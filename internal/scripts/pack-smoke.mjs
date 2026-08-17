import {execFile} from 'node:child_process';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {basename, dirname, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {promisify} from 'node:util';
import {load as parseYaml} from 'js-yaml';

const run = promisify(execFile);
const workspaceRoot = fileURLToPath(new URL('../../', import.meta.url));
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const repositoryUrl = 'https://github.com/Misoto22/kioku-ui.git';
const publicPackageNames = [
  '@misoto22/kioku-ui',
  '@misoto22/kioku-ui-build',
  '@misoto22/kioku-ui-theme-kioku',
];
const finalSemanticProperties = [
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
];
const legacySemanticProperties = [
  '--kioku-ui-radius-sm',
  '--kioku-ui-radius-md',
  '--kioku-ui-radius-lg',
  '--kioku-ui-radius-round',
  '--kioku-ui-density-control-block',
  '--kioku-ui-density-control-inline',
  '--kioku-ui-density-item-gap',
];

export function semanticCssProblems({
  css,
  label,
  legacyProperties = legacySemanticProperties,
  requiredProperties = finalSemanticProperties,
}) {
  const problems = [];

  for (const customProperty of requiredProperties) {
    if (!css.includes(customProperty)) {
      problems.push(`${label} omitted ${customProperty}`);
    }
  }
  for (const customProperty of legacyProperties) {
    if (css.includes(customProperty)) {
      problems.push(`${label} retained legacy ${customProperty}`);
    }
  }

  return problems;
}

export function packedRuntimeProblems(markup) {
  const problems = [];

  if (
    !markup.button?.startsWith('<button') ||
    !markup.button.includes('Delete release') ||
    !markup.button.includes('aria-busy="true"') ||
    !markup.button.includes('disabled=""')
  ) {
    problems.push('packed runtime omitted Button');
  }
  if (!markup.text?.includes('Supporting copy')) {
    problems.push('packed runtime omitted Text');
  }
  if (!markup.heading?.startsWith('<h2')) {
    problems.push('packed runtime omitted Heading');
  }
  if (!markup.card?.startsWith('<article')) {
    problems.push('packed runtime omitted Card');
  }
  if (
    !markup.emptyState?.includes('No release candidates') ||
    !markup.emptyState.includes('◇') ||
    markup.emptyState.indexOf('◇') >
      markup.emptyState.indexOf('No release candidates')
  ) {
    problems.push('packed runtime omitted EmptyState');
  }
  if (
    !markup.table?.startsWith('<table') ||
    !markup.table.includes('<th') ||
    !markup.table.includes('<td')
  ) {
    problems.push('packed runtime omitted Table');
  }

  return problems;
}

function exportEntries(exports, subpath = '.') {
  if (typeof exports === 'string') {
    return [{condition: 'default', subpath, target: exports}];
  }

  if (!exports || typeof exports !== 'object') {
    return [];
  }

  return Object.entries(exports).flatMap(([key, value]) => {
    if (key.startsWith('.')) {
      return exportEntries(value, key);
    }

    return exportEntries(value, subpath).map((entry) => ({
      ...entry,
      condition: key,
    }));
  });
}

function exportSubpaths(exports) {
  if (
    exports &&
    typeof exports === 'object' &&
    Object.keys(exports).some((key) => key.startsWith('.'))
  ) {
    return Object.entries(exports);
  }

  return [['.', exports]];
}

export function artifactProblems({manifest, files}) {
  const name = manifest.name ?? '<unnamed package>';
  const problems = [];
  const hasFile = (pattern) => [...files].some((file) => pattern.test(file));

  if (!hasFile(/^(?:README|readme)(?:\.[^/]+)?$/)) {
    problems.push(`${name}: missing README`);
  }
  if (!hasFile(/^(?:LICEN[CS]E|license)(?:\.[^/]+)?$/)) {
    problems.push(`${name}: missing license file`);
  }
  if (manifest.license !== 'MIT') {
    problems.push(`${name}: package license must be MIT`);
  }
  if (manifest.repository?.url !== repositoryUrl) {
    problems.push(`${name}: repository URL must be ${repositoryUrl}`);
  }
  if (manifest.publishConfig?.access !== 'public') {
    problems.push(`${name}: publishConfig.access must be public`);
  }

  for (const group of [
    'dependencies',
    'optionalDependencies',
    'peerDependencies',
  ]) {
    for (const [dependency, range] of Object.entries(manifest[group] ?? {})) {
      if (/^(?:workspace|link):/.test(range)) {
        problems.push(`${name}: dependency ${dependency} uses ${range}`);
      }
    }
  }

  for (const {target} of exportEntries(manifest.exports)) {
    const normalizedTarget = target.replace(/^\.\//, '');
    if (!files.has(normalizedTarget)) {
      problems.push(`${name}: missing export target: ${normalizedTarget}`);
    }
  }

  for (const [subpath, value] of exportSubpaths(manifest.exports)) {
    const entries = exportEntries(value, subpath);
    if (subpath.endsWith('.css')) {
      if (entries.some(({target}) => !target.endsWith('.css'))) {
        problems.push(`${name}: CSS export ${subpath} must target a .css file`);
      }
      continue;
    }

    const hasRuntime = entries.some(({condition}) =>
      ['default', 'import', 'require', 'source'].includes(condition),
    );
    const typeEntry = entries.find(({condition}) => condition === 'types');
    if (hasRuntime && !typeEntry) {
      problems.push(
        `${name}: runtime export ${subpath} is missing a types condition`,
      );
    } else if (typeEntry && !typeEntry.target.endsWith('.d.ts')) {
      problems.push(
        `${name}: types export ${subpath} must target a .d.ts file`,
      );
    }
  }

  for (const file of files) {
    if (/(?:^|\/)(?:__tests__|tests?)(?:\/|$)/.test(file)) {
      problems.push(`${name}: published test directory module: ${file}`);
    } else if (/(?:^|\/)[^/]+\.(?:spec|test)\.[^.]+$/.test(file)) {
      problems.push(`${name}: published test module: ${file}`);
    } else if (
      /(?:^|\/)(?:__fixtures__|fixtures?|private-fixtures)(?:\/|$)/.test(file)
    ) {
      problems.push(`${name}: published private fixture: ${file}`);
    } else if (
      /(?:^|\/)(?:coverage|node_modules)(?:\/|$)/.test(file) ||
      /(?:^|\/)(?:pnpm-lock\.yaml|tsconfig(?:\.[^/]+)?\.json|vitest\.config\.[^/]+|[^/]+\.tsbuildinfo)$/.test(
        file,
      )
    ) {
      problems.push(`${name}: published development file: ${file}`);
    }
  }

  return problems.sort();
}

export function releaseWorkflowProblems(workflow) {
  const problems = [];
  const release = workflow.jobs?.release;
  const permissions = release?.permissions ?? {};
  const workflowText = JSON.stringify(workflow);
  const setupNodeStep = release?.steps?.find(
    (step) =>
      typeof step.uses === 'string' &&
      step.uses.startsWith('actions/setup-node@'),
  );
  const changesetsStep = release?.steps?.find(
    (step) =>
      typeof step.uses === 'string' &&
      step.uses.startsWith('changesets/action@'),
  );

  if (workflow.on?.pull_request !== undefined) {
    problems.push('release workflow must not run for pull requests');
  }
  if (
    workflow.permissions?.contents !== 'read' ||
    Object.keys(workflow.permissions ?? {}).length !== 1
  ) {
    problems.push(
      'release workflow top-level permissions must be contents: read only',
    );
  }
  if (
    workflow.concurrency?.group !== 'release-${{ github.ref }}' ||
    workflow.concurrency?.['cancel-in-progress'] !== false
  ) {
    problems.push(
      'release workflow must serialize main releases without cancellation',
    );
  }
  if (release?.['runs-on'] !== 'ubuntu-latest') {
    problems.push('release job must use a GitHub-hosted runner');
  }
  if (release?.environment !== 'npm') {
    problems.push('release job must use the npm protected environment');
  }
  if (release?.if !== "github.repository == 'Misoto22/kioku-ui'") {
    problems.push('release job must be limited to Misoto22/kioku-ui');
  }
  for (const [permission, value] of [
    ['contents', 'write'],
    ['id-token', 'write'],
    ['pull-requests', 'write'],
  ]) {
    if (permissions[permission] !== value) {
      problems.push(`release job needs ${permission}: ${value}`);
    }
  }
  if (changesetsStep?.with?.publish !== 'pnpm release') {
    problems.push(
      'release workflow must use changesets/action with pnpm release',
    );
  }
  if (String(changesetsStep?.env?.NPM_CONFIG_PROVENANCE) !== 'true') {
    problems.push('release job must set NPM_CONFIG_PROVENANCE=true');
  }
  if (!release?.steps?.some((step) => step.run === 'pnpm release:verify')) {
    problems.push('release job must run pnpm release:verify');
  }
  if (
    String(setupNodeStep?.with?.['node-version']) !== '24' ||
    setupNodeStep?.with?.['registry-url'] !== 'https://registry.npmjs.org' ||
    String(setupNodeStep?.with?.['package-manager-cache']) !== 'false'
  ) {
    problems.push(
      'release workflow must set up Node 24 for the npm registry without caching',
    );
  }
  if (/(?:NPM_TOKEN|NODE_AUTH_TOKEN|_authToken)/i.test(workflowText)) {
    problems.push(
      'release workflow must not configure an npm authentication token',
    );
  }

  return problems.sort();
}

export function changesetWorkflowProblems(workflow) {
  const problems = [];
  const steps = workflow.jobs?.check?.steps ?? [];
  const checkoutStep = steps.find(
    (step) =>
      typeof step.uses === 'string' &&
      step.uses.startsWith('actions/checkout@'),
  );
  const changesetStep = steps.find(
    (step) =>
      typeof step.run === 'string' && step.run.includes('changeset status'),
  );
  const condition = String(changesetStep?.if ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  const trustedReleaseCondition =
    "github.event_name == 'pull_request' && " +
    "(github.event.pull_request.user.login != 'github-actions[bot]' || " +
    'github.event.pull_request.head.repo.full_name != github.repository || ' +
    "github.head_ref != 'changeset-release/main')";

  if (workflow.on?.pull_request === undefined) {
    problems.push(
      'CI workflow must trigger the Changeset gate for pull requests',
    );
  }
  if (Number(checkoutStep?.with?.['fetch-depth']) !== 0) {
    problems.push(
      'CI checkout must fetch full history for Changeset comparison',
    );
  }
  if (
    changesetStep?.run !==
    'pnpm changeset status --since=origin/${{ github.base_ref }}'
  ) {
    problems.push(
      'CI Changeset gate must compare the pull request with its base branch',
    );
  }
  if (condition !== trustedReleaseCondition) {
    problems.push(
      'CI Changeset gate must exempt only the trusted Changesets release PR',
    );
  }

  return problems.sort();
}

export function changesetPolicyWorkflowProblems(workflow) {
  const problems = [];
  const job = workflow.jobs?.['changeset-policy'];
  const steps = job?.steps ?? [];
  const checkoutStep = steps.find(
    (step) =>
      typeof step.uses === 'string' &&
      step.uses.startsWith('actions/checkout@'),
  );
  const policyStep = steps.find(
    (step) => step.run === 'node internal/scripts/check-changeset-policy.mjs',
  );
  const events = Object.keys(workflow.on ?? {}).sort();
  const permissions = workflow.permissions ?? {};

  if (events.length !== 1 || events[0] !== 'pull_request_target') {
    problems.push(
      'Changeset policy workflow must use pull_request_target only',
    );
  }
  if (
    workflow.on?.pull_request_target !== undefined &&
    JSON.stringify(workflow.on?.pull_request_target?.branches) !==
      JSON.stringify(['main'])
  ) {
    problems.push('Changeset policy workflow must target protected main');
  }
  if (
    permissions.contents !== 'read' ||
    permissions['pull-requests'] !== 'read' ||
    Object.keys(permissions).length !== 2 ||
    job?.permissions !== undefined
  ) {
    problems.push(
      'Changeset policy permissions must be contents: read and pull-requests: read only',
    );
  }
  if (job?.['runs-on'] !== 'ubuntu-latest') {
    problems.push('Changeset policy job must use a GitHub-hosted runner');
  }
  if (
    checkoutStep?.with?.ref !== '${{ github.event.repository.default_branch }}'
  ) {
    problems.push(
      'Changeset policy checkout must use the trusted default branch',
    );
  }
  if (String(checkoutStep?.with?.['persist-credentials']) !== 'false') {
    problems.push(
      'Changeset policy checkout must disable persisted credentials',
    );
  }
  if (
    steps.length !== 2 ||
    !policyStep ||
    policyStep.env?.GITHUB_TOKEN !== '${{ github.token }}'
  ) {
    problems.push(
      'Changeset policy job must run the read-only policy script only',
    );
  }

  return problems.sort();
}

export function consumerInstallProblems({consumer, manifest, lockfile}) {
  const problems = [];
  const dependencies = manifest.dependencies ?? {};
  const requiredPackages =
    consumer === 'compiled'
      ? publicPackageNames.filter(
          (packageName) => packageName !== '@misoto22/kioku-ui-build',
        )
      : publicPackageNames;

  if (manifest.packageManager !== 'pnpm@11.10.0') {
    problems.push('consumer install must pin pnpm@11.10.0');
  }

  for (const packageName of requiredPackages) {
    const specifier = dependencies[packageName];
    if (specifier === undefined) {
      problems.push(`consumer install is missing ${packageName}`);
    } else if (!/^file:.+\.tgz$/.test(specifier)) {
      problems.push(
        `consumer dependency ${packageName} must reference a packed tarball`,
      );
    }
  }

  if (consumer === 'compiled') {
    for (const sourceDependency of [
      '@misoto22/kioku-ui-build',
      '@stylexjs/stylex',
    ]) {
      if (dependencies[sourceDependency] !== undefined) {
        problems.push(
          `compiled consumer must not depend on ${sourceDependency}`,
        );
      }
    }
  } else if (
    consumer === 'source-authoring' &&
    dependencies['@stylexjs/stylex'] !== '0.19.0'
  ) {
    problems.push(
      'source-authoring consumer must declare @stylexjs/stylex@0.19.0 directly',
    );
  }

  for (const [dependency, specifier] of Object.entries(dependencies)) {
    if (
      !publicPackageNames.includes(dependency) &&
      !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(specifier)
    ) {
      problems.push(
        `consumer dependency ${dependency} must use an exact version`,
      );
    }
  }

  if (!lockfile) {
    problems.push('consumer install is missing pnpm-lock.yaml');
  }

  return problems.sort();
}

export function exampleBuildScriptProblems(script) {
  const expectedDirectories = [
    'apps/example-vite',
    'apps/example-nextjs',
    'apps/example-vite-source',
    'apps/example-nextjs-source',
  ];
  const commands = String(script)
    .split('&&')
    .map((command) => command.trim());
  const problems = [];

  for (const directory of expectedDirectories) {
    const install = commands.find((command) =>
      command.startsWith(`pnpm --dir ${directory} install`),
    );
    if (
      !install?.includes('--ignore-workspace') ||
      !install.includes('--frozen-lockfile')
    ) {
      problems.push(
        `${directory}: reference install must use its standalone frozen lock`,
      );
    }
  }

  return problems.sort();
}

async function packageDirectories(root) {
  const directories = [];

  async function visit(directory) {
    const entries = await readdir(directory, {withFileTypes: true});

    if (
      entries.some((entry) => entry.isFile() && entry.name === 'package.json')
    ) {
      directories.push(directory);
      return;
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        await visit(join(directory, entry.name));
      }
    }
  }

  await visit(join(root, 'packages'));
  return directories;
}

export async function publishablePackageNames(root) {
  const packages = await Promise.all(
    (await packageDirectories(root)).map(async (directory) => ({
      directory,
      manifest: JSON.parse(
        await readFile(join(directory, 'package.json'), 'utf8'),
      ),
    })),
  );

  return packages
    .filter(({manifest}) => manifest.private !== true)
    .map(({manifest}) => manifest.name)
    .sort();
}

async function publishablePackages(root) {
  const packages = await Promise.all(
    (await packageDirectories(root)).map(async (directory) => ({
      directory,
      manifest: JSON.parse(
        await readFile(join(directory, 'package.json'), 'utf8'),
      ),
    })),
  );

  return packages
    .filter(({manifest}) => manifest.private !== true)
    .sort((left, right) =>
      left.manifest.name.localeCompare(right.manifest.name),
    );
}

async function runCommand(command, arguments_, options = {}) {
  try {
    return await run(command, arguments_, {
      maxBuffer: 10 * 1024 * 1024,
      ...options,
    });
  } catch (error) {
    const result = error;
    throw new Error(
      [result.message, result.stdout, result.stderr].filter(Boolean).join('\n'),
      {cause: error},
    );
  }
}

export async function packedFiles(packageName) {
  const destination = await mkdtemp(join(tmpdir(), 'kioku-ui-pack-'));

  try {
    await runCommand(pnpm, ['--filter', packageName, 'build'], {
      cwd: workspaceRoot,
    });
    const {stdout} = await runCommand(
      pnpm,
      [
        '--filter',
        packageName,
        'pack',
        '--json',
        '--pack-destination',
        destination,
      ],
      {cwd: workspaceRoot},
    );
    const packResult = JSON.parse(stdout);
    const {filename} = Array.isArray(packResult) ? packResult[0] : packResult;
    const {stdout: listing} = await runCommand('tar', ['-tzf', filename]);

    return new Set(
      listing
        .split('\n')
        .filter(Boolean)
        .map((file) => file.replace(/^package\//, '')),
    );
  } finally {
    await rm(destination, {force: true, recursive: true});
  }
}

function shouldCopy(source) {
  return ![
    '.DS_Store',
    '.next',
    'dist',
    'node_modules',
    'storybook-static',
  ].includes(basename(source));
}

async function copyWorkspace(sourceRoot, destinationRoot) {
  for (const file of [
    'LICENSE',
    'README.md',
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'tsconfig.json',
  ]) {
    await cp(join(sourceRoot, file), join(destinationRoot, file));
  }

  await cp(join(sourceRoot, 'packages'), join(destinationRoot, 'packages'), {
    filter: shouldCopy,
    recursive: true,
  });
  await mkdir(join(destinationRoot, 'internal/scripts'), {recursive: true});
  for (const file of ['check-package-boundaries.mjs', 'verify-exports.mjs']) {
    await cp(
      join(sourceRoot, 'internal/scripts', file),
      join(destinationRoot, 'internal/scripts', file),
    );
  }
  await cp(
    join(sourceRoot, 'internal/test-utils'),
    join(destinationRoot, 'internal/test-utils'),
    {filter: shouldCopy, recursive: true},
  );
  await cp(
    join(sourceRoot, 'internal/types'),
    join(destinationRoot, 'internal/types'),
    {filter: shouldCopy, recursive: true},
  );
}

function parsePackResult(stdout) {
  const result = JSON.parse(stdout);
  return Array.isArray(result) ? result[0] : result;
}

async function inspectTarball(filename) {
  const [{stdout: listing}, {stdout: packageJson}] = await Promise.all([
    runCommand('tar', ['-tzf', filename]),
    runCommand('tar', ['-xOf', filename, 'package/package.json']),
  ]);

  return {
    filename,
    files: new Set(
      listing
        .split('\n')
        .filter(Boolean)
        .map((file) => file.replace(/^package\//, '')),
    ),
    manifest: JSON.parse(packageJson),
  };
}

async function packPublicPackages(stagedRoot, destination) {
  const packages = await publishablePackages(stagedRoot);
  const artifacts = [];

  for (const {manifest} of packages) {
    await runCommand(pnpm, ['--filter', manifest.name, 'build'], {
      cwd: stagedRoot,
    });
  }

  await runCommand(
    process.execPath,
    ['internal/scripts/check-package-boundaries.mjs'],
    {
      cwd: stagedRoot,
    },
  );
  await runCommand(process.execPath, ['internal/scripts/verify-exports.mjs'], {
    cwd: stagedRoot,
  });

  await mkdir(destination, {recursive: true});
  for (const {manifest} of packages) {
    const {stdout} = await runCommand(
      pnpm,
      [
        '--filter',
        manifest.name,
        'pack',
        '--json',
        '--pack-destination',
        destination,
      ],
      {cwd: stagedRoot},
    );
    artifacts.push(await inspectTarball(parsePackResult(stdout).filename));
  }

  return artifacts;
}

function lockedVersion(importer, dependency) {
  const entry =
    importer.dependencies?.[dependency] ??
    importer.devDependencies?.[dependency];
  const version = typeof entry === 'string' ? entry : entry?.version;
  const exact = String(version).replace(/\(.*/, '');

  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(exact)) {
    throw new Error(`Missing exact locked version for ${dependency}`);
  }

  return exact;
}

async function exampleVersions(sourceRoot, directory) {
  const lockfile = parseYaml(
    await readFile(join(sourceRoot, directory, 'pnpm-lock.yaml'), 'utf8'),
  );
  return lockfile.importers['.'];
}

function tarballDependencies(artifacts, packageNames) {
  return Object.fromEntries(
    artifacts
      .filter(({manifest}) => packageNames.includes(manifest.name))
      .map(({filename, manifest}) => [
        manifest.name,
        `file:${resolve(filename)}`,
      ]),
  );
}

async function writeCompiledConsumer(sourceRoot, consumerRoot, artifacts) {
  const versions = await exampleVersions(sourceRoot, 'apps/example-vite');

  await mkdir(join(consumerRoot, 'src'), {recursive: true});
  await writeFile(
    join(consumerRoot, 'package.json'),
    `${JSON.stringify(
      {
        name: 'kioku-ui-packed-compiled-vite-consumer',
        packageManager: 'pnpm@11.10.0',
        private: true,
        type: 'module',
        dependencies: {
          ...tarballDependencies(artifacts, [
            '@misoto22/kioku-ui',
            '@misoto22/kioku-ui-theme-kioku',
          ]),
          '@vitejs/plugin-react': lockedVersion(
            versions,
            '@vitejs/plugin-react',
          ),
          '@types/react': lockedVersion(versions, '@types/react'),
          '@types/react-dom': lockedVersion(versions, '@types/react-dom'),
          react: lockedVersion(versions, 'react'),
          'react-dom': lockedVersion(versions, 'react-dom'),
          typescript: lockedVersion(versions, 'typescript'),
          vite: lockedVersion(versions, 'vite'),
        },
      },
      null,
      2,
    )}\n`,
  );
  await writeFile(
    join(consumerRoot, 'index.html'),
    '<main id="root"></main><script type="module" src="/src/main.tsx"></script>\n',
  );
  await writeFile(
    join(consumerRoot, 'src/main.tsx'),
    `import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import type {
  ButtonVariant,
  CardElevation,
  ControlSize,
  EmptyStateSize,
  HeadingFamily,
  TableDensity,
  TableDividers,
  TextTone,
} from '@misoto22/kioku-ui';
import {
  Button,
  Card,
  EmptyState,
  Heading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
} from '@misoto22/kioku-ui';
import {ThemeProvider} from '@misoto22/kioku-ui/theme';
import '@misoto22/kioku-ui/reset.css';
import '@misoto22/kioku-ui/styles.css';
import {kiokuThemes, washiTheme} from '@misoto22/kioku-ui-theme-kioku';
import '@misoto22/kioku-ui-theme-kioku/theme.css';

const buttonSize: ControlSize = 'lg';
const buttonVariant: ButtonVariant = 'destructive';
const textTone: TextTone = 'secondary';
const headingFamily: HeadingFamily = 'display';
const cardElevation: CardElevation = 'medium';
const emptyStateSize: EmptyStateSize = 'compact';
const tableDensity: TableDensity = 'compact';
const tableDividers: TableDividers = 'grid';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider themes={kiokuThemes} defaultThemeId={washiTheme.id}>
      <Card elevation={cardElevation}>
        <Button loading size={buttonSize} variant={buttonVariant}>
          Delete release
        </Button>
        <Text tone={textTone}>Supporting copy</Text>
        <Heading family={headingFamily} level={2}>Release review</Heading>
        <EmptyState
          detail="Create a release candidate to continue."
          size={emptyStateSize}
          title="No release candidates"
          visual={<span aria-hidden>◇</span>}
        />
        <Table density={tableDensity} dividers={tableDividers}>
          <TableHead>
            <TableRow><TableHeaderCell>Status</TableHeaderCell></TableRow>
          </TableHead>
          <TableBody>
            <TableRow><TableCell>Ready</TableCell></TableRow>
          </TableBody>
        </Table>
      </Card>
    </ThemeProvider>
  </StrictMode>,
);
`,
  );
  await writeFile(
    join(consumerRoot, 'verify-runtime.mjs'),
    `import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {
  Button,
  Card,
  EmptyState,
  Heading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
} from '@misoto22/kioku-ui';

const render = (component, props, children) =>
  renderToStaticMarkup(createElement(component, props, children));
const markup = {
  button: render(
    Button,
    {loading: true, size: 'lg', variant: 'destructive'},
    'Delete release',
  ),
  text: render(Text, {tone: 'secondary'}, 'Supporting copy'),
  heading: render(
    Heading,
    {family: 'display', level: 2},
    'Release review',
  ),
  card: render(Card, {elevation: 'medium'}, 'Release details'),
  emptyState: render(EmptyState, {
    detail: 'Create a release candidate to continue.',
    size: 'compact',
    title: 'No release candidates',
    visual: createElement('span', {'aria-hidden': true}, '◇'),
  }),
  table: render(Table, {density: 'compact', dividers: 'grid'}, [
    createElement(
      TableHead,
      {key: 'head'},
      createElement(
        TableRow,
        null,
        createElement(TableHeaderCell, null, 'Status'),
      ),
    ),
    createElement(
      TableBody,
      {key: 'body'},
      createElement(
        TableRow,
        null,
        createElement(TableCell, null, 'Ready'),
      ),
    ),
  ]),
};

process.stdout.write(JSON.stringify(markup));
`,
  );
  await writeFile(
    join(consumerRoot, 'ignore-css-loader.mjs'),
    `const emptyCssModule = new URL('./empty-css.mjs', import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('.css')) {
    return {shortCircuit: true, url: emptyCssModule};
  }
  return nextResolve(specifier, context);
}
`,
  );
  await writeFile(join(consumerRoot, 'empty-css.mjs'), 'export {};\n');
  await writeFile(
    join(consumerRoot, 'vite.config.mjs'),
    `import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({plugins: [react()]});
`,
  );
  await writeFile(
    join(consumerRoot, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          jsx: 'react-jsx',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          noEmit: true,
          strict: true,
          target: 'ES2022',
          types: ['vite/client'],
        },
        include: ['src/**/*.tsx'],
      },
      null,
      2,
    )}\n`,
  );
}

async function writeSourceConsumer(sourceRoot, consumerRoot, artifacts) {
  const versions = await exampleVersions(
    sourceRoot,
    'apps/example-vite-source',
  );

  await mkdir(join(consumerRoot, 'src'), {recursive: true});
  await writeFile(
    join(consumerRoot, 'package.json'),
    `${JSON.stringify(
      {
        name: 'kioku-ui-packed-source-vite-consumer',
        packageManager: 'pnpm@11.10.0',
        private: true,
        type: 'module',
        dependencies: {
          ...tarballDependencies(artifacts, publicPackageNames),
          '@stylexjs/stylex': lockedVersion(versions, '@stylexjs/stylex'),
          '@types/react': lockedVersion(versions, '@types/react'),
          '@types/react-dom': lockedVersion(versions, '@types/react-dom'),
          '@vitejs/plugin-react': lockedVersion(
            versions,
            '@vitejs/plugin-react',
          ),
          react: lockedVersion(versions, 'react'),
          'react-dom': lockedVersion(versions, 'react-dom'),
          typescript: lockedVersion(versions, 'typescript'),
          vite: lockedVersion(versions, 'vite'),
        },
      },
      null,
      2,
    )}\n`,
  );
  await writeFile(
    join(consumerRoot, 'index.html'),
    '<main id="root"></main><script type="module" src="/src/main.tsx"></script>\n',
  );
  await writeFile(
    join(consumerRoot, 'src/main.tsx'),
    `import * as stylex from '@stylexjs/stylex';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Button, Card} from '@misoto22/kioku-ui/source';
import {semanticTokens} from '@misoto22/kioku-ui/authoring.stylex';
import '@misoto22/kioku-ui/reset.css';
import {ThemeProvider} from '@misoto22/kioku-ui/theme';
import {kiokuThemes, washiTheme} from '@misoto22/kioku-ui-theme-kioku';
import '@misoto22/kioku-ui-theme-kioku/theme.css';

const styles = stylex.create({root: {color: semanticTokens.colorText}});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider themes={kiokuThemes} defaultThemeId={washiTheme.id}>
      <Card {...stylex.props(styles.root)}><Button>Source package</Button></Card>
    </ThemeProvider>
  </StrictMode>,
);
`,
  );
  await writeFile(
    join(consumerRoot, 'vite.config.mjs'),
    `import {kiokuUiVitePlugin} from '@misoto22/kioku-ui-build/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [...kiokuUiVitePlugin({rootDir: import.meta.dirname}), react()],
});
`,
  );
  await writeFile(
    join(consumerRoot, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          jsx: 'react-jsx',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          noEmit: true,
          strict: true,
          target: 'ES2022',
          types: ['vite/client'],
        },
        include: ['src/**/*.tsx'],
      },
      null,
      2,
    )}\n`,
  );
}

