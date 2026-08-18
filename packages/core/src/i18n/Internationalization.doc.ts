import type {ComponentDoc} from '../docs/types.js';

export const internationalizationProviderDoc = {
  name: 'InternationalizationProvider',
  description: 'Supplies the locale, writing direction, and system strings.',
  props: [
    {name: 'children', description: 'Supplies the tree that reads the locale.'},
    {name: 'direction', description: 'Selects the writing direction.'},
    {name: 'locale', description: 'Names the active locale.'},
    {name: 'messages', description: 'Replaces every string the system speaks.'},
  ],
  inheritedProps: ['None; the provider owns its language wrapper'],
  example:
    '<InternationalizationProvider direction="rtl" locale="ar" messages={ar}>…</InternationalizationProvider>',
  storyId: 'core-internationalization-provider--default',
} satisfies ComponentDoc;
