# StyleX capability policy

This internal package verifies that authored core sources stay within the
StyleX syntax supported by the public build integrations. The supported subset
is deliberately small: import the StyleX namespace and call `create`,
`defineVars`, `keyframes`, or `props` directly through that import.

The namespace import can use any local name, and a statically named computed
member is equivalent to dot syntax:

```ts
import * as sx from '@stylexjs/stylex';

const styles = sx.create({root: {color: 'rebeccapurple'}});
const props = sx['props'](styles.root);
```

Direct calls remain valid inside functions, class methods, and accessors. The
resolver uses lexical binding identity, so a parameter or local variable that
shadows `sx` is an unrelated local and is not subject to this policy.

The following forms are rejected where the imported namespace or member first
escapes the direct-use subset:

```ts
const alias = sx; // namespace alias
const create = sx.create; // member alias
const {props} = sx; // destructuring
const aggregate = [sx]; // object/array/spread aggregation
function capture(value = sx) {} // capture or default parameter
return sx; // return/export flow
sx[method]({}); // dynamic property
sx.create.call(null, {}); // indirect invocation
new sx.create({}); // constructor invocation
sx.create`...`; // tagged invocation
sx.firstThatWorks('red', 'blue'); // unsupported capability
sx['firstThatWorks']('red', 'blue');
```

These restrictions make policy failures deterministic without attempting to
simulate JavaScript execution order, closure timing, loop completion, or path
merges. They also ensure a capability violation is reported at its source
instead of at a later call through an alias.

Rewrite aliases and captures as direct calls on the namespace import:

```ts
// Rejected
const applyStyles = sx.props;
const namespace = sx;
applyStyles(namespace.create({root: {color: 'red'}}).root);

// Supported
const styles = sx.create({root: {color: 'red'}});
sx.props(styles.root);
```

Within `create`, `:focus-visible` is the supported pseudo-class selector.
Arbitrary global selectors, other pseudo-class selectors, and authored
at-rules are rejected. Similar keys on unrelated local objects are ignored.
