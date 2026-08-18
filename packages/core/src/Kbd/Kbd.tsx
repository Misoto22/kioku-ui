import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusInner,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    color: semanticTokens.colorText,
    display: 'inline-block',
    fontFamily: semanticTokens.fontFamilyMono,
    fontSize: '0.875em',
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
