---
'@misoto22/kioku-ui-theme-kioku': patch
---

Contain the frosted skin's blur inside its own root, and give Chinese its own
leading.

`[data-theme='kasumi']::before` carries the frost as `position: absolute;
inset: 0`, and the root it belongs to set `isolation: isolate` but no
containing block. Isolation governs paint order, not geometry — so the frost
resolved its inset against whatever positioned ancestor happened to be above
it, escaped the skin, and blurred everything up to that ancestor. A page
showing several skins at once stacked one `saturate(180%)` per swatch until the
whole document went yellow. The root is `position: relative` now, which is safe
where `transform` and `filter` are not: it does not become the containing block
for a fixed descendant.

The `:lang(zh)` block also sets `--kioku-theme-line-height-body: 1.8`. Leading
is a property of the writing system, like the font stack that already lives
there: CJK glyphs are dense and square and need more room between lines than
Latin does.
