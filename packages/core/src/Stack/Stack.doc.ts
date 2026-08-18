import type {ComponentDoc} from '../docs/types.js';

export const stackDoc = {
  name: 'Stack',
  description: 'Arranges children vertically with semantic spacing.',
  props: [
    {name: 'gap', description: 'Optional semantic gap token.'},
    {name: 'align', description: 'Optional cross-axis alignment.'},
  ],
  inheritedProps: ['HTMLAttributes<HTMLDivElement> except className'],
  example: '<Stack gap="md"><Text>First</Text><Text>Second</Text></Stack>',
  storyId: 'core-stack--default',
} satisfies ComponentDoc;
