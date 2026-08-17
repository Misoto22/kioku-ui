# StyleX capability policy

This internal package verifies that authored core sources stay within the
StyleX syntax supported by the public build integrations. The supported subset
is deliberately small: use a static value namespace import, then call `create`,
`defineVars`, `keyframes`, or `props` directly through that import. Default,
named, type-only, dynamic, import-equals, side-effect, import-type, CommonJS
`require`, and re-export forms are outside the contract.

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
const holder = {sx}; // shorthand aggregation
function capture(value = sx) {} // capture or default parameter
return sx; // return/export flow
export {sx}; // local namespace export
sx[method]({}); // dynamic property
sx.create.call(null, {}); // indirect invocation
new sx.create({}); // constructor invocation
sx.create`...`; // tagged invocation
sx.firstThatWorks('red', 'blue'); // unsupported capability
sx['firstThatWorks']('red', 'blue');
```

Module forms other than the static value namespace import are also rejected at
their own source location:

```ts
import stylex from '@stylexjs/stylex';
import {create} from '@stylexjs/stylex';
import type * as stylexTypes from '@stylexjs/stylex';
import legacy = require('@stylexjs/stylex');

await import('@stylexjs/stylex');
await import('@stylexjs/stylex' as string);
await import('@stylexjs/stylex' satisfies string);
type Styles = import('@stylexjs/stylex').StyleXStyles;
const required = require('@stylexjs/stylex');

import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const createdRequire = require('@stylexjs/stylex');

export * as stylex from '@stylexjs/stylex';
export {create as makeStyles} from '@stylexjs/stylex';
```

Parentheses and TypeScript expression wrappers do not hide a static StyleX
module specifier. Genuinely dynamic specifiers and loads of unrelated modules
are not classified as StyleX module acquisitions.

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

Within `create`, only the interaction and structural selector spellings used by
the public core recipes are supported:

```text
:disabled
:active:not(:disabled)
:hover:not(:disabled)
:hover:not(:disabled):not(:active)
::before
::placeholder
:active:not(:disabled):not(:read-only):not(:focus-visible)
:hover:not(:disabled):not(:read-only):not(:focus-visible)
:active
:focus-within
:focus-within:not(:active)
:hover
:hover:not(:active)
:not(:last-child)
:focus-visible
```

The only authored at-rule spelling is
`@media (prefers-reduced-motion: reduce)`. Arbitrary global selectors, unknown
or dynamic style keys, selector near-misses, and all other at-rules remain
rejected. Similar keys on unrelated local objects are ignored.
