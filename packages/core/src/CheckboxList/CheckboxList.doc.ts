import type {ComponentDoc} from '../docs/types.js';

export const checkboxListDoc = {
  name: 'CheckboxList',
  description: 'Collects independent choices under one question.',
  props: [
    {
      name: 'defaultValue',
      description: 'Sets the initial uncontrolled choices.',
    },
    {name: 'legend', description: 'States the question the options answer.'},
    {name: 'onValueChange', description: 'Receives the next set of values.'},
    {name: 'options', description: 'Supplies the choices in reading order.'},
    {name: 'value', description: 'Controls the current set of values.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLFieldSetElement> except children, className, defaultValue, and onChange',
  ],
  example:
    '<CheckboxList legend="Notify" onValueChange={setChannels} options={channels} value={channels} />',
  storyId: 'core-checkbox-list--default',
} satisfies ComponentDoc;
