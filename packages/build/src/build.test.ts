import {transformAsync, type PluginObj} from '@babel/core';
import {execFile} from 'node:child_process';
import {createRequire} from 'node:module';
import postcss from 'postcss';
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';

import kiokuUiBabelPlugin, {createKiokuUiBabelConfig} from './babel.js';
import kiokuUiPostcssPlugin, {createKiokuUiPostcssConfig} from './postcss.js';
import {kiokuUiVitePlugin} from './vite.js';

const workspaceRoot = fileURLToPath(new URL('../../../', import.meta.url));
const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const run = promisify(execFile);
const temporaryDirectories: string[] = [];

// A full build of the package, well past the default hook budget.
beforeAll(async () => {
  await run(pnpm, ['build'], {cwd: packageRoot});
}, 180_000);

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

async function sourceNextConfigContract() {
  const filename = join(
    workspaceRoot,
    'apps/example-nextjs-source/next.config.ts',
  );
  const contract: {
    extensionAliases?: Record<string, string[]>;
    transpilePackages?: string[];
  } = {};

  await transformAsync(await readFile(filename, 'utf8'), {
    ast: false,
    babelrc: false,
    code: false,
    configFile: false,
    filename,
    parserOpts: {plugins: ['typescript']},
    plugins: [
      (): PluginObj => ({
        visitor: {
          AssignmentExpression(path) {
            const {left, right} = path.node;
            if (
              left.type !== 'MemberExpression' ||
              left.computed ||
              left.property.type !== 'Identifier' ||
              left.property.name !== 'extensionAlias' ||
              left.object.type !== 'MemberExpression' ||
              left.object.computed ||
              left.object.object.type !== 'Identifier' ||
              left.object.object.name !== 'config' ||
              left.object.property.type !== 'Identifier' ||
              left.object.property.name !== 'resolve' ||
              right.type !== 'ObjectExpression'
            ) {
              return;
            }

            const extensionAliases: Record<string, string[]> = {};
            for (const property of right.properties) {
              if (
                property.type !== 'ObjectProperty' ||
                property.computed ||
                property.key.type !== 'StringLiteral' ||
                property.value.type !== 'ArrayExpression'
              ) {
                continue;
              }
              const aliases = property.value.elements.flatMap((element) =>
                element?.type === 'StringLiteral' ? [element.value] : [],
              );
              extensionAliases[property.key.value] = aliases;
            }
            contract.extensionAliases = extensionAliases;
          },
          ObjectProperty(path) {
            const {key, value} = path.node;
            if (
              !path.node.computed &&
              key.type === 'Identifier' &&
              key.name === 'transpilePackages' &&
              value.type === 'ArrayExpression'
            ) {
              contract.transpilePackages = value.elements.flatMap((element) =>
                element?.type === 'StringLiteral' ? [element.value] : [],
              );
            }
          },
        },
      }),
    ],
  });

  return contract;
}

afterAll(async () => {
  await Promise.all(
    temporaryDirectories.map((directory) =>
      rm(directory, {force: true, recursive: true}),
    ),
  );
});

describe('StyleX build integrations', {timeout: 120_000}, () => {
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

  it('compiles with frozen Babel options without mutating the caller', async () => {
    const options = Object.freeze({dev: false, rootDir: workspaceRoot});
    const result = await transformAsync(
      `import * as stylex from '@stylexjs/stylex';
export const styles = stylex.create({root: {color: 'navy'}});`,
      {
        babelrc: false,
        configFile: false,
        filename: join(workspaceRoot, 'consumer/src/frozen.stylex.ts'),
        parserOpts: {plugins: ['typescript']},
        plugins: [[kiokuUiBabelPlugin, options]],
      },
    );

    expect(result?.code).not.toContain('stylex.create');
    expect(options).toEqual({dev: false, rootDir: workspaceRoot});
  });

  it('resolves emitted JavaScript theme specifiers to TypeScript source', async () => {
    const filename = join(workspaceRoot, 'packages/core/src/Card/Card.tsx');
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

  it('deoptimizes every included source package through the official Vite plugin', async () => {
    const integration = kiokuUiVitePlugin({
      include: ['@acme/source-components'],
      rootDir: workspaceRoot,
    });
    const stylexPlugin = integration.find(
      (plugin) => plugin.name === '@stylexjs/unplugin',
    );
    const configHook =
      typeof stylexPlugin?.config === 'function'
        ? stylexPlugin.config
        : stylexPlugin?.config?.handler;

    expect(configHook).toBeTypeOf('function');
    const config = await configHook?.call(
      {} as never,
      {
        optimizeDeps: {exclude: ['existing-client-package']},
        ssr: {optimizeDeps: {exclude: ['existing-ssr-package']}},
      },
      {command: 'build', mode: 'production'} as never,
    );

    expect(config?.optimizeDeps?.exclude).toEqual(
      expect.arrayContaining([
        'existing-client-package',
        '@misoto22/kioku-ui',
        '@acme/source-components',
      ]),
    );
    expect(config?.ssr?.optimizeDeps?.exclude).toEqual(
      expect.arrayContaining([
        'existing-ssr-package',
        '@misoto22/kioku-ui',
        '@acme/source-components',
      ]),
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

describe('reference distribution applications', {timeout: 120_000}, () => {
  it('compiles a packed root-import consumer without installing Vite', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'kioku-ui-no-vite-'));
    temporaryDirectories.push(fixtureRoot);
    await run(pnpm, ['pack', '--pack-destination', fixtureRoot], {
      cwd: packageRoot,
    });
    const archive = (await readdir(fixtureRoot)).find((file) =>
      file.endsWith('.tgz'),
    );
    expect(archive).toBeDefined();
    await writeFile(
      join(fixtureRoot, 'package.json'),
      JSON.stringify({
        name: 'kioku-ui-build-no-vite-consumer',
        private: true,
        type: 'module',
        dependencies: {
          '@misoto22/kioku-ui-build': `file:./${archive}`,
        },
      }),
    );
    await run(
      pnpm,
      [
        'install',
        '--ignore-workspace',
        '--offline',
        '--ignore-scripts',
        '--config.auto-install-peers=false',
      ],
      {cwd: fixtureRoot},
    );
    await expect(
      access(join(fixtureRoot, 'node_modules/vite')),
    ).rejects.toThrow();
    const consumer = join(fixtureRoot, 'consumer.ts');
    await writeFile(
      consumer,
      `import {createKiokuUiBabelConfig} from '@misoto22/kioku-ui-build';

const config = createKiokuUiBabelConfig({rootDir: '.'});
void config;
`,
    );

    try {
      await run(
        process.execPath,
        [
          join(workspaceRoot, 'node_modules/typescript/bin/tsc'),
          '--ignoreConfig',
          '--noEmit',
          '--strict',
          '--module',
          'NodeNext',
          '--moduleResolution',
          'NodeNext',
          '--target',
          'ES2024',
          consumer,
        ],
        {cwd: fixtureRoot},
      );
    } catch (error) {
      const result = error as Error & {stderr?: string; stdout?: string};
      throw new Error(
        [result.message, result.stdout, result.stderr]
          .filter(Boolean)
          .join('\n'),
        {cause: error},
      );
    }
  }, 20_000);

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

  it('inspects the source Next.js config without loading standalone dependencies', async () => {
    await expect(sourceNextConfigContract()).resolves.toEqual({
      extensionAliases: {'.js': ['.ts', '.tsx', '.js']},
      transpilePackages: ['@misoto22/kioku-ui'],
    });
  });
});
