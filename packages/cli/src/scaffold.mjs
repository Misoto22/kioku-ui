import {copyFile, mkdir, stat} from 'node:fs/promises';
import {dirname, join} from 'node:path';

import {listTemplates} from './registry.mjs';

/**
 * Copies one template into `destination`. Existing files are never
 * overwritten unless `force` is set, because a consumer owns the source once
 * it lands in their repository.
 */
export async function scaffold({destination, force = false, id, kind}) {
  const {templates} = await listTemplates(kind);
  const template = templates.find((candidate) => candidate.id === id);

  if (!template) {
    throw new Error(`Unknown ${kind} template: ${id}`);
  }

  const written = [];
  const skipped = [];

  for (const file of template.files) {
    const target = join(destination, file);

    if (!force) {
      try {
        await stat(target);
        skipped.push(file);
        continue;
      } catch {
        // Nothing there yet, so writing is safe.
      }
    }

    await mkdir(dirname(target), {recursive: true});
    await copyFile(join(template.directory, file), target);
    written.push(file);
  }

  return {skipped, template, written};
}
