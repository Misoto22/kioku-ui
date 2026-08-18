import {useEffect, useRef} from 'react';

/**
 * Maps a normalized shortcut to its handler. Combinations use `+` and the
 * `mod` alias, which resolves to Command on Apple platforms and Control
 * everywhere else: `mod+k`, `shift+?`, `Escape`.
 */
export type HotkeyBindings = Readonly<
  Record<string, (event: KeyboardEvent) => void>
>;

/** Options controlling when a hotkey map listens. */
export interface HotkeyOptions {
  readonly enabled?: boolean;
}

function isApplePlatform() {
  return (
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad/u.test(navigator.platform)
  );
}

function describe(event: KeyboardEvent) {
  const parts: string[] = [];
  const mod = isApplePlatform() ? event.metaKey : event.ctrlKey;

  if (mod) parts.push('mod');
  if (event.altKey) parts.push('alt');
  if (event.shiftKey) parts.push('shift');
  parts.push(event.key.toLowerCase());

  return parts.join('+');
}

const modifierOrder = ['mod', 'alt', 'shift'];

// Non-modifiers rank last so `mod+k` and `K+MOD` describe the same shortcut.
function rank(part: string) {
  const index = modifierOrder.indexOf(part);
  return index === -1 ? modifierOrder.length : index;
}

function normalize(binding: string) {
  return binding
    .split('+')
    .map((part) => part.trim().toLowerCase())
    .sort((left, right) => rank(left) - rank(right))
    .join('+');
}

/** Runs a handler when its shortcut fires anywhere in the document. */
export function useHotkeys(
  bindings: HotkeyBindings,
  {enabled = true}: HotkeyOptions = {},
): void {
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      const pressed = describe(event);

      for (const [binding, handler] of Object.entries(bindingsRef.current)) {
        if (normalize(binding) === pressed) {
          handler(event);
          return;
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);
}
