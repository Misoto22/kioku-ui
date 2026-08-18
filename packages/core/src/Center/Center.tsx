import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

const styles = stylex.create({
  base: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
});

export type CenterProps = Omit<HTMLAttributes<HTMLDivElement>, 'className'>;

export function Center({children, ...props}: CenterProps) {
  return (
    <div {...props} {...stylex.props(styles.base)}>
      {children}
    </div>
  );
}