async function assertBuiltCss(consumerRoot, outputDirectory) {
  const outputRoot = join(consumerRoot, outputDirectory);
  const files = await readdir(outputRoot, {recursive: true});
  const cssFiles = files.filter((file) => file.endsWith('.css'));

  if (cssFiles.length === 0) {
    throw new Error(`${outputDirectory} did not emit CSS`);
  }

  const css = (
    await Promise.all(
      cssFiles.map((file) => readFile(join(outputRoot, file), 'utf8')),
    )
  ).join('\n');
  if (!css.includes('--kioku-ui-color-text')) {
    throw new Error(`${outputDirectory} omitted the semantic theme CSS`);
  }

  return css;
}

async function readCssEntryTree(entry, visited = new Set()) {
  if (visited.has(entry)) {
    return '';
  }
  visited.add(entry);

  const css = await readFile(entry, 'utf8');
  const imports = [...css.matchAll(/@import\s+['"]([^'"]+\.css)['"]/g)];
  const importedCss = await Promise.all(
    imports.map((match) =>
      readCssEntryTree(resolve(dirname(entry), match[1]), visited),
    ),
  );

  return [css, ...importedCss].join('\n');
}

async function packedConsumerCss(consumerRoot, builtCss) {
  const consumerRequire = createRequire(join(consumerRoot, 'package.json'));
  const coreEntry = consumerRequire.resolve('@misoto22/kioku-ui/styles.css');
  const themeEntry = consumerRequire.resolve(
    '@misoto22/kioku-ui-theme-kioku/theme.css',
  );
  const [coreCss, themeCss] = await Promise.all([
    readCssEntryTree(coreEntry),
    readFile(themeEntry, 'utf8'),
  ]);

  for (const [label, css] of [
    ['packed core CSS entry', coreCss],
    ['packed theme CSS entry', themeCss],
    ['packed consumer build CSS', builtCss],
  ]) {
    const problems = semanticCssProblems({css, label});
    if (problems.length > 0) {
      throw new Error(problems.join('\n'));
    }
  }

  const omittedSemanticVariable = themeCss.replaceAll(
    '--kioku-ui-color-accent-hover',
    '--kioku-ui-omitted-color-accent-hover',
  );
  const mutationProblems = semanticCssProblems({
    css: omittedSemanticVariable,
    label: 'packed theme CSS mutation',
  });
  if (
    !mutationProblems.includes(
      'packed theme CSS mutation omitted --kioku-ui-color-accent-hover',
    )
  ) {
    throw new Error(
      'Packed CSS validation accepted an omitted semantic custom property',
    );
  }

  return {
    legacyPropertiesRejected: legacySemanticProperties.length,
    semanticProperties: finalSemanticProperties.length,
  };
}

