import type {ComponentDoc} from '../docs/types.js';

export const typeaheadItemDoc = {
  name: 'TypeaheadItem',
  description: 'One suggestion inside a typeahead listbox.',
  props: [
    {name: 'active', description: 'Marks the option the combobox points at.'},
    {name: 'description', description: 'Adds secondary text under the label.'},
    {name: 'disabled', description: 'Marks the option as unavailable.'},
    {name: 'leading', description: 'Places content before the label.'},
    {name: 'trailing', description: 'Places content after the label.'},
  ],
  inheritedProps: [
    'LiHTMLAttributes<HTMLLIElement> except aria-disabled, aria-selected, className, and role',
  ],
  example: '<TypeaheadItem active>Ada Lovelace</TypeaheadItem>',
  storyId: 'core-typeahead--states',
} satisfies ComponentDoc;
