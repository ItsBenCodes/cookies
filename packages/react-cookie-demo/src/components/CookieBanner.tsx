import React from 'react';
import { useCookies } from 'react-cookie';

interface CookieBannerProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function useCookieBanner() {
  const [cookies, setCookie] = useCookies(['cookieConsent']);

  const hasConsent = cookies.cookieConsent === 'accepted';

  const acceptCookies = () => {
    setCookie('cookieConsent', 'accepted', {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
    }); // 1 year
  };

  const declineCookies = () => {
    setCookie('cookieConsent', 'declined', {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
    }); // 1 year
  };

  return {
    hasConsent,
    acceptCookies,
    declineCookies,
    isBannerVisible: cookies.cookieConsent === undefined,
  };
}

export default function CookieBanner({
  onAccept,
  onDecline,
}: CookieBannerProps): React.ReactElement | null {
  const { hasConsent, acceptCookies, declineCookies, isBannerVisible } =
    useCookieBanner();

  if (!isBannerVisible) {
    return null;
  }

  const handleAccept = () => {
    acceptCookies();
    if (onAccept) onAccept();
  };

  const handleDecline = () => {
    declineCookies();
    if (onDecline) onDecline();
  };

  const bannerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #dee2e6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000,
  };

  const buttonStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    marginLeft: '0.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const acceptButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#28a745',
    color: 'white',
  };

  const declineButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#6c757d',
    color: 'white',
  };

  return (
    <div style={bannerStyle}>
      <div>
        <p style={{ margin: '0 0 0.5rem 0' }}>
          This website uses cookies to enhance the user experience.
        </p>
      </div>
      <div>
        <button type="button" style={acceptButtonStyle} onClick={handleAccept}>
          Accept
        </button>
        <button
          type="button"
          style={declineButtonStyle}
          onClick={handleDecline}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
