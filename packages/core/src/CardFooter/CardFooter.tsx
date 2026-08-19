import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    borderBlockStartColor: semanticTokens.borderDefault,
    borderBlockStartStyle: semanticTokens.borderStyle,
    borderBlockStartWidth: semanticTokens.borderWidth,
    marginBlockEnd: `calc(-1 * ${semanticTokens.spacingLg})`,
    marginBlockStart: semanticTokens.spacingLg,
    marginInline: `calc(-1 * ${semanticTokens.spacingLg})`,
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
