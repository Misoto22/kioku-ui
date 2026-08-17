# Release operations

Kioku UI releases are prepared with Changesets and published from
`.github/workflows/release.yml`. The repository contains the policy and the
verification commands; GitHub and npm settings are external prerequisites and
must be configured by a release authority before publishing.

## Release authority

A release authority is a maintainer who has write access to the `@misoto22`
npm scope, can merge the Changesets release PR, and is a required reviewer for
the GitHub `npm` environment. Only a release authority may perform the initial
package bootstrap, approve a publish job, start or end a canary series, change
dist-tags, or deprecate a release.

Repository contributors add a Changeset for every user-visible package change:

```sh
pnpm changeset
```

CI and review must pass before the change reaches protected `main`. A push to
`main` updates the Changesets release PR. Merging that reviewed release PR
causes the next protected-main run to publish the approved versions. The
workflow is not triggered by pull requests and does not store or read an
`NPM_TOKEN`.

The independent `Changeset Policy / changeset-policy` required check is the
authoritative pull-request gate. Its `pull_request_target` workflow and policy
script come from the default branch, use read-only repository and pull-request
permissions, and compare the PR's file list through the GitHub API. It checks
for public-package changes and an added `.changeset/*.md` without checking out
or executing pull-request code. An incomplete GitHub file comparison fails
closed.

Ordinary PR CI also fetches full history and runs Changesets status against
`origin/${base_ref}` as defense in depth. The only exception in both checks is
the same-repository `changeset-release/main` pull request authored by
`github-actions[bot]`: that PR has already consumed the pending Changeset files
into versions and changelogs, so repeating the pending-file check would be
self-contradictory. Bot identity, source repository, and exact branch name must
all match. All other CI gates still run on that release PR. `release:verify`
deliberately remains a generic artifact and quality command so operators can
run it after Changesets have been consumed.

## External setup

Configure these controls outside the repository before the first stable
release. Do not mark this checklist complete based only on the files in this
repository.

### GitHub

1. Keep `Misoto22/kioku-ui` public so public npm packages can receive provenance.
2. Protect `main`: require pull requests, approvals, and both exact status
   checks `CI / check` and `Changeset Policy / changeset-policy`; block force
   pushes and branch deletion. Requiring the independent default-branch policy
   check prevents a PR from bypassing the Changeset rule by editing `ci.yml`.
3. Create an environment named `npm`. Restrict deployments to `main` and add
   the release authority as a required reviewer.
4. Allow GitHub Actions to create pull requests so Changesets can maintain its
   release PR. The workflow's generated `GITHUB_TOKEN` is ephemeral; do not add
   a personal token for npm publishing.

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

## Dry run

From a clean checkout of the candidate commit:

```sh
pnpm install --frozen-lockfile
pnpm changeset status
pnpm release:verify
```

`release:verify` builds fresh tarballs for every public package, inspects their
export maps and contents, and installs those tarballs into standalone compiled
and source-authoring Vite consumers. It also runs repository checks, tests,
accessibility, builds, export verification, and all four reference builds. It
does not publish or contact npm for a write.

Review the pending Changesets release PR after the dry run. Package versions,
dependency ranges, changelogs, and the intended stable or canary channel must
all be explicit before merge.

For the initial release, core, build, and the Kioku theme are all classified as
minor releases from `0.0.0` to `0.1.0`. The theme's core peer range is
`>=0.0.0 <0.2.0`, so Changesets updates peer dependents only when a planned core
version leaves that reviewed compatibility range. Do not widen the range to
silence a release-plan bump; confirm runtime compatibility first.

## Canary release

Canaries use Changesets pre mode and the `canary` npm tag. A release authority
creates a dedicated PR from current `main`, enters pre mode, versions the
existing Changesets, and runs the full dry run:

```sh
pnpm changeset pre enter canary
pnpm changeset version
pnpm release:verify
```

Commit the generated `.changeset/pre.json`, versions, dependency ranges, and
changelogs in that PR. After protected review and merge, the same OIDC workflow
publishes the prerelease versions under `canary`, not `latest`. End the series
through another reviewed PR with `pnpm changeset pre exit` followed by
`pnpm changeset version`; never edit a published version in place.

## Stable release

1. Confirm every releasable change on `main` has a Changeset.
2. Wait for the Changesets release PR and `pnpm release:verify` to pass.
3. Review versions, changelogs, package dependency ranges, and tarball evidence.
4. Merge the release PR through protected `main`.
5. Approve the `npm` environment deployment only for that expected commit.
6. Verify all three npm records, dist-tags, Git tags, GitHub releases, and npm
   provenance after the workflow completes.

## Rollback and immutable versions

An npm package name and version is immutable and must never be overwritten or
reused, even after unpublishing. Do not delete a release to make room for
replacement bytes.

For a bad release, the release authority should:

1. Deprecate every affected package version with a useful replacement message:

   ```sh
   npm deprecate '@misoto22/kioku-ui@0.1.0' 'Deprecated: use 0.1.1 or later.'
   ```

2. Add a corrective Changeset and publish a new patch through the normal
   protected workflow.
3. If immediate consumer protection is required, move `latest` back to a known
   good immutable version with `npm dist-tag add`, then move it forward only
   after the corrective release is verified.
4. Record which core, theme, and build versions are mutually compatible; do not
   deprecate only one member of an affected release set.

If trusted publishing, branch protection, the GitHub environment, package
ownership, or release authority cannot be verified, stop before approving the
publish job.
