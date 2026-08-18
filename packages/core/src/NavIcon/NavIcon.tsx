import * as stylex from '@stylexjs/stylex';
import type {ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  slot: {
    alignItems: 'center',
    color: 'inherit',
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: semanticTokens.fontSizeLg,
    justifyContent: 'center',
    height: semanticTokens.fontSizeLg,
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
