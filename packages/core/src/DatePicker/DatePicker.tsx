import * as stylex from '@stylexjs/stylex';
import {useRef, useState, type HTMLAttributes} from 'react';

import {Calendar} from '../Calendar/index.js';
import {DateInput} from '../DateInput/index.js';
import {Popover} from '../Popover/index.js';

const styles = stylex.create({
  // The anchor is the whole field, so the sheet lines up with the well rather
  // than with the small control that opened it.
  root: {display: 'block', position: 'relative', width: '100%'},
});

type SharedDatePickerProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children' | 'className' | 'defaultValue' | 'onChange'
> & {
  readonly disabled?: boolean;
  /**
   * Given to the field, not to the wrapper — a `<label for>` beside this
   * control has to reach the input the reader types into.
   */
  readonly id?: string;
  /** Names the month grid for assistive technology. */
  readonly label: string;
  readonly max?: string;
  readonly min?: string;
  readonly onValueChange?: (value: string) => void;
  readonly pickerLabel?: string;
  readonly readOnly?: boolean;
};

type ControlledDatePickerProps = SharedDatePickerProps & {
  readonly defaultValue?: never;
  readonly onValueChange: (value: string) => void;
  readonly value: string;
};

type UncontrolledDatePickerProps = SharedDatePickerProps & {
  readonly defaultValue?: string;
  readonly value?: never;
};

/** Props for a date field whose picker this system draws. */
export type DatePickerProps =
  ControlledDatePickerProps | UncontrolledDatePickerProps;

/**
 * A date field with a month grid of this system's own instead of the engine's.
 *
 * `DateInput` remains the right choice for a lone date: leaving the platform
 * picker in place is what keeps the wheel on a phone, the reader's own date
 * order and the whole accessibility tree for free. Reach for this one when the
 * sheet itself has to belong to the page — a range, a set of shortcuts, two
 * months side by side — because none of those exist in any engine's picker.
 */
export function DatePicker({
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  defaultValue = '',
  disabled,
  id,
  label,
  max,
  min,
  onValueChange,
  pickerLabel,
  readOnly,
  value,
  ...props
}: DatePickerProps) {
  // `label` names the grid, and a reader who never opens the grid would meet
  // an unnamed field. An explicit name wins; an `id` means the caller has
  // wired a `<label for>` of its own, which anything set here would override.
  const fieldLabel =
    ariaLabel ??
    (ariaLabelledBy === undefined && id === undefined ? label : undefined);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const shown = value ?? internalValue;

  function commit(next: string) {
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  }

  // Closing returns the reader to the field they left, whether the sheet was
  // dismissed or a day was chosen. A picker that drops focus on the document
  // costs a keyboard reader the whole form.
  function close() {
    setOpen(false);
    anchorRef.current?.querySelector('input')?.focus();
  }

  return (
    <span {...props} ref={anchorRef} {...stylex.props(styles.root)}>
      <DateInput
        {...(fieldLabel === undefined ? {} : {'aria-label': fieldLabel})}
        {...(ariaLabelledBy === undefined
          ? {}
          : {'aria-labelledby': ariaLabelledBy})}
        disabled={disabled}
        {...(id === undefined ? {} : {id})}
        {...(max === undefined ? {} : {max})}
        {...(min === undefined ? {} : {min})}
        onPickerOpen={() => {
          setOpen(true);
        }}
        onValueChange={commit}
        {...(pickerLabel === undefined ? {} : {pickerLabel})}
        readOnly={readOnly}
        value={shown}
      />
      <Popover
        alignment="start"
        anchorRef={anchorRef}
        onDismiss={close}
        open={open}
        placement="bottom"
        role="presentation"
      >
        <Calendar
          label={label}
          {...(max === undefined ? {} : {max})}
          {...(min === undefined ? {} : {min})}
          onValueChange={(next) => {
            commit(next);
            close();
          }}
          value={shown}
        />
      </Popover>
    </span>
  );
}
