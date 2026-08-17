import '@misoto22/kioku-ui/reset.css';
import '@misoto22/kioku-ui/styles.css';
import '@misoto22/kioku-ui-theme-kioku/theme.css';

import {ThemeProvider} from '@misoto22/kioku-ui/theme';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';
import type {Preview} from '@storybook/react-vite';
import {createElement} from 'react';

import {
  storybookGlobalTypes,
  storybookInitialGlobals,
} from './audit-globals.js';

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const requestedTheme =
        typeof context.globals.theme === 'string'
          ? context.globals.theme
          : 'washi';
      const theme =
        kiokuThemes.find(({id}) => id === requestedTheme) ?? kiokuThemes[0];
      const mode = context.globals.mode === 'dark' ? 'dark' : 'light';

      return createElement(
        ThemeProvider,
        {defaultThemeId: theme.id, key: theme.id, themes: kiokuThemes},
        createElement(
          'div',
          {
            'data-story-mode': mode,
            'data-story-surface': 'true',
            style: {
              background: 'var(--kioku-ui-color-canvas)',
              boxSizing: 'border-box',
              color: 'var(--kioku-ui-color-text)',
              colorScheme: mode,
              margin: '-1rem',
              minHeight: '100vh',
              padding: '1rem',
            },
          },
          createElement(Story),
        ),
      );
    },
  ],
  globalTypes: storybookGlobalTypes,
  initialGlobals: storybookInitialGlobals,
  parameters: {
    a11y: {test: 'error'},
    controls: {expanded: true},
    layout: 'padded',
  },
};

export default preview;
