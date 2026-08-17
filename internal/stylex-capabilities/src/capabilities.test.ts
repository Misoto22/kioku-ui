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
      'iteration-target.stylex.ts:23 uses unsupported StyleX capability: stylex.firstThatWorks',
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

  it('does not guess dynamic computed StyleX keys or unrelated local members', () => {
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
      'dynamic-computed.stylex.ts:9 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);
  });

  it('keeps public core authoring within the declared capability policy', async () => {
    await expect(workspaceStylexCapabilityProblems()).resolves.toEqual([]);
  });
});
