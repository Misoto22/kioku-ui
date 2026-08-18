import * as stylex from '@stylexjs/stylex';
import type {ButtonHTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  card: {
    backgroundColor: semanticTokens.colorSurface,
    // A control's own edge is a real border, so the card carries no
    // elevation: drawing both would draw the same line twice.
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusContainer,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxShadow: 'none',
    boxSizing: 'border-box',
    color: semanticTokens.colorText,
    cursor: 'pointer',
    display: 'block',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    fontWeight: semanticTokens.fontWeightRegular,
    inlineSize: '100%',
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    padding: semanticTokens.spacingLg,
    textAlign: 'start',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, border-color, color',
    transitionTimingFunction: semanticTokens.easingStandard,
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
    // Hover is a wash over the surface. The card never lifts, scales, or
    // grows a shadow: nothing in this system blurs.
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
    <button {...props} {...stylex.props(styles.card)} type={type}>
      {children}
    </button>
  );
}
