import * as cookie from 'cookie';
import { Cookie, CookieGetOptions } from './types';

export function hasDocumentCookie() {
  const testingValue =
    typeof globalThis === 'undefined'
      ? undefined
      : (globalThis as any).TEST_HAS_DOCUMENT_COOKIE;

  if (typeof testingValue === 'boolean') {
    return testingValue;
  }

  // Can we get/set cookies on document.cookie?
  return typeof document === 'object' && typeof document.cookie === 'string';
}

export function cleanCookies() {
  if (typeof document !== 'undefined') {
    document.cookie.split(';').forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
  }
}

export function parseCookies(cookies?: string | object | null) {
  if (typeof cookies === 'string') {
    return cookie.parse(cookies);
  } else if (typeof cookies === 'object' && cookies !== null) {
    return cookies;
  } else {
    return {};
  }
}

export function readCookie(value: Cookie, options: CookieGetOptions = {}) {
  const cleanValue = cleanupCookieValue(value);
  if (!options.doNotParse) {
    try {
      return JSON.parse(cleanValue);
    } catch (e) {
      // At least we tried
    }
  }

  // Ignore clean value if we failed the deserialization
  // It is not relevant anymore to trim those values
  return value;
}

function cleanupCookieValue(value: Cookie): Cookie {
  // express prepend j: before serializing a cookie
  if (value && value[0] === 'j' && value[1] === ':') {
    return value.substr(2);
  }

  return value;
}
