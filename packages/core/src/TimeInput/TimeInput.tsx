import {TemporalInput, type TemporalInputProps} from '../DateInput/index.js';

/** Props for a time field. */
export type TimeInputProps = TemporalInputProps;

/** Accepts one time of day, exchanged as an ISO `HH:MM` string. */
export function TimeInput(props: TimeInputProps) {
  return <TemporalInput {...props} type="time" />;
}
