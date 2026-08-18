import type {ComponentDoc} from '../docs/types.js';

export const tabListDoc = {
  name: 'TabList',
  description: 'Selects one of several panels through the ARIA tabs pattern.',
  props: [
    {
      name: 'label',
      description: 'Names the tab strip for assistive technology.',
    },
    {
      name: 'onSelect',
      description: 'Receives the id of the newly selected tab.',
    },
    {name: 'selectedId', description: 'Identifies the currently selected tab.'},
    {name: 'tabs', description: 'Supplies the tab options in reading order.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children, className, onSelect, and role',
  ],
  example:
    '<TabList label="Views" onSelect={setView} selectedId={view} tabs={views} />',
  storyId: 'core-tab-list--default',
} satisfies ComponentDoc;
