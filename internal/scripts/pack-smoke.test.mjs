import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test} from 'node:test';
import {promisify} from 'node:util';
import {load as parseYaml} from 'js-yaml';

import * as packSmokeContract from './pack-smoke.mjs';
import {
  artifactProblems,
  consumerInstallProblems,
  exampleBuildScriptProblems,
  packSmoke,
  packedFiles,
  publishablePackageNames,
  releaseWorkflowProblems,
  repositoryWorkflowProblems,
} from './pack-smoke.mjs';

const run = promisify(execFile);
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

const setupNodeInputs = {
  'node-version': 24,
  'registry-url': 'https://registry.npmjs.org',
  'package-manager-cache': false,
};

// The shape release.yml actually ships, so every contract test below can name
// only the one thing it breaks.
function releaseWorkflowFixture({release, publish, publishSteps} = {}) {
  return {
    on: {push: {branches: ['main']}},
    permissions: {contents: 'read'},
    concurrency: {
      group: 'release-${{ github.ref }}',
      'cancel-in-progress': false,
    },
    jobs: {
      release: {
        if: "github.repository == 'Misoto22/kioku-ui'",
        uses: 'Misoto22/ci/.github/workflows/release.yml@168697c01c8c24ce02a24a4e7b7b773e65c5cefe',
        ...release,
      },
      publish: {
        needs: 'release',
        if: "needs.release.outputs.release_created == 'true'",
        'runs-on': 'ubuntu-latest',
        environment: 'npm',
        permissions: {contents: 'read', 'id-token': 'write'},
        steps: publishSteps ?? [
          {uses: 'actions/checkout@v7'},
          {uses: 'pnpm/action-setup@v6', with: {version: '11.10.0'}},
          {uses: 'actions/setup-node@v7', with: setupNodeInputs},
          {run: 'pnpm install --frozen-lockfile'},
          {run: 'pnpm exec playwright install chromium', 'timeout-minutes': 10},
          {run: 'pnpm release:verify'},
          {
            run: 'pnpm -r publish --access public --no-git-checks',
            env: {NPM_CONFIG_PROVENANCE: 'true'},
          },
        ],
        ...publish,
      },
    },
  };
}

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
      'consumer install must pin pnpm@11.10.0',
    ],
  );
});

test('compiled consumers do not require source-authoring tooling', () => {
  assert.deepEqual(
    consumerInstallProblems({
      consumer: 'compiled',
      manifest: {
        packageManager: 'pnpm@11.10.0',
        dependencies: {
          '@misoto22/kioku-ui': 'file:/tmp/kioku-ui.tgz',
          '@misoto22/kioku-ui-theme-kioku':
            'file:/tmp/kioku-ui-theme-kioku.tgz',
          react: '19.2.4',
        },
      },
      lockfile: 'lockfileVersion: 9.0',
    }),
    [],
  );
});

test('compiled consumers reject source-authoring tooling', () => {
  assert.deepEqual(
    consumerInstallProblems({
      consumer: 'compiled',
      manifest: {
        packageManager: 'pnpm@11.10.0',
        dependencies: {
          '@misoto22/kioku-ui': 'file:/tmp/kioku-ui.tgz',
          '@misoto22/kioku-ui-build': 'file:/tmp/kioku-ui-build.tgz',
          '@misoto22/kioku-ui-theme-kioku':
            'file:/tmp/kioku-ui-theme-kioku.tgz',
          '@stylexjs/stylex': '0.19.0',
          react: '19.2.4',
        },
      },
      lockfile: 'lockfileVersion: 9.0',
    }),
    [
      'compiled consumer must not depend on @misoto22/kioku-ui-build',
      'compiled consumer must not depend on @stylexjs/stylex',
    ],
  );
});

test('source-authoring consumers require an exact direct StyleX dependency', () => {
  assert.deepEqual(
    consumerInstallProblems({
      consumer: 'source-authoring',
      manifest: {
        packageManager: 'pnpm@11.10.0',
        dependencies: {
          '@misoto22/kioku-ui': 'file:/tmp/kioku-ui.tgz',
          '@misoto22/kioku-ui-build': 'file:/tmp/kioku-ui-build.tgz',
          '@misoto22/kioku-ui-theme-kioku':
            'file:/tmp/kioku-ui-theme-kioku.tgz',
          react: '19.2.4',
        },
      },
      lockfile: 'lockfileVersion: 9.0',
    }),
    ['source-authoring consumer must declare @stylexjs/stylex@0.19.0 directly'],
  );
});

test('first-party source examples declare the StyleX authoring dependency', async () => {
  for (const directory of [
    'apps/example-vite-source',
    'apps/example-nextjs-source',
  ]) {
    const manifest = JSON.parse(
      await readFile(join(directory, 'package.json'), 'utf8'),
    );
    assert.equal(manifest.dependencies['@stylexjs/stylex'], '0.19.0');
  }
});

