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
    // The em basis an `Icon` sizes itself against, held at the label's own
    // size rather than above it. A mark drawn larger than the word it marks
    // competes with it, and there is one down the left edge of every row.
    fontSize: semanticTokens.fontSizeMd,
    // The box is a fixed square, one step above the glyph inside it. It has to
    // be fixed: sized from the label's own `fontSizeMd` the gutter moved
    // whenever the type did, and `NavItem` could not reserve a matching one
    // for a row that carries no glyph.
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
