import type {ComponentDoc} from '../docs/types.js';

export const appShellDoc = {
  name: 'AppShell',
  description: 'Wraps Layout with a skip link into the main region.',
  props: [
    {name: 'aside', description: 'Places a secondary rail after the content.'},
    {name: 'children', description: 'Supplies the main region content.'},
    {
      name: 'contentPadding',
      description:
        'Drops the main region gutter when the page supplies its own.',
    },
    {name: 'footer', description: 'Places content below the body.'},
    {name: 'header', description: 'Places the banner above the body.'},
    {name: 'sidebar', description: 'Places a primary rail before the content.'},
    {name: 'skipLinkLabel', description: 'Names the skip link.'},
  ],
  inheritedProps: ['None; AppShell composes Layout and owns its skip link'],
  example: '<AppShell header={<TopNav />}>{page}</AppShell>',
  storyId: 'core-app-shell--default',
} satisfies ComponentDoc;
