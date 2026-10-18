import React from 'react';
import { cleanCookies } from '../../../universal-cookie/src/utils';
import { act, render, screen } from '@testing-library/react';

import { CookiesProvider, useCookies, Cookies } from '..';

function TestComponent({ dependencies }) {
  const [cookies] = useCookies(dependencies);
  return <div>{cookies.test}</div>;
}

describe('useCookies', () => {
  beforeEach(() => {
    cleanCookies();
  });

  describe('on the browser', () => {
    it('provides the cookies', () => {
      document.cookie = 'test="big fat cat"';

      render(
        <CookiesProvider>
          <TestComponent />
        </CookiesProvider>,
      );

      expect(screen.getByText('big fat cat')).toBeInTheDocument();
    });

    it('update when a cookie change', () => {
      const cookies = new Cookies();
      cookies.set('test', 'big fat cat Pacman');

      render(
        <CookiesProvider cookies={cookies}>
          <TestComponent />
        </CookiesProvider>,
      );

      expect(screen.getByText('big fat cat Pacman')).toBeInTheDocument();

      act(() => {
        cookies.set('test', 'mean lean cat Suki');
      });

      expect(screen.getByText('mean lean cat Suki')).toBeInTheDocument();
    });

    it('update when a cookie is removed', () => {
      const cookies = new Cookies();
      cookies.set('test', 'big fat cat Pacman');

      render(
        <CookiesProvider cookies={cookies}>
          <TestComponent />
        </CookiesProvider>,
      );

      expect(screen.getByText('big fat cat Pacman')).toBeInTheDocument();

      act(() => {
        cookies.remove('test');
      });

      expect(screen.queryByText('big fat cat Pacman')).not.toBeInTheDocument();
    });

    it('clear the change subscription on unmount', () => {
      const cookies = new Cookies();

      const { rerender } = render(
        <CookiesProvider cookies={cookies}>
          <TestComponent />
        </CookiesProvider>,
      );

      expect(cookies.changeListeners.length).toBe(1);

      rerender(null);

      expect(cookies.changeListeners.length).toBe(0);
    });

    it('re-render if a dependency changes', () => {
      const cookies = new Cookies();
      cookies.set('test', 'big fat cat Pacman');

      render(
        <CookiesProvider cookies={cookies}>
          <TestComponent dependencies={['test']} />
        </CookiesProvider>,
      );

      expect(screen.getByText('big fat cat Pacman')).toBeInTheDocument();

      act(() => {
        cookies.set('test', 'mean lean cat Suki');
      });

      expect(screen.getByText('mean lean cat Suki')).toBeInTheDocument();
    });

    it('re-render if a dependency changes multiple times', () => {
      const cookies = new Cookies();
      cookies.set('test', 'big fat cat Pacman');

      render(
        <CookiesProvider cookies={cookies}>
          <TestComponent dependencies={['test']} />
        </CookiesProvider>,
      );

      expect(screen.getByText('big fat cat Pacman')).toBeInTheDocument();

      act(() => {
        cookies.set('test', 'mean lean cat Suki');
      });

      expect(screen.getByText('mean lean cat Suki')).toBeInTheDocument();

      act(() => {
        cookies.set('test', 'good old Yuki');
      });

      expect(screen.getByText('good old Yuki')).toBeInTheDocument();
    });

    it('re-render if a dependency changes and go back', () => {
      const cookies = new Cookies();

      render(
        <CookiesProvider cookies={cookies}>
          <TestComponent dependencies={['test']} />
        </CookiesProvider>,
      );

      act(() => {
        cookies.set('test', 'big fat cat Pacman');
      });

      expect(screen.getByText('big fat cat Pacman')).toBeInTheDocument();

      act(() => {
        cookies.set('test', 'mean lean cat Suki');
      });

      expect(screen.getByText('mean lean cat Suki')).toBeInTheDocument();

      act(() => {
        cookies.set('test', 'big fat cat Pacman');
      });

      expect(screen.getByText('big fat cat Pacman')).toBeInTheDocument();
    });

    it.each([{ theme: 'dark' }, ['dark']])(
      'only re-renders when watched settings change from %j',
      (settings) => {
        const cookies = new Cookies();
        cookies.set('settings', settings);
        let renders = 0;

        function SettingsComponent() {
          const [values] = useCookies(['settings']);
          renders += 1;
          return <div>{JSON.stringify(values.settings)}</div>;
        }

        render(
          <CookiesProvider cookies={cookies}>
            <SettingsComponent />
          </CookiesProvider>,
        );

        expect(screen.getByText(JSON.stringify(settings))).toBeInTheDocument();
        expect(renders).toBe(1);

        act(() => {
          cookies.set('unrelated', 'changed');
        });

        expect(renders).toBe(1);

        const updatedSettings = Array.isArray(settings)
          ? ['light']
          : { theme: 'light' };
        act(() => {
          cookies.set('settings', updatedSettings);
        });

        expect(renders).toBe(2);
        expect(
          screen.getByText(JSON.stringify(updatedSettings)),
        ).toBeInTheDocument();
      },
    );

    it('does not re-render if no dependency changes', () => {
      const cookies = new Cookies();
      cookies.set('test', 'big fat cat Pacman');

      render(
        <CookiesProvider cookies={cookies}>
          <TestComponent dependencies={[]} />
        </CookiesProvider>,
      );

      expect(screen.getByText('big fat cat Pacman')).toBeInTheDocument();

      act(() => {
        cookies.set('test', 'mean lean cat Suki');
      });

      expect(screen.getByText('big fat cat Pacman')).toBeInTheDocument();
    });
  });

  it('throws error without the provider', () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow('Missing <CookiesProvider>');
  });
});
