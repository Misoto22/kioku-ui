import type {ComponentDoc} from '../docs/types.js';

export const resizableDoc = {
  name: 'Resizable',
  description: 'Splits a region into a sized panel and the rest.',
  props: [
    {name: 'children', description: 'Supplies the content beside the panel.'},
    {name: 'handleLabel', description: 'Names the divider control.'},
    {name: 'max', description: 'Caps how wide the panel can grow.'},
    {name: 'min', description: 'Sets how narrow the panel can shrink.'},
    {name: 'onSizeChange', description: 'Receives the next panel width.'},
    {name: 'panel', description: 'Supplies the sized panel content.'},
    {name: 'size', description: 'Controls the panel width in pixels.'},
    {
      name: 'step',
      description: 'Sets how far each arrow key moves the divider.',
    },
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children and className',
  ],
  example: '<Resizable panel={<SideNav>…</SideNav>}>{page}</Resizable>',
  storyId: 'core-resizable--default',
} satisfies ComponentDoc;
