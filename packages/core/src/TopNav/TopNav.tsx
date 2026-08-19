import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  // The masthead is a surface over the canvas, parted from the page by a rule
  // rather than a shadow.
  bar: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurface,
    borderBlockEndColor: semanticTokens.borderStrong,
    borderBlockEndStyle: semanticTokens.borderStyle,
    borderBlockEndWidth: semanticTokens.borderWidth,
    columnGap: semanticTokens.spacingLg,
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    // One hit target tall, so the banner keeps its height whether it holds a
    // wordmark alone or a wordmark, a menu, and a row of account tools.
    minHeight: semanticTokens.sizeHitTarget,
    paddingBlock: semanticTokens.spacingSm,
    paddingInline: semanticTokens.spacingLg,
  },
  brand: {
    alignItems: 'center',
    color: semanticTokens.colorText,
    columnGap: semanticTokens.spacingSm,
    display: 'flex',
    flexShrink: 0,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeLg,
    fontWeight: semanticTokens.fontWeightStrong,
    letterSpacing: semanticTokens.letterSpacingHeading,
    lineHeight: semanticTokens.lineHeightHeading,
  },
  navigation: {flexGrow: 1, minWidth: 0},
  actions: {
    alignItems: 'center',
    columnGap: semanticTokens.spacingSm,
    display: 'flex',
    flexShrink: 0,
  },
});

/** Props for the banner across the top of an application. */
export interface TopNavProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'className' | 'role'
> {
  readonly actions?: ReactNode;
  readonly brand?: ReactNode;
  readonly children?: ReactNode;
}

/**
 * Places identity, primary navigation, and account actions in one banner.
 * It emits `header`, so it is the page banner landmark.
 */
export function TopNav({actions, brand, children, ...props}: TopNavProps) {
  return (
    <header {...props} {...stylex.props(styles.bar)}>
      {brand === undefined ? null : (
        <div {...stylex.props(styles.brand)}>{brand}</div>
      )}
      {children === undefined ? null : (
        <div {...stylex.props(styles.navigation)}>{children}</div>
      )}
      {actions === undefined ? null : (
        <div {...stylex.props(styles.actions)}>{actions}</div>
      )}
    </header>
  );
}
