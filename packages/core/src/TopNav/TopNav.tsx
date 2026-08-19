import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  // The masthead is the top of the same sheet the page is printed on, not a
  // bar laid over it: the rule under it is the only thing that parts the two.
  // Painting it `colorSurface` made the banner read as a card the width of the
  // window, which put the shell on the same rung as the cards inside it.
  bar: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorCanvas,
    borderBlockEndColor: semanticTokens.borderDefault,
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
  // A wordmark, so it is cut in the display face and tracked as a display
  // name rather than as a heading. It carries the medium weight the rest of
  // the masthead does: a bolder wordmark shouts across a bar that is otherwise
  // all second-rank ink.
  brand: {
    alignItems: 'center',
    color: semanticTokens.colorText,
    columnGap: semanticTokens.spacingSm,
    display: 'flex',
    flexShrink: 0,
    fontFamily: semanticTokens.fontFamilyDisplay,
    fontSize: semanticTokens.fontSizeLg,
    fontSynthesis: 'none',
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: semanticTokens.letterSpacingLabel,
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
