import type {ComponentDoc} from '../docs/types.js';

export const gridDoc = {
  name: 'Grid',
  description: 'Arranges content in a fixed, semantic-token-spaced grid.',
  props: [
    {
      name: 'columns',
      description: 'Optional number of columns from 1 through 4.',
    },
    {name: 'gap', description: 'Optional semantic gap token.'},
  ],
  inheritedProps: ['HTMLAttributes<HTMLDivElement> except className'],
  example: '<Grid columns={2}><Text>First</Text><Text>Second</Text></Grid>',
  storyId: 'foundations--grid',
} satisfies ComponentDoc;
