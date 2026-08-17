import {execFile} from 'node:child_process';
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';

import {afterAll, beforeAll, describe, expect, it} from 'vitest';

const run = promisify(execFile);
const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const packageName = ['@misoto22', 'kioku-ui'].join('/');
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

describe('published package build', () => {
  beforeAll(async () => {
    await runPnpm(['build']);
  });

  afterAll(async () => {
    await Promise.all([
      rm(join(packageRoot, 'dist'), {force: true, recursive: true}),
      ...temporaryDirectories.map((directory) =>
        rm(directory, {force: true, recursive: true}),
      ),
    ]);
  });

  it('compiles a StyleX recipe through the stable public authoring module', async () => {
    const fixtureRoot = await mkdtemp(
      join(packageRoot, '.test-public-authoring-'),
    );
    temporaryDirectories.push(fixtureRoot);

    const input = join(fixtureRoot, 'input');
    const output = join(fixtureRoot, 'output');
    await mkdir(input);
    await writeFile(
      join(input, 'consumer.stylex.ts'),
      `import * as stylex from '@stylexjs/stylex';
import {semanticTokens} from '${packageName}/authoring.stylex';

export const consumerStyles = stylex.create({
  root: {color: semanticTokens.colorText},
});
`,
    );

    await runPnpm([
      'exec',
      'stylex',
      '-i',
      input,
      '-o',
      output,
      '-b',
      'stylex.css',
      '--babelPresets',
      '@babel/preset-typescript',
    ]);

    const css = await readFile(join(output, 'stylex.css'), 'utf8');
    const referencedVariable = css.match(/color:var\((--[^)]+)\)/)?.[1];
    expect(referencedVariable).toBeDefined();

    const packageCss = await readFile(
      join(packageRoot, 'dist/styles/stylex.css'),
      'utf8',
    );
    expect(packageCss).toContain(
      `${referencedVariable}:var(--kioku-ui-color-text)`,
    );
  });

  it('publishes declarations that resolve from the package root', async () => {
    await access(join(packageRoot, 'dist/index.d.ts'));

    const fixtureRoot = await mkdtemp(join(packageRoot, '.test-types-'));
    temporaryDirectories.push(fixtureRoot);
    const source = join(fixtureRoot, 'consumer.ts');
    await writeFile(
      source,
      `import type {ThemeDefinition, TokenContract} from '${packageName}';

declare const contract: TokenContract;
declare const theme: ThemeDefinition;

const themeId: string = theme.id;
const canvasValue: string = theme.tokens[contract.color.canvas];
void [themeId, canvasValue];
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
      source,
    ]);
  });
});
