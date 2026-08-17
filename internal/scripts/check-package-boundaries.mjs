import {readFile, readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join, relative} from 'node:path';

const sourceExtensions = new Set([
  '.cjs',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx',
]);
const forbiddenDependencies = new Set([
  '@misoto22/kioku-ui-cli',
  '@misoto22/kioku-ui-build',
  '@misoto22/kioku-ui-theme-kioku',
  '@misoto22/kioku-ui-charts',
  '@misoto22/kioku-ui-vega',
]);
const importPattern = /(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)/g;

function importProblem(file, specifier) {
  if (specifier.includes('react-router-dom')) {
    return `${file} imports react-router-dom`;
  }

  if (
    specifier.includes('kioku') ||
    specifier.includes('apps/') ||
    specifier.includes('web/src')
  ) {
    return `${file} imports a host application path`;
  }

  return undefined;
}

async function sourceFiles(directory) {
  const files = {};

  async function visit(current) {
    let entries;

    try {
      entries = await readdir(current, {withFileTypes: true});
    } catch {
      return;
    }

    for (const entry of entries) {
      const path = join(current, entry.name);

      if (entry.isDirectory()) {
        await visit(path);
      } else if (sourceExtensions.has(path.slice(path.lastIndexOf('.')))) {
        files[relative(directory, path)] = await readFile(path, 'utf8');
      }
    }
  }

  await visit(directory);
  return files;
}

async function workspacePackages(root) {
  const packages = {};
  async function visit(directory) {
    let entries;

    try {
      entries = await readdir(directory, {withFileTypes: true});
    } catch {
      return;
    }

    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(path);
      } else if (entry.name === 'package.json') {
        const manifest = JSON.parse(await readFile(path, 'utf8'));
        packages[manifest.name] = manifest;
      }
    }
  }

  await visit(join(root, 'packages'));
  return packages;
}

export async function packageBoundaryProblems({files, packages} = {}) {
  const problems = [];

  for (const [file, contents] of Object.entries(files ?? {})) {
    importPattern.lastIndex = 0;
    let match;

    while ((match = importPattern.exec(contents)) !== null) {
      const problem = importProblem(file, match[1] ?? match[2] ?? match[3]);
      if (problem) {
        problems.push(problem);
      }
    }
  }

  const core = packages?.['@misoto22/kioku-ui'];
  const dependencies = {
    ...core?.dependencies,
    ...core?.devDependencies,
    ...core?.peerDependencies,
  };

  for (const dependency of Object.keys(dependencies).sort()) {
    if (forbiddenDependencies.has(dependency)) {
      problems.push(
        `@misoto22/kioku-ui depends on a forbidden package: ${dependency}`,
      );
    }
  }

  return problems.sort();
}

export async function workspacePackageBoundaryProblems(root) {
  const coreDirectory = join(root, 'packages/core');
  const files = await sourceFiles(coreDirectory);
  const packages = await workspacePackages(root);
  const prefixedFiles = Object.fromEntries(
    Object.entries(files).map(([file, contents]) => [
      `packages/core/${file}`,
      contents,
    ]),
  );

  return packageBoundaryProblems({files: prefixedFiles, packages});
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const problems = await workspacePackageBoundaryProblems(process.cwd());

  if (problems.length > 0) {
    console.error(problems.join('\n'));
    process.exitCode = 1;
  }
}
