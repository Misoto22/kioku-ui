import type {ComponentDoc} from '../docs/types.js';

export const themeProviderDoc = {
  name: 'ThemeProvider',
  description:
    'Applies one validated theme definition and exposes theme selection to descendants.',
  props: [
    {
      name: 'children',
      description: 'Supplies the themed application subtree.',
      required: true,
    },
    {
      name: 'defaultThemeId',
      description: 'Selects the initial theme when persistence has no value.',
      required: true,
    },
    {
      name: 'persistence',
      description:
        'Reads and writes the selected theme through a host adapter.',
    },
    {
      name: 'themes',
      description: 'Supplies the complete set of valid theme definitions.',
      required: true,
    },
  ],
  inheritedProps: ['No inherited DOM attributes'],
  example:
    '<ThemeProvider defaultThemeId="washi" themes={themes}>...</ThemeProvider>',
  storyId: 'themes-kioku--theme-provider',
} satisfies ComponentDoc;
