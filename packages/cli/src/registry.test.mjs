import {mkdtemp, readFile, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

import {publicExports, templateImportProblems} from './imports.mjs';
import {listAllTemplates, listTemplates, templateKinds} from './registry.mjs';
import {scaffold} from './scaffold.mjs';

describe('listTemplates', () => {
  it('reads every page template with a resolvable manifest', async () => {
    const {problems, templates} = await listTemplates('pages');

    expect(problems).toEqual([]);
    expect(templates.length).toBeGreaterThan(0);
    for (const template of templates) {
      expect(template.description).not.toBe('');
      expect(template.files.length).toBeGreaterThan(0);
    }
  });

  it('refuses an unknown kind rather than returning nothing', async () => {
    await expect(listTemplates('widgets')).rejects.toThrow(
      'Unknown template kind: widgets',
    );
  });

  it('covers every declared kind', async () => {
    const {problems} = await listAllTemplates();

    expect(templateKinds).toContain('pages');
    expect(problems).toEqual([]);
  });
});

describe('scaffold', () => {
  it('copies a template into the destination', async () => {
    const destination = await mkdtemp(join(tmpdir(), 'kioku-cli-'));

    const result = await scaffold({destination, id: 'blank', kind: 'pages'});

    expect(result.written).toEqual(['BlankPage.tsx']);
    const written = await readFile(join(destination, 'BlankPage.tsx'), 'utf8');
    expect(written).toContain('export function BlankPage');
  });

  it('never overwrites a file the consumer already owns', async () => {
    const destination = await mkdtemp(join(tmpdir(), 'kioku-cli-'));
    await writeFile(join(destination, 'BlankPage.tsx'), 'mine', 'utf8');

    const result = await scaffold({destination, id: 'blank', kind: 'pages'});

    expect(result.written).toEqual([]);
    expect(result.skipped).toEqual(['BlankPage.tsx']);
    expect(await readFile(join(destination, 'BlankPage.tsx'), 'utf8')).toBe(
      'mine',
    );
  });

  it('overwrites only when explicitly forced', async () => {
    const destination = await mkdtemp(join(tmpdir(), 'kioku-cli-'));
    await writeFile(join(destination, 'BlankPage.tsx'), 'mine', 'utf8');

    const result = await scaffold({
      destination,
      force: true,
      id: 'blank',
      kind: 'pages',
    });

    expect(result.written).toEqual(['BlankPage.tsx']);
    expect(
      await readFile(join(destination, 'BlankPage.tsx'), 'utf8'),
    ).toContain('BlankPage');
  });

  it('refuses an unknown template id', async () => {
    const destination = await mkdtemp(join(tmpdir(), 'kioku-cli-'));

    await expect(
      scaffold({destination, id: 'nope', kind: 'pages'}),
    ).rejects.toThrow('Unknown pages template: nope');
  });
});

describe('theme templates', () => {
  it('fills every role the token contract declares', async () => {
    const contract = await readFile(
      new URL('../../core/src/authoring.stylex.ts', import.meta.url),
      'utf8',
    );
    const roles = [
      ...contract.matchAll(/var\(--kioku-ui-([a-z0-9-]+)\)/gu),
    ].map((match) => match[1]);
    expect(roles.length).toBeGreaterThan(0);

    const {templates} = await listTemplates('themes');
    expect(templates.length).toBeGreaterThan(0);

    for (const template of templates) {
      for (const file of template.files) {
        const source = await readFile(join(template.directory, file), 'utf8');
        const missing = roles.filter((role) => !source.includes(`'${role}'`));
        expect({missing, template: template.id}).toEqual({
          missing: [],
          template: template.id,
        });
      }
    }
  });
});

describe('template imports', () => {
  const coreIndex = new URL('../../core/src/index.ts', import.meta.url);

  it('reads the public export surface', async () => {
    const names = await publicExports(coreIndex);

    expect(names.has('Button')).toBe(true);
    expect(names.has('AppShell')).toBe(true);
    expect(names.has('NotAComponent')).toBe(false);
  });

  it('never ships a template importing a name the package lacks', async () => {
    await expect(templateImportProblems(coreIndex)).resolves.toEqual([]);
  });
});
