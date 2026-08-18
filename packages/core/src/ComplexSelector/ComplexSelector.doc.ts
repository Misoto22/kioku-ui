import type {ComponentDoc} from '../docs/types.js';

export const complexSelectorDoc = {
  name: 'ComplexSelector',
  description: 'Chooses one option from grouped lists.',
  props: [
    {name: 'defaultValue', description: 'Sets the initial uncontrolled value.'},
    {name: 'groups', description: 'Supplies the named groups of options.'},
    {name: 'onValueChange', description: 'Receives the newly chosen value.'},
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
    '<ComplexSelector groups={teams} onValueChange={setOwner} value={owner} />',
  storyId: 'core-complex-selector--default',
} satisfies ComponentDoc;
