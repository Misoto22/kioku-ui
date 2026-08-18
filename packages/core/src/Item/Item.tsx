import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    alignItems: 'center',
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingSm,
    minWidth: 0,
  },
  slot: {
    alignItems: 'center',
    color: semanticTokens.colorTextSecondary,
    display: 'flex',
    flexShrink: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0,
  },
  label: {
    color: semanticTokens.colorText,
    fontSize: semanticTokens.fontSizeMd,
    lineHeight: semanticTokens.lineHeightBody,
  },
  description: {
    color: semanticTokens.colorTextSecondary,
    fontSize: semanticTokens.fontSizeSm,
    lineHeight: semanticTokens.lineHeightBody,
  },
});

/** Props for the shared leading/label/trailing row layout. */
export interface ItemProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className'
> {
  readonly description?: ReactNode;
  readonly leading?: ReactNode;
  readonly trailing?: ReactNode;
}

/**
 * Lays out one row of content so lists, menus, and navigation share the same
 * spacing rhythm without each re-deriving it.
 */
export function Item({
  children,
  description,
  leading,
  trailing,
  ...props
}: ItemProps) {
  return (
    <div {...props} {...stylex.props(styles.base)}>
      {leading === undefined ? null : (
        <span {...stylex.props(styles.slot)}>{leading}</span>
      )}
      <span {...stylex.props(styles.content)}>
        <span {...stylex.props(styles.label)}>{children}</span>
        {description === undefined ? null : (
          <span {...stylex.props(styles.description)}>{description}</span>
        )}
      </span>
      {trailing === undefined ? null : (
        <span {...stylex.props(styles.slot)}>{trailing}</span>
      )}
    </div>
  );
}
