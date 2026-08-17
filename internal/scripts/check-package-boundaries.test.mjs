import assert from 'node:assert/strict';
import {test} from 'node:test';
import {packageBoundaryProblems} from './check-package-boundaries.mjs';

test('rejects core imports from the Kioku host application', async () => {
  const problems = await packageBoundaryProblems({
    files: {
      'packages/core/src/Bad.tsx':
        "import {api} from '../../../kioku/web/src/lib/api'",
    },
  });

  assert.deepEqual(problems, [
    'packages/core/src/Bad.tsx imports a host application path',
  ]);
});

test('rejects forbidden core package dependencies', async () => {
  const problems = await packageBoundaryProblems({
    packages: {
      '@misoto22/kioku-ui': {dependencies: {'@misoto22/kioku-ui-cli': 'workspace:*'}},
    },
  });

  assert.deepEqual(problems, [
    '@misoto22/kioku-ui depends on a forbidden package: @misoto22/kioku-ui-cli',
  ]);
});
