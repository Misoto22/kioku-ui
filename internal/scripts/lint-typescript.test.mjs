import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {promisify} from 'node:util';
import {test} from 'node:test';

const execFileAsync = promisify(execFile);

test('reports unused variables in TypeScript files', async () => {
  const directory = await mkdtemp(
    join(process.cwd(), 'internal/scripts/.lint-typescript-'),
  );
  const source = join(directory, 'unused.ts');

  try {
    await writeFile(source, "const unusedValue = 'lint coverage';\n");
    let stdout;

    try {
      ({stdout} = await execFileAsync(
        join(process.cwd(), 'node_modules/.bin/eslint'),
        [
          '--config',
          join(process.cwd(), 'eslint.config.js'),
          '--format',
          'json',
          source,
        ],
      ));
    } catch (error) {
      stdout = error.stdout;
    }

    const [result] = JSON.parse(stdout);

    assert.ok(
      result.messages.some(
        ({ruleId}) => ruleId === '@typescript-eslint/no-unused-vars',
      ),
    );
  } finally {
    await rm(directory, {force: true, recursive: true});
  }
});
