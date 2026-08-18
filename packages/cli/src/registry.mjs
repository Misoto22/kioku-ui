import {readFile, readdir, stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

/** Kinds of source the CLI can copy into a host application. */
export const templateKinds = Object.freeze(['blocks', 'pages', 'themes']);

export function assetsRoot() {
  return fileURLToPath(new URL('../assets/templates/', import.meta.url));
}

function kindRoot(kind) {
  return kind === 'blocks'
    ? join(assetsRoot(), 'blocks', 'components')
    : join(assetsRoot(), kind);
}

async function readManifest(directory) {
  try {
    return JSON.parse(await readFile(join(directory, 'template.json'), 'utf8'));
  } catch {
    return undefined;
  }
}

/**
 * Lists every template of one kind. A directory without a `template.json` is
 * reported as a problem rather than skipped, so a half-added template cannot
 * disappear from the catalogue unnoticed.
 */
export async function listTemplates(kind) {
  if (!templateKinds.includes(kind)) {
    throw new Error(`Unknown template kind: ${kind}`);
  }

  const root = kindRoot(kind);
  let entries;
  try {
    entries = await readdir(root, {withFileTypes: true});
  } catch {
    return {problems: [], templates: []};
  }

  const templates = [];
  const problems = [];

  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    if (!entry.isDirectory()) continue;

    const directory = join(root, entry.name);
    const manifest = await readManifest(directory);
    if (!manifest) {
      problems.push(`${kind}/${entry.name} is missing template.json`);
      continue;
    }
    if (
      typeof manifest.description !== 'string' ||
      manifest.description === ''
    ) {
      problems.push(`${kind}/${entry.name} has no description`);
    }
    if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
      problems.push(`${kind}/${entry.name} lists no files`);
      continue;
    }

    for (const file of manifest.files) {
      try {
        await stat(join(directory, file));
      } catch {
        problems.push(`${kind}/${entry.name} lists a missing file: ${file}`);
      }
    }

    templates.push({
      description: manifest.description ?? '',
      directory,
      files: manifest.files,
      id: entry.name,
      kind,
      title: manifest.title ?? entry.name,
    });
  }

  return {problems, templates};
}

/** Lists every template across every kind. */
export async function listAllTemplates() {
  const templates = [];
  const problems = [];

  for (const kind of templateKinds) {
    const result = await listTemplates(kind);
    templates.push(...result.templates);
    problems.push(...result.problems);
  }

  return {problems, templates};
}
