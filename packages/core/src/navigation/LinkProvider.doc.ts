import type {ComponentDoc} from '../docs/types.js';

export const linkDoc = {
  name: 'Link',
  description:
    'Renders a native anchor or delegates navigation to the nearest LinkProvider.',
  props: [{name: 'href', description: 'Sets the navigation destination.'}],
  inheritedProps: ['AnchorHTMLAttributes<HTMLAnchorElement>'],
  example: '<Link href="/records">Records</Link>',
  storyId: 'navigation--link',
} satisfies ComponentDoc;

export const linkProviderDoc = {
  name: 'LinkProvider',
  description:
    'Supplies an optional host-router renderer to descendant Link components.',
  props: [
    {
      name: 'children',
      description: 'Supplies links that share the host navigation adapter.',
      required: true,
    },
    {
      name: 'renderLink',
      description: 'Renders links through the host application router.',
    },
  ],
  inheritedProps: ['No inherited DOM attributes'],
  example:
    '<LinkProvider renderLink={renderLink}><Link href="/records">Records</Link></LinkProvider>',
  storyId: 'navigation--link-provider',
} satisfies ComponentDoc;
