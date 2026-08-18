---
'@misoto22/kioku-ui': minor
'@misoto22/kioku-ui-theme-kioku': patch
---

Add six letter-spacing tokens to the type contract.

Tracking is not decoration in this system: the console it comes from opens
small type up and closes mono in, and the amount is a function of the role,
not of the component. A theme had no way to say that, so every component was
setting type at whatever tracking the font shipped with — which for Mincho at
11px is a smudge.

`letterSpacingTitle` (page titles and figures), `letterSpacingHeading`
(section titles), `letterSpacingBody` (running copy, set solid),
`letterSpacingLabel` (control labels and display names), `letterSpacingEyebrow`
(table headers, eyebrows, captions) and `letterSpacingMono` (the one role that
tightens). Themes now fulfil 78 roles rather than 72; a pack that does not
supply them is rejected as incomplete, so bump any custom pack alongside this.
