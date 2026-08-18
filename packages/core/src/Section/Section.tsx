import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {Space} from '../Stack/index.js';

const styles = stylex.create({
  paddingXs: {paddingBlock: semanticTokens.spacingXs},
  paddingSm: {paddingBlock: semanticTokens.spacingSm},
  paddingMd: {paddingBlock: semanticTokens.spacingMd},
  paddingLg: {paddingBlock: semanticTokens.spacingLg},
  paddingXl: {paddingBlock: semanticTokens.spacingXl},
  padding2xl: {paddingBlock: semanticTokens.spacing2xl},
});

const paddings = {
  xs: styles.paddingXs,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
  xl: styles.paddingXl,
  '2xl': styles.padding2xl,
} as const;

export interface SectionProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'className'
> {
  readonly padding?: Space;
}

export function Section({children, padding = 'xl', ...props}: SectionProps) {
  return (
    <section {...props} {...stylex.props(paddings[padding])}>
      {children}
    </section>
  );
}
