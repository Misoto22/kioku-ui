import * as stylex from '@stylexjs/stylex';
import {useState, type ChangeEvent, type InputHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useFieldControl} from '../Field/index.js';

const styles = stylex.create({
  track: {
    accentColor: semanticTokens.colorAccent,
    blockSize: semanticTokens.sizeHitTarget,
    cursor: 'pointer',
    inlineSize: '100%',
    ':disabled': {
      accentColor: semanticTokens.colorDisabledText,
      cursor: 'default',
    },
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
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
  defaultValue,
  formatValue,
  id,
  max = 100,
  min = 0,
  onValueChange,
  step = 1,
  value,
  ...props
}: SliderProps) {
  const field = useFieldControl();
  const [internalValue, setInternalValue] = useState(defaultValue ?? min);
  const current = value ?? internalValue;

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
      aria-describedby={field?.describedBy}
      {...(formatValue ? {'aria-valuetext': formatValue(current)} : {})}
      id={field?.controlId ?? id}
      max={max}
      min={min}
      onChange={handleChange}
      step={step}
      type="range"
      value={current}
      {...stylex.props(styles.track)}
    />
  );
}
