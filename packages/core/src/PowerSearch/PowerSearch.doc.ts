import type {ComponentDoc} from '../docs/types.js';

export const powerSearchDoc = {
  name: 'PowerSearch',
  description: 'Searches with the applied filters shown beside the query.',
  props: [
    {name: 'filters', description: 'Supplies the filters already applied.'},
    {name: 'label', description: 'Names the search field.'},
    {name: 'onFiltersChange', description: 'Receives the remaining filters.'},
    {name: 'onSearch', description: 'Receives the submitted query.'},
    {name: 'placeholder', description: 'Hints at what to search for.'},
    {name: 'submitLabel', description: 'Names the submit control.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLFormElement> except children, className, onSubmit, and role',
  ],
  example:
    '<PowerSearch label="Search releases" onSearch={run} filters={applied} />',
  storyId: 'core-power-search--default',
} satisfies ComponentDoc;