async function assertMissingPublicTypeImportFails(consumerRoot) {
  const entry = join(consumerRoot, 'src/main.tsx');
  const source = await readFile(entry, 'utf8');
  const mutation = source.replace('  TextTone,\n', '');
  if (mutation === source) {
    throw new Error('Could not create the missing TextTone import mutation');
  }

  let rejection;
  await writeFile(entry, mutation);
  try {
    await runCommand(pnpm, ['exec', 'tsc', '--noEmit', '-p', 'tsconfig.json'], {
      cwd: consumerRoot,
    });
  } catch (error) {
    rejection = error;
  } finally {
    await writeFile(entry, source);
  }

  if (!rejection) {
    throw new Error(
      'Strict packed consumer typecheck accepted an omitted TextTone import',
    );
  }
  if (!String(rejection.message).includes("Cannot find name 'TextTone'")) {
    throw new Error(
      `Missing TextTone import failed for an unexpected reason:\n${rejection.message}`,
    );
  }
}

async function renderPackedRuntime(consumerRoot) {
  const {stdout} = await runCommand(
    process.execPath,
    [
      '--experimental-loader',
      pathToFileURL(join(consumerRoot, 'ignore-css-loader.mjs')).href,
      join(consumerRoot, 'verify-runtime.mjs'),
    ],
    {cwd: consumerRoot},
  );
  const markup = JSON.parse(stdout);
  const problems = packedRuntimeProblems(markup);
  if (problems.length > 0) {
    throw new Error(problems.join('\n'));
  }

  return Object.keys(markup).length;
}

