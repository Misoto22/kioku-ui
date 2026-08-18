import type {ComponentDoc} from '../docs/types.js';

export const paginationDoc = {
  name: 'Pagination',
  description: 'Moves between pages of a bounded result set.',
  props: [
    {name: 'label', description: 'Names the navigation landmark.'},
    {
      name: 'onChange',
      description: 'Receives the newly requested page number.',
    },
    {
      name: 'page',
      description: 'Identifies the current page, counting from one.',
    },
    {name: 'pageCount', description: 'States how many pages exist in total.'},
    {
      name: 'siblingCount',
      description:
        'Sets how many pages stay visible either side of the current one.',
    },
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLElement> except children, className, and onChange',
  ],
  example: '<Pagination onChange={setPage} page={page} pageCount={12} />',
  storyId: 'core-pagination--default',
} satisfies ComponentDoc;
