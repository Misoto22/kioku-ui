import assert from 'node:assert/strict';
import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test} from 'node:test';
import {workspaceProblems} from './check-workspace.mjs';

const requiredDirectories = ['apps', 'packages', 'internal', '.changeset'];

async function workspaceFixture(t, pnpmWorkspaceYaml) {
  const root = await mkdtemp(join(tmpdir(), 'kioku-ui-workspace-policy-'));
  t.after(() => rm(root, {force: true, recursive: true}));
  await Promise.all(
    requiredDirectories.map((directory) =>
      mkdir(join(root, directory), {recursive: true}),
    ),
  );
  if (pnpmWorkspaceYaml !== undefined) {
    await writeFile(join(root, 'pnpm-workspace.yaml'), pnpmWorkspaceYaml);
  }
  return root;
}

test('accepts the required Astryx-aligned top-level directories', async () => {
  assert.deepEqual(await workspaceProblems(process.cwd()), []);
});

test('requires exactly the reviewed esbuild dependency build permission', async (t) => {
  const expected = [
    'pnpm-workspace.yaml must define exactly allowBuilds.esbuild: true',
  ];
  const fixtures = [
    {
      name: 'missing allowBuilds',
      yaml: 'packages:\n  - packages/*\n',
    },
    {
      name: 'false permission',
      yaml: 'packages:\n  - packages/*\nallowBuilds:\n  esbuild: false\n',
    },
    {
      name: 'wildcard permission',
      yaml: 'packages:\n  - packages/*\nallowBuilds:\n  esbuild: true\n  "*": true\n',
    },
    {
      name: 'additional package permission',
      yaml: 'packages:\n  - packages/*\nallowBuilds:\n  esbuild: true\n  sharp: true\n',
    },
  ];

  for (const fixture of fixtures) {
    const root = await workspaceFixture(t, fixture.yaml);
    assert.deepEqual(await workspaceProblems(root), expected, fixture.name);
  }
});

test('rejects dangerouslyAllowAllBuilds even with the reviewed allowlist', async (t) => {
  const root = await workspaceFixture(
    t,
    'packages:\n  - packages/*\nallowBuilds:\n  esbuild: true\ndangerouslyAllowAllBuilds: true\n',
  );

  assert.deepEqual(await workspaceProblems(root), [
    'pnpm-workspace.yaml must not enable dangerouslyAllowAllBuilds',
  ]);
});
