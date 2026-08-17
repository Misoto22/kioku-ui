import assert from 'node:assert/strict';
import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test} from 'node:test';
import {exportProblems, workspaceExportProblems} from './verify-exports.mjs';

test('rejects an export map target that is absent from the package', async () => {
  const problems = await exportProblems({
    exports: {'./theme': './dist/theme.js'},
    files: new Set(['dist/index.js']),
  });

  assert.deepEqual(problems, ['missing export target: ./dist/theme.js']);
});

test('accepts an export map target that exists in the package', async () => {
  const problems = await exportProblems({
    exports: {'.': './dist/index.js'},
    files: new Set(['dist/index.js']),
  });

  assert.deepEqual(problems, []);
});

test('traverses an isolated workspace when checking public package exports', async () => {
  const root = await mkdtemp(join(tmpdir(), 'kioku-ui-exports-'));
  const packageRoot = join(root, 'packages/example');

  try {
    await mkdir(join(packageRoot, 'dist'), {recursive: true});
    await writeFile(
      join(packageRoot, 'package.json'),
      `${JSON.stringify({
        name: '@misoto22/example',
        exports: {'.': './dist/missing.js'},
      })}\n`,
    );
    await writeFile(join(packageRoot, 'dist/index.js'), 'export {};\n');

    assert.deepEqual(await workspaceExportProblems(root), [
      '@misoto22/example: missing export target: ./dist/missing.js',
    ]);
  } finally {
    await rm(root, {force: true, recursive: true});
  }
});
