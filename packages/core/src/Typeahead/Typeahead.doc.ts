import type {ComponentDoc} from '../docs/types.js';

export const typeaheadDoc = {
  name: 'Typeahead',
  description: 'Filters suggestions as the reader types.',
  props: [
    {name: 'emptyMessage', description: 'States that nothing matched.'},
    {name: 'inputValue', description: 'Controls the text in the field.'},
    {name: 'onInputValueChange', description: 'Receives the typed text.'},
    {name: 'onSelect', description: 'Receives the chosen suggestion.'},
    {
      name: 'options',
      description: 'Supplies the suggestions already filtered.',
    },
  ],
  inheritedProps: [
    'InputHTMLAttributes<HTMLInputElement> except children, className, onChange, onSelect, type, and value',
  ],
  example:
    '<Typeahead inputValue={query} onInputValueChange={setQuery} onSelect={choose} options={matches} />',
  storyId: 'core-typeahead--default',
} satisfies ComponentDoc;
