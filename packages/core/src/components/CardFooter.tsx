import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    paddingBlock: semanticTokens.spacingMd,
    paddingInline: semanticTokens.spacingLg,
  },
});

export type CardFooterProps = Omit<HTMLAttributes<HTMLElement>, 'className'>;

export function CardFooter({children, ...props}: CardFooterProps) {
  return (
    <footer {...props} {...stylex.props(styles.base)}>
      {children}
    </footer>
  );
}
