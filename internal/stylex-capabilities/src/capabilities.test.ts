import {describe, expect, it} from 'vitest';

import {
  isSupportedStylexCapability,
  stylexSourceProblems,
  workspaceStylexCapabilityProblems,
} from './capabilities.js';

describe('StyleX capability policy', () => {
  it('rejects an unsupported StyleX capability rather than silently compiling it', () => {
    expect(isSupportedStylexCapability('arbitrary-global-selector')).toBe(
      false,
    );
  });

  it('accepts the StyleX calls and selector forms in the public contract', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const spin = stylex.keyframes({to: {transform: 'rotate(360deg)'}});
const styles = stylex.create({
  root: {
    animationName: spin,
    ':focus-visible': {outlineStyle: 'solid'},
  },
});
export const props = stylex.props(styles.root);`,
        'supported.stylex.ts',
      ),
    ).toEqual([]);
  });

  it('rejects arbitrary global selectors in authored StyleX', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
export const styles = stylex.create({
  root: {':global(body .private)': {color: 'red'}},
});`,
        'unsupported.stylex.ts',
      ),
    ).toEqual([
      'unsupported.stylex.ts:3 uses unsupported StyleX capability: arbitrary-global-selector',
    ]);
  });

  it('rejects named imports that bypass the declared StyleX call syntax', () => {
    expect(
      stylexSourceProblems(
        `import {firstThatWorks} from '@stylexjs/stylex';
export const fallback = firstThatWorks('red', 'blue');`,
        'named-import.stylex.ts',
      ),
    ).toEqual([
      'named-import.stylex.ts:1 uses unsupported StyleX capability: named import firstThatWorks',
    ]);
  });

  it('rejects direct and renamed destructuring from the StyleX namespace', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
{
  const {firstThatWorks} = stylex;
  firstThatWorks('red', 'blue');
}
{
  const {firstThatWorks: chooseFallback} = stylex;
  chooseFallback('red', 'blue');
}`,
        'destructured.stylex.ts',
      ),
    ).toEqual([
      'destructured.stylex.ts:3 uses unsupported StyleX capability: destructured stylex.firstThatWorks',
      'destructured.stylex.ts:7 uses unsupported StyleX capability: destructured stylex.firstThatWorks as chooseFallback',
    ]);
  });

  it('rejects unsupported calls through namespace and method aliases', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const sx = stylex;
sx.firstThatWorks('red', 'blue');
const choose = stylex.firstThatWorks;
choose('red', 'blue');`,
        'aliased.stylex.ts',
      ),
    ).toEqual([
      'aliased.stylex.ts:3 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
      'aliased.stylex.ts:5 uses unsupported StyleX capability: stylex.firstThatWorks via choose',
    ]);
  });

  it('does not confuse shadowed or unrelated locals with StyleX aliases', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
function useLocal(stylex: {firstThatWorks: (...values: string[]) => string}) {
  return stylex.firstThatWorks('red', 'blue');
}
const sx = {firstThatWorks: (...values: string[]) => values[0]};
sx.firstThatWorks('red', 'blue');`,
        'shadowed.stylex.ts',
      ),
    ).toEqual([]);
  });

  it('rejects unsupported calls through assigned namespace and method aliases', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
let sx;
sx = stylex;
sx.firstThatWorks('red', 'blue');
let choose;
choose = sx.firstThatWorks;
choose('red', 'blue');`,
        'assigned.stylex.ts',
      ),
    ).toEqual([
      'assigned.stylex.ts:4 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
      'assigned.stylex.ts:7 uses unsupported StyleX capability: stylex.firstThatWorks via choose',
    ]);
  });

  it('keeps catch-parameter shadowing inside the catch scope', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
try {
  throw new Error('local');
} catch (stylex) {
  stylex.firstThatWorks('local', 'fallback');
}
stylex.firstThatWorks('red', 'blue');`,
        'catch-shadow.stylex.ts',
      ),
    ).toEqual([
      'catch-shadow.stylex.ts:7 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);
  });

  it('honors hoisted local function shadowing without hiding the imported namespace', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
function inspectLocal() {
  stylex.firstThatWorks('local', 'fallback');
  function stylex() {}
}
stylex.firstThatWorks('red', 'blue');`,
        'function-shadow.stylex.ts',
      ),
    ).toEqual([
      'function-shadow.stylex.ts:6 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);
  });

  it('resolves assignments against the nearest lexical binding identity', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
let sx;
{
  const stylex = {firstThatWorks: (...values: string[]) => values[0]};
  sx = stylex;
}
sx.firstThatWorks('local', 'fallback');
stylex.firstThatWorks('red', 'blue');`,
        'assigned-shadow.stylex.ts',
      ),
    ).toEqual([
      'assigned-shadow.stylex.ts:8 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);
  });

  it('isolates dormant function assignments from outer flow state', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
let dormantAlias;
function assignDormant() {
  dormantAlias = stylex;
  dormantAlias.firstThatWorks('inside', 'fallback');
}
dormantAlias.firstThatWorks('outside', 'fallback');
let preservedAlias = stylex;
function eraseDormant() {
  const local = {firstThatWorks: (...values: string[]) => values[0]};
  preservedAlias = local;
}
preservedAlias.firstThatWorks('red', 'blue');`,
        'function-flow.stylex.ts',
      ),
    ).toEqual([
      'function-flow.stylex.ts:13 uses unsupported StyleX capability: stylex.firstThatWorks via preservedAlias',
      'function-flow.stylex.ts:5 uses unsupported StyleX capability: stylex.firstThatWorks via dormantAlias',
    ]);
  });

  it('keeps loop shadows and loop-local aliases inside the loop scope', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const locals = [{firstThatWorks: (...values: string[]) => values[0]}];
for (const stylex of locals) {
  stylex.firstThatWorks('local', 'fallback');
}
stylex.firstThatWorks('red', 'blue');
for (let sx = stylex; false; ) {
  sx.firstThatWorks('inside', 'fallback');
}
sx.firstThatWorks('outside', 'fallback');`,
        'loop-scope.stylex.ts',
      ),
    ).toEqual([
      'loop-scope.stylex.ts:6 uses unsupported StyleX capability: stylex.firstThatWorks',
      'loop-scope.stylex.ts:8 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
    ]);
  });

  it('uses one lexical scope for unbraced switch cases without leaking it', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
switch (kind) {
  case 'local':
    const stylex = {firstThatWorks: (...values: string[]) => values[0]};
    stylex.firstThatWorks('local', 'fallback');
    break;
}
stylex.firstThatWorks('red', 'blue');
switch (kind) {
  case 'alias':
    const sx = stylex;
    sx.firstThatWorks('inside', 'fallback');
}
sx.firstThatWorks('outside', 'fallback');`,
        'switch-scope.stylex.ts',
      ),
    ).toEqual([
      'switch-scope.stylex.ts:12 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
      'switch-scope.stylex.ts:8 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);
  });

  it('joins independent switch paths without applying an earlier case mutation', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
let sx = stylex;
switch (kind) {
  case 'local': sx = local; break;
  case 'use': sx.firstThatWorks('red', 'blue'); break;
}
sx.firstThatWorks('after', 'fallback');`,
        'switch-flow.stylex.ts',
      ),
    ).toEqual([
      'switch-flow.stylex.ts:6 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
      'switch-flow.stylex.ts:8 uses unsupported StyleX capability: ambiguous StyleX flow via sx',
    ]);
  });

  it('normalizes parenthesized namespaces, members, and callees', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
let sx, choose;
sx = (stylex);
(sx).firstThatWorks('red', 'blue');
choose = (sx.firstThatWorks);
(choose)('red', 'blue');
((sx).firstThatWorks)('red', 'blue');`,
        'parenthesized.stylex.ts',
      ),
    ).toEqual([
      'parenthesized.stylex.ts:4 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
      'parenthesized.stylex.ts:6 uses unsupported StyleX capability: stylex.firstThatWorks via choose',
      'parenthesized.stylex.ts:7 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
    ]);
  });

  it('propagates direct and renamed destructuring assignments only from StyleX', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
let firstThatWorks, choose;
const local = {firstThatWorks: (...values: string[]) => values[0]};
({firstThatWorks: choose} = local);
choose('local', 'fallback');
({firstThatWorks} = (stylex));
({firstThatWorks: choose} = stylex);
firstThatWorks('red', 'blue');
choose('red', 'blue');`,
        'destructured-assignment.stylex.ts',
      ),
    ).toEqual([
      'destructured-assignment.stylex.ts:6 uses unsupported StyleX capability: destructured stylex.firstThatWorks',
      'destructured-assignment.stylex.ts:7 uses unsupported StyleX capability: destructured stylex.firstThatWorks as choose',
    ]);
  });

  it('joins shorthand destructuring defaults that may introduce a member alias', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
let choose;
({choose = stylex.firstThatWorks} = {});
choose('red', 'blue');`,
        'destructuring-default.stylex.ts',
      ),
    ).toEqual([
      'destructuring-default.stylex.ts:4 uses unsupported StyleX capability: ambiguous StyleX flow via choose',
    ]);
  });

  it('evaluates chained alias assignments right-to-left for every target', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
let sx, sy;
sx = sy = stylex;
sx.firstThatWorks('red', 'blue');
sy.firstThatWorks('red', 'blue');
const local = {firstThatWorks: (...values: string[]) => values[0]};
sx = sy = local;
sx.firstThatWorks('local', 'fallback');
sy.firstThatWorks('local', 'fallback');
stylex.firstThatWorks('red', 'blue');`,
        'chained-assignment.stylex.ts',
      ),
    ).toEqual([
      'chained-assignment.stylex.ts:10 uses unsupported StyleX capability: stylex.firstThatWorks',
      'chained-assignment.stylex.ts:4 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
      'chained-assignment.stylex.ts:5 uses unsupported StyleX capability: stylex.firstThatWorks via sy',
    ]);
  });

  it('joins logical assignment paths that may introduce or clear an alias', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
let sx;
sx ||= stylex;
sx.firstThatWorks('red', 'blue');
let sy = stylex;
sy &&= local;
sy.firstThatWorks('red', 'blue');`,
        'logical-assignment.stylex.ts',
      ),
    ).toEqual([
      'logical-assignment.stylex.ts:5 uses unsupported StyleX capability: ambiguous StyleX flow via sx',
      'logical-assignment.stylex.ts:8 uses unsupported StyleX capability: ambiguous StyleX flow via sy',
    ]);
  });

  it('retains StyleX aliases supplied by default parameters and nested captures', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
function use(sx = stylex) {
  sx.firstThatWorks('red', 'blue');
}
function outer(sx = stylex) {
  function nestedCapture() {
    sx.firstThatWorks('red', 'blue');
  }
}`,
        'default-parameter.stylex.ts',
      ),
    ).toEqual([
      'default-parameter.stylex.ts:3 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
      'default-parameter.stylex.ts:7 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
    ]);
  });

  it('keeps local defaults and parameter shadows unrelated to StyleX', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
function useLocal(sx = local) {
  sx.firstThatWorks('local', 'fallback');
}
function outer(stylex = local) {
  function nestedLocal() {
    stylex.firstThatWorks('local', 'fallback');
  }
}
stylex.firstThatWorks('red', 'blue');`,
        'default-parameter-shadow.stylex.ts',
      ),
    ).toEqual([
      'default-parameter-shadow.stylex.ts:11 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);
  });

  it('visits a for body with pre-increment alias state', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
let sx = stylex;
for (; ready; sx = local) {
  sx.firstThatWorks('first', 'fallback');
}
sx.firstThatWorks('after-update', 'fallback');
stylex.firstThatWorks('red', 'blue');`,
        'for-phase.stylex.ts',
      ),
    ).toEqual([
      'for-phase.stylex.ts:5 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
      'for-phase.stylex.ts:7 uses unsupported StyleX capability: ambiguous StyleX flow via sx',
      'for-phase.stylex.ts:8 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);
  });

  it('writes iteration values through identifier and binding-pattern targets', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
const rows = [];
let inAlias = stylex;
for (inAlias in local) {
  inAlias.firstThatWorks('local', 'fallback');
}
inAlias.firstThatWorks('after', 'fallback');
let ofAlias = stylex;
for ({item: ofAlias} of rows) {
  ofAlias.firstThatWorks('local', 'fallback');
}
ofAlias.firstThatWorks('after', 'fallback');
let choose = stylex.firstThatWorks;
for ([choose] of rows) {
  choose('local', 'fallback');
}
choose('after', 'fallback');
for (const loopAlias of rows) {
  loopAlias.firstThatWorks('local', 'fallback');
}
loopAlias.firstThatWorks('outside', 'fallback');
stylex.firstThatWorks('red', 'blue');`,
        'iteration-target.stylex.ts',
      ),
    ).toEqual([
      'iteration-target.stylex.ts:13 uses unsupported StyleX capability: ambiguous StyleX flow via ofAlias',
      'iteration-target.stylex.ts:18 uses unsupported StyleX capability: ambiguous StyleX flow via choose',
      'iteration-target.stylex.ts:23 uses unsupported StyleX capability: stylex.firstThatWorks',
      'iteration-target.stylex.ts:8 uses unsupported StyleX capability: ambiguous StyleX flow via inAlias',
    ]);
  });

  it('merges the zero-iteration path when a loop may overwrite a StyleX alias', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
let sx = stylex;
for (sx of []) {}
sx.firstThatWorks('red', 'blue');`,
        'zero-iteration.stylex.ts',
      ),
    ).toEqual([
      'zero-iteration.stylex.ts:4 uses unsupported StyleX capability: ambiguous StyleX flow via sx',
    ]);
  });

  it('joins path-dependent StyleX aliases without flagging a direct local shadow', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
let sx = stylex;
if (clearAlias) sx = local;
sx.firstThatWorks('red', 'blue');
let sy = local;
if (setAlias) sy = stylex;
sy.firstThatWorks('red', 'blue');
{
  let sx = local;
  if (replaceLocal) sx = local;
  sx.firstThatWorks('local', 'fallback');
}`,
        'path-dependent.stylex.ts',
      ),
    ).toEqual([
      'path-dependent.stylex.ts:5 uses unsupported StyleX capability: ambiguous StyleX flow via sx',
      'path-dependent.stylex.ts:8 uses unsupported StyleX capability: ambiguous StyleX flow via sy',
    ]);
  });

  it('resets loop-local shadow bindings before each analyzed iteration', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
while (ready) {
  sx.firstThatWorks('local', 'fallback');
  let sx = stylex;
}
stylex.firstThatWorks('red', 'blue');`,
        'loop-local-shadow.stylex.ts',
      ),
    ).toEqual([
      'loop-local-shadow.stylex.ts:6 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);
  });

  it('visits calls in computed destructuring property names', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {red: 'red'};
const {[stylex.firstThatWorks('red', 'blue')]: value} = local;`,
        'computed-property-expression.stylex.ts',
      ),
    ).toEqual([
      'computed-property-expression.stylex.ts:3 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);
  });

  it('visits calls in computed method names at definition time', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {[stylex.firstThatWorks('red', 'blue')]() {}};
class Example {
  [stylex.firstThatWorks('red', 'blue')]() {}
}`,
        'computed-method-name.stylex.ts',
      ),
    ).toEqual([
      'computed-method-name.stylex.ts:2 uses unsupported StyleX capability: stylex.firstThatWorks',
      'computed-method-name.stylex.ts:4 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);
  });

  it('resolves string-literal computed StyleX members and destructuring keys', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
stylex['firstThatWorks']('red', 'blue');
const sx = stylex;
sx['firstThatWorks']('red', 'blue');
let choose;
({['firstThatWorks']: choose} = stylex);
choose('red', 'blue');
const {['firstThatWorks']: pick} = stylex;
pick('red', 'blue');`,
        'computed-member.stylex.ts',
      ),
    ).toEqual([
      'computed-member.stylex.ts:2 uses unsupported StyleX capability: stylex.firstThatWorks',
      'computed-member.stylex.ts:4 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
      'computed-member.stylex.ts:6 uses unsupported StyleX capability: destructured stylex.firstThatWorks as choose',
      'computed-member.stylex.ts:8 uses unsupported StyleX capability: destructured stylex.firstThatWorks as pick',
    ]);
  });

  it('rejects dynamic computed StyleX keys without flagging local members', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
const key = getKey();
stylex[key]('unknown', 'fallback');
let choose = stylex.firstThatWorks;
({[key]: choose} = stylex);
choose('unknown', 'fallback');
local['firstThatWorks']('local', 'fallback');
stylex.firstThatWorks('red', 'blue');`,
        'dynamic-computed.stylex.ts',
      ),
    ).toEqual([
      'dynamic-computed.stylex.ts:4 uses unsupported StyleX capability: ambiguous StyleX flow via stylex',
      'dynamic-computed.stylex.ts:6 uses unsupported StyleX capability: ambiguous StyleX destructuring key',
      'dynamic-computed.stylex.ts:7 uses unsupported StyleX capability: ambiguous StyleX flow via choose',
      'dynamic-computed.stylex.ts:9 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);
  });

  it('preserves aliases through non-mutating prefix unary reads', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
let sx = stylex;
!sx;
+sx;
-sx;
~sx;
sx.firstThatWorks('red', 'blue');
++sx;
sx.firstThatWorks('local', 'fallback');
stylex.firstThatWorks('red', 'blue');`,
        'prefix-unary.stylex.ts',
      ),
    ).toEqual([
      'prefix-unary.stylex.ts:10 uses unsupported StyleX capability: stylex.firstThatWorks',
      'prefix-unary.stylex.ts:7 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
    ]);
  });

  it('applies captured binding effects only when a local function is called', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
let sx = stylex;
function clearAlias() { sx = local; }
sx.firstThatWorks('before-call', 'fallback');
clearAlias();
sx.firstThatWorks('after-call', 'fallback');
stylex.firstThatWorks('red', 'blue');`,
        'captured-clear.stylex.ts',
      ),
    ).toEqual([
      'captured-clear.stylex.ts:5 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
      'captured-clear.stylex.ts:8 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);

    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
let sx = local;
function activateAlias() { sx = stylex; }
sx.firstThatWorks('before-call', 'fallback');
activateAlias();
sx.firstThatWorks('after-call', 'fallback');`,
        'captured-activate.stylex.ts',
      ),
    ).toEqual([
      'captured-activate.stylex.ts:7 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
    ]);
  });

  it('uses late capture state when a nested named function is invoked', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
let sx = local;
function activateAlias() {
  function useLatestCapture() {
    sx.firstThatWorks('red', 'blue');
  }
  sx = stylex;
  useLatestCapture();
}
activateAlias();`,
        'late-capture.stylex.ts',
      ),
    ).toEqual([
      'late-capture.stylex.ts:6 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
    ]);
  });

  it('stops normal flow at return and throw completions', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
let sx = local;
function activateAlias() { sx = stylex; return; sx = local; }
activateAlias();
sx.firstThatWorks('red', 'blue');`,
        'return-completion.stylex.ts',
      ),
    ).toEqual([
      'return-completion.stylex.ts:6 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
    ]);

    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
