import assert from 'node:assert/strict';
import {test} from 'node:test';
import {workspaceProblems} from './check-workspace.mjs';

test('accepts the required Astryx-aligned top-level directories', async () => {
  assert.deepEqual(await workspaceProblems(process.cwd()), []);
});
