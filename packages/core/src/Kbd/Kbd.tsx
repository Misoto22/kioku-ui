import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    // A key cap is a well in the page, not a bevelled object above it — and at
    // this size not an outlined one either: a 16px box with a hairline round
    // it reads as a field that failed to grow. The fill draws the edge.
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderRadius: semanticTokens.radiusInner,
    borderStyle: 'none',
    boxShadow: 'none',
    color: semanticTokens.colorText,
    display: 'inline-block',
    fontFamily: semanticTokens.fontFamilyMono,
    fontSize: semanticTokens.fontSizeXs,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: semanticTokens.letterSpacingMono,
    lineHeight: semanticTokens.lineHeightBody,
    paddingInline: semanticTokens.spacingXs,
    whiteSpace: 'nowrap',
  },
});

/** Props for a rendered keyboard key. */
export type KbdProps = Omit<HTMLAttributes<HTMLElement>, 'className'>;

/** Renders one keyboard key so shortcuts read as input, not as prose. */
export function Kbd({children, ...props}: KbdProps) {
  return (
    <kbd {...props} {...stylex.props(styles.base)}>
      {children}
    </kbd>
  );
}
