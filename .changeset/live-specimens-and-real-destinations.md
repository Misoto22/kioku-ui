---
'@misoto22/kioku-ui': patch
---

Fix a data URI that painted every placeholder image black.

The inline SVG shared by `Avatar`, `Thumbnail` and `Lightbox` escaped its `#`
before handing the markup to `encodeURIComponent`, so the fill arrived as
`%2523…`, which is not a colour. The media rendered as a black rectangle in
every theme.
