import * as stylexVite from '@stylexjs/unplugin/vite';
import type {Plugin, UserConfig} from 'vite';

import {
  createKiokuUiStylexOptions,
  type KiokuUiStylexOptions,
} from './babel.js';

const CORE_PACKAGE = '@misoto22/kioku-ui';

export interface KiokuUiViteOptions extends KiokuUiStylexOptions {
  readonly include?: readonly string[];
}

export type KiokuUiViteIntegration = Plugin[] & {
  readonly include: readonly string[];
};

export function kiokuUiVitePlugin({
  include = [],
  rootDir = process.cwd(),
  ...overrides
}: KiokuUiViteOptions = {}): KiokuUiViteIntegration {
  const configPlugin: Plugin = {
    name: 'kioku-ui-source-config',
    config(): UserConfig {
      return {
        resolve: {
          alias: [
            {
              find: /^@misoto22\/kioku-ui$/,
              replacement: '@misoto22/kioku-ui/source',
            },
          ],
        },
        optimizeDeps: {exclude: [CORE_PACKAGE]},
      };
    },
  };
  const stylexOptions = createKiokuUiStylexOptions({
    rootDir,
    ...overrides,
  });
  const createStylexVitePlugin = stylexVite.default as unknown as (
    options: Record<string, unknown>,
  ) => Plugin;
  const stylexPlugin = createStylexVitePlugin({
    ...stylexOptions,
    useCSSLayers: true,
  }) as Plugin;
  const plugins = [configPlugin, stylexPlugin] as KiokuUiViteIntegration;

  Object.defineProperty(plugins, 'include', {
    enumerable: true,
    value: Object.freeze([CORE_PACKAGE, ...include]),
  });

  return plugins;
}
