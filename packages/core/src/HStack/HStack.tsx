import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {Space} from '../Stack/index.js';

const styles = stylex.create({
  base: {display: 'flex', flexDirection: 'row'},
  wrap: {flexWrap: 'wrap'},
  gapXs: {gap: semanticTokens.spacingXs},
  gapSm: {gap: semanticTokens.spacingSm},
  gapMd: {gap: semanticTokens.spacingMd},
  gapLg: {gap: semanticTokens.spacingLg},
  gapXl: {gap: semanticTokens.spacingXl},
  gap2xl: {gap: semanticTokens.spacing2xl},
  alignStretch: {alignItems: 'stretch'},
  alignStart: {alignItems: 'flex-start'},
  alignCenter: {alignItems: 'center'},
  alignEnd: {alignItems: 'flex-end'},
  alignBaseline: {alignItems: 'baseline'},
  justifyStart: {justifyContent: 'flex-start'},
  justifyCenter: {justifyContent: 'center'},
  justifyEnd: {justifyContent: 'flex-end'},
  justifyBetween: {justifyContent: 'space-between'},
});

const gaps = {
  xs: styles.gapXs,
  sm: styles.gapSm,
  md: styles.gapMd,
  lg: styles.gapLg,
  xl: styles.gapXl,
  '2xl': styles.gap2xl,
} as const;

const aligns = {
  stretch: styles.alignStretch,
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
  baseline: styles.alignBaseline,
} as const;

const justifies = {
  start: styles.justifyStart,
  center: styles.justifyCenter,
  end: styles.justifyEnd,
  between: styles.justifyBetween,
} as const;

/** Cross-axis placement a horizontal stack can apply. */
export type HStackAlign = 'baseline' | 'center' | 'end' | 'start' | 'stretch';

/** Main-axis distribution a horizontal stack can apply. */
export type HStackJustify = 'between' | 'center' | 'end' | 'start';

/** Props for a row of evenly spaced children. */
export interface HStackProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className'
> {
  readonly align?: HStackAlign;
  readonly gap?: Space;
  readonly justify?: HStackJustify;
  readonly wrap?: boolean;
}

/** Arranges children in a row. Use `Stack` for the vertical equivalent. */
export function HStack({
  align = 'center',
  children,
  gap = 'md',
  justify = 'start',
  wrap = false,
  ...props
}: HStackProps) {
  return (
    <div
      {...props}
      {...stylex.props(
        styles.base,
        gaps[gap],
        aligns[align],
        justifies[justify],
        wrap && styles.wrap,
      )}
    >
      {children}
    </div>
  );
}
