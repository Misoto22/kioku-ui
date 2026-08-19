import {execFile} from 'node:child_process';
import {access, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';

import {afterAll, beforeAll, describe, expect, it} from 'vitest';

const run = promisify(execFile);
const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const packageName = ['@misoto22', 'kioku-ui-theme-kioku'].join('/');
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const temporaryDirectories: string[] = [];

async function runPnpm(arguments_: string[], cwd = packageRoot) {
  try {
    return await run(pnpm, arguments_, {cwd});
  } catch (error) {
    const result = error as Error & {stderr?: string; stdout?: string};
    throw new Error(
      [result.message, result.stdout, result.stderr].filter(Boolean).join('\n'),
      {cause: error},
    );
  }
}

describe('published theme package build', {timeout: 120_000}, () => {
  // A full build of the package, well past the default hook budget.
  beforeAll(async () => {
    await runPnpm(['build']);
  }, 180_000);

  afterAll(async () => {
    await Promise.all(
      temporaryDirectories.map((directory) =>
        rm(directory, {force: true, recursive: true}),
      ),
    );
  });

  it('loads the themes through the public package name at runtime', async () => {
    const fixtureRoot = await mkdtemp(join(packageRoot, '.test-runtime-'));
    temporaryDirectories.push(fixtureRoot);
    const consumer = join(fixtureRoot, 'consumer.mjs');
    await writeFile(
      consumer,
      `import {kasumiTheme, kiokuThemes, washiTheme} from '${packageName}';

if (kiokuThemes.length !== 4 || washiTheme.id !== 'washi' || kasumiTheme.id !== 'kasumi') {
  throw new Error('The public theme runtime did not expose the registered themes.');
}
if (!washiTheme.tokens['color.canvas'].includes('--kioku-theme-washi-color-canvas')) {
  throw new Error('The public theme runtime did not expose semantic token values.');
}
`,
    );

    await run(process.execPath, [consumer], {cwd: fixtureRoot});
  });

  it('publishes types that consume ThemeDefinition from the documented core subpath', async () => {
    const fixtureRoot = await mkdtemp(join(packageRoot, '.test-types-'));
    temporaryDirectories.push(fixtureRoot);
    const consumer = join(fixtureRoot, 'consumer.ts');
    await writeFile(
      consumer,
      `import type {ThemeDefinition, TokenName} from '@misoto22/kioku-ui';
import {kiokuThemes, mujiTheme} from '${packageName}';

const theme: ThemeDefinition = mujiTheme;
const themes: readonly ThemeDefinition[] = kiokuThemes;
const names: readonly TokenName[] = [
  'color.surfaceRaised',
  'border.interactive',
  'typography.fontFamilyDisplay',
  'radius.container',
  'size.controlLg',
];
void [theme, themes, names];
`,
    );

    await runPnpm([
      'exec',
      'tsc',
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
    ]);
  });

  it('exports ready-to-use theme CSS from the public package', async () => {
    await access(join(packageRoot, 'dist/theme.css'));

    const css = await readFile(join(packageRoot, 'dist/theme.css'), 'utf8');
    for (const customProperty of [
      '--kioku-ui-color-surface-raised',
      '--kioku-ui-color-surface-muted',
      '--kioku-ui-color-text-secondary',
      '--kioku-ui-color-text-muted',
      '--kioku-ui-color-text-on-accent',
      '--kioku-ui-color-accent',
      '--kioku-ui-color-accent-hover',
      '--kioku-ui-color-accent-active',
      '--kioku-ui-color-overlay-hover',
      '--kioku-ui-color-overlay-active',
      '--kioku-ui-color-disabled-surface',
      '--kioku-ui-color-disabled-text',
      '--kioku-ui-border-interactive',
      '--kioku-ui-border-disabled',
      '--kioku-ui-typography-font-family-display',
      '--kioku-ui-typography-font-size-xs',
      '--kioku-ui-typography-font-size2xl',
      '--kioku-ui-radius-inner',
      '--kioku-ui-radius-element',
      '--kioku-ui-radius-container',
      '--kioku-ui-radius-page',
      '--kioku-ui-radius-full',
      '--kioku-ui-size-control-sm',
      '--kioku-ui-size-control-md',
      '--kioku-ui-size-control-lg',
      '--kioku-ui-size-hit-target',
    ]) {
      expect(css).toContain(`${customProperty}:`);
    }

    for (const legacyProperty of [
      '--kioku-ui-radius-sm',
      '--kioku-ui-radius-md',
      '--kioku-ui-radius-lg',
      '--kioku-ui-radius-round',
      '--kioku-ui-density-control-block',
      '--kioku-ui-density-control-inline',
      '--kioku-ui-density-item-gap',
    ]) {
      expect(css).not.toContain(legacyProperty);
    }
  });
});
