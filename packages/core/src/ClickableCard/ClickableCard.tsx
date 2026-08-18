import * as stylex from '@stylexjs/stylex';
import type {ButtonHTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  card: {
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusContainer,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    color: semanticTokens.colorText,
    cursor: 'pointer',
    display: 'block',
    fontFamily: semanticTokens.fontFamilyBody,
    inlineSize: '100%',
    padding: semanticTokens.spacingLg,
    textAlign: 'start',
    ':disabled': {
      backgroundColor: semanticTokens.colorDisabledSurface,
      borderColor: semanticTokens.borderDisabled,
      color: semanticTokens.colorDisabledText,
      cursor: 'default',
    },
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover:not(:disabled)': {
      backgroundColor: semanticTokens.colorOverlayHover,
      borderColor: semanticTokens.borderInteractive,
    },
  },
});

/** Props for a card that acts as a single control. */
export interface ClickableCardProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className'
> {
  readonly children: ReactNode;
}

/**
 * A card that is itself the control. It emits one button, so the whole surface
 * is a single tab stop — never nest another control inside it.
 */
export function ClickableCard({
  children,
  type = 'button',
  ...props
}: ClickableCardProps) {
  return (
    <button {...props} type={type} {...stylex.props(styles.card)}>
      {children}
    </button>
  );
}
