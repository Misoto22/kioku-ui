import type {ComponentDoc} from '../docs/types.js';

export const hoverCardDoc = {
  name: 'HoverCard',
  description: 'Previews interactive detail on hover and on focus.',
  props: [
    {name: 'alignment', description: 'Lines the card up along the cross axis.'},
    {name: 'children', description: 'Supplies the single trigger element.'},
    {
      name: 'closeDelay',
      description: 'Delays closing after the pointer leaves.',
    },
    {name: 'content', description: 'Supplies the preview content.'},
    {
      name: 'openDelay',
      description: 'Delays opening after the pointer arrives.',
    },
    {
      name: 'placement',
      description: 'Selects the preferred side of the trigger.',
    },
  ],
  inheritedProps: ['None; HoverCard renders only its trigger and preview'],
  example:
    '<HoverCard content={<Profile />}><Link href="/a">Ada</Link></HoverCard>',
  storyId: 'core-hover-card--default',
} satisfies ComponentDoc;
