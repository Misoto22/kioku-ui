import type {ComponentDoc} from '../docs/types.js';

export const stackDoc = {
  name: 'Stack',
  description: 'Arranges children vertically with semantic spacing.',
  props: ['gap?: Space', 'align?: "stretch" | "start" | "center" | "end"'],
  example: '<Stack gap="md"><Text>First</Text><Text>Second</Text></Stack>',
  storyId: 'foundations--stack',
} satisfies ComponentDoc;
