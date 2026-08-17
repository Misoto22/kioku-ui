import stylexBabelPlugin from '@stylexjs/babel-plugin';
import type {
  BabelFile,
  ConfigAPI,
  PluginItem,
  PluginObj,
  PluginPass,
  TransformOptions,
} from '@babel/core';
import {existsSync, readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, isAbsolute, join, parse, relative, resolve} from 'node:path';

type StylexAliases = Readonly<Record<string, readonly string[]>> | null;

function sourceCandidates(filePath: string) {
  if (filePath.endsWith('.js')) {
    return [
      `${filePath.slice(0, -3)}.ts`,
      `${filePath.slice(0, -3)}.tsx`,
      filePath,
    ];
  }
  if (filePath.endsWith('.jsx')) {
    return [`${filePath.slice(0, -4)}.tsx`, filePath];
  }
  return [filePath];
}

function aliasedSpecifiers(importPath: string, aliases: StylexAliases) {
  const matches = Object.entries(aliases ?? {}).flatMap(
    ([alias, replacements]) => {
      if (importPath !== alias && !importPath.startsWith(`${alias}/`)) {
        return [];
      }
      const suffix = importPath.slice(alias.length);
      return replacements.map((replacement) => `${replacement}${suffix}`);
    },
  );
  return [...matches, importPath];
}

function resolveSourceImport(
  importPath: string,
  sourceFilePath: string,
  aliases: StylexAliases,
) {
  for (const specifier of aliasedSpecifiers(importPath, aliases)) {
    if (specifier.startsWith('.') || isAbsolute(specifier)) {
      const absolutePath = isAbsolute(specifier)
        ? specifier
        : resolve(dirname(sourceFilePath), specifier);
      const match = sourceCandidates(absolutePath).find(existsSync);
      if (match) return match;
      continue;
    }

    try {
      return createRequire(sourceFilePath).resolve(specifier);
    } catch {
      // Try the next alias before reporting an unresolved StyleX theme.
    }
  }
}

function canonicalSourcePath(filePath: string, rootDir: string) {
  let directory = dirname(filePath);
  const filesystemRoot = parse(directory).root;

  while (directory !== filesystemRoot) {
    const manifestPath = join(directory, 'package.json');
    if (existsSync(manifestPath)) {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
        name?: string;
      };
      if (manifest.name) {
        return `${manifest.name}:${relative(directory, filePath)}`;
      }
    }
    directory = dirname(directory);
  }

  return relative(rootDir, filePath);
}

export interface KiokuUiStylexOptions {
  readonly classNamePrefix?: string;
  readonly dev?: boolean;
  readonly enableInlinedConditionalMerge?: boolean;
  readonly rootDir?: string;
  readonly runtimeInjection?: boolean;
  readonly treeshakeCompensation?: boolean;
  readonly [option: string]: unknown;
}

export interface KiokuUiBabelConfigOptions extends KiokuUiStylexOptions {
  readonly plugins?: readonly PluginItem[];
  readonly presets?: readonly PluginItem[];
}

export function createKiokuUiStylexOptions({
  rootDir = process.cwd(),
  ...overrides
}: KiokuUiStylexOptions = {}) {
  return {
    dev: process.env.NODE_ENV !== 'production',
    runtimeInjection: false,
    enableInlinedConditionalMerge: true,
    treeshakeCompensation: true,
    unstable_moduleResolution: {
      type: 'custom' as const,
      filePathResolver: resolveSourceImport,
      getCanonicalFilePath: (filePath: string) =>
        canonicalSourcePath(filePath, rootDir),
    },
    ...overrides,
  };
}

export default function kiokuUiBabelPlugin(
  api: ConfigAPI,
  options: KiokuUiStylexOptions = {},
): PluginObj {
  const transform = stylexBabelPlugin as unknown as (
    babelApi: ConfigAPI,
  ) => PluginObj;
  const normalizedOptions = createKiokuUiStylexOptions(options);
  const plugin = transform(api);
  const upstreamPre = plugin.pre;

  return {
    ...plugin,
    pre(this: PluginPass, file: BabelFile) {
      this.opts = normalizedOptions;
      upstreamPre?.call(this, file);
    },
  };
}

export function createKiokuUiBabelConfig({
  plugins = [],
  presets = [],
  ...stylexOptions
}: KiokuUiBabelConfigOptions = {}): TransformOptions {
  return {
    presets: [...presets],
    plugins: [...plugins, [kiokuUiBabelPlugin, stylexOptions]],
  };
}
