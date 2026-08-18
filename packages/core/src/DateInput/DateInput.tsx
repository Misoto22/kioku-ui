import {TemporalInput, type TemporalInputProps} from './TemporalInput.js';

/** Props for a calendar-date field. */
export type DateInputProps = TemporalInputProps;

/** Accepts one calendar date, exchanged as an ISO `YYYY-MM-DD` string. */
export function DateInput(props: DateInputProps) {
  return <TemporalInput {...props} type="date" />;
}
