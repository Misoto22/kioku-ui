import * as stylex from '@stylexjs/stylex';
import type {ButtonHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    alignItems: 'center',
    borderRadius: semanticTokens.radiusSm,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    fontWeight: semanticTokens.fontWeightMedium,
    gap: semanticTokens.densityItemGap,
    justifyContent: 'center',
    minHeight: semanticTokens.densityControlBlock,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.densityControlInline,
  },
  primary: {
    backgroundColor: semanticTokens.colorText,
    borderColor: semanticTokens.colorText,
    color: semanticTokens.colorSurface,
  },
  secondary: {
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderStrong,
    color: semanticTokens.colorText,
  },
  ghost: {
    backgroundColor: semanticTokens.colorCanvas,
    borderColor: semanticTokens.colorCanvas,
    color: semanticTokens.colorText,
  },
});

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className'
> {
  readonly variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      {...stylex.props(styles.base, styles[variant])}
      type={type}
    >
      {children}
    </button>
  );
}
