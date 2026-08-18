import type {ComponentDoc} from '../docs/types.js';

export const thumbnailDoc = {
  name: 'Thumbnail',
  description: 'Shows a small bounded preview that degrades to text.',
  props: [
    {name: 'alt', description: 'Describes the image for assistive technology.'},
    {
      name: 'fallback',
      description: 'Replaces the alt text when loading fails.',
    },
    {name: 'size', description: 'Selects the square size.'},
    {name: 'src', description: 'Points at the image to show.'},
  ],
  inheritedProps: [
    'ImgHTMLAttributes<HTMLImageElement> except children, className, height, and width',
  ],
  example: '<Thumbnail alt="Release cover" src="/cover.png" />',
  storyId: 'core-thumbnail--default',
} satisfies ComponentDoc;
