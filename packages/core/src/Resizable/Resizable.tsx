import * as stylex from '@stylexjs/stylex';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useInternationalization} from '../i18n/index.js';

const styles = stylex.create({
  frame: {
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    minWidth: 0,
  },
  panel: {flexShrink: 0, minWidth: 0, overflow: 'auto'},
  rest: {flexGrow: 1, minWidth: 0, overflow: 'auto'},
  handle: {
    // The divider is a hairline like every other seam in this system; the
    // grab area is widened by a pseudo-element instead of the visible box.
    backgroundColor: semanticTokens.borderDefault,
    borderStyle: 'none',
    borderWidth: 0,
    cursor: 'col-resize',
    flexShrink: 0,
    inlineSize: semanticTokens.borderWidth,
    padding: 0,
    position: 'relative',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color',
    transitionTimingFunction: semanticTokens.easingStandard,
    '::before': {
      blockSize: '100%',
      content: '',
      inlineSize: semanticTokens.spacingSm,
      insetBlockStart: 0,
      insetInlineStart: '50%',
      position: 'absolute',
      transform: 'translateX(-50%)',
    },
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
});

/** Props for a two-panel split whose divider can be moved. */
export interface ResizableProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> {
  readonly children: ReactNode;
  readonly handleLabel?: string;
  readonly max?: number;
  readonly min?: number;
  readonly onSizeChange?: (size: number) => void;
  readonly panel: ReactNode;
  readonly size?: number;
  readonly step?: number;
}

/**
 * Splits a region into a sized panel and the rest. The divider is a real
 * `separator` control, so arrow keys move it — a drag handle that only
 * responds to a pointer is unusable by keyboard.
 */
export function Resizable({
  children,
  handleLabel,
  max = 480,
  min = 160,
  onSizeChange,
  panel,
  size,
  step = 16,
  ...props
}: ResizableProps) {
  const {messages} = useInternationalization();
  const frameRef = useRef<HTMLDivElement>(null);
  const [internalSize, setInternalSize] = useState(size ?? 240);
  const current = size ?? internalSize;
  const [dragging, setDragging] = useState(false);

  const apply = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, min), max);
      if (size === undefined) {
        setInternalSize(clamped);
      }
      onSizeChange?.(clamped);
    },
    [max, min, onSizeChange, size],
  );

  useEffect(() => {
    if (!dragging) {
      return;
    }

    function handleMove(event: MouseEvent) {
      const frame = frameRef.current;
      if (frame) {
        apply(event.clientX - frame.getBoundingClientRect().left);
      }
    }
    function stop() {
      setDragging(false);
    }

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', stop);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', stop);
    };
  }, [apply, dragging]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      apply(current - step);
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      apply(current + step);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      apply(min);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      apply(max);
    }
  }

  return (
    <div {...props} ref={frameRef} {...stylex.props(styles.frame)}>
      <div {...stylex.props(styles.panel)} style={{width: `${current}px`}}>
        {panel}
      </div>
      <div
        aria-label={handleLabel ?? messages.resizeHandle}
        aria-orientation="vertical"
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={current}
        onKeyDown={handleKeyDown}
        onMouseDown={() => {
          setDragging(true);
        }}
        role="separator"
        tabIndex={0}
        {...stylex.props(styles.handle)}
      />
      <div {...stylex.props(styles.rest)}>{children}</div>
    </div>
  );
}
