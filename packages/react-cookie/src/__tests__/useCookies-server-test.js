/**
 * @jest-environment node
 */
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { cleanCookies } from '../../../universal-cookie/src/utils';

import { CookiesProvider, useCookies, Cookies } from '..';
import * as Utils from '../utils';

function TestComponent({ dependencies }) {
  const [cookies] = useCookies(dependencies);
  return <div>{cookies.test}</div>;
}

describe('useCookies', () => {
  beforeEach(() => {
    cleanCookies();
  });

  describe('on the server', () => {
    beforeEach(() => {
      jest.spyOn(Utils, 'isInBrowser').mockReturnValue(false);
    });

    it('provides the cookies', () => {
      const cookies = new Cookies('test="big fat cat"');
      cookies.HAS_DOCUMENT_COOKIE = false;

      const html = ReactDOMServer.renderToString(
        <CookiesProvider cookies={cookies}>
          <TestComponent />
        </CookiesProvider>,
      );

      expect(html).toContain('big fat cat');
    });

    it('does not track changes', () => {
      const cookies = new Cookies('test="big fat cat"');

      const addChangeListenerSpy = jest.spyOn(cookies, 'addChangeListener');

      ReactDOMServer.renderToString(
        <CookiesProvider cookies={cookies}>
          <TestComponent />
        </CookiesProvider>,
      );

      expect(addChangeListenerSpy).not.toHaveBeenCalled();
    });
  });
});
