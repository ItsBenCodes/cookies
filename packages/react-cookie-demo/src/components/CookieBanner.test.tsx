import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CookiesProvider } from 'react-cookie';
import CookieBanner from './CookieBanner';
import Cookies from 'universal-cookie';

// Clear cookies before each test
beforeEach(() => {
  const cookies = new Cookies();
  cookies.remove('cookieConsent');
});

describe('CookieBanner', () => {
  const mockOnAccept = jest.fn();
  const mockOnDecline = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when cookie consent is undefined', () => {
    render(
      <CookiesProvider>
        <CookieBanner onAccept={mockOnAccept} onDecline={mockOnDecline} />
      </CookiesProvider>,
    );

    expect(
      screen.getByText(
        'This website uses cookies to enhance the user experience.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByText('Decline')).toBeInTheDocument();
  });

  it('does not render when cookie consent is already set', () => {
    // Set the cookie before rendering
    const cookies = new Cookies();
    cookies.set('cookieConsent', 'accepted', { path: '/' });

    const { container } = render(
      <CookiesProvider>
        <CookieBanner onAccept={mockOnAccept} onDecline={mockOnDecline} />
      </CookiesProvider>,
    );

    expect(container.firstChild).toBeNull();
  });

  it('calls onAccept and sets cookie when Accept button is clicked', () => {
    render(
      <CookiesProvider>
        <CookieBanner onAccept={mockOnAccept} onDecline={mockOnDecline} />
      </CookiesProvider>,
    );

    fireEvent.click(screen.getByText('Accept'));

    // Verify cookie was set
    const cookies = new Cookies();
    expect(cookies.get('cookieConsent')).toBe('accepted');
    expect(mockOnAccept).toHaveBeenCalled();
  });

  it('calls onDecline and sets cookie when Decline button is clicked', () => {
    render(
      <CookiesProvider>
        <CookieBanner onAccept={mockOnAccept} onDecline={mockOnDecline} />
      </CookiesProvider>,
    );

    fireEvent.click(screen.getByText('Decline'));

    // Verify cookie was set
    const cookies = new Cookies();
    expect(cookies.get('cookieConsent')).toBe('declined');
    expect(mockOnDecline).toHaveBeenCalled();
  });

  it('renders with banner when consent is undefined and hides when accepted', () => {
    const { rerender, container } = render(
      <CookiesProvider>
        <CookieBanner onAccept={mockOnAccept} onDecline={mockOnDecline} />
      </CookiesProvider>,
    );

    // Banner should be visible initially
    expect(
      screen.getByText(
        'This website uses cookies to enhance the user experience.',
      ),
    ).toBeInTheDocument();

    // Click accept
    fireEvent.click(screen.getByText('Accept'));

    // Rerender the component to reflect cookie changes
    rerender(
      <CookiesProvider>
        <CookieBanner onAccept={mockOnAccept} onDecline={mockOnDecline} />
      </CookiesProvider>,
    );

    // Banner should now be hidden
    expect(container.firstChild).toBeNull();
  });

  it('renders with banner when consent is undefined and hides when declined', () => {
    const { rerender, container } = render(
      <CookiesProvider>
        <CookieBanner onAccept={mockOnAccept} onDecline={mockOnDecline} />
      </CookiesProvider>,
    );

    // Banner should be visible initially
    expect(
      screen.getByText(
        'This website uses cookies to enhance the user experience.',
      ),
    ).toBeInTheDocument();

    // Click decline
    fireEvent.click(screen.getByText('Decline'));

    // Rerender the component to reflect cookie changes
    rerender(
      <CookiesProvider>
        <CookieBanner onAccept={mockOnAccept} onDecline={mockOnDecline} />
      </CookiesProvider>,
    );

    // Banner should now be hidden
    expect(container.firstChild).toBeNull();
  });
});
