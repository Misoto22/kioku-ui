import * as stylex from '@stylexjs/stylex';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {ResizeHandle} from '../ResizeHandle/index.js';

const styles = stylex.create({
  frame: {
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    minWidth: 0,
  },
  panel: {flexShrink: 0, minWidth: 0, overflow: 'auto'},
  rest: {flexGrow: 1, minWidth: 0, overflow: 'auto'},
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

  return (
    <div {...props} ref={frameRef} {...stylex.props(styles.frame)}>
      <div {...stylex.props(styles.panel)} style={{width: `${current}px`}}>
        {panel}
      </div>
      <ResizeHandle
        label={handleLabel}
        max={max}
        min={min}
        onMouseDown={() => {
          setDragging(true);
        }}
        onValueChange={apply}
        step={step}
        value={current}
      />
      <div {...stylex.props(styles.rest)}>{children}</div>
    </div>
  );
}
