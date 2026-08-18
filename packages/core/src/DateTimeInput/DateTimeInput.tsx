import {TemporalInput, type TemporalInputProps} from '../DateInput/index.js';

/** Props for a datetime-local field. */
export type DateTimeInputProps = TemporalInputProps;

/** Accepts one local date and time, exchanged as an ISO string. */
export function DateTimeInput(props: DateTimeInputProps) {
  return <TemporalInput {...props} type="datetime-local" />;
}