async function installPackedConsumer(consumer, consumerRoot) {
  // Resolution has to reach the registry: the consumer's bundler pulls its
  // native binding through platform optional dependencies, and an offline
  // resolve silently writes a lockfile that omits the ones this machine has
  // never downloaded.
  await runCommand(
    pnpm,
    [
      'install',
      '--ignore-workspace',
      '--prefer-offline',
      '--ignore-scripts',
      '--lockfile-only',
      '--config.auto-install-peers=false',
    ],
    {cwd: consumerRoot},
  );
  const installProblems = consumerInstallProblems({
    consumer,
    manifest: JSON.parse(
      await readFile(join(consumerRoot, 'package.json'), 'utf8'),
    ),
    lockfile: await readFile(join(consumerRoot, 'pnpm-lock.yaml'), 'utf8'),
  });
  if (installProblems.length > 0) {
    throw new Error(installProblems.join('\n'));
  }
  // The consumer resolves its own dependency tree, so parts of it never enter
  // the workspace store and cannot be installed offline on a clean machine.
  // The lockfile written above still pins every version and integrity hash.
  await runCommand(
    pnpm,
    [
      'install',
      '--ignore-workspace',
      '--prefer-offline',
      '--ignore-scripts',
      '--frozen-lockfile',
      '--config.auto-install-peers=false',
    ],
    {cwd: consumerRoot},
  );
}

