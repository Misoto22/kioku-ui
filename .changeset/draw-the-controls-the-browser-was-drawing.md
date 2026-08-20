---
'@misoto22/kioku-ui': minor
'@misoto22/kioku-ui-theme-kioku': patch
---

Take back the five controls the browser was drawing, and add `DatePicker`.

`CheckboxInput` contributed one declaration — `accent-color` — and the engine
supplied the white fill, the `#767676` edge, the radius, the check glyph and
every disabled grey. `NumberInput` grew Chrome's grey arrows in the corner of a
well this system had drawn to the hairline. `PowerSearch` carried WebKit's
cancel cross one line above filters it drew itself. The temporal inputs set
their separators at the weight of the data, showed an empty control in the same
ink as an answered one, and opened a blue calendar glyph.

All five draw their own now. Anything growing inside a well — a stepper, a
calendar control, a clear — is a cell in that well parted by the same hairline
that parts everything else here, never a button floating on top of it.

The fields stay native: `type="date"` hands a page arrow-key editing per field,
the platform wheel on a phone, the reader's own regional order and the whole
accessibility tree, and replacing the input means paying for all four in code.
What no engine gives is a picker that knows where the other end of a range is,
so **`DatePicker`** puts `Calendar` inside `Popover`, and `DateRangeInput` uses
two of them with each bound passed to the other as `min` and `max`.

`elevationHigh` loses its blur in the three flat skins — its five consumers are
all scrimmed modals, so the blur was doing no work — and `SegmentedControl`
marks its current option with an ink rail rather than a raised fill that
measured 1.03:1 against its own groove in every dark skin.

Also repaired: `Indicator`'s dot was 2px of colour inside a 2px ring; `Token`
painted itself the colour of the well it sits in; `Table`'s header rule was
gated on the switch that rules its body; `Layout`'s hanging numeral pushed the
title 44px right instead of hanging left; `NavIcon` promised a fixed square and
sized it from the type; `CheckboxInput` kept the UA's margins, so its declared
6px gap was 9px; four list components inherited a legend a fieldset's `gap`
never reaches; `AsyncState` had no styles at all; `ResizeHandle` offered a 6px
grab area and lost its highlight on the first pixel of every drag; `Spinner`
drove an endless rotation with an ease-out curve; and `FieldStatus` and `Field`
drew one message two colours.