test('checked-in reference builds install their standalone frozen locks', async () => {
  const manifest = JSON.parse(await readFile('package.json', 'utf8'));
  assert.deepEqual(
    exampleBuildScriptProblems(manifest.scripts['examples:build']),
    [],
  );
});

test('packed consumer evidence rejects an omitted runtime surface and semantic variable', () => {
  assert.equal(
    typeof packSmokeContract.packedRuntimeProblems,
    'function',
    'pack smoke must validate the rendered packed runtime surface',
  );
  assert.equal(
    typeof packSmokeContract.semanticCssProblems,
    'function',
    'pack smoke must validate CSS resolved from the packed consumer',
  );

  assert.deepEqual(
    packSmokeContract.packedRuntimeProblems({
      button: '<button aria-busy="true" disabled="">Delete release</button>',
      card: '<article>Release details</article>',
      emptyState: '<div>◇ No release candidates</div>',
      heading: '<h2>Release review</h2>',
      table:
        '<table><thead><tr><th>Status</th></tr></thead><tbody><tr><td>Ready</td></tr></tbody></table>',
    }),
    ['packed runtime omitted Text'],
  );

  assert.deepEqual(
    packSmokeContract.semanticCssProblems({
      css: ':root { --kioku-ui-radius-sm: 4px; }',
      label: 'packed CSS fixture',
      legacyProperties: ['--kioku-ui-radius-sm'],
      requiredProperties: ['--kioku-ui-color-accent-hover'],
    }),
    [
      'packed CSS fixture omitted --kioku-ui-color-accent-hover',
      'packed CSS fixture retained legacy --kioku-ui-radius-sm',
    ],
  );
});

