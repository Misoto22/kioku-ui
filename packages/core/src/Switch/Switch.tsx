import * as stylex from '@stylexjs/stylex';
import {useState} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {ToggleProps} from '../Toggle/index.js';

// The knob crosses the track's inner width: the track less its two hairline
// edges and the knob's own diameter. No single step of the scale names it.
const knobTravel = `calc(${semanticTokens.sizeControlLg} - ${semanticTokens.spacingMd} - ${semanticTokens.borderWidth} * 2)`;

const styles = stylex.create({
  control: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    color: semanticTokens.colorText,
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    gap: semanticTokens.spacingSm,
    justifyContent: 'flex-start',
    letterSpacing: semanticTokens.letterSpacingLabel,
    lineHeight: semanticTokens.lineHeightBody,
    minHeight: semanticTokens.sizeHitTarget,
    minWidth: semanticTokens.sizeHitTarget,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingXs,
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, color',
    transitionTimingFunction: semanticTokens.easingStandard,
    ':active:not(:disabled)': {
      backgroundImage: `linear-gradient(${semanticTokens.colorOverlayActive}, ${semanticTokens.colorOverlayActive})`,
    },
    ':disabled': {color: semanticTokens.colorDisabledText, cursor: 'default'},
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover:not(:disabled):not(:active)': {
      backgroundImage: `linear-gradient(${semanticTokens.colorOverlayHover}, ${semanticTokens.colorOverlayHover})`,
    },
  },
  // The track is a well, not a capsule: it takes the element radius every
  // other control takes. Only the knob is genuinely round.
  track: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxSizing: 'border-box',
    display: 'inline-flex',
    flexShrink: 0,
    height: semanticTokens.spacingLg,
    justifyContent: 'flex-start',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, border-color',
    transitionTimingFunction: semanticTokens.easingStandard,
    width: semanticTokens.sizeControlLg,
  },
  trackOn: {
    backgroundColor: semanticTokens.colorAccent,
    borderColor: semanticTokens.colorAccent,
  },
  trackDisabled: {
    backgroundColor: semanticTokens.colorDisabledSurface,
    borderColor: semanticTokens.borderDisabled,
  },
  // Travel is written on the inline axis so the knob crosses the way the
  // reading direction runs.
  knob: {
    backgroundColor: semanticTokens.colorSurfaceRaised,
    borderRadius: semanticTokens.radiusFull,
    boxShadow: semanticTokens.elevationLow,
    height: semanticTokens.spacingMd,
    insetInlineStart: 0,
    position: 'relative',
    transitionDuration: semanticTokens.durationModerate,
    transitionProperty: 'inset-inline-start',
    transitionTimingFunction: semanticTokens.easingStandard,
    width: semanticTokens.spacingMd,
  },
  knobOn: {insetInlineStart: knobTravel},
  knobDisabled: {
    backgroundColor: semanticTokens.colorDisabledText,
    boxShadow: 'none',
  },
});

/** Props for a control that applies its change immediately. */
export type SwitchProps = ToggleProps;

/**
 * Turns a setting on or off, taking effect at once. Use `Toggle` when the
 * control expresses a pressed state inside a toolbar instead of a setting,
 * and a `CheckboxInput` when the value is only submitted with a form.
 */
export function Switch({
  children,
  defaultPressed = false,
  disabled,
  onClick,
  onPressedChange,
  pressed,
  type = 'button',
  ...props
}: SwitchProps) {
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
      {...stylex.props(styles.control)}
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
            styles.knob,
            isPressed ? styles.knobOn : undefined,
            disabled ? styles.knobDisabled : undefined,
          )}
        />
      </span>
      {children}
    </button>
  );
}
