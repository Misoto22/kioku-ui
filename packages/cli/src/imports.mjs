import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

import {listAllTemplates} from './registry.mjs';

const importPattern =
  /import\s*\{([^}]+)\}\s*from\s*['"]@misoto22\/kioku-ui['"]/gu;
const exportPattern = /^export\s*\{([^}]+)\}\s*from/gmu;

function parseNames(block) {
  return block
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.replace(/^type\s+/u, ''))
    .map((entry) => entry.split(/\s+as\s+/u)[0].trim())
    .filter(Boolean);
}

/** Reads every name the public package entry re-exports. */
export async function publicExports(coreIndexUrl) {
  const source = await readFile(coreIndexUrl, 'utf8');
  const names = new Set();

  for (const match of source.matchAll(exportPattern)) {
    for (const name of parseNames(match[1])) {
      names.add(name);
    }
  }

  return names;
}

/**
 * Reports template files that import something the package does not export.
 * Templates are copied into a consumer's repository verbatim, so a stale name
 * here becomes their compile error rather than ours.
 */
export async function templateImportProblems(coreIndexUrl) {
  const exported = await publicExports(coreIndexUrl);
  const {templates} = await listAllTemplates();
  const problems = [];

  for (const template of templates) {
    for (const file of template.files) {
      const source = await readFile(join(template.directory, file), 'utf8');

      for (const match of source.matchAll(importPattern)) {
        for (const name of parseNames(match[1])) {
          if (!exported.has(name)) {
            problems.push(
              `${template.kind}/${template.id}/${file} imports '${name}', which @misoto22/kioku-ui does not export`,
            );
          }
        }
      }
    }
  }

  return problems;
}
