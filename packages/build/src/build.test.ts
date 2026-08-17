import {transformAsync} from '@babel/core';
import {execFile} from 'node:child_process';
import {createRequire} from 'node:module';
import postcss from 'postcss';
import {mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';

import nextSourceConfig from '../../../apps/example-nextjs-source/next.config.js';
import kiokuUiBabelPlugin, {createKiokuUiBabelConfig} from './babel.js';
import kiokuUiPostcssPlugin, {createKiokuUiPostcssConfig} from './postcss.js';
import {kiokuUiVitePlugin} from './vite.js';

const workspaceRoot = fileURLToPath(new URL('../../../', import.meta.url));
const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const run = promisify(execFile);
const temporaryDirectories: string[] = [];

beforeAll(async () => {
  await run(pnpm, ['build'], {cwd: packageRoot});
});

async function packageManifest(relativeDirectory: string) {
  return JSON.parse(
    await readFile(
      join(workspaceRoot, relativeDirectory, 'package.json'),
      'utf8',
    ),
  ) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
}

async function packageUsesBuildPlugin(relativeDirectory: string) {
  const manifest = await packageManifest(relativeDirectory);
  return Boolean(
    manifest.dependencies?.['@misoto22/kioku-ui-build'] ??
    manifest.devDependencies?.['@misoto22/kioku-ui-build'],
  );
}

afterAll(async () => {
  await Promise.all(
    temporaryDirectories.map((directory) =>
      rm(directory, {force: true, recursive: true}),
    ),
  );
});

describe('StyleX build integrations', () => {
  it('compiles StyleX authoring through the Babel integration', async () => {
    const result = await transformAsync(
      `import * as stylex from '@stylexjs/stylex';
export const styles = stylex.create({root: {color: 'rebeccapurple'}});`,
      {
        babelrc: false,
        configFile: false,
        filename: join(workspaceRoot, 'consumer/src/example.stylex.ts'),
        parserOpts: {plugins: ['typescript']},
        plugins: [[kiokuUiBabelPlugin, {rootDir: workspaceRoot}]],
      },
    );

    expect(result?.code).not.toContain('stylex.create');
    expect(
      (result?.metadata as {stylex?: readonly unknown[]}).stylex?.length,
    ).toBeGreaterThan(0);
  });

  it('creates a Babel config that preserves consumer plugins', () => {
    const consumerPlugin = () => ({visitor: {}});
    const config = createKiokuUiBabelConfig({
      plugins: [consumerPlugin],
      rootDir: workspaceRoot,
    });

    expect(config.plugins).toHaveLength(2);
    expect(config.plugins?.[0]).toBe(consumerPlugin);
    expect(config.plugins?.[1]).toEqual(
      expect.arrayContaining([kiokuUiBabelPlugin]),
    );
  });

  it('resolves emitted JavaScript theme specifiers to installed TypeScript source', async () => {
    const filename = join(
      workspaceRoot,
      'apps/example-nextjs-source/node_modules/@misoto22/kioku-ui/src/components/Card.tsx',
    );
    const result = await transformAsync(await readFile(filename, 'utf8'), {
      babelrc: false,
      configFile: false,
      filename,
      parserOpts: {plugins: ['typescript', 'jsx']},
      plugins: [[kiokuUiBabelPlugin, {rootDir: workspaceRoot}]],
    });

    expect(result?.code).not.toContain('stylex.create');
    expect(
      (result?.metadata as {stylex?: readonly unknown[]}).stylex?.length,
    ).toBeGreaterThan(0);
  });

  it('extracts application StyleX rules through the PostCSS integration', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'kioku-ui-postcss-'));
    temporaryDirectories.push(fixtureRoot);
    await mkdir(join(fixtureRoot, 'src'));
    await writeFile(
      join(fixtureRoot, 'src/example.stylex.ts'),
      `import * as stylex from '@stylexjs/stylex';
export const styles = stylex.create({root: {color: 'rebeccapurple'}});`,
    );

    const result = await postcss([
      kiokuUiPostcssPlugin({cwd: fixtureRoot}),
    ]).process('@stylex;', {
      from: join(fixtureRoot, 'src/styles.css'),
    });

    expect(result.css).not.toContain('@stylex');
    expect(result.css).toContain('rebeccapurple');
  });

  it('creates a framework-loadable PostCSS package configuration', () => {
    const config = createKiokuUiPostcssConfig({cwd: '/consumer'});

    expect(Array.isArray(config.plugins)).toBe(false);
    expect(config.plugins['@misoto22/kioku-ui-build/postcss']).toMatchObject({
      cwd: '/consumer',
    });
  });

  it('loads the published PostCSS integration as a CommonJS plugin', () => {
    const require = createRequire(join(packageRoot, 'postcss.config.cjs'));

    expect(require('@misoto22/kioku-ui-build/postcss')).toBeTypeOf('function');
  });

  it('adds the Kioku UI source package to the Vite StyleX include list', () => {
    const integration = kiokuUiVitePlugin({rootDir: workspaceRoot});

    expect(integration.include).toContain('@misoto22/kioku-ui');
    expect(integration.some((plugin) => plugin.name.includes('stylex'))).toBe(
      true,
    );
  });

  it('resolves source authoring through the public source entrypoint', async () => {
    const consumerRoot = resolve(workspaceRoot, 'apps/example-vite-source');
    const integration = kiokuUiVitePlugin({rootDir: consumerRoot});
    const configPlugin = integration.find(
      (plugin) => plugin.name === 'kioku-ui-source-config',
    );
    const configHook =
      typeof configPlugin?.config === 'function'
        ? configPlugin.config
        : configPlugin?.config?.handler;

    expect(configHook).toBeTypeOf('function');
    const config = await configHook?.call({} as never, {}, {
      command: 'build',
      mode: 'production',
    } as never);
    const alias = Array.isArray(config?.resolve?.alias)
      ? config.resolve.alias
      : Object.entries(config?.resolve?.alias ?? {}).map(
          ([find, replacement]) => ({find, replacement}),
        );
    const coreAlias = alias.find(({find}) =>
      typeof find === 'string'
        ? find === '@misoto22/kioku-ui'
        : find.test('@misoto22/kioku-ui') &&
          !find.test('@misoto22/kioku-ui/reset.css'),
    );

    expect(coreAlias?.replacement).toBe('@misoto22/kioku-ui/source');
    expect(coreAlias?.replacement).not.toContain('../');
  });
});

