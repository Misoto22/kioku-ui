import type {ComponentDoc} from '../docs/types.js';

export const asyncStateDoc = {
  name: 'AsyncState',
  description: 'Renders distinct loading, empty, error, and ready states.',
  props: [
    {
      name: 'children',
      description: 'Renders ready data and is required for the ready state.',
    },
    {
      name: 'state',
      description: 'Provides the current discriminated async state.',
      required: true,
    },
  ],
  inheritedProps: ['No inherited DOM attributes'],
  example:
    '<AsyncState state={{kind: "ready", data}}>{renderData}</AsyncState>',
  storyId: 'core-async-state--default',
} satisfies ComponentDoc;
