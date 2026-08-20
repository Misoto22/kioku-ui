---
'@misoto22/kioku-ui': patch
---

Stop the row under a moving cursor from reflowing.

`Typeahead`, `TypeaheadItem`, `TreeList`, `Outline` and `CommandPalette` all
added `fontWeightMedium` to the active or selected row. Their labels are
proportional type, so a heavier row is a **wider** row: every arrow-key press
reflowed the line the cursor had just landed on. `NavItem` settled the same
question the same way — ink alone is enough to find, and it leaves the column
still.

Weight remains a legal mark elsewhere (design-language §5 lists it as one of
three). It is this case that it fails: a moving cursor over proportional text.
Three other sites keep theirs, and the reasons are written down — `Calendar`
and `Pagination` set their figures in mono with tabular numerals and a fixed
cell, where weight cannot reflow anything, and `Breadcrumbs` marks a terminal
crumb nobody arrows through.

`CommandPalette`'s active row already carried a wash, full-strength ink and a
2px accent bar; the weight was a fourth mark on top of three.

`Outline` tiles its entries a hairline apart, the way `SideNav` and `NavMenu`
do. At a full spacing step the rules beside each entry stopped being a
continuous edge and became a dashed one.
