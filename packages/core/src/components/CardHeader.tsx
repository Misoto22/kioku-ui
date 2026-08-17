import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    paddingBlock: semanticTokens.spacingMd,
    paddingInline: semanticTokens.spacingLg,
  },
});

export type CardHeaderProps = Omit<HTMLAttributes<HTMLElement>, 'className'>;

export function CardHeader({children, ...props}: CardHeaderProps) {
  return (
    <header {...props} {...stylex.props(styles.base)}>
      {children}
    </header>
  );
}
