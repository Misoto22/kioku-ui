import * as stylex from '@stylexjs/stylex';
import type {ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  slot: {
    alignItems: 'center',
    color: 'inherit',
    display: 'inline-flex',
    flexShrink: 0,
    fontFamily: semanticTokens.fontFamilyBody,
    // The em basis an `Icon` sizes itself against, so a glyph fills the
    // square exactly rather than inheriting the label's size.
    fontSize: semanticTokens.fontSizeLg,
    height: semanticTokens.fontSizeLg,
    justifyContent: 'center',
    // One glyph, so it is set solid: tracking has nothing to open here.
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightHeading,
    width: semanticTokens.fontSizeLg,
  },
});

/** Props for the fixed icon slot inside navigation. */
export interface NavIconProps {
  readonly children: ReactNode;
}

/**
 * Reserves one fixed square for a navigation glyph so labels stay aligned
 * whether or not a given item carries an icon.
 */
export function NavIcon({children}: NavIconProps) {
  return (
    <span aria-hidden="true" {...stylex.props(styles.slot)}>
      {children}
    </span>
  );
}
