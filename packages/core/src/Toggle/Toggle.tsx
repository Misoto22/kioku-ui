import * as stylex from '@stylexjs/stylex';
import {useState, type ButtonHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    display: 'inline-flex',
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingLabel,
    gap: semanticTokens.spacingSm,
    justifyContent: 'center',
    minHeight: semanticTokens.sizeHitTarget,
    minWidth: semanticTokens.sizeHitTarget,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingXs,
    ':active:not(:disabled)': {
      backgroundImage: `linear-gradient(${semanticTokens.colorOverlayActive}, ${semanticTokens.colorOverlayActive})`,
    },
    ':disabled': {color: semanticTokens.colorDisabledText},
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover:not(:disabled)': {
      backgroundImage: `linear-gradient(${semanticTokens.colorOverlayHover}, ${semanticTokens.colorOverlayHover})`,
    },
  },
  // The track is squared and the knob is round. A capsule track was the one
  // control still borrowing its shape from somewhere else: everything around it
  // turns a 3px corner, and a pill next to a 3px input reads as imported.
  track: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    display: 'inline-flex',
    flexShrink: 0,
    height: semanticTokens.spacingLg,
    justifyContent: 'flex-start',
    width: semanticTokens.sizeControlLg,
  },
  trackOn: {
    backgroundColor: semanticTokens.colorAccent,
    borderColor: semanticTokens.colorAccent,
    justifyContent: 'flex-end',
  },
  trackDisabled: {
    backgroundColor: semanticTokens.colorDisabledSurface,
    borderColor: semanticTokens.borderDisabled,
  },
  thumb: {
    backgroundColor: semanticTokens.colorSurfaceRaised,
    borderRadius: semanticTokens.radiusFull,
    boxShadow: semanticTokens.elevationLow,
    height: semanticTokens.spacingMd,
    width: semanticTokens.spacingMd,
  },
  thumbDisabled: {backgroundColor: semanticTokens.colorDisabledText},
});

type SharedToggleProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-checked' | 'aria-pressed' | 'className' | 'onChange' | 'role'
> & {
  readonly onPressedChange?: (pressed: boolean) => void;
};

type ControlledToggleProps = SharedToggleProps & {
  readonly defaultPressed?: never;
  readonly onPressedChange: (pressed: boolean) => void;
  readonly pressed: boolean;
};

type UncontrolledToggleProps = SharedToggleProps & {
  readonly defaultPressed?: boolean;
  readonly pressed?: never;
};

export type ToggleProps = ControlledToggleProps | UncontrolledToggleProps;

export function Toggle({
  children,
  defaultPressed = false,
  disabled,
  onClick,
  onPressedChange,
  pressed,
  type = 'button',
  ...props
}: ToggleProps) {
  const [internalPressed, setInternalPressed] = useState(defaultPressed);
  const isPressed = pressed ?? internalPressed;

  return (
    <button
      {...props}
      aria-checked={isPressed}
      disabled={disabled}
      onClick={(event) => {
        const nextPressed = !isPressed;
        if (pressed === undefined) {
          setInternalPressed(nextPressed);
        }
        onPressedChange?.(nextPressed);
        onClick?.(event);
      }}
      role="switch"
      {...stylex.props(styles.base)}
      type={type}
    >
      <span
        aria-hidden="true"
        {...stylex.props(
          styles.track,
          isPressed ? styles.trackOn : undefined,
          disabled ? styles.trackDisabled : undefined,
        )}
      >
        <span
          aria-hidden="true"
          {...stylex.props(
            styles.thumb,
            disabled ? styles.thumbDisabled : undefined,
          )}
        />
      </span>
      {children}
    </button>
  );
}
