import type {ComponentDoc} from '../docs/types.js';

export const avatarGroupDoc = {
  name: 'AvatarGroup',
  description: 'Shows several people as one capped, overlapping row.',
  props: [
    {name: 'label', description: 'Names what the group of people represents.'},
    {name: 'max', description: 'Caps how many avatars are drawn.'},
    {name: 'members', description: 'Supplies the people in reading order.'},
    {name: 'size', description: 'Selects the size of every avatar.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children and className',
  ],
  example: '<AvatarGroup label="Reviewers" members={reviewers} />',
  storyId: 'core-avatar-group--default',
} satisfies ComponentDoc;
