import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, LiHTMLAttributes, OlHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {Space} from '../Stack/index.js';

const styles = stylex.create({
  base: {
    color: semanticTokens.colorText,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    lineHeight: semanticTokens.lineHeightBody,
    marginBlock: 0,
  },
  marked: {
    paddingInlineStart: semanticTokens.spacingXl,
  },
  plain: {
    listStyleType: 'none',
    paddingInlineStart: 0,
  },
  unordered: {listStyleType: 'disc'},
  ordered: {listStyleType: 'decimal'},
  gapXs: {gap: semanticTokens.spacingXs},
  gapSm: {gap: semanticTokens.spacingSm},
  gapMd: {gap: semanticTokens.spacingMd},
  gapLg: {gap: semanticTokens.spacingLg},
  gapXl: {gap: semanticTokens.spacingXl},
  gap2xl: {gap: semanticTokens.spacing2xl},
  item: {marginBlock: 0},
});

const gaps = {
  xs: styles.gapXs,
  sm: styles.gapSm,
  md: styles.gapMd,
  lg: styles.gapLg,
  xl: styles.gapXl,
  '2xl': styles.gap2xl,
} as const;

/** Marker treatments a list can apply to its items. */
export type ListVariant = 'unordered' | 'ordered' | 'plain';

/** Props for a vertical collection of related items. */
export interface ListProps extends Omit<
  OlHTMLAttributes<HTMLOListElement> & HTMLAttributes<HTMLUListElement>,
  'className' | 'type'
> {
  readonly gap?: Space;
  readonly variant?: ListVariant;
}

/**
 * Renders a semantic list. `ordered` emits `ol` so reading order carries
 * meaning; the other variants emit `ul`.
 */
export function List({
  children,
  gap = 'sm',
  variant = 'unordered',
  ...props
}: ListProps) {
  const listProps = {
    ...props,
    ...stylex.props(
      styles.base,
      gaps[gap],
      variant === 'plain' ? styles.plain : styles.marked,
      variant !== 'plain' && styles[variant],
    ),
  };

  return variant === 'ordered' ? (
    <ol {...listProps}>{children}</ol>
  ) : (
    <ul {...listProps}>{children}</ul>
  );
}

/** Props for a single entry inside a `List`. */
export type ListItemProps = Omit<LiHTMLAttributes<HTMLLIElement>, 'className'>;

/** Renders one list entry without overriding the parent marker treatment. */
export function ListItem({children, ...props}: ListItemProps) {
  return (
    <li {...props} {...stylex.props(styles.item)}>
      {children}
    </li>
  );
}
