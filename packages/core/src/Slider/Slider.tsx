import * as stylex from '@stylexjs/stylex';
import {
  useState,
  type ChangeEvent,
  type CSSProperties,
  type InputHTMLAttributes,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useFieldControl} from '../Field/index.js';
import {clamp} from '../utils/index.js';

/*
 * A range control is drawn by the engine, and each engine exposes its own
 * pseudo-elements for the parts and ignores the other's — hence the doubled
 * declarations. `appearance: 'none'` on the input is what hands authorship
 * over: without it WebKit keeps painting its own thumb and the one declared
 * here is ignored outright.
 *
 * The filled portion is a gradient on the track rather than a native part,
 * because only Gecko exposes one (`::-moz-range-progress`) and WebKit has no
 * counterpart. Painting it the same way in both engines makes them agree by
 * construction; the Gecko part is then held transparent so it cannot lay a
 * second fill over the gradient. Styling the track at all also stops WebKit
 * painting the `accent-color` fill it would otherwise draw, so `accentColor`
 * has nothing left to colour and is gone.
 *
 * The stop position is data — the current value — so it arrives as an inline
 * custom property, the way `ProgressBar` carries its width.
 */
const progressProperty = '--kioku-ui-slider-progress';
// CSS has no logical direction keyword for a gradient, so this is physical.
// Under `direction: rtl` the engine flips the control but not the gradient,
// and the fill would sit on the wrong side.
const fill = (from: string, to: string) =>
  `linear-gradient(to right, ${from} 0 var(${progressProperty}, 0%), ${to} var(${progressProperty}, 0%) 100%)`;

const trackThickness = semanticTokens.spacingSm;
const thumbSize = semanticTokens.spacingLg;
// WebKit lays the thumb out in flow on top of the track rather than centring
// it, so it is pulled back by half the difference between the two.
const thumbCentring = `calc((${trackThickness} - ${thumbSize}) / 2)`;

const styles = stylex.create({
  /*
   * There is deliberately no hover state. Every visible part is drawn by the
   * engine, so a hover would have to hand-roll a ring shadow, which rule 2
   * forbids — depth here is a hairline, not an invented one. A native range
   * has no hover affordance worth inventing, and `:focus-visible` plus the
   * disabled treatment carry the state matrix in both engines.
   */
  control: {
    appearance: 'none',
    backgroundColor: 'transparent',
    blockSize: semanticTokens.sizeHitTarget,
    cursor: 'pointer',
    inlineSize: '100%',
    marginBlock: 0,
    marginInline: 0,
    '::-webkit-slider-runnable-track': {
      backgroundColor: semanticTokens.colorSurfaceMuted,
      backgroundImage: fill(
        semanticTokens.colorAccent,
        semanticTokens.colorSurfaceMuted,
      ),
      blockSize: trackThickness,
      borderRadius: semanticTokens.radiusFull,
    },
    '::-webkit-slider-thumb': {
      appearance: 'none',
      backgroundColor: semanticTokens.colorSurface,
      blockSize: thumbSize,
      borderRadius: semanticTokens.radiusFull,
      boxShadow: semanticTokens.elevationLow,
      inlineSize: thumbSize,
      marginBlockStart: thumbCentring,
    },
    '::-moz-range-track': {
      backgroundColor: semanticTokens.colorSurfaceMuted,
      backgroundImage: fill(
        semanticTokens.colorAccent,
        semanticTokens.colorSurfaceMuted,
      ),
      blockSize: trackThickness,
      borderRadius: semanticTokens.radiusFull,
    },
    // Held transparent so Gecko's own filled part cannot paint over the
    // gradient the track already carries.
    '::-moz-range-progress': {backgroundColor: 'transparent'},
    '::-moz-range-thumb': {
      backgroundColor: semanticTokens.colorSurface,
      blockSize: thumbSize,
      borderRadius: semanticTokens.radiusFull,
      borderStyle: 'none',
      borderWidth: 0,
      boxShadow: semanticTokens.elevationLow,
      inlineSize: thumbSize,
    },
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  // The engine draws every visible part, so a disabled slider has to restate
  // them rather than tint the element. Driven from React, not from a selector.
  // The fill stays legible: a disabled slider still reports its value.
  disabled: {
    cursor: 'default',
    '::-webkit-slider-runnable-track': {
      backgroundColor: semanticTokens.colorDisabledSurface,
      backgroundImage: fill(
        semanticTokens.colorDisabledText,
        semanticTokens.colorDisabledSurface,
      ),
    },
    '::-webkit-slider-thumb': {
      backgroundColor: semanticTokens.colorDisabledText,
      boxShadow: 'none',
    },
    '::-moz-range-track': {
      backgroundColor: semanticTokens.colorDisabledSurface,
      backgroundImage: fill(
        semanticTokens.colorDisabledText,
        semanticTokens.colorDisabledSurface,
      ),
    },
    '::-moz-range-thumb': {
      backgroundColor: semanticTokens.colorDisabledText,
      boxShadow: 'none',
    },
  },
});

type SharedSliderProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'className' | 'defaultValue' | 'onChange' | 'type' | 'value'
> & {
  readonly formatValue?: (value: number) => string;
  readonly max?: number;
  readonly min?: number;
  readonly onValueChange?: (value: number) => void;
  readonly step?: number;
};

type ControlledSliderProps = SharedSliderProps & {
  readonly defaultValue?: never;
  readonly onValueChange: (value: number) => void;
  readonly value: number;
};

type UncontrolledSliderProps = SharedSliderProps & {
  readonly defaultValue?: number;
  readonly value?: never;
};

/** Props for choosing a number along a visible range. */
export type SliderProps = ControlledSliderProps | UncontrolledSliderProps;

/**
 * Chooses a number along a visible range. `formatValue` supplies the spoken
 * text, so "40 percent" can be announced where the raw number would not help.
 */
export function Slider({
  'aria-describedby': ariaDescribedBy,
  defaultValue,
  disabled,
  formatValue,
  id,
  max = 100,
  min = 0,
  onValueChange,
  step = 1,
  style,
  value,
  ...props
}: SliderProps) {
  const field = useFieldControl();
  const [internalValue, setInternalValue] = useState(defaultValue ?? min);
  const current = value ?? internalValue;
  const describedBy =
    [field?.describedBy, ariaDescribedBy].filter(Boolean).join(' ') ||
    undefined;

  // Measured from the value the input itself renders, so a controlled and an
  // uncontrolled slider fill alike, and clamped so a value outside the bounds
  // cannot put the gradient stop past either end.
  const span = max - min;
  const filled = span > 0 ? ((clamp(current, min, max) - min) / span) * 100 : 0;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = Number(event.currentTarget.value);
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  }

  return (
    <input
      {...props}
      aria-describedby={describedBy}
      {...(formatValue ? {'aria-valuetext': formatValue(current)} : {})}
      disabled={disabled}
      id={field?.controlId ?? id}
      max={max}
      min={min}
      onChange={handleChange}
      step={step}
      {...stylex.props(styles.control, disabled ? styles.disabled : undefined)}
      // The stop position is data, so it stays inline — after stylex.props,
      // which would otherwise overwrite the style attribute it is carried in.
      style={{...style, [progressProperty]: `${filled}%`} as CSSProperties}
      type="range"
      value={current}
    />
  );
}
