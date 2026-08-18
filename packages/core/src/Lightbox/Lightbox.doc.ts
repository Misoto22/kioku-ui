import type {ComponentDoc} from '../docs/types.js';

export const lightboxDoc = {
  name: 'Lightbox',
  description: 'Shows one piece of media at viewport scale.',
  props: [
    {name: 'children', description: 'Supplies the media to show.'},
    {name: 'closeLabel', description: 'Names the dismiss control.'},
    {
      name: 'onDismiss',
      description: 'Runs on Escape, the scrim, or the control.',
    },
    {name: 'open', description: 'Controls whether the viewer renders.'},
    {name: 'title', description: 'Names the media for assistive technology.'},
  ],
  inheritedProps: ['None; Lightbox owns its modal surface'],
  example:
    '<Lightbox onDismiss={close} open={open} title="Cover">{image}</Lightbox>',
  storyId: 'core-lightbox--default',
} satisfies ComponentDoc;
