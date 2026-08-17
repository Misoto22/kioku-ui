import assert from 'node:assert/strict';
import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test} from 'node:test';
import {
  packageBoundaryProblems,
  workspacePackageBoundaryProblems,
} from './check-package-boundaries.mjs';

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
      '@misoto22/kioku-ui': {
        dependencies: {'@misoto22/kioku-ui-cli': 'workspace:*'},
      },
    },
  });

  assert.deepEqual(problems, [
    '@misoto22/kioku-ui depends on a forbidden package: @misoto22/kioku-ui-cli',
  ]);
});

test('rejects named skins, literal defaults, and persistence ownership in core theme sources', async () => {
  const problems = await packageBoundaryProblems({
    files: {
      'packages/core/src/theme/Theme.doc.ts':
        '\'<ThemeProvider defaultThemeId="washi" themes={themes} />\'',
      'packages/core/src/theme/Theme.tsx':
        "const savedTheme = localStorage.getItem('theme');",
    },
  });

  assert.deepEqual(problems, [
    'packages/core/src/theme/Theme.doc.ts hard-codes a default theme ID instead of accepting host configuration',
    'packages/core/src/theme/Theme.doc.ts names external theme skin "washi"',
    'packages/core/src/theme/Theme.tsx owns theme persistence instead of accepting a host adapter',
  ]);
});

test('accepts host-supplied theme registry, default, and persistence adapters', async () => {
  const problems = await packageBoundaryProblems({
    files: {
      'packages/core/src/theme/Theme.doc.ts':
        "'<ThemeProvider defaultThemeId={hostDefaultThemeId} persistence={hostPersistence} themes={hostThemes} />'",
    },
  });

  assert.deepEqual(problems, []);
});

test('rejects a host application import in a CommonJS core file', async () => {
  const root = await mkdtemp(join(tmpdir(), 'kioku-ui-boundary-'));
  const source = join(root, 'packages/core/src');

  try {
    await mkdir(source, {recursive: true});
    await writeFile(
      join(root, 'packages/core/package.json'),
      '{"name":"@misoto22/kioku-ui"}\n',
    );
    const file = join(source, 'boundary-regression.cjs');
    await writeFile(file, "require('../../../kioku/web/src/lib/api');\n");
    assert.deepEqual(await workspacePackageBoundaryProblems(root), [
      'packages/core/src/boundary-regression.cjs imports a host application path',
    ]);
  } finally {
    await rm(root, {force: true, recursive: true});
  }
});

test('rejects a router import in a CommonJS TypeScript core file', async () => {
  const root = await mkdtemp(join(tmpdir(), 'kioku-ui-boundary-'));
  const source = join(root, 'packages/core/src');

  try {
    await mkdir(source, {recursive: true});
    await writeFile(
      join(root, 'packages/core/package.json'),
      '{"name":"@misoto22/kioku-ui"}\n',
    );
    const file = join(source, 'boundary-regression.cts');
    await writeFile(file, "import {Link} from 'react-router-dom';\n");
    assert.deepEqual(await workspacePackageBoundaryProblems(root), [
      'packages/core/src/boundary-regression.cts imports react-router-dom',
    ]);
  } finally {
    await rm(root, {force: true, recursive: true});
  }
});
