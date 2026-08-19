import * as stylex from '@stylexjs/stylex';
import {useId, useState, type HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {DateInput} from '../DateInput/index.js';

// The narrowest a date control stays legible at before the pair should stack.
// The spacing scale has no single step that measures it.
const boundMinimumWidth = `calc(${semanticTokens.spacing2xl} * 6)`;

const styles = stylex.create({
  group: {
    borderStyle: 'none',
    borderWidth: 0,
    display: 'flex',
    flexWrap: 'wrap',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingMd,
    margin: 0,
    padding: 0,
  },
  // The question the pair asks, set in the display face: a mincho line is how
  // this system titles a group, and it is what keeps the legend from reading
  // as a third field label sitting above two others.
  legend: {
    color: semanticTokens.colorText,
    flexBasis: '100%',
    fontFamily: semanticTokens.fontFamilyDisplay,
    fontSize: semanticTokens.fontSizeSm,
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: semanticTokens.letterSpacingLabel,
    lineHeight: semanticTokens.lineHeightBody,
    padding: 0,
  },
  bound: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    gap: semanticTokens.spacingXs,
    minWidth: boundMinimumWidth,
  },
  // "Start" and "End" are eyebrows, not labels. The legend already asks the
  // question; these two only say which end of it a control holds, and set at
  // the same size and weight as the legend they competed with it.
  label: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyDisplay,
    fontSize: semanticTokens.fontSizeXs,
    letterSpacing: semanticTokens.letterSpacingEyebrow,
    lineHeight: semanticTokens.lineHeightHeading,
  },
});

/** A start and end date, either of which may still be empty. */
export interface DateRange {
  readonly end: string;
  readonly start: string;
}

type SharedRangeProps = Omit<
  HTMLAttributes<HTMLFieldSetElement>,
  'children' | 'className' | 'defaultValue' | 'onChange'
> & {
  readonly endLabel?: string;
  readonly legend: string;
  readonly onValueChange?: (value: DateRange) => void;
  readonly startLabel?: string;
};

type ControlledRangeProps = SharedRangeProps & {
  readonly defaultValue?: never;
  readonly onValueChange: (value: DateRange) => void;
  readonly value: DateRange;
};

type UncontrolledRangeProps = SharedRangeProps & {
  readonly defaultValue?: DateRange;
  readonly value?: never;
};

/** Props for a start-to-end date range. */
export type DateRangeInputProps = ControlledRangeProps | UncontrolledRangeProps;

const emptyRange: DateRange = {end: '', start: ''};

/**
 * Accepts a start and an end date. The end control refuses dates before the
 * start, so an impossible range cannot be entered in the first place.
 */
export function DateRangeInput({
  defaultValue,
  endLabel = 'End',
  legend,
  onValueChange,
  startLabel = 'Start',
  value,
  ...props
}: DateRangeInputProps) {
  const startId = useId();
  const endId = useId();
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? emptyRange,
  );
  const range = value ?? internalValue;

  function update(next: DateRange) {
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  }

  return (
    <fieldset {...props} {...stylex.props(styles.group)}>
      <legend {...stylex.props(styles.legend)}>{legend}</legend>
      <span {...stylex.props(styles.bound)}>
        <label htmlFor={startId} {...stylex.props(styles.label)}>
          {startLabel}
        </label>
        <DateInput
          id={startId}
          {...(range.end === '' ? {} : {max: range.end})}
          onValueChange={(start) => {
            update({...range, start});
          }}
          value={range.start}
        />
      </span>
      <span {...stylex.props(styles.bound)}>
        <label htmlFor={endId} {...stylex.props(styles.label)}>
          {endLabel}
        </label>
        <DateInput
          id={endId}
          {...(range.start === '' ? {} : {min: range.start})}
          onValueChange={(end) => {
            update({...range, end});
          }}
          value={range.end}
        />
      </span>
    </fieldset>
  );
}