let sx = local;
function activateAlias() { sx = stylex; throw failure; sx = local; }
try { activateAlias(); } catch {}
sx.firstThatWorks('red', 'blue');`,
        'throw-completion.stylex.ts',
      ),
    ).toEqual([
      'throw-completion.stylex.ts:6 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
    ]);
  });

  it('excludes statements unreachable after loop break and continue', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
let sx = stylex;
for (;;) {
  break;
  sx = local;
}
sx.firstThatWorks('red', 'blue');
let sy = stylex;
while (ready) {
  continue;
  sy = local;
}
sy.firstThatWorks('red', 'blue');`,
        'loop-completion.stylex.ts',
      ),
    ).toEqual([
      'loop-completion.stylex.ts:14 uses unsupported StyleX capability: stylex.firstThatWorks via sy',
      'loop-completion.stylex.ts:8 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
    ]);
  });

  it('executes a do loop body at least once', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
let sx = stylex;
do { sx = local; } while (ready);
sx.firstThatWorks('local', 'fallback');
stylex.firstThatWorks('red', 'blue');`,
        'mandatory-do.stylex.ts',
      ),
    ).toEqual([
      'mandatory-do.stylex.ts:6 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);
  });

  it('does not fall through a switch path after break', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
let sx = local;
switch (kind) {
  case 'seed':
    sx = stylex;
    break;
  case 'use':
    sx.firstThatWorks('local', 'fallback');
    break;
}
stylex.firstThatWorks('red', 'blue');`,
        'switch-completion.stylex.ts',
      ),
    ).toEqual([
      'switch-completion.stylex.ts:12 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);
  });

  it('preserves condition and case-selection side effects on exit paths', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
let sx = local;
while ((sx = stylex, ready)) { break; }
sx.firstThatWorks('red', 'blue');`,
        'loop-condition-effect.stylex.ts',
      ),
    ).toEqual([
      'loop-condition-effect.stylex.ts:5 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
    ]);

    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
let sx = local;
switch (kind) {
  case (sx = stylex, 'first'):
    break;
  case 'second':
    sx.firstThatWorks('red', 'blue');
    break;
}`,
        'switch-selection-effect.stylex.ts',
      ),
    ).toEqual([
      'switch-selection-effect.stylex.ts:8 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
    ]);
  });

  it('bounds recursive local calls without losing captured effects', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
let sx = local;
let pending = local;
function rotateAlias() {
  sx = pending;
  pending = stylex;
  if (again) rotateAlias();
}
rotateAlias();
sx.firstThatWorks('red', 'blue');`,
        'recursive-capture.stylex.ts',
      ),
    ).toEqual([
      'recursive-capture.stylex.ts:11 uses unsupported StyleX capability: ambiguous StyleX flow via sx',
    ]);
  });

  it('visits computed accessor names and accessor bodies', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const object = {
  get [stylex.firstThatWorks('getter', 'fallback')]() {
    return stylex.firstThatWorks('getter-body', 'fallback');
  },
  set [stylex.firstThatWorks('setter', 'fallback')](value) {
    stylex.firstThatWorks('setter-body', 'fallback');
  },
};`,
        'computed-accessor.stylex.ts',
      ),
    ).toEqual([
      'computed-accessor.stylex.ts:3 uses unsupported StyleX capability: stylex.firstThatWorks',
      'computed-accessor.stylex.ts:4 uses unsupported StyleX capability: stylex.firstThatWorks',
      'computed-accessor.stylex.ts:6 uses unsupported StyleX capability: stylex.firstThatWorks',
      'computed-accessor.stylex.ts:7 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);
  });

  it('analyzes ordinary class expressions without recursive traversal', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const Example = class {};
stylex.firstThatWorks('red', 'blue');`,
        'class-expression.stylex.ts',
      ),
    ).toEqual([
      'class-expression.stylex.ts:3 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);
  });

  it('keeps class static block var shadows inside the static block', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
class Example {
  static {
    var stylex = local;
    stylex.firstThatWorks('local', 'fallback');
  }
}
stylex.firstThatWorks('red', 'blue');`,
        'static-block-shadow.stylex.ts',
      ),
    ).toEqual([
      'static-block-shadow.stylex.ts:9 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);
  });

  it('preserves exact values through statically known array destructuring', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {firstThatWorks: (...values: string[]) => values[0]};
const [sx, choose] = [stylex, stylex.firstThatWorks];
sx.firstThatWorks('red', 'blue');
choose('red', 'blue');
let sy;
[sy] = [stylex];
sy.firstThatWorks('red', 'blue');
const [localShadow] = [local];
localShadow.firstThatWorks('local', 'fallback');
const [pathAlias] = ready ? [stylex] : [local];
pathAlias.firstThatWorks('red', 'blue');`,
        'array-aggregate.stylex.ts',
      ),
    ).toEqual([
      'array-aggregate.stylex.ts:12 uses unsupported StyleX capability: ambiguous StyleX flow via pathAlias',
      'array-aggregate.stylex.ts:4 uses unsupported StyleX capability: stylex.firstThatWorks via sx',
      'array-aggregate.stylex.ts:5 uses unsupported StyleX capability: stylex.firstThatWorks via choose',
      'array-aggregate.stylex.ts:8 uses unsupported StyleX capability: stylex.firstThatWorks via sy',
    ]);
  });

  it('keeps public core authoring within the declared capability policy', async () => {
    await expect(workspaceStylexCapabilityProblems()).resolves.toEqual([]);
  });
});
