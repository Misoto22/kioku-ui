import {useEffect, useRef} from 'react';

function isProduction() {
  return (
    typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'production'
  );
}

/**
 * Reports a broken component contract once per mount during development.
 * Production builds stay silent so hosts never pay for the check.
 */
export function useDevWarning(condition: boolean, message: string): void {
  const warned = useRef(false);

  useEffect(() => {
    if (isProduction() || !condition || warned.current) {
      return;
    }

    warned.current = true;
    console.warn(message);
  }, [condition, message]);
}
