import * as stylex from '@stylexjs/stylex';
import {
  Children,
  cloneElement,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {
  useAnchoredPosition,
  type Alignment,
  type Placement,
} from '../hooks/useAnchoredPosition.js';
import {Layer} from '../Layer/index.js';

// A tooltip stays narrow enough to read in one or two lines; the scale stops
// at 38px, so the cap is a named multiple of it rather than a rem literal.
const surfaceMaxWidth = `calc(${semanticTokens.spacing2xl} * 8)`;

const styles = stylex.create({
  surface: {
    backgroundColor: semanticTokens.colorSurfaceRaised,
    borderRadius: semanticTokens.radiusContainer,
    boxShadow: semanticTokens.elevationMedium,
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingLabel,
    lineHeight: semanticTokens.lineHeightBody,
    maxWidth: surfaceMaxWidth,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    pointerEvents: 'none',
    position: 'fixed',
  },
  hidden: {visibility: 'hidden'},
});

interface TriggerProps {
  readonly 'aria-describedby'?: string;
  readonly onBlur?: (event: FocusEvent<HTMLElement>) => void;
  readonly onFocus?: (event: FocusEvent<HTMLElement>) => void;
  readonly onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
  readonly onMouseLeave?: (event: MouseEvent<HTMLElement>) => void;
  readonly ref?: unknown;
}

/** Props for a hover- and focus-triggered description. */
export interface TooltipProps {
  readonly alignment?: Alignment;
  readonly children: ReactElement<TriggerProps>;
  readonly content: ReactNode;
  readonly delay?: number;
  readonly placement?: Placement;
}

/**
 * Describes its trigger on hover and on focus. The description is wired with
 * `aria-describedby`, so it supplements the trigger's name rather than
 * replacing it — never put essential information here alone.
 */
export function Tooltip({
  alignment,
  children,
  content,
  delay = 300,
  placement = 'top',
}: TooltipProps) {
  const anchorRef = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const describedBy = useId();

  const {position, surfaceRef} = useAnchoredPosition(anchorRef, open, {
    ...(alignment ? {alignment} : {}),
    placement,
  });

  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function show() {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setOpen(true);
    }, delay);
  }

  function hide() {
    clearTimeout(timer.current);
    setOpen(false);
  }

  const trigger = Children.only(children);
  const anchor = cloneElement(trigger, {
    'aria-describedby': open ? describedBy : trigger.props['aria-describedby'],
    onBlur: (event: FocusEvent<HTMLElement>) => {
      trigger.props.onBlur?.(event);
      hide();
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      trigger.props.onFocus?.(event);
      show();
    },
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      trigger.props.onMouseEnter?.(event);
      show();
    },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => {
      trigger.props.onMouseLeave?.(event);
      hide();
    },
    ref: anchorRef,
  });

  return (
    <>
      {anchor}
      {open ? (
        <Layer>
          <div
            data-placement={position?.placement}
            id={describedBy}
            ref={surfaceRef}
            role="tooltip"
            {...stylex.props(
              styles.surface,
              position === undefined && styles.hidden,
            )}
            style={{left: position?.left, top: position?.top}}
          >
            {content}
          </div>
        </Layer>
      ) : null}
    </>
  );
}
