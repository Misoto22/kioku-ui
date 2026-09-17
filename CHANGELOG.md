# Changelog

## 1.0.0

Releases are cut by release-please from the Conventional Commit subjects on
`main`, and from `1.0.x` onwards `@misoto22/kioku-ui`, `@misoto22/kioku-ui-build`
and `@misoto22/kioku-ui-theme-kioku` all carry the same version, tagged once as
`vX.Y.Z`. The shared line starts at the highest version already published, which
is the theme's `1.0.0`, so core skips from `0.2.0` and build from `0.1.0` to
keep npm's `latest` moving forward for every package. Nothing was released at
`1.0.0` under the shared line; it is only where the count resumes, and each
package's own `CHANGELOG.md` holds the frozen Changesets history from before
it.
