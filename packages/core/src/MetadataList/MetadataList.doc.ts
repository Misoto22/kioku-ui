import type {ComponentDoc} from '../docs/types.js';

export const metadataListDoc = {
  name: 'MetadataList',
  description: 'Lists labelled facts about one subject.',
  props: [
    {name: 'entries', description: 'Supplies the term and detail pairs.'},
    {name: 'layout', description: 'Selects stacked or side-by-side pairing.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDListElement> except children and className',
  ],
  example: '<MetadataList entries={[{term: "Owner", detail: "Ada"}]} />',
  storyId: 'core-metadata-list--default',
} satisfies ComponentDoc;
