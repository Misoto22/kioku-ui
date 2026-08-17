import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {Space} from './Stack.js';

const styles = stylex.create({
  base: {display: 'grid'},
  columnOne: {gridTemplateColumns: 'repeat(1, minmax(0, 1fr))'},
  columnTwo: {gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'},
  columnThree: {gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'},
  columnFour: {gridTemplateColumns: 'repeat(4, minmax(0, 1fr))'},
  gapXs: {gap: semanticTokens.spacingXs},
  gapSm: {gap: semanticTokens.spacingSm},
  gapMd: {gap: semanticTokens.spacingMd},
  gapLg: {gap: semanticTokens.spacingLg},
  gapXl: {gap: semanticTokens.spacingXl},
  gap2xl: {gap: semanticTokens.spacing2xl},
});

export interface GridProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className'
> {
  readonly columns?: 1 | 2 | 3 | 4;
  readonly gap?: Space;
}

const columnStyles = {
  1: styles.columnOne,
  2: styles.columnTwo,
  3: styles.columnThree,
  4: styles.columnFour,
} as const;

const gaps = {
  xs: styles.gapXs,
  sm: styles.gapSm,
  md: styles.gapMd,
  lg: styles.gapLg,
  xl: styles.gapXl,
  '2xl': styles.gap2xl,
} as const;

export function Grid({columns = 1, gap = 'md', children, ...props}: GridProps) {
  return (
    <div
      {...props}
      {...stylex.props(styles.base, columnStyles[columns], gaps[gap])}
    >
      {children}
    </div>
  );
}