describe('reference distribution applications', () => {
  it('does not require a source build plugin for the compiled Vite example', async () => {
    expect(await packageUsesBuildPlugin('apps/example-vite')).toBe(false);
  });

  it('does not require a source build plugin for the compiled Next.js example', async () => {
    expect(await packageUsesBuildPlugin('apps/example-nextjs')).toBe(false);
  });

  it('requires the public build package for both source examples', async () => {
    await expect(
      packageUsesBuildPlugin('apps/example-vite-source'),
    ).resolves.toBe(true);
    await expect(
      packageUsesBuildPlugin('apps/example-nextjs-source'),
    ).resolves.toBe(true);
  });

  it('imports the public source entrypoint in the source Next.js example', async () => {
    const page = await readFile(
      join(workspaceRoot, 'apps/example-nextjs-source/src/app/page.tsx'),
      'utf8',
    );

    expect(page).toContain("from '@misoto22/kioku-ui/source'");
    expect(page).not.toContain('packages/core');
  });

  it('resolves emitted JavaScript specifiers to TypeScript in the source Next.js example', () => {
    expect(nextSourceConfig.webpack).toBeTypeOf('function');
    const result = nextSourceConfig.webpack?.(
      {resolve: {}} as never,
      {} as never,
    ) as {resolve: {extensionAlias?: Record<string, readonly string[]>}};

    expect(result.resolve.extensionAlias?.['.js']).toEqual([
      '.ts',
      '.tsx',
      '.js',
    ]);
  });
});
