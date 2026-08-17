import {kiokuUiVitePlugin} from '@misoto22/kioku-ui-build/vite';
import type {StorybookConfig} from '@storybook/react-vite';
import {mergeConfig} from 'vite';

const config: StorybookConfig = {
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  async viteFinal(baseConfig) {
    return mergeConfig(baseConfig, {
      plugins: [...kiokuUiVitePlugin({rootDir: import.meta.dirname})],
    });
  },
};

export default config;
