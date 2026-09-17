# Changelog

Releases are cut by release-please from the Conventional Commit subjects on
`main`, and from `1.0.x` onwards `@misoto22/kioku-ui`, `@misoto22/kioku-ui-build`
and `@misoto22/kioku-ui-theme-kioku` all carry the same version, tagged once as
`vX.Y.Z`. The shared line starts at the highest version already published, which
is the theme's `1.0.0`, so core skips from `0.2.0` and build from `0.1.0` to
keep npm's `latest` moving forward for every package. Each package's own
`CHANGELOG.md` is the frozen Changesets history from before that change.
