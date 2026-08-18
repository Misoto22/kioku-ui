import type {ComponentDoc} from '../docs/types.js';

export const markdownDoc = {
  name: 'Markdown',
  description: 'Renders a restricted Markdown subset into system components.',
  props: [
    {name: 'source', description: 'Supplies the Markdown text to render.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children, className, and dangerouslySetInnerHTML',
  ],
  example: '<Markdown source="## Release 12\\n\\nReady to **publish**." />',
  storyId: 'core-markdown--default',
} satisfies ComponentDoc;
