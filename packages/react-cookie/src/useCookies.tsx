import { useContext, useLayoutEffect, useState, useMemo } from 'react';
import { Cookie, CookieSetOptions, CookieGetOptions } from 'universal-cookie';
import CookiesContext from './CookiesContext';
import { isInBrowser } from './utils';

export default function useCookies<T extends string, U = { [K in T]?: any }>(
  dependencies?: T[],
  options?: CookieGetOptions,
): [
  U,
  (name: T, value: Cookie, options?: CookieSetOptions) => void,
  (name: T, options?: CookieSetOptions) => void,
  () => void,
] {
  const cookies = useContext(CookiesContext);
  if (!cookies) {
    throw new Error('Missing <CookiesProvider>');
  }
  const defaultOptions = { doNotUpdate: true };

  const getOptions: CookieGetOptions = { ...defaultOptions, ...options };

  const [allCookies, setCookies] = useState(() => cookies.getAll(getOptions));

  const isInBrowserEnv = isInBrowser();

  useLayoutEffect(() => {
    if (!isInBrowserEnv) return;

    function onChange() {
      if (!cookies) {
        throw new Error('Missing <CookiesProvider>');
      }

      const newCookies = cookies.getAll(getOptions);

      if (shouldUpdate(dependencies || null, newCookies, allCookies)) {
        setCookies(newCookies);
      }
    }

    cookies.addChangeListener(onChange);

    return () => {
      cookies.removeChangeListener(onChange);
    };
  }, [cookies, allCookies, isInBrowserEnv]);

  const setCookie = useMemo(() => cookies.set.bind(cookies), [cookies]);
  const removeCookie = useMemo(() => cookies.remove.bind(cookies), [cookies]);
  const updateCookies = useMemo(() => cookies.update.bind(cookies), [cookies]);

  return [allCookies, setCookie, removeCookie, updateCookies];
}

function shouldUpdate<U = { [K: string]: any }>(
  dependencies: Array<keyof U> | null,
  newCookies: U,
  oldCookies: U,
) {
  if (!dependencies) {
    return true;
  }

  for (let dependency of dependencies) {
    if (newCookies[dependency] !== oldCookies[dependency]) {
      return true;
    }
  }

  return false;
}
