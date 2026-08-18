import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const run = promisify(execFile);

/**
 * Points git at the tracked hooks directory. Using `core.hooksPath` rather
 * than a hook manager keeps the dependency count at zero and keeps the hooks
 * themselves reviewable in the repository.
 *
 * Skipped in CI, where hooks never run and the git config is throwaway.
 */
async function installGitHooks() {
  if (process.env['CI']) {
    return;
  }

  try {
    await run('git', ['rev-parse', '--git-dir']);
  } catch {
    // Not a git checkout — an npm tarball, for example. Nothing to install.
    return;
  }

  await run('git', ['config', 'core.hooksPath', '.githooks']);
}

await installGitHooks();
