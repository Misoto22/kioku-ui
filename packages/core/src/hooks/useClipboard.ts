import {useCallback, useEffect, useRef, useState} from 'react';

/** Result of a clipboard hook: the copy action and its recent outcome. */
export interface ClipboardState {
  readonly copied: boolean;
  readonly copy: (text: string) => Promise<boolean>;
}

/**
 * Copies text and reports success for `resetAfterMs`, so a caller can show a
 * confirmation without owning its own timer.
 */
export function useClipboard(resetAfterMs = 2000): ClipboardState {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    async (text: string) => {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
      } catch {
        setCopied(false);
        return false;
      }

      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setCopied(false);
      }, resetAfterMs);
      return true;
    },
    [resetAfterMs],
  );

  return {copied, copy};
}
