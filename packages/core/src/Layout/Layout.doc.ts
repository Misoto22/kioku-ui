import type {ComponentDoc} from '../docs/types.js';

export const layoutDoc = {
  name: 'Layout',
  description: 'Positions banner, rails, main content, and footer.',
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
    {name: 'mainId', description: 'Sets the id of the main element itself.'},
    {
      name: 'pageHead',
      description: 'Opens the main region with a chapter head.',
    },
    {
      name: 'pageIndex',
      description: 'Hangs a numeral in the margin beside the page head.',
    },
    {name: 'sidebar', description: 'Places a primary rail before the content.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children and className',
  ],
  example:
    '<Layout header={<TopNav />} sidebar={<SideNav>…</SideNav>}>…</Layout>',
  storyId: 'core-layout--default',
} satisfies ComponentDoc;
