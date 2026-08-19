import * as stylex from '@stylexjs/stylex';
import {useState, type ButtonHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {ControlSize} from '../Button/index.js';

const styles = stylex.create({
  // The block-end edge is carried at the focus weight in every state so the
  // pressed mark can arrive as colour alone, without the box changing size.
  base: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurface,
    borderBlockEndStyle: semanticTokens.borderStyle,
    borderBlockEndWidth: semanticTokens.focusWidth,
    borderBlockStartStyle: semanticTokens.borderStyle,
    borderBlockStartWidth: semanticTokens.borderWidth,
    borderInlineStyle: semanticTokens.borderStyle,
    borderInlineWidth: semanticTokens.borderWidth,
    borderRadius: semanticTokens.radiusElement,
    boxSizing: 'border-box',
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingSm,
    justifyContent: 'center',
    letterSpacing: semanticTokens.letterSpacingLabel,
    lineHeight: semanticTokens.lineHeightBody,
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, border-color, color',
    transitionTimingFunction: semanticTokens.easingStandard,
    ':disabled': {
      backgroundColor: semanticTokens.colorDisabledSurface,
      borderBlockEndColor: semanticTokens.borderDisabled,
      borderBlockStartColor: semanticTokens.borderDisabled,
      borderInlineEndColor: semanticTokens.borderDisabled,
      borderInlineStartColor: semanticTokens.borderDisabled,
      color: semanticTokens.colorDisabledText,
      cursor: 'default',
    },
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  sm: {
    fontSize: semanticTokens.fontSizeSm,
    height: semanticTokens.sizeControlSm,
    paddingInline: semanticTokens.spacingSm,
  },
  md: {
    fontSize: semanticTokens.fontSizeMd,
    height: semanticTokens.sizeControlMd,
    paddingInline: semanticTokens.spacingMd,
  },
  lg: {
    fontSize: semanticTokens.fontSizeMd,
    height: semanticTokens.sizeControlLg,
    paddingInline: semanticTokens.spacingLg,
  },
  // Only the state that can still be entered carries a hover or a press.
  unpressed: {
    borderBlockEndColor: semanticTokens.borderStrong,
    borderBlockStartColor: semanticTokens.borderStrong,
    borderInlineEndColor: semanticTokens.borderStrong,
    borderInlineStartColor: semanticTokens.borderStrong,
    color: semanticTokens.colorTextSecondary,
    fontWeight: semanticTokens.fontWeightRegular,
    ':active:not(:disabled)': {
      backgroundColor: semanticTokens.colorOverlayActive,
      borderBlockEndColor: semanticTokens.borderInteractive,
      borderBlockStartColor: semanticTokens.borderInteractive,
      borderInlineEndColor: semanticTokens.borderInteractive,
      borderInlineStartColor: semanticTokens.borderInteractive,
    },
    ':hover:not(:disabled):not(:active)': {
      backgroundColor: semanticTokens.colorOverlayHover,
      borderBlockEndColor: semanticTokens.borderInteractive,
      borderBlockStartColor: semanticTokens.borderInteractive,
      borderInlineEndColor: semanticTokens.borderInteractive,
      borderInlineStartColor: semanticTokens.borderInteractive,
    },
  },
  // Pressed is a mark and a change of ink, never a filled block. The mark is
  // the same ink underline a selected tab draws, one weight heavier than the
  // edge it replaces, so a pressed toggle and a current tab read as one idea.
  pressed: {
    borderBlockEndColor: semanticTokens.colorText,
    borderBlockStartColor: semanticTokens.borderStrong,
    borderInlineEndColor: semanticTokens.borderStrong,
    borderInlineStartColor: semanticTokens.borderStrong,
    color: semanticTokens.colorText,
    fontWeight: semanticTokens.fontWeightMedium,
  },
});

type SharedToggleButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-pressed' | 'className'
> & {
  readonly onPressedChange?: (pressed: boolean) => void;
  readonly size?: ControlSize;
};

type ControlledToggleButtonProps = SharedToggleButtonProps & {
  readonly defaultPressed?: never;
  readonly onPressedChange: (pressed: boolean) => void;
  readonly pressed: boolean;
};

type UncontrolledToggleButtonProps = SharedToggleButtonProps & {
  readonly defaultPressed?: boolean;
  readonly pressed?: never;
};

/** Props for a button that stays pressed. */
export type ToggleButtonProps =
  ControlledToggleButtonProps | UncontrolledToggleButtonProps;

/**
 * A button that stays pressed. It reports state through `aria-pressed`, which
 * is what separates it from `Switch`: this is a command that stays on, not a
 * setting that applies on its own.
 */
export function ToggleButton({
  children,
  defaultPressed = false,
  disabled,
  onClick,
  onPressedChange,
  pressed,
  size = 'md',
  type = 'button',
  ...props
}: ToggleButtonProps) {
  const [internalPressed, setInternalPressed] = useState(defaultPressed);
  const isPressed = pressed ?? internalPressed;

  return (
    <button
      {...props}
      aria-pressed={isPressed}
      disabled={disabled}
      onClick={(event) => {
        const next = !isPressed;
        if (pressed === undefined) {
          setInternalPressed(next);
        }
        onPressedChange?.(next);
        onClick?.(event);
      }}
      {...stylex.props(
        styles.base,
        styles[size],
        isPressed ? styles.pressed : styles.unpressed,
      )}
      type={type}
    >
      {children}
    </button>
  );
}
