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
  changesetWorkflowProblems,
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

test('the initial Changeset plan releases every public package at 0.1.0', async () => {
  const releaseRoot = await mkdtemp(join(tmpdir(), 'kioku-ui-release-plan-'));

  try {
    await mkdir(join(releaseRoot, '.changeset'), {recursive: true});
    await writeFile(
      join(releaseRoot, 'package.json'),
      `${JSON.stringify({private: true}, null, 2)}\n`,
    );
    await writeFile(
      join(releaseRoot, 'pnpm-workspace.yaml'),
      "packages:\n  - 'packages/*'\n  - 'packages/themes/*'\n",
    );
    await writeFile(
      join(releaseRoot, '.changeset/config.json'),
      `${JSON.stringify(
        {
          ...JSON.parse(await readFile('.changeset/config.json', 'utf8')),
          changelog: false,
        },
        null,
        2,
      )}\n`,
    );

    for (const directory of [
      'packages/core',
      'packages/build',
      'packages/themes/kioku',
    ]) {
      const sourceManifest = JSON.parse(
        await readFile(join(directory, 'package.json'), 'utf8'),
      );
      const manifest = {
        name: sourceManifest.name,
        peerDependencies: sourceManifest.peerDependencies,
        version: '0.0.0',
      };
      await mkdir(join(releaseRoot, directory), {recursive: true});
      await writeFile(
        join(releaseRoot, directory, 'package.json'),
        `${JSON.stringify(manifest, null, 2)}\n`,
      );
    }

    await run('git', ['init', '-b', 'main'], {cwd: releaseRoot});
    await run('git', ['config', 'user.email', 'test@example.invalid'], {
      cwd: releaseRoot,
    });
    await run('git', ['config', 'user.name', 'Release plan test'], {
      cwd: releaseRoot,
    });
    await run('git', ['add', '.'], {cwd: releaseRoot});
    await run('git', ['commit', '-m', 'test: establish release baseline'], {
      cwd: releaseRoot,
    });
    await writeFile(
      join(releaseRoot, '.changeset/initial.md'),
      "---\n'@misoto22/kioku-ui': minor\n'@misoto22/kioku-ui-build': minor\n'@misoto22/kioku-ui-theme-kioku': minor\n---\n\nInitial public release.\n",
    );
    await run('git', ['add', '.changeset/initial.md'], {cwd: releaseRoot});
    await run(
      join(process.cwd(), 'node_modules/.bin/changeset'),
      ['status', '--since=HEAD', '--output=release-plan.json'],
      {cwd: releaseRoot},
    );

    const plan = JSON.parse(
      await readFile(join(releaseRoot, 'release-plan.json'), 'utf8'),
    );
    assert.deepEqual(
      plan.releases.map(({name, newVersion, type}) => ({
        name,
        newVersion,
        type,
      })),
      [
        {
          name: '@misoto22/kioku-ui',
          newVersion: '0.1.0',
          type: 'minor',
        },
        {
          name: '@misoto22/kioku-ui-build',
          newVersion: '0.1.0',
          type: 'minor',
        },
        {
          name: '@misoto22/kioku-ui-theme-kioku',
          newVersion: '0.1.0',
          type: 'minor',
        },
      ],
    );
  } finally {
    await rm(releaseRoot, {force: true, recursive: true});
  }
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

test('rejects a release workflow that audits without installing browsers', () => {
  const problems = releaseWorkflowProblems({
    on: {push: {branches: ['main']}},
    permissions: {contents: 'read'},
    concurrency: {
      group: 'release-${{ github.ref }}',
      'cancel-in-progress': false,
    },
    jobs: {
      release: {
        if: "github.repository == 'Misoto22/kioku-ui'",
        'runs-on': 'ubuntu-latest',
        environment: 'npm',
        permissions: {
          contents: 'write',
          'id-token': 'write',
          'pull-requests': 'write',
        },
        steps: [
          {
            uses: 'actions/setup-node@v6',
            with: {
              'node-version': 24,
              'registry-url': 'https://registry.npmjs.org',
              'package-manager-cache': false,
            },
          },
          {run: 'pnpm install --frozen-lockfile'},
          {run: 'pnpm release:verify'},
          {
            uses: 'changesets/action@v1',
            with: {publish: 'pnpm release'},
            env: {NPM_CONFIG_PROVENANCE: true},
          },
        ],
      },
    },
  });

  assert.deepEqual(problems, [
    'release job must install Playwright browsers before pnpm release:verify',
  ]);
});

test('rejects a release workflow with an unbounded browser install', () => {
  const problems = releaseWorkflowProblems({
    on: {push: {branches: ['main']}},
    permissions: {contents: 'read'},
    concurrency: {
      group: 'release-${{ github.ref }}',
      'cancel-in-progress': false,
    },
    jobs: {
      release: {
        if: "github.repository == 'Misoto22/kioku-ui'",
        'runs-on': 'ubuntu-latest',
        environment: 'npm',
        permissions: {
          contents: 'write',
          'id-token': 'write',
          'pull-requests': 'write',
        },
        steps: [
          {
            uses: 'actions/setup-node@v6',
            with: {
              'node-version': 24,
              'registry-url': 'https://registry.npmjs.org',
              'package-manager-cache': false,
            },
          },
          {run: 'pnpm install --frozen-lockfile'},
          {run: 'pnpm exec playwright install chromium'},
          {run: 'pnpm release:verify'},
          {
            uses: 'changesets/action@v1',
            with: {publish: 'pnpm release'},
            env: {NPM_CONFIG_PROVENANCE: true},
          },
        ],
      },
    },
  });

  assert.deepEqual(problems, [
    'release job must bound the Playwright install with a timeout',
  ]);
});

test('rejects a Changeset policy workflow that can execute pull request code', () => {
  const problems =
    packSmokeContract.changesetPolicyWorkflowProblems?.({
      on: {pull_request: null},
      permissions: {contents: 'write'},
      jobs: {
        'changeset-policy': {
          'runs-on': 'self-hosted',
          steps: [
            {
              uses: 'actions/checkout@v5',
              with: {ref: '${{ github.event.pull_request.head.sha }}'},
            },
            {run: 'pnpm install && pnpm changeset status'},
          ],
        },
      },
    }) ?? [];

  assert.deepEqual(problems, [
    'Changeset policy checkout must disable persisted credentials',
    'Changeset policy checkout must use the trusted default branch',
    'Changeset policy job must run the read-only policy script only',
    'Changeset policy job must use a GitHub-hosted runner',
    'Changeset policy permissions must be contents: read and pull-requests: read only',
    'Changeset policy workflow must use pull_request_target only',
  ]);
});

test('requires the independent Changeset policy to target protected main', () => {
  const problems = packSmokeContract.changesetPolicyWorkflowProblems({
    on: {pull_request_target: {types: ['opened', 'synchronize']}},
    permissions: {contents: 'read', 'pull-requests': 'read'},
    jobs: {
      'changeset-policy': {
        'runs-on': 'ubuntu-latest',
        steps: [
          {
            uses: 'actions/checkout@v5',
            with: {
              ref: '${{ github.event.repository.default_branch }}',
              'persist-credentials': false,
            },
          },
          {
            run: 'node internal/scripts/check-changeset-policy.mjs',
            env: {GITHUB_TOKEN: '${{ github.token }}'},
          },
        ],
      },
    },
  });

  assert.deepEqual(problems, [
    'Changeset policy workflow must target protected main',
  ]);
});

test('requires a PR-only Changeset gate without blocking the trusted release PR', () => {
  const problems = changesetWorkflowProblems({
    on: {pull_request: null, push: {branches: ['main']}},
    jobs: {
      check: {
        steps: [{uses: 'actions/checkout@v5'}, {run: 'pnpm changeset status'}],
      },
    },
  });

  assert.deepEqual(problems, [
    'CI Changeset gate must compare the pull request with its base branch',
    'CI Changeset gate must exempt only the trusted Changesets release PR',
    'CI checkout must fetch full history for Changeset comparison',
  ]);
});

test('rejects a Changeset exception whose trust checks use the wrong boolean logic', () => {
  const problems = changesetWorkflowProblems({
    on: {pull_request: null},
    jobs: {
      check: {
        steps: [
          {uses: 'actions/checkout@v5', with: {'fetch-depth': 0}},
          {
            if: "github.event_name == 'pull_request' && github.actor != 'github-actions[bot]' && github.event.pull_request.head.repo.full_name != github.repository && github.head_ref != 'changeset-release/main'",
            run: 'pnpm changeset status --since=origin/${{ github.base_ref }}',
          },
        ],
      },
    },
  });

  assert.deepEqual(problems, [
    'CI Changeset gate must exempt only the trusted Changesets release PR',
  ]);
});

test('trusts the Changesets release PR author rather than the workflow trigger actor', () => {
  const problems = changesetWorkflowProblems({
    on: {pull_request: null},
    jobs: {
      check: {
        steps: [
          {uses: 'actions/checkout@v5', with: {'fetch-depth': 0}},
          {
            if: "github.event_name == 'pull_request' && (github.event.pull_request.user.login != 'github-actions[bot]' || github.event.pull_request.head.repo.full_name != github.repository || github.head_ref != 'changeset-release/main')",
            run: 'pnpm changeset status --since=origin/${{ github.base_ref }}',
          },
        ],
      },
    },
  });

  assert.deepEqual(problems, []);
});

test('requires CI to trigger the Changeset gate for pull requests', () => {
  const problems = changesetWorkflowProblems({
    jobs: {
      check: {
        steps: [
          {uses: 'actions/checkout@v5', with: {'fetch-depth': 0}},
          {
            if: "github.event_name == 'pull_request' && (github.event.pull_request.user.login != 'github-actions[bot]' || github.event.pull_request.head.repo.full_name != github.repository || github.head_ref != 'changeset-release/main')",
            run: 'pnpm changeset status --since=origin/${{ github.base_ref }}',
          },
        ],
      },
    },
  });

  assert.deepEqual(problems, [
    'CI workflow must trigger the Changeset gate for pull requests',
  ]);
});

test('checked-in workflows enforce the release and Changeset topology', async () => {
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