async function buildPackedConsumers(sourceRoot, consumerRoot, artifacts) {
  const compiledRoot = join(consumerRoot, 'compiled');
  const sourceAuthoringRoot = join(consumerRoot, 'source-authoring');

  await Promise.all([
    writeCompiledConsumer(sourceRoot, compiledRoot, artifacts),
    writeSourceConsumer(sourceRoot, sourceAuthoringRoot, artifacts),
  ]);
  await installPackedConsumer('compiled', compiledRoot);
  await assertMissingPublicTypeImportFails(compiledRoot);
  await runCommand(pnpm, ['exec', 'tsc', '--noEmit', '-p', 'tsconfig.json'], {
    cwd: compiledRoot,
  });
  const runtimeComponents = await renderPackedRuntime(compiledRoot);
  await runCommand(
    pnpm,
    ['exec', 'vite', 'build', '--config', 'vite.config.mjs'],
    {cwd: compiledRoot},
  );
  const compiledCss = await assertBuiltCss(compiledRoot, 'dist');
  const packedCss = await packedConsumerCss(compiledRoot, compiledCss);

  await installPackedConsumer('source-authoring', sourceAuthoringRoot);
  await runCommand(pnpm, ['exec', 'tsc', '--noEmit', '-p', 'tsconfig.json'], {
    cwd: sourceAuthoringRoot,
  });
  await runCommand(
    pnpm,
    ['exec', 'vite', 'build', '--config', 'vite.config.mjs'],
    {cwd: sourceAuthoringRoot},
  );
  await assertBuiltCss(sourceAuthoringRoot, 'dist');

  return {
    ...packedCss,
    publicTypes: 8,
    runtimeComponents,
  };
}

