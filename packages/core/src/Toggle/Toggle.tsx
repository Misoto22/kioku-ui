import * as stylex from '@stylexjs/stylex';
import {useState, type ButtonHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

// The console's switch, in tokens, and the same block `Switch` is cut from —
// the two are one control wearing two names, so they may not drift apart. Its
// proportions are relationships rather than measurements: a track one spacing
// step tall, a knob inset by a hairline on each side, and a travel of exactly
// the difference between the track's two dimensions. Nothing here is a
// literal, so the control keeps its proportions when density moves it.
const trackHeight = semanticTokens.spacingLg;
const trackWidth = semanticTokens.sizeControlMd;
const knobInset = `calc(${semanticTokens.borderWidth} * 2)`;
const knobSize = `calc(${trackHeight} - ${knobInset} * 2)`;
const knobTravel = `calc(${trackWidth} - ${trackHeight})`;

const styles = stylex.create({
  base: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    cursor: 'pointer',
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
  // input box with something inside it — an outlined 14px track reads as a
  // field that failed to grow, which is what this was. The corner is the
  // sheet's 3px; a pill beside a 3px input reads as imported.
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
  thumb: {
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
  thumbOn: {insetInlineStart: knobTravel},
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
            isPressed ? styles.thumbOn : undefined,
            disabled ? styles.thumbDisabled : undefined,
          )}
        />
      </span>
      {children}
    </button>
  );
}
