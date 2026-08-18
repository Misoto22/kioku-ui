import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  bar: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurface,
    borderBlockEndColor: semanticTokens.borderDefault,
    borderBlockEndStyle: semanticTokens.borderStyle,
    borderBlockEndWidth: semanticTokens.borderWidth,
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingLg,
    paddingBlock: semanticTokens.spacingSm,
    paddingInline: semanticTokens.spacingLg,
  },
  brand: {
    alignItems: 'center',
    color: semanticTokens.colorText,
    display: 'flex',
    flexShrink: 0,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeLg,
    fontWeight: semanticTokens.fontWeightStrong,
    gap: semanticTokens.spacingSm,
  },
  navigation: {flexGrow: 1, minWidth: 0},
  actions: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    gap: semanticTokens.spacingSm,
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
