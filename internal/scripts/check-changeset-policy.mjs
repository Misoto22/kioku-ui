import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const publicPackageDirectories = [
  'packages/core/',
  'packages/build/',
  'packages/themes/kioku/',
];

function isPublicPackagePath(filename) {
  return publicPackageDirectories.some((directory) =>
    filename?.startsWith(directory),
  );
}

export async function listPullRequestFiles({
  fetchImpl = fetch,
  pullNumber,
  repository,
  token,
}) {
  const [owner, repo] = repository.split('/');
  const files = [];

  for (let page = 1; ; page += 1) {
    const url =
      `https://api.github.com/repos/${encodeURIComponent(owner)}/` +
      `${encodeURIComponent(repo)}/pulls/${pullNumber}/files` +
      `?per_page=100&page=${page}`;
    const response = await fetchImpl(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      throw new Error(
        `GitHub pull request files request failed with ${response.status}`,
      );
    }

    const pageFiles = await response.json();
    if (!Array.isArray(pageFiles)) {
      throw new Error('GitHub pull request files response must be an array');
    }
    files.push(...pageFiles);

    if (pageFiles.length < 100) {
      return files;
    }
  }
}

export function changesetPolicyProblems({files, pullRequest, repository}) {
  const trustedReleasePullRequest =
    pullRequest.user?.login === 'github-actions[bot]' &&
    pullRequest.head?.repo?.full_name === repository &&
    pullRequest.head?.ref === 'changeset-release/main';

  if (trustedReleasePullRequest) {
    return [];
  }
  if (
    Number.isInteger(pullRequest.changed_files) &&
    pullRequest.changed_files !== files.length
  ) {
    return ['GitHub returned an incomplete pull request file comparison'];
  }

  const changesPublicPackage = files.some(
    ({filename, previous_filename: previousFilename, status}) =>
      isPublicPackagePath(filename) ||
      isPublicPackagePath(previousFilename) ||
      (status === 'added' &&
        /^packages\/(?:[^/]+|themes\/[^/]+)\/package\.json$/.test(filename)),
  );
  const addsChangeset = files.some(
    ({filename, status}) =>
      status === 'added' &&
      /^\.changeset\/(?!README\.md$)[^/]+\.md$/.test(filename),
  );

  return changesPublicPackage && !addsChangeset
    ? ['Public package changes require an added .changeset/*.md file']
    : [];
}

async function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;

  if (!eventPath) {
    throw new Error('GITHUB_EVENT_PATH is required');
  }
  if (!repository) {
    throw new Error('GITHUB_REPOSITORY is required');
  }
  if (!token) {
    throw new Error('GITHUB_TOKEN is required');
  }

  const event = JSON.parse(await readFile(eventPath, 'utf8'));
  const pullRequest = event.pull_request;
  if (!pullRequest?.number) {
    throw new Error('pull_request event payload is required');
  }
  const files = await listPullRequestFiles({
    pullNumber: pullRequest.number,
    repository,
    token,
  });
  const problems = changesetPolicyProblems({files, pullRequest, repository});

  if (problems.length > 0) {
    throw new Error(problems.join('\n'));
  }

  console.log('Changeset policy passed.');
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
