import {Toggle, type ToggleProps} from '../Toggle/index.js';

/** Props for a control that applies its change immediately. */
export type SwitchProps = ToggleProps;

/**
 * Turns a setting on or off, taking effect at once. Use `Toggle` when the
 * control expresses a pressed state inside a toolbar instead of a setting,
 * and a `CheckboxInput` when the value is only submitted with a form.
 */
export function Switch(props: SwitchProps) {
  return <Toggle {...props} />;
}
