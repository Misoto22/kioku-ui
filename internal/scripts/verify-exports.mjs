import {readFile, readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join, relative} from 'node:path';

function exportTargets(value) {
  if (typeof value === 'string') {
    return [value];
  }

  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(exportTargets);
  }

  return [];
}

export async function exportProblems({exports, files}) {
  return exportTargets(exports)
    .filter((target) => !files.has(target.replace(/^\.\//, '')))
    .map((target) => `missing export target: ${target}`)
    .sort();
}

async function packageFiles(directory) {
  const files = new Set();

  async function visit(current) {
    const entries = await readdir(current, {withFileTypes: true});

    for (const entry of entries) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) {
        await visit(path);
      } else {
        files.add(relative(directory, path));
      }
    }
  }

  await visit(directory);
  return files;
}

async function packageDirectories(root) {
  const directories = [];

  async function visit(current) {
    const entries = await readdir(current, {withFileTypes: true});
    if (entries.some((entry) => entry.name === 'package.json')) {
      directories.push(current);
      return;
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        await visit(join(current, entry.name));
      }
    }
  }

  await visit(join(root, 'packages'));
  return directories;
}

export async function workspaceExportProblems(root) {
  const problems = [];

  for (const directory of await packageDirectories(root)) {
    const manifest = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
    if (manifest.private || !manifest.exports) {
      continue;
    }

    const packageProblems = await exportProblems({
      exports: manifest.exports,
      files: await packageFiles(directory),
    });
    problems.push(...packageProblems.map((problem) => `${manifest.name}: ${problem}`));
  }

  return problems.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const problems = await workspaceExportProblems(process.cwd());

  if (problems.length > 0) {
    console.error(problems.join('\n'));
    process.exitCode = 1;
  }
}
