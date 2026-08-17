import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    borderBlockStartColor: semanticTokens.borderDefault,
    borderBlockStartStyle: semanticTokens.borderStyle,
    borderBlockStartWidth: semanticTokens.borderWidth,
    marginBlockEnd: `calc(-1 * ${semanticTokens.spacingXl})`,
    marginBlockStart: semanticTokens.spacingXl,
    marginInline: `calc(-1 * ${semanticTokens.spacingXl})`,
    paddingBlock: semanticTokens.spacingLg,
    paddingInline: semanticTokens.spacingXl,
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
