import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, KeyboardEvent} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useInternationalization} from '../i18n/index.js';
import {clamp} from '../utils/index.js';

const styles = stylex.create({
  // The divider is a hairline like every other seam in this system; the grab
  // area is widened by a pseudo-element instead of the visible box, and it is
  // widened to the hit target the rest of the system uses — `Slider` writes
  // the same token for its thumb. At the 6px it used to be, the thing a reader
  // has to catch was a seventh of the size of everything else they can press.
  handle: {
    backgroundColor: semanticTokens.borderDefault,
    borderStyle: 'none',
    borderWidth: 0,
    flexShrink: 0,
    padding: 0,
    position: 'relative',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color',
    transitionTimingFunction: semanticTokens.easingStandard,
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover:not(:disabled)': {
      backgroundColor: semanticTokens.borderInteractive,
    },
  },
  // A drag begins by pressing a one-pixel rule and immediately moving off it,
  // so hover is the wrong thing to hang the highlight on: it goes out on the
  // first pixel of every drag while the drag is still going. The caller owns
  // the fact and hands it back.
  dragging: {backgroundColor: semanticTokens.borderInteractive},
  vertical: {
    cursor: 'col-resize',
    inlineSize: semanticTokens.borderWidth,
    '::before': {
      blockSize: '100%',
      content: '',
      inlineSize: semanticTokens.sizeHitTarget,
      insetBlockStart: 0,
      insetInlineStart: '50%',
      position: 'absolute',
      transform: 'translateX(-50%)',
    },
  },
  horizontal: {
    blockSize: semanticTokens.borderWidth,
    cursor: 'row-resize',
    '::before': {
      blockSize: semanticTokens.sizeHitTarget,
      content: '',
      inlineSize: '100%',
      insetBlockStart: '50%',
      insetInlineStart: 0,
      position: 'absolute',
      transform: 'translateY(-50%)',
    },
  },
});

/** Axis the divider itself runs along, as `aria-orientation` reports it. */
export type ResizeHandleOrientation = 'horizontal' | 'vertical';

/** Props for the movable divider a caller places between two panes. */
export interface ResizeHandleProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'aria-label'
  | 'aria-orientation'
  | 'aria-valuemax'
  | 'aria-valuemin'
  | 'aria-valuenow'
  | 'children'
  | 'className'
  | 'onKeyDown'
  | 'role'
  | 'tabIndex'
> {
  readonly label?: string;
  readonly max?: number;
  readonly min?: number;
  readonly onValueChange?: (value: number) => void;
  /** Held while the caller is dragging, so the mark survives the pointer. */
  readonly dragging?: boolean;
  readonly orientation?: ResizeHandleOrientation;
  readonly step?: number;
  readonly value?: number;
}

/**
 * The divider between two panes the caller lays out itself. It is a real
 * `separator` control, so arrow keys move it — a drag handle that only
 * responds to a pointer is unusable by keyboard. The value attributes appear
 * only when the caller supplies the numbers behind them, because a separator
 * that reports a range it does not have is worse than one that reports none.
 */
export function ResizeHandle({
  dragging = false,
  label,
  max,
  min,
  onValueChange,
  orientation = 'vertical',
  step = 16,
  value,
  ...props
}: ResizeHandleProps) {
  const {messages} = useInternationalization();
  // An unset bound is no bound: a caller that leaves `min` or `max` out has a
  // range this handle cannot know, so it stops holding the value inside one.
  const lowerBound = min ?? Number.NEGATIVE_INFINITY;
  const upperBound = max ?? Number.POSITIVE_INFINITY;
  const decreaseKey = orientation === 'vertical' ? 'ArrowLeft' : 'ArrowUp';
  const increaseKey = orientation === 'vertical' ? 'ArrowRight' : 'ArrowDown';

  function requestedValue(key: string) {
    if (key === decreaseKey) {
      return value === undefined ? undefined : value - step;
    }
    if (key === increaseKey) {
      return value === undefined ? undefined : value + step;
    }
    if (key === 'Home') {
      return min;
    }
    return key === 'End' ? max : undefined;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const next = requestedValue(event.key);
    if (next === undefined) {
      return;
    }

    event.preventDefault();
    onValueChange?.(clamp(next, lowerBound, upperBound));
  }

  return (
    <div
      {...props}
      aria-label={label ?? messages.resizeHandle}
      aria-orientation={orientation}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={value}
      onKeyDown={handleKeyDown}
      role="separator"
      {...stylex.props(
        styles.handle,
        styles[orientation],
        dragging && styles.dragging,
      )}
      tabIndex={0}
    />
  );
}
