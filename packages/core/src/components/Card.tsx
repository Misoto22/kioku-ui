import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusContainer,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxShadow: semanticTokens.elevationLow,
    color: semanticTokens.colorText,
  },
});

export type CardProps = Omit<HTMLAttributes<HTMLElement>, 'className'>;

export function Card({children, ...props}: CardProps) {
  return (
    <article {...props} {...stylex.props(styles.base)}>
      {children}
    </article>
  );
}
