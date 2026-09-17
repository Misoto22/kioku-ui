# Release operations

Kioku UI releases are cut by release-please and published from
`.github/workflows/release.yml`. The repository contains the policy and the
verification commands; GitHub and npm settings are external prerequisites and
must be configured by a release authority before publishing.

## One version for three packages

`release-please-config.json` declares a single release path — the repository
root — with `include-component-in-tag: false`, so every release is one tag
`vX.Y.Z` and one GitHub Release. `extra-files` rewrites the `version` field of
`packages/core/package.json`, `packages/build/package.json`, and
`packages/themes/kioku/package.json`, so the three published packages always
carry the same number.

The shared line starts at `1.0.0`, the highest version already on npm (the
theme's). Core therefore skips from `0.2.0` and build from `0.1.0`: npm's
`latest` tag can only move forward, and no package may be republished below a
version it has already served.

`.release-please-manifest.json` is the bot's record of the last released
version. Do not hand-edit a package version; release-please owns all four
numbers.

## Release authority

A release authority is a maintainer who has write access to the `@misoto22`
npm scope, can merge the release pull request, and is a required reviewer for
the GitHub `npm` environment. Only a release authority may perform the initial
package bootstrap, approve a publish job, change dist-tags, or deprecate a
release.

Contributors do not record releases by hand. The pull-request title is the
release input: this repository squash-merges, so that title becomes the commit
subject on `main`, and release-please reads those subjects. `feat:` bumps the
minor, `fix:` and `perf:` the patch, and a `!` or a `BREAKING CHANGE:` footer
the major. `chore:`, `test:`, `ci:`, `build:` and `style:` release nothing.

The `pr-title / pr-title` required check validates that title against the fleet
Conventional Commit vocabulary before the pull request can merge. It runs on
`pull_request_target`, reads only the title through the API, and checks out no
pull-request code.

## How a release runs

1. A pull request merges to `main`.
2. `release.yml` calls the fleet reusable workflow, which mints a
   `misoto22-release-bot` App token and runs release-please. The bot opens or
   updates one release pull request titled `chore(main): release X.Y.Z`,
   carrying the root `CHANGELOG.md`, the manifest, and the three package
   versions.
3. All ordinary CI gates run on that release pull request.
4. A release authority merges it. release-please creates tag `vX.Y.Z` and the
   GitHub Release, and the reusable workflow verifies that the tag really
   exists before reporting success.
5. The `publish` job runs in the same workflow file, gated on
   `needs.release.outputs.release_created`. It waits for the `npm`
   environment's required reviewer, runs `pnpm release:verify`, and then
   `pnpm -r publish --access public --no-git-checks`.

The App token matters: anything created with the default `GITHUB_TOKEN` raises
no further workflow events, so a release created that way would never start a
publish.

The workflow is not triggered by pull requests and does not store or read an
`NPM_TOKEN`.

## External setup

Configure these controls outside the repository. Do not mark this checklist
complete based only on the files in this repository.

### GitHub

1. Keep `Misoto22/kioku-ui` public so public npm packages can receive provenance.
2. Protect `main`: require pull requests and the exact status checks `check`,
   `build`, `accessibility`, `consumers`, and `pr-title / pr-title`; block force
   pushes and branch deletion.
3. Create an environment named `npm`. Restrict deployments to `main` and add
   the release authority as a required reviewer.
4. Set the repository variable `APP_CLIENT_ID` and the secret
   `APP_PRIVATE_KEY` to the `misoto22-release-bot` GitHub App's client ID and
   private key. The App must be installed on this repository with permission to
   write contents and pull requests.

### npm scope and first package records

Confirm that the release authority controls the `@misoto22` user or
organization scope and that these public names are available:

- `@misoto22/kioku-ui`
- `@misoto22/kioku-ui-build`
- `@misoto22/kioku-ui-theme-kioku`

npm requires a package to exist before a trusted publisher can be attached.
For each brand-new name, the release authority therefore performs one
interactive, 2FA-protected bootstrap publish of version `0.0.0` under a
non-default `bootstrap` tag. Run `pnpm release:verify`, create the tarballs with
the same package filters used by the smoke test, inspect them, and publish those
exact tarballs with:

```sh
mkdir -p /absolute/path/to/inspected-tarballs
pnpm --filter @misoto22/kioku-ui pack --pack-destination /absolute/path/to/inspected-tarballs
pnpm --filter @misoto22/kioku-ui-build pack --pack-destination /absolute/path/to/inspected-tarballs
pnpm --filter @misoto22/kioku-ui-theme-kioku pack --pack-destination /absolute/path/to/inspected-tarballs
npm publish /absolute/path/to/inspected-tarballs/misoto22-kioku-ui-0.0.0.tgz --access public --tag bootstrap
```

Repeat the final command for the inspected build and theme tarballs.

This is a one-time registry bootstrap from a trusted workstation. Use npm web
login and 2FA; do not create an automation token or save an npm credential in
GitHub. Stop if any name already exists under unexpected ownership.

For each package, configure the same trusted publisher in npm package settings:

- provider: GitHub Actions
- owner: `Misoto22`
- repository: `kioku-ui`
- workflow filename: `release.yml`
- environment: `npm`
- allowed action: `npm publish`

The equivalent `npm trust github` command requires npm 11.15 or newer and an
interactive 2FA session:

```sh
npm trust github @misoto22/kioku-ui --repo Misoto22/kioku-ui --file release.yml --environment npm --allow-publish
```

Repeat it for the build and theme packages. Then set each package's publishing
access to require 2FA and disallow tokens. Trusted publishing uses short-lived
OIDC credentials and continues to work without a saved npm token. The workflow
uses a GitHub-hosted runner with `id-token: write`; npm generates provenance for
public packages automatically, and the workflow keeps provenance explicitly
enabled.

Both halves of that identity are bound to file names. Renaming
`.github/workflows/release.yml`, moving the publish step into another workflow,
or dropping `environment: npm` revokes the trusted publisher, and the publish
fails with no token to fall back on. `pnpm pack:smoke` asserts that topology.

## Dry run

From a clean checkout of the candidate commit:

```sh
pnpm install --frozen-lockfile
pnpm release:verify
```

`release:verify` builds fresh tarballs for every public package, inspects their
export maps and contents, and installs those tarballs into standalone compiled
and source-authoring Vite consumers. It also runs repository checks, tests,
accessibility, builds, export verification, and all four reference builds. It
does not publish or contact npm for a write.

Review the open release pull request after the dry run. The version, the
changelog entries, and the three package manifests must all be explicit before
merge.

The theme's core peer range is `workspace:>=0.2.0`, which pnpm publishes as
`>=0.2.0`. A shared major bump stays inside it. Do not widen the range to
silence a compatibility question; confirm runtime compatibility first.

## Stable release

1. Confirm every releasable change on `main` merged with a Conventional Commit
   subject that says what it should bump.
2. Wait for the release pull request and every CI gate on it to pass.
3. Review the version, changelogs, package manifests, and tarball evidence.
4. Merge the release pull request through protected `main`.
5. Approve the `npm` environment deployment only for that expected commit.
6. Verify all three npm records, dist-tags, the Git tag, the GitHub Release, and
   npm provenance after the workflow completes.

## Rollback and immutable versions

An npm package name and version is immutable and must never be overwritten or
reused, even after unpublishing. Do not delete a release to make room for
replacement bytes.

For a bad release, the release authority should:

1. Deprecate every affected package version with a useful replacement message:

   ```sh
   npm deprecate '@misoto22/kioku-ui@1.0.1' 'Deprecated: use 1.0.2 or later.'
   ```

2. Merge a corrective `fix:` change and publish the next patch through the
   normal protected workflow.
3. If immediate consumer protection is required, move `latest` back to a known
   good immutable version with `npm dist-tag add`, then move it forward only
   after the corrective release is verified.
4. Deprecate the whole release set. The three packages share a version, so a
   bad `1.2.0` is bad for all three.

If trusted publishing, branch protection, the GitHub environment, package
ownership, or release authority cannot be verified, stop before approving the
publish job.
