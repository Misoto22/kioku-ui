import assert from 'node:assert/strict';
import {test} from 'node:test';
import {exportProblems} from './verify-exports.mjs';

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
