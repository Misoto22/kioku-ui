import type {ComponentDoc} from '../docs/types.js';

export const sectionDoc = {
  name: 'Section',
  description: 'Groups related content in a native section landmark.',
  props: [
    {name: 'padding', description: 'Optional semantic block-padding token.'},
  ],
  inheritedProps: ['HTMLAttributes<HTMLElement> except className'],
  example: '<Section aria-label="Preferences"><Text>Content</Text></Section>',
  storyId: 'foundations--section',
} satisfies ComponentDoc;
