import stylexPostcssPlugin from '@stylexjs/postcss-plugin';
import type {Plugin} from 'postcss';

import {
  createKiokuUiStylexOptions,
  type KiokuUiStylexOptions,
} from './babel.js';

const SOURCE_GLOB = 'node_modules/@misoto22/kioku-ui/src/**/*.{js,jsx,ts,tsx}';

export interface KiokuUiPostcssOptions extends KiokuUiStylexOptions {
  readonly appDir?: string;
  readonly cwd?: string;
  readonly include?: readonly string[];
  readonly useCSSLayers?: boolean;
}

export function createKiokuUiPostcssOptions({
  appDir = 'src',
  cwd = process.cwd(),
  include = [],
  useCSSLayers = true,
  ...stylexOptions
}: KiokuUiPostcssOptions = {}) {
  return {
    cwd,
    include: [`${appDir}/**/*.{js,jsx,ts,tsx}`, SOURCE_GLOB, ...include],
    babelConfig: {
      babelrc: false,
      configFile: false,
      parserOpts: {plugins: ['typescript', 'jsx']},
      plugins: [
        [
          '@stylexjs/babel-plugin',
          createKiokuUiStylexOptions({rootDir: cwd, ...stylexOptions}),
        ],
      ],
    },
    useCSSLayers,
  };
}

export default function kiokuUiPostcssPlugin(
  options: KiokuUiPostcssOptions = {},
): Plugin {
  return stylexPostcssPlugin(createKiokuUiPostcssOptions(options)) as Plugin;
}

export function createKiokuUiPostcssConfig(
  options: KiokuUiPostcssOptions = {},
) {
  return {
    plugins: {
      '@misoto22/kioku-ui-build/postcss': options,
    },
  };
}
