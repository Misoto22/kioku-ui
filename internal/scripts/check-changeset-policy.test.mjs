import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {test} from 'node:test';
import {promisify} from 'node:util';

const policy = await import('./check-changeset-policy.mjs').catch(() => ({}));
const run = promisify(execFile);

test('requires an added Changeset when an ordinary PR changes a public package', () => {
  const problems =
    policy.changesetPolicyProblems?.({
      files: [
        {
          filename: 'packages/core/src/components/Button.tsx',
          status: 'modified',
        },
      ],
      pullRequest: {
        head: {
          ref: 'feature/button',
          repo: {full_name: 'Misoto22/kioku-ui'},
        },
        user: {login: 'contributor'},
      },
      repository: 'Misoto22/kioku-ui',
    }) ?? [];

  assert.deepEqual(problems, [
    'Public package changes require an added .changeset/*.md file',
  ]);
});

test('exempts only the trusted same-repository Changesets release PR', () => {
  const files = [{filename: 'packages/core/package.json', status: 'modified'}];
  const trustedPullRequest = {
    head: {
      ref: 'changeset-release/main',
      repo: {full_name: 'Misoto22/kioku-ui'},
    },
    user: {login: 'github-actions[bot]'},
  };
  const expectedProblem = [
    'Public package changes require an added .changeset/*.md file',
  ];

  assert.deepEqual(
    policy.changesetPolicyProblems({
      files,
      pullRequest: trustedPullRequest,
      repository: 'Misoto22/kioku-ui',
    }),
    [],
  );
  assert.deepEqual(
    policy.changesetPolicyProblems({
      files,
      pullRequest: {
        ...trustedPullRequest,
        user: {login: 'maintainer'},
      },
      repository: 'Misoto22/kioku-ui',
    }),
    expectedProblem,
  );
  assert.deepEqual(
    policy.changesetPolicyProblems({
      files,
      pullRequest: {
        ...trustedPullRequest,
        head: {...trustedPullRequest.head, ref: 'release-lookalike'},
      },
      repository: 'Misoto22/kioku-ui',
    }),
    expectedProblem,
  );
  assert.deepEqual(
    policy.changesetPolicyProblems({
      files,
      pullRequest: {
        ...trustedPullRequest,
        head: {
          ...trustedPullRequest.head,
          repo: {full_name: 'fork/kioku-ui'},
        },
      },
      repository: 'Misoto22/kioku-ui',
    }),
    expectedProblem,
  );
});

test('requires a Changeset for a newly added package manifest', () => {
  assert.deepEqual(
    policy.changesetPolicyProblems({
      files: [
        {filename: 'packages/new-public-package/package.json', status: 'added'},
      ],
      pullRequest: {
        head: {
          ref: 'feature/new-package',
          repo: {full_name: 'Misoto22/kioku-ui'},
        },
        user: {login: 'contributor'},
      },
      repository: 'Misoto22/kioku-ui',
    }),
    ['Public package changes require an added .changeset/*.md file'],
  );
});

test('requires a Changeset when a public package file is renamed away', () => {
  assert.deepEqual(
    policy.changesetPolicyProblems({
      files: [
        {
          filename: 'archive/Button.tsx',
          previous_filename: 'packages/core/src/components/Button.tsx',
          status: 'renamed',
        },
      ],
      pullRequest: {
        head: {
          ref: 'feature/move-component',
          repo: {full_name: 'Misoto22/kioku-ui'},
        },
        user: {login: 'contributor'},
      },
      repository: 'Misoto22/kioku-ui',
    }),
    ['Public package changes require an added .changeset/*.md file'],
  );
});

test('reads the complete pull request file comparison through the GitHub API', async () => {
  const requests = [];
  const firstPage = Array.from({length: 100}, (_, index) => ({
    filename: `packages/core/src/file-${index}.ts`,
    status: 'modified',
  }));
  const finalFile = {
    filename: '.changeset/public-change.md',
    status: 'added',
  };
  const fetchImpl = async (url, options) => {
    requests.push({url, options});
    return {
      ok: true,
      status: 200,
      async json() {
        return url.endsWith('page=1') ? firstPage : [finalFile];
      },
    };
  };

  const files = policy.listPullRequestFiles
    ? await policy.listPullRequestFiles({
        fetchImpl,
        pullNumber: 42,
        repository: 'Misoto22/kioku-ui',
        token: 'test-token',
      })
    : [];

  assert.deepEqual(
    requests.map(({url}) => url),
    [
      'https://api.github.com/repos/Misoto22/kioku-ui/pulls/42/files?per_page=100&page=1',
      'https://api.github.com/repos/Misoto22/kioku-ui/pulls/42/files?per_page=100&page=2',
    ],
  );
  assert.deepEqual(requests[0].options, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer test-token',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  assert.equal(files.length, 101);
  assert.deepEqual(files.at(-1), finalFile);
});

test('fails closed when GitHub does not return the complete file comparison', () => {
  assert.deepEqual(
    policy.changesetPolicyProblems({
      files: [{filename: 'README.md', status: 'modified'}],
      pullRequest: {
        changed_files: 2,
        head: {
          ref: 'feature/large-change',
          repo: {full_name: 'Misoto22/kioku-ui'},
        },
        user: {login: 'contributor'},
      },
      repository: 'Misoto22/kioku-ui',
    }),
    ['GitHub returned an incomplete pull request file comparison'],
  );
});

test('the policy script entry point refuses to run without a GitHub event', async () => {
  await assert.rejects(
    run(process.execPath, ['internal/scripts/check-changeset-policy.mjs'], {
      env: {},
    }),
    /GITHUB_EVENT_PATH is required/,
  );
});
