import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderRadius: semanticTokens.radiusInner,
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyMono,
    // A ratio, not a size: inline code tracks whatever it is set inside.
    fontSize: '0.9375em',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: semanticTokens.letterSpacingMono,
    paddingInline: semanticTokens.spacingXs,
    wordBreak: 'break-word',
  },
});

/** Props for an inline code fragment. */
export type CodeProps = Omit<HTMLAttributes<HTMLElement>, 'className'>;

/** Marks a fragment as code without claiming it is a standalone block. */
export function Code({children, ...props}: CodeProps) {
  return (
    <code {...props} {...stylex.props(styles.base)}>
      {children}
    </code>
  );
}
