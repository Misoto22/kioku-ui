import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

const styles = stylex.create({
  frame: {
    display: 'block',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  content: {
    blockSize: '100%',
    insetBlockStart: 0,
    insetInlineStart: 0,
    inlineSize: '100%',
    objectFit: 'cover',
    position: 'absolute',
  },
});

/** Props for a box that holds a fixed width-to-height ratio. */
export interface AspectRatioProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'style'
> {
  readonly children: ReactNode;
  readonly ratio?: number;
}

/**
 * Reserves space at a fixed ratio before its content loads, so a page does
 * not jump once an image or embed arrives.
 */
export function AspectRatio({
  children,
  ratio = 16 / 9,
  ...props
}: AspectRatioProps) {
  return (
    <div
      {...props}
      {...stylex.props(styles.frame)}
      style={{aspectRatio: String(ratio)}}
    >
      <div {...stylex.props(styles.content)}>{children}</div>
    </div>
  );
}
