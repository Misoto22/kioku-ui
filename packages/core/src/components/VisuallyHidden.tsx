import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

const styles = stylex.create({
  base: {
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: 1,
  },
});

export type VisuallyHiddenProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  'className'
>;

export function VisuallyHidden({children, ...props}: VisuallyHiddenProps) {
  return (
    <span {...props} {...stylex.props(styles.base)}>
      {children}
    </span>
  );
}
