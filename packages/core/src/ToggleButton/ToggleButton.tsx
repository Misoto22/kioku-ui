import * as stylex from '@stylexjs/stylex';
import {useState, type ButtonHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {ControlSize} from '../Button/index.js';

const styles = stylex.create({
  base: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    color: semanticTokens.colorText,
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontWeight: semanticTokens.fontWeightMedium,
    gap: semanticTokens.spacingSm,
    justifyContent: 'center',
    lineHeight: semanticTokens.lineHeightBody,
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
  pressed: {
    backgroundColor: semanticTokens.colorAccent,
    borderColor: semanticTokens.colorAccent,
    color: semanticTokens.colorTextOnAccent,
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
      type={type}
      {...stylex.props(styles.base, styles[size], isPressed && styles.pressed)}
    >
      {children}
    </button>
  );
}