async function workflow(root, filename) {
  try {
    const source = await readFile(
      join(root, '.github/workflows', filename),
      'utf8',
    );
    return parseYaml(source);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

export async function repositoryWorkflowProblems(root) {
  const [release, ci, changesetPolicy] = await Promise.all([
    workflow(root, 'release.yml'),
    workflow(root, 'ci.yml'),
    workflow(root, 'changeset-policy.yml'),
  ]);
  return [
    ...releaseWorkflowProblems(release),
    ...changesetWorkflowProblems(ci),
    ...changesetPolicyWorkflowProblems(changesetPolicy),
  ].sort();
}

export async function packSmoke(root = workspaceRoot) {
  const stagedRoot = await mkdtemp(
    join(tmpdir(), 'kioku-ui-release-workspace-'),
  );
  const consumerRoot = await mkdtemp(join(tmpdir(), 'kioku-ui-vite-consumer-'));

  try {
    const workflowProblems = await repositoryWorkflowProblems(root);
    if (workflowProblems.length > 0) {
      throw new Error(workflowProblems.join('\n'));
    }

    await copyWorkspace(root, stagedRoot);
    await runCommand(
      pnpm,
      ['install', '--offline', '--frozen-lockfile', '--ignore-scripts'],
      {cwd: stagedRoot},
    );
    const artifacts = await packPublicPackages(
      stagedRoot,
      join(stagedRoot, '.pack-artifacts'),
    );
    const problems = artifacts.flatMap(artifactProblems);
    if (problems.length > 0) {
      throw new Error(problems.join('\n'));
    }

    const packedSurface = await buildPackedConsumers(
      root,
      consumerRoot,
      artifacts,
    );

    return {
      consumers: ['compiled', 'source-authoring'],
      packedSurface,
      packages: artifacts.map(({manifest}) => manifest.name).sort(),
      temporaryTraversal: ['package-boundaries', 'exports'],
    };
  } finally {
    await Promise.all([
      rm(stagedRoot, {force: true, recursive: true}),
      rm(consumerRoot, {force: true, recursive: true}),
    ]);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await packSmoke();
  console.log(
    `Packed ${result.packages.join(', ')}; built ${result.consumers.join(' and ')} Vite consumers; verified ${result.packedSurface.publicTypes} public types, ${result.packedSurface.runtimeComponents} rendered components, ${result.packedSurface.semanticProperties} semantic properties, and rejected ${result.packedSurface.legacyPropertiesRejected} legacy properties.`,
  );
}
