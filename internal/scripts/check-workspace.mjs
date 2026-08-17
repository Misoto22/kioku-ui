import {readFile, stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {load as parseYaml} from 'js-yaml';

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export async function workspaceProblems(root) {
  const required = ['apps', 'packages', 'internal', '.changeset'];
  const missing = [];

  for (const name of required) {
    try {
      await stat(join(root, name));
    } catch {
      missing.push(`missing top-level directory: ${name}`);
    }
  }

  let workspaceConfig;
  try {
    workspaceConfig = parseYaml(
      await readFile(join(root, 'pnpm-workspace.yaml'), 'utf8'),
    );
  } catch {
    workspaceConfig = undefined;
  }

  const allowBuilds = isRecord(workspaceConfig)
    ? workspaceConfig.allowBuilds
    : undefined;
  if (
    !isRecord(allowBuilds) ||
    Object.keys(allowBuilds).length !== 1 ||
    allowBuilds.esbuild !== true
  ) {
    missing.push(
      'pnpm-workspace.yaml must define exactly allowBuilds.esbuild: true',
    );
  }
  if (
    isRecord(workspaceConfig) &&
    workspaceConfig.dangerouslyAllowAllBuilds === true
  ) {
    missing.push(
      'pnpm-workspace.yaml must not enable dangerouslyAllowAllBuilds',
    );
  }

  return missing;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const problems = await workspaceProblems(process.cwd());

  if (problems.length > 0) {
    console.error(problems.join('\n'));
    process.exitCode = 1;
  }
}
