import type {ComponentDoc} from '../docs/types.js';

export const gridDoc = {
  name: 'Grid',
  description: 'Arranges content in a fixed, semantic-token-spaced grid.',
  props: ['columns?: 1 | 2 | 3 | 4', 'gap?: Space'],
  example: '<Grid columns={2}><Text>First</Text><Text>Second</Text></Grid>',
  storyId: 'foundations--grid',
} satisfies ComponentDoc;
