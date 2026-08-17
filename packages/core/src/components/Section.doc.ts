import type {ComponentDoc} from '../docs/types.js';

export const sectionDoc = {
  name: 'Section',
  description: 'Groups related content in a native section landmark.',
  props: ['padding?: Space', 'native section attributes including aria-label'],
  example: '<Section aria-label="Preferences"><Text>Content</Text></Section>',
  storyId: 'foundations--section',
} satisfies ComponentDoc;
