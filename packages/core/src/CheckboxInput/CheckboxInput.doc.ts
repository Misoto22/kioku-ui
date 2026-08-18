import type {ComponentDoc} from '../docs/types.js';

export const checkboxInputDoc = {
  name: 'CheckboxInput',
  description: 'Records one independent choice.',
  props: [
    {name: 'checked', description: 'Controls the checked state.'},
    {
      name: 'defaultChecked',
      description: 'Sets the initial uncontrolled state.',
    },
    {name: 'description', description: 'Adds detail under the label.'},
    {
      name: 'indeterminate',
      description: 'Shows a mixed state until the reader decides.',
    },
    {name: 'label', description: 'Names the choice.'},
    {name: 'onCheckedChange', description: 'Receives the next checked state.'},
  ],
  inheritedProps: [
    'InputHTMLAttributes<HTMLInputElement> except checked, children, className, defaultChecked, onChange, and type',
  ],
  example:
    '<CheckboxInput label="Notify subscribers" onCheckedChange={setNotify} checked={notify} />',
  storyId: 'core-checkbox-input--default',
} satisfies ComponentDoc;
