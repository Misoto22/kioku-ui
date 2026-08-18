---
'@misoto22/kioku-ui': minor
'@misoto22/kioku-ui-theme-kioku': minor
---

Add `typography.fontFeatureSettings`, so a theme asks for the OpenType features
the type it selects is cut for rather than leaving them to a rule in the reset.
The Kioku skins ask for `'palt' 1`, the proportional spacing their Japanese
faces expect; a theme set in Latin type says `normal`.

It applies at the theme root and on `globalStyles.document`, so a host putting
that on `<body>` gets the same result.
