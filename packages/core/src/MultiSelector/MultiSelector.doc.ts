import type {ComponentDoc} from '../docs/types.js';

export const multiSelectorDoc = {
  name: 'MultiSelector',
  description: 'Chooses several options through a typeahead.',
  props: [
    {name: 'emptyMessage', description: 'States that nothing matched.'},
    {name: 'label', description: 'Names the search field.'},
    {name: 'onValueChange', description: 'Receives the next set of values.'},
    {name: 'options', description: 'Supplies every selectable option.'},
    {
      name: 'removeLabel',
      description: 'Builds the name of each remove control.',
    },
    {name: 'value', description: 'Controls the current set of values.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children, className, defaultValue, and onChange',
  ],
  example:
    '<MultiSelector label="Owners" onValueChange={setOwners} options={people} value={owners} />',
  storyId: 'core-multi-selector--default',
} satisfies ComponentDoc;
