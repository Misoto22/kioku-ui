---
'@misoto22/kioku-ui': patch
---

Let `Tokenizer` read the whole field contract, not two lines of it.

It took `controlId` and `describedBy` from the surrounding `Field` and stopped
there, so a field marked required or invalid printed its message underneath a
control that showed nothing: no `aria-invalid`, no `required`, and a frame that
stayed at the resting edge. It also had exactly two style rules to its name,
`frame` and `input`, which is why there was no invalid edge to show.

It now reads `invalid` and `required` as every other well does, merges a
caller's `aria-describedby` with the field's own rather than dropping one, and
wears the danger edge when it is wrong.

One behaviour changes with it: an `id` passed to `Tokenizer` now reaches the
input, where a `<label for>` can find it, instead of landing on the wrapper.
That is what `TextInput`, `NumberInput` and the temporal inputs already do.
