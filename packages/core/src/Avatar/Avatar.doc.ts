import type {ComponentDoc} from '../docs/types.js';

export const avatarDoc = {
  name: 'Avatar',
  description: 'Shows one person or entity, falling back to initials.',
  props: [
    {name: 'name', description: 'Names the person and supplies the initials.'},
    {name: 'size', description: 'Selects the square size.'},
    {name: 'src', description: 'Points at the likeness to show.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLSpanElement> except children and className',
  ],
  example: '<Avatar name="Ada Lovelace" src="/ada.jpg" />',
  storyId: 'core-avatar--default',
} satisfies ComponentDoc;
