import {stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

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

  return missing;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const problems = await workspaceProblems(process.cwd());

  if (problems.length > 0) {
    console.error(problems.join('\n'));
    process.exitCode = 1;
  }
}
