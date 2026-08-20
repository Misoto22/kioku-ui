---
'@misoto22/kioku-ui': minor
---

Repair the sixteen shoddy findings in `Chat` and `Table`.

**The bubble measured the wrong thing.** `calc(20 * spacing2xl)` is 560px at the
compact density and 760px at the standard one, while the type inside it stays
at 13.5px either way — so the reader who asked for more air got a _longer line_.
Where a line stops is a fact about the type, so the measure is now built from
`fontSizeMd` and holds at both densities.

**Two of `ChatToolCalls`' three statuses never reached the page.** The type says
`'done' | 'failed' | 'running'` and the file had one branch, on `running`; a
failed call looked exactly like a successful one. The dot was inside that branch
too, so running rows started 12px further in than their neighbours and the
register had a ragged edge. The mark slot is now always present — alignment
holds — and only the two statuses that want attention draw into it: a hollow
ring for running, a filled danger dot for failed. The outcome text no longer
prints the raw enum value, which put the English words "running" and "failed"
into a transcript in any language; three messages carry them now.

**`ChatComposer` held a private copy of `TextArea`** that had drifted a step of
padding, a min-height of one control rather than four lines, and none of the
active, read-only or invalid states. It uses the real one.

**`ChatSystemMessage` and `ChatMessage author="system"` were two renderings of
one note**, already drifted: the first had no bubble box, so a system note sat
on a different rhythm from every other row. The first delegates to the second.

**`ChatMessageMetadata` typed its separator into a text node** — `${label}: ` —
which no translation can move, and declared its own copies of the `Eyebrow` and
`Numeral` recipes. It is a `dl`/`dt`/`dd` now, set with those two components.

Also: `ChatLayout` fills the height it is given rather than needing a sized box
around it; an empty transcript says so; the reader's author eyebrow stands on
the same edge as the words beneath it; and the running dot is drawn with a
border rather than the only raw `box-shadow` string in the package that was
neither an elevation nor a selection mark.

**`Table`** takes the system's own leading — nothing above it set a
`line-height` to inherit, while `List` and `Item` beside it did — and its
numeric cells stop being a rank smaller than the words they sit with, matching
`Numeral`, which declares no size of its own. Its `selected` mark, implemented
and documented but never once demonstrated, now appears in the story.

Four new message keys — `chatToolCallDone`, `chatToolCallFailed`,
`chatToolCallRunning`, `chatTranscriptEmpty`. A host that supplies its own
`Messages` must add them; that is the contract working as designed.
