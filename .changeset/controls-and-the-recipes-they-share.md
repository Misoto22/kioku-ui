---
'@misoto22/kioku-ui': minor
---

Take back two more controls the browser was drawing, and stop two wells
clipping their own focus ring.

`RadioList` still contributed `accent-color` and took the white fill, the grey
edge and every disabled tone from the engine — the same defect `CheckboxInput`
carried, left behind when that one was fixed. `Selector` still wore whichever
arrow the platform draws, a blue chevron on one and a grey triangle on another,
in the corner of a field drawn to the hairline everywhere else. Both draw their
own now, and both stay real controls: the click target, the group behaviour,
the arrow keys, the form value and the accessibility tree are untouched.

`Tokenizer` and `PowerSearch` drew their focus ring on the field inside the
well. The ring stands 4px out — 2px of offset plus 2px of stroke — and the well
spends 3px of padding, so the well clipped a quarter of its own ring. It moves
to the well, on `:focus-within`, which is where the border already changed.
`Tokenizer` also stops being 34px tall when empty in a row of 28px controls: it
was spending a step of block padding inside a well that already spent one.

`Eyebrow` pins its weight. Left open it took the weight of whatever it was
dropped into, and every hand-rolled copy of the recipe pinned one — `Field` at
medium, `Table` and `MetadataList` at regular, disagreeing with each other. It
is regular: at 11px the tracking is what does the work, and weight on top of it
makes a second heading out of a quiet label.

`TextInput` and `TextArea` take the transition trio every other well declares,
so an edge that changes on hover or focus moves rather than snaps. `TextArea`
resizes vertically only — the UA default let a reader drag the field wider than
the column it sits in and take the form's layout with it.
