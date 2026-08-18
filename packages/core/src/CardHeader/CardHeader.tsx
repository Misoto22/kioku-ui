import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    borderBlockEndColor: semanticTokens.borderDefault,
    borderBlockEndStyle: semanticTokens.borderStyle,
    borderBlockEndWidth: semanticTokens.borderWidth,
    marginBlockEnd: semanticTokens.spacingXl,
    marginBlockStart: `calc(-1 * ${semanticTokens.spacingXl})`,
    marginInline: `calc(-1 * ${semanticTokens.spacingXl})`,
    paddingBlock: semanticTokens.spacingLg,
    paddingInline: semanticTokens.spacingXl,
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
