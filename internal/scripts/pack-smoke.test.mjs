import assert from 'node:assert/strict';
import {test} from 'node:test';

import {
  artifactProblems,
  consumerInstallProblems,
  packSmoke,
  packedFiles,
  publishablePackageNames,
  releaseWorkflowProblems,
} from './pack-smoke.mjs';

test('rejects workspace aliases and unlocked standalone consumer installs', () => {
  assert.deepEqual(
    consumerInstallProblems({
      manifest: {
        dependencies: {
          '@misoto22/kioku-ui': 'workspace:*',
          react: '^19.2.4',
        },
      },
    }),
    [
      'consumer dependency @misoto22/kioku-ui must reference a packed tarball',
      'consumer dependency react must use an exact version',
      'consumer install is missing @misoto22/kioku-ui-build',
      'consumer install is missing @misoto22/kioku-ui-theme-kioku',
      'consumer install is missing pnpm-lock.yaml',
    ],
  );
});

test('discovers every actual publishable package and excludes placeholders', async () => {
  assert.deepEqual(await publishablePackageNames(process.cwd()), [
    '@misoto22/kioku-ui',
    '@misoto22/kioku-ui-build',
    '@misoto22/kioku-ui-theme-kioku',
  ]);
});

test('reports missing package contract files and published development artifacts', () => {
  const problems = artifactProblems({
    manifest: {
      name: '@misoto22/example',
      license: 'MIT',
      repository: {
        type: 'git',
        url: 'https://github.com/Misoto22/kioku-ui.git',
      },
      publishConfig: {access: 'public'},
      dependencies: {'@misoto22/private-fixture': 'workspace:*'},
      exports: {
        '.': {
          types: './dist/index.d.ts',
          import: './dist/index.js',
        },
        './theme.css': './dist/theme.css',
      },
    },
    files: new Set([
      'LICENSE',
      'package.json',
      'dist/debug.test.js',
      'dist/index.js',
      'fixtures/owner-record.json',
      'tsconfig.build.json',
    ]),
  });

  assert.deepEqual(problems, [
    '@misoto22/example: dependency @misoto22/private-fixture uses workspace:*',
    '@misoto22/example: missing README',
    '@misoto22/example: missing export target: dist/index.d.ts',
    '@misoto22/example: missing export target: dist/theme.css',
    '@misoto22/example: published development file: tsconfig.build.json',
    '@misoto22/example: published private fixture: fixtures/owner-record.json',
    '@misoto22/example: published test module: dist/debug.test.js',
  ]);
});

test('requires typed runtime exports and real CSS targets', () => {
  const problems = artifactProblems({
    manifest: {
      name: '@misoto22/example',
      license: 'MIT',
      repository: {
        type: 'git',
        url: 'https://github.com/Misoto22/kioku-ui.git',
      },
      publishConfig: {access: 'public'},
      exports: {
        '.': {import: './dist/index.js'},
        './theme.css': './dist/theme.js',
      },
    },
    files: new Set([
      'LICENSE',
      'README.md',
      'package.json',
      'dist/index.js',
      'dist/theme.js',
    ]),
  });

  assert.deepEqual(problems, [
    '@misoto22/example: CSS export ./theme.css must target a .css file',
    '@misoto22/example: runtime export . is missing a types condition',
  ]);
});

test('rejects release workflows that can publish pull requests or use npm tokens', () => {
  const problems = releaseWorkflowProblems({
    on: {pull_request: {}, push: {branches: ['main']}},
    permissions: {contents: 'write'},
    jobs: {
      release: {
        'runs-on': 'self-hosted',
        steps: [
          {
            run: 'pnpm release',
            env: {NODE_AUTH_TOKEN: '${{ secrets.NPM_TOKEN }}'},
          },
        ],
      },
    },
  });

  assert.deepEqual(problems, [
    'release job must be limited to Misoto22/kioku-ui',
    'release job must run pnpm release:verify',
    'release job must set NPM_CONFIG_PROVENANCE=true',
    'release job must use a GitHub-hosted runner',
    'release job must use the npm protected environment',
    'release job needs contents: write',
    'release job needs id-token: write',
    'release job needs pull-requests: write',
    'release workflow must not configure an npm authentication token',
    'release workflow must not run for pull requests',
    'release workflow must serialize main releases without cancellation',
    'release workflow must set up Node 24 for the npm registry without caching',
    'release workflow must use changesets/action with pnpm release',
    'release workflow top-level permissions must be contents: read only',
  ]);
});

test('packed core contains public runtime and CSS exports without test modules', async () => {
  const files = await packedFiles('@misoto22/kioku-ui');

  assert(files.has('dist/index.js'));
  assert(files.has('dist/styles/index.css'));
  assert.equal(
    [...files].some((file) =>
      /(?:^|\/)[^/]+\.(?:spec|test)\.[^.]+$/.test(file),
    ),
    false,
  );
});

test(
  'builds every public tarball and both standalone Vite consumer paths',
  {timeout: 180_000},
  async () => {
    assert.deepEqual(await packSmoke(process.cwd()), {
      consumers: ['compiled', 'source-authoring'],
      packages: [
        '@misoto22/kioku-ui',
        '@misoto22/kioku-ui-build',
        '@misoto22/kioku-ui-theme-kioku',
      ],
      temporaryTraversal: ['package-boundaries', 'exports'],
    });
  },
);
