import {execFile} from 'node:child_process';
import {access, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';

import {afterAll, beforeAll, describe, it} from 'vitest';

const run = promisify(execFile);
const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const packageName = ['@misoto22', 'kioku-ui-theme-kioku'].join('/');
const coreThemeEntry = ['@misoto22', 'kioku-ui/theme'].join('/');
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

describe('published theme package build', () => {
  beforeAll(async () => {
    await runPnpm(['build']);
  });

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
      `import {kiokuThemes, washiTheme} from '${packageName}';

if (kiokuThemes.length !== 3 || washiTheme.id !== 'washi') {
  throw new Error('The public theme runtime did not expose the registered themes.');
}
if (!washiTheme.tokens['color.canvas'].includes('--kioku-theme-color-canvas')) {
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
      `import type {ThemeDefinition} from '${coreThemeEntry}';
import {kiokuThemes, mujiTheme} from '${packageName}';

const theme: ThemeDefinition = mujiTheme;
const themes: readonly ThemeDefinition[] = kiokuThemes;
void [theme, themes];
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
  });
});
