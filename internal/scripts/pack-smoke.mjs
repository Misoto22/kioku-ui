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
import {basename, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
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
          react: lockedVersion(versions, 'react'),
          'react-dom': lockedVersion(versions, 'react-dom'),
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
import {Button, Card} from '@misoto22/kioku-ui';
import {ThemeProvider} from '@misoto22/kioku-ui/theme';
import '@misoto22/kioku-ui/reset.css';
import '@misoto22/kioku-ui/styles.css';
import {kiokuThemes, washiTheme} from '@misoto22/kioku-ui-theme-kioku';
import '@misoto22/kioku-ui-theme-kioku/theme.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider themes={kiokuThemes} defaultThemeId={washiTheme.id}>
      <Card><Button>Compiled package</Button></Card>
    </ThemeProvider>
  </StrictMode>,
);
`,
  );
  await writeFile(
    join(consumerRoot, 'vite.config.mjs'),
    `import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({plugins: [react()]});
`,
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
  const cssFile = files.find((file) => file.endsWith('.css'));

  if (!cssFile) {
    throw new Error(`${outputDirectory} did not emit CSS`);
  }

  const css = await readFile(join(outputRoot, cssFile), 'utf8');
  if (!css.includes('--kioku-ui-color-text')) {
    throw new Error(`${outputDirectory} omitted the semantic theme CSS`);
  }
}

async function installPackedConsumer(consumer, consumerRoot) {
  await runCommand(
    pnpm,
    [
      'install',
      '--ignore-workspace',
      '--offline',
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
  await runCommand(
    pnpm,
    [
      'install',
      '--ignore-workspace',
      '--offline',
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
  await runCommand(
    pnpm,
    ['exec', 'vite', 'build', '--config', 'vite.config.mjs'],
    {cwd: compiledRoot},
  );
  await assertBuiltCss(compiledRoot, 'dist');

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
}

async function workflow(root, filename) {
  const source = await readFile(
    join(root, '.github/workflows', filename),
    'utf8',
  );
  return parseYaml(source);
}

export async function repositoryWorkflowProblems(root) {
  const [release, ci] = await Promise.all([
    workflow(root, 'release.yml'),
    workflow(root, 'ci.yml'),
  ]);
  return [
    ...releaseWorkflowProblems(release),
    ...changesetWorkflowProblems(ci),
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

    await buildPackedConsumers(root, consumerRoot, artifacts);

    return {
      consumers: ['compiled', 'source-authoring'],
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
    `Packed ${result.packages.join(', ')}; built ${result.consumers.join(' and ')} Vite consumers.`,
  );
}
