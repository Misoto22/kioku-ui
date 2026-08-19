import * as stylex from '@stylexjs/stylex';
import {useEffect, useState, type HTMLAttributes, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useFocusTrap} from '../hooks/useFocusTrap.js';
import {useScrollLock} from '../hooks/useScrollLock.js';
import {Layer} from '../Layer/index.js';

const scrimEnter = stylex.keyframes({
  from: {opacity: 0},
  to: {opacity: 1},
});

const styles = stylex.create({
  scrim: {
    alignItems: 'center',
    animationDuration: semanticTokens.durationFast,
    animationName: {
      default: scrimEnter,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: semanticTokens.easingEmphasized,
    backgroundColor: semanticTokens.colorScrim,
    display: 'flex',
    inset: 0,
    justifyContent: 'center',
    padding: semanticTokens.spacingLg,
    position: 'fixed',
  },
  bare: {
    backgroundColor: 'transparent',
    padding: 0,
    pointerEvents: 'none',
  },
  surface: {
    maxHeight: '100%',
    maxWidth: '100%',
    outlineStyle: 'none',
    pointerEvents: 'auto',
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
});

/** Props for the dismissal, focus, and scroll behaviour behind modal surfaces. */
export interface OverlayProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> {
  readonly children: ReactNode;
  readonly dismissOnOutsideClick?: boolean;
  readonly lockScroll?: boolean;
  readonly onDismiss?: () => void;
  readonly open: boolean;
  readonly scrim?: boolean;
  readonly trapFocus?: boolean;
}

/**
 * Owns the behaviour every modal surface repeats: an optional scrim, Escape
 * and outside-click dismissal, a focus trap, and a scroll lock. It carries no
 * role of its own so the caller names the surface it wraps.
 */
export function Overlay({
  children,
  dismissOnOutsideClick = true,
  lockScroll = true,
  onDismiss,
  open,
  scrim = true,
  trapFocus = true,
  ...props
}: OverlayProps) {
  const [surface, setSurface] = useState<HTMLDivElement | null>(null);

  useFocusTrap(surface, open && trapFocus);
  useScrollLock(open && lockScroll);

  useEffect(() => {
    if (!open || !onDismiss) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onDismiss?.();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onDismiss, open]);

  if (!open) {
    return null;
  }

  return (
    <Layer>
      <div
        {...props}
        onMouseDown={(event) => {
          if (dismissOnOutsideClick && event.target === event.currentTarget) {
            onDismiss?.();
          }
        }}
        {...stylex.props(styles.scrim, !scrim && styles.bare)}
      >
        <div ref={setSurface} tabIndex={-1} {...stylex.props(styles.surface)}>
          {children}
        </div>
      </div>
    </Layer>
  );
}
