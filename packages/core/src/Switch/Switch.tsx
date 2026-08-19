import * as stylex from '@stylexjs/stylex';
import {useState} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {ToggleProps} from '../Toggle/index.js';

// The console's switch, in tokens. Its proportions are the point: a track as
// tall as one spacing step, a knob inset by a hairline on each side, and a
// travel of exactly the difference. Nothing here is a literal, so the control
// keeps its proportions when density moves it.
const trackHeight = semanticTokens.spacingLg;
const trackWidth = semanticTokens.sizeControlMd;
const knobInset = `calc(${semanticTokens.borderWidth} * 2)`;
const knobSize = `calc(${trackHeight} - ${knobInset} * 2)`;
const knobTravel = `calc(${trackWidth} - ${trackHeight})`;

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
  // No border. The track is a solid block that changes colour, not a small
  // input box with something inside it — an outlined track reads as a field,
  // and at 14px a field reads as a mistake.
  track: {
    alignItems: 'center',
    backgroundColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusElement,
    boxSizing: 'border-box',
    display: 'inline-flex',
    flexShrink: 0,
    height: trackHeight,
    justifyContent: 'flex-start',
    padding: knobInset,
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color',
    transitionTimingFunction: semanticTokens.easingStandard,
    width: trackWidth,
  },
  // On is ink. "In effect" is the same colour as the seal on the primary
  // button, and for the same reason: the accent is reserved for thin marks.
  trackOn: {backgroundColor: semanticTokens.colorText},
  trackDisabled: {backgroundColor: semanticTokens.colorDisabledSurface},
  // A round knob travelling inside a squared track reads as a physical switch;
  // two capsules read as a widget.
  knob: {
    backgroundColor: semanticTokens.colorSurface,
    borderRadius: semanticTokens.radiusFull,
    height: knobSize,
    insetInlineStart: 0,
    position: 'relative',
    transitionDuration: semanticTokens.durationModerate,
    transitionProperty: 'inset-inline-start',
    transitionTimingFunction: semanticTokens.easingStandard,
    width: knobSize,
  },
  knobOn: {insetInlineStart: knobTravel},
  knobDisabled: {backgroundColor: semanticTokens.colorDisabledText},
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