test('CI reference builds install their standalone frozen locks', async () => {
  const workflow = parseYaml(
    await readFile('.github/workflows/ci.yml', 'utf8'),
  );
  const script = Object.values(workflow.jobs)
    .flatMap((job) => job.steps)
    .map((step) => step.run)
    .filter(Boolean)
    .join(' && ');

  assert.deepEqual(exampleBuildScriptProblems(script), []);
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

test('rejects modules under conventional test directories', () => {
  const problems = artifactProblems({
    manifest: {
      name: '@misoto22/example',
      license: 'MIT',
      repository: {
        type: 'git',
        url: 'https://github.com/Misoto22/kioku-ui.git',
      },
      publishConfig: {access: 'public'},
      exports: {},
    },
    files: new Set([
      'LICENSE',
      'README.md',
      'package.json',
      'src/__tests__/owner-data.ts',
      'dist/test/owner-data.js',
      'dist/tests/owner-data.js',
    ]),
  });

  assert.deepEqual(problems, [
    '@misoto22/example: published test directory module: dist/test/owner-data.js',
    '@misoto22/example: published test directory module: dist/tests/owner-data.js',
    '@misoto22/example: published test directory module: src/__tests__/owner-data.ts',
  ]);
});

test('core package files exclude conventional test directories', async () => {
  const packageRoot = await mkdtemp(join(tmpdir(), 'kioku-ui-pack-files-'));
  const destination = join(packageRoot, 'artifacts');

  try {
    const manifest = JSON.parse(
      await readFile('packages/core/package.json', 'utf8'),
    );
    manifest.name = '@misoto22/kioku-ui-pack-pattern-test';
    delete manifest.devDependencies;
    await writeFile(
      join(packageRoot, 'package.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
    await writeFile(join(packageRoot, 'README.md'), '# Pack pattern test\n');
    await writeFile(join(packageRoot, 'LICENSE'), 'MIT\n');

    for (const file of [
      'dist/__tests__/owner-data.js',
      'dist/test/owner-data.js',
      'dist/tests/owner-data.js',
      'src/__tests__/owner-data.ts',
      'src/test/owner-data.ts',
      'src/tests/owner-data.ts',
    ]) {
      await mkdir(join(packageRoot, file, '..'), {recursive: true});
      await writeFile(join(packageRoot, file), 'export {};\n');
    }

    await mkdir(destination);
    const {stdout} = await run(
      pnpm,
      ['pack', '--json', '--pack-destination', destination],
      {cwd: packageRoot},
    );
    const result = JSON.parse(stdout);
    const {filename} = Array.isArray(result) ? result[0] : result;
    const {stdout: listing} = await run('tar', ['-tzf', filename]);

    assert.equal(
      listing
        .split('\n')
        .some((file) => /(?:^|\/)(?:__tests__|tests?)(?:\/|$)/.test(file)),
      false,
    );
  } finally {
    await rm(packageRoot, {force: true, recursive: true});
  }
});

test('rejects release workflows that can publish pull requests or use npm tokens', () => {
  const problems = releaseWorkflowProblems({
    on: {pull_request: {}, push: {branches: ['main']}},
    permissions: {contents: 'write'},
    jobs: {
      publish: {
        'runs-on': 'self-hosted',
        permissions: {
          contents: 'read',
          'id-token': 'write',
          'pull-requests': 'write',
        },
        steps: [
          {
            run: 'pnpm publish -r',
            env: {NODE_AUTH_TOKEN: '${{ secrets.NPM_TOKEN }}'},
          },
        ],
      },
    },
  });

  assert.deepEqual(problems, [
    'publish job must not be able to write pull requests',
    'publish job must publish every public package in one recursive command',
    'publish job must run only for a created release',
    'publish job must run pnpm release:verify',
    'publish job must use a GitHub-hosted runner',
    'publish job must use the npm protected environment',
    'release job must be limited to Misoto22/kioku-ui',
    'release job must call the fleet release workflow pinned to a commit SHA',
    'release workflow must not configure an npm authentication token',
    'release workflow must not run for pull requests',
    'release workflow must serialize main releases without cancellation',
    'release workflow must set up Node 24 for the npm registry without caching',
    'release workflow top-level permissions must be contents: read only',
  ]);
});

test('rejects a release job that floats the fleet workflow on a movable ref', () => {
  assert.deepEqual(
    releaseWorkflowProblems(
      releaseWorkflowFixture({
        release: {
          uses: 'Misoto22/ci/.github/workflows/release.yml@v0.2.0',
        },
      }),
    ),
    ['release job must call the fleet release workflow pinned to a commit SHA'],
  );
});

test('rejects a publish job that runs before release-please cut the tag', () => {
  assert.deepEqual(
    releaseWorkflowProblems(
      releaseWorkflowFixture({publish: {if: 'always()'}}),
    ),
    ['publish job must run only for a created release'],
  );
});

test('rejects a publish job that can write pull requests', () => {
  assert.deepEqual(
    releaseWorkflowProblems(
      releaseWorkflowFixture({
        publish: {
          permissions: {
            contents: 'read',
            'id-token': 'write',
            'pull-requests': 'write',
          },
        },
      }),
    ),
    ['publish job must not be able to write pull requests'],
  );
});

test('rejects a publish job without the OIDC identity npm trusts', () => {
  assert.deepEqual(
    releaseWorkflowProblems(
      releaseWorkflowFixture({
        publish: {environment: undefined, permissions: {contents: 'read'}},
      }),
    ),
    [
      'publish job must use the npm protected environment',
      'publish job needs id-token: write',
    ],
  );
});

test('requires the recursive publish to request provenance as a string', () => {
  assert.deepEqual(
    releaseWorkflowProblems(
      releaseWorkflowFixture({
        publishSteps: [
          {uses: 'actions/setup-node@v7', with: setupNodeInputs},
          {run: 'pnpm exec playwright install chromium', 'timeout-minutes': 10},
          {run: 'pnpm release:verify'},
          {
            run: 'pnpm -r publish --access public --no-git-checks',
            // YAML parses an unquoted true as a boolean, and the runner then
            // never exports the variable npm reads.
            env: {NPM_CONFIG_PROVENANCE: true},
          },
        ],
      }),
    ),
    ["publish step must set NPM_CONFIG_PROVENANCE to 'true'"],
  );
});

test('rejects a release workflow that audits without installing browsers', () => {
  assert.deepEqual(
    releaseWorkflowProblems(
      releaseWorkflowFixture({
        publishSteps: [
          {uses: 'actions/setup-node@v7', with: setupNodeInputs},
          {run: 'pnpm release:verify'},
          {
            run: 'pnpm -r publish --access public --no-git-checks',
            env: {NPM_CONFIG_PROVENANCE: 'true'},
          },
        ],
      }),
    ),
    ['publish job must install Playwright browsers before pnpm release:verify'],
  );
});

test('rejects a release workflow with an unbounded browser install', () => {
  assert.deepEqual(
    releaseWorkflowProblems(
      releaseWorkflowFixture({
        publishSteps: [
          {uses: 'actions/setup-node@v7', with: setupNodeInputs},
          {run: 'pnpm exec playwright install chromium'},
          {run: 'pnpm release:verify'},
          {
            run: 'pnpm -r publish --access public --no-git-checks',
            env: {NPM_CONFIG_PROVENANCE: 'true'},
          },
        ],
      }),
    ),
    ['publish job must bound the Playwright install with a timeout'],
  );
});

test('accepts the release-please topology this repository ships', () => {
  assert.deepEqual(releaseWorkflowProblems(releaseWorkflowFixture()), []);
});

test('the checked-in release workflow satisfies the release contract', async () => {
  assert.deepEqual(await repositoryWorkflowProblems(process.cwd()), []);
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
      packedSurface: {
        legacyPropertiesRejected: 7,
        publicTypes: 8,
        runtimeComponents: 6,
        semanticProperties: 26,
      },
      packages: [
        '@misoto22/kioku-ui',
        '@misoto22/kioku-ui-build',
        '@misoto22/kioku-ui-theme-kioku',
      ],
      temporaryTraversal: ['package-boundaries', 'exports'],
    });
  },
);
