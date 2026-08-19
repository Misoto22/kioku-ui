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
  // Three ranks, top to bottom: the label is what the row is, the slots are
  // what is available beside it, the description is context. Separating them
  // by ink is what keeps a list of rows from needing a fill per row.
  // No colour here. A row is placed inside things that have already decided
  // what rank it holds — a disabled menu item, a second-rank option — and
  // pinning the first rank here overrode every one of them. The label inherits
  // its ink from whatever placed it; the description still steps down, because
  // that step is relative to the label wherever the label landed.
  label: {
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
  },
  description: {
    // Secondary, not muted, and it cannot become muted. A row that responds to
    // the pointer is read against the hover wash, not the bare surface, and on
    // that composite the third rank lands at 3.81:1 in every dark theme. The
    // gap that would clear 4.5:1 puts muted at 97-105% of secondary, which is
    // not a third rank at all. So an interactive row has two ink ranks, and
    // the description separates from the label by size instead.
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingBody,
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
