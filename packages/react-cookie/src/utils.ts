import { useEffect, useLayoutEffect } from 'react';

export function isInBrowser() {
  return (
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.document.createElement !== 'undefined'
  );
}

export const useIsomorphicLayoutEffect = isInBrowser()
  ? useLayoutEffect
  : useEffect;
