import * as stylex from '@stylexjs/stylex';
import {useId, useState, type HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {DatePicker} from '../DatePicker/index.js';

// The narrowest a date control stays legible at before the pair should stack.
// The spacing scale has no single step that measures it.
const boundMinimumWidth = `calc(${semanticTokens.spacing2xl} * 6)`;

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
    fontFamily: semanticTokens.fontFamilyDisplay,
    fontSize: semanticTokens.fontSizeSm,
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: semanticTokens.letterSpacingLabel,
    lineHeight: semanticTokens.lineHeightBody,
    // A legend is not a flex item: the browser lifts it out of the fieldset's
    // formatting context and draws it in the border box, so the group's `gap`
    // never reaches it and the first row sat flush against the question. The
    // step has to be spent here, and it has to match the group's own gap.
    // The `flexBasis: 100%` that used to sit here was the same mistake read
    // the other way round: it assumed the legend was a flex item that needed
    // forcing onto its own line. It never was one, and the two bounds sat side
    // by side either way.
    marginBlockEnd: semanticTokens.spacingMd,
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
 *
 * Each bound is a `DatePicker` rather than a `DateInput`: no engine offers a
 * range picker, and two platform pickers side by side cannot show the reader
 * that the second is bounded by the first. Two grids of this system's own can,
 * because the bound is passed to them as `min` and `max`.
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
        <DatePicker
          id={startId}
          label={startLabel}
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
        <DatePicker
          id={endId}
          label={endLabel}
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
