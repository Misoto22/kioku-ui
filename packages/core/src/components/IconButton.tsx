import * as stylex from '@stylexjs/stylex';
import type {ButtonHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusRound,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    color: semanticTokens.colorText,
    display: 'inline-flex',
    height: semanticTokens.densityControlBlock,
    justifyContent: 'center',
    width: semanticTokens.densityControlBlock,
  },
});

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'className'
> {
  readonly 'aria-label': string;
}

export function IconButton({
  children,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button {...props} {...stylex.props(styles.base)} type={type}>
      {children}
    </button>
  );
}
