import { useContext, useState, useMemo, useRef } from 'react';
import { Cookie, CookieSetOptions, CookieGetOptions } from 'universal-cookie';
import CookiesContext from './CookiesContext';
import { useIsomorphicLayoutEffect } from './utils';

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
  const previousCookies = useRef<Record<string, unknown> | null>(null);
  if (previousCookies.current === null) {
    previousCookies.current = cookies.getAll({
      ...getOptions,
      doNotParse: true,
    });
  }

  useIsomorphicLayoutEffect(() => {
    function onChange() {
      if (!cookies) {
        throw new Error('Missing <CookiesProvider>');
      }

      const newCookies = cookies.getAll({ ...getOptions, doNotParse: true });

      if (
        shouldUpdate(dependencies || null, newCookies, previousCookies.current)
      ) {
        previousCookies.current = newCookies;
        setCookies(cookies.getAll(getOptions));
      }
    }

    cookies.addChangeListener(onChange);

    return () => {
      cookies.removeChangeListener(onChange);
    };
  }, [cookies, allCookies]);

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
