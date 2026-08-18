import type {ComponentDoc} from '../docs/types.js';

export const layerDoc = {
  name: 'Layer',
  description:
    'Portals a floating surface out of the current stacking context.',
  props: [
    {name: 'children', description: 'Supplies the portalled content.'},
    {
      name: 'container',
      description: 'Selects the portal target; defaults to the document body.',
    },
  ],
  inheritedProps: ['None; Layer renders no element of its own'],
  example: '<Layer><div role="dialog">...</div></Layer>',
  storyId: 'core-layer--default',
} satisfies ComponentDoc;
