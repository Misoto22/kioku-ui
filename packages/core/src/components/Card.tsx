import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    backgroundColor: semanticTokens.colorSurface,
    borderRadius: semanticTokens.radiusContainer,
    color: semanticTokens.colorText,
    padding: semanticTokens.spacingXl,
  },
  none: {
    borderColor: semanticTokens.borderDefault,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxShadow: 'none',
  },
  low: {
    borderStyle: 'none',
    boxShadow: semanticTokens.elevationLow,
  },
  medium: {
    borderStyle: 'none',
    boxShadow: semanticTokens.elevationMedium,
  },
});

export type CardElevation = 'none' | 'low' | 'medium';

export interface CardProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'className'
> {
  readonly elevation?: CardElevation;
}

export function Card({children, elevation = 'none', ...props}: CardProps) {
  return (
    <article {...props} {...stylex.props(styles.base, styles[elevation])}>
      {children}
    </article>
  );
}
