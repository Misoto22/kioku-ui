# StyleX capability policy

This internal package verifies that authored core sources stay within the
StyleX syntax supported by the public build integrations. It accepts namespace
calls to `create`, `defineVars`, `keyframes`, and `props`; other StyleX imports,
calls, selectors, and at-rules are rejected.

The analyzer tracks lexical binding identity and conservatively joins branch
and loop paths, including abrupt `break`, `continue`, `return`, and `throw`
completions. Direct local function calls apply captured-binding effects at the
call site; function definitions are inspected without applying dormant effects.
Statically known array aggregates retain element flow through destructuring. If
a binding or computed member may refer to StyleX on any reachable path but
cannot be resolved to one supported capability, the source is rejected with an
`ambiguous StyleX flow` diagnostic. Static string-literal computed properties
resolve normally. Dynamic computed keys and destructuring keys are evaluated
for their own effects and remain ambiguous when their source may be StyleX.
Unrelated local bindings that shadow a StyleX import remain local and are not
flagged.
