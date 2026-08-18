import type {ComponentDoc} from '../docs/types.js';

export const selectorDoc = {
  name: 'Selector',
  description: 'Chooses one option from a closed list.',
  props: [
    {name: 'defaultValue', description: 'Sets the initial uncontrolled value.'},
    {name: 'onValueChange', description: 'Receives the newly chosen value.'},
    {name: 'options', description: 'Supplies the options in reading order.'},
    {
      name: 'placeholder',
      description: 'Adds a disabled prompt as the first entry.',
    },
    {name: 'value', description: 'Controls the current value.'},
  ],
  inheritedProps: [
    'SelectHTMLAttributes<HTMLSelectElement> except children, className, defaultValue, onChange, and value',
  ],
  example:
    '<Selector onValueChange={setOwner} options={owners} value={owner} />',
  storyId: 'core-selector--default',
} satisfies ComponentDoc;
