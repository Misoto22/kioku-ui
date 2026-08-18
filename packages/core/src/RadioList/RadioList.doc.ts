import type {ComponentDoc} from '../docs/types.js';

export const radioListDoc = {
  name: 'RadioList',
  description: 'Offers a set of mutually exclusive choices.',
  props: [
    {
      name: 'defaultValue',
      description: 'Sets the initial uncontrolled choice.',
    },
    {name: 'legend', description: 'States the question the options answer.'},
    {name: 'onValueChange', description: 'Receives the newly chosen value.'},
    {name: 'options', description: 'Supplies the choices in reading order.'},
    {name: 'value', description: 'Controls the current choice.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLFieldSetElement> except children, className, defaultValue, and onChange',
  ],
  example:
    '<RadioList legend="Visibility" onValueChange={setScope} options={scopes} value={scope} />',
  storyId: 'core-radio-list--default',
} satisfies ComponentDoc;
