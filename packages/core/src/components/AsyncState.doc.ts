import type {ComponentDoc} from '../docs/types.js';

export const asyncStateDoc = {
  name: 'AsyncState',
  description: 'Renders distinct loading, empty, error, and ready states.',
  props: [
    {
      name: 'state',
      description: 'Provides the current discriminated async state.',
      required: true,
    },
  ],
  inheritedProps: ['No inherited DOM attributes'],
  example:
    '<AsyncState state={{kind: "ready", data}}>{renderData}</AsyncState>',
  storyId: 'data-display--async-state',
} satisfies ComponentDoc;
