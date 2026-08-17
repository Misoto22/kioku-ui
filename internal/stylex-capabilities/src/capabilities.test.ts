import {describe, expect, it} from 'vitest';

import {
  isSupportedStylexCapability,
  stylexSourceProblems,
  workspaceStylexCapabilityProblems,
} from './capabilities.js';

describe('StyleX capability policy', () => {
  it('rejects a capability outside the public contract', () => {
    expect(isSupportedStylexCapability('arbitrary-global-selector')).toBe(
      false,
    );
  });

  it('accepts direct static supported calls on any namespace import alias', () => {
    expect(
      stylexSourceProblems(
        `import * as sx from '@stylexjs/stylex';
const spin = sx.keyframes({to: {transform: 'rotate(360deg)'}});
const variables = sx.defineVars({accent: 'rebeccapurple'});
const styles = sx['create']({
  root: {
    animationName: spin,
    color: variables.accent,
    ':focus-visible': {outlineStyle: 'solid'},
  },
});
function render() { return sx.props(styles.root); }
if (ready) { sx.props(styles.root); }
class Example { method() { return sx.props(styles.root); } }
const object = {get value() { return sx.props(styles.root); }};`,
        'direct-supported.stylex.ts',
      ),
    ).toEqual([]);
  });

  it('rejects unsupported selectors only inside direct StyleX declarations', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
const local = {':hover': {color: 'blue'}};
export const styles = stylex.create({
  global: {':global(body .private)': {color: 'red'}},
  hover: {':hover': {color: 'red'}},
  media: {'@media print': {color: 'black'}},
});`,
        'unsupported-selectors.stylex.ts',
      ),
    ).toEqual([
      'unsupported-selectors.stylex.ts:4 uses unsupported StyleX capability: arbitrary-global-selector',
      'unsupported-selectors.stylex.ts:5 uses unsupported StyleX capability: selector :hover',
      'unsupported-selectors.stylex.ts:6 uses unsupported StyleX capability: at-rule',
    ]);
  });

  it('rejects default and named StyleX imports', () => {
    expect(
      stylexSourceProblems(
        `import stylex, {create, props as compose} from '@stylexjs/stylex';`,
        'unsupported-imports.stylex.ts',
      ),
    ).toEqual([
      'unsupported-imports.stylex.ts:1 uses unsupported StyleX capability: default import stylex',
      'unsupported-imports.stylex.ts:1 uses unsupported StyleX capability: named import create',
      'unsupported-imports.stylex.ts:1 uses unsupported StyleX capability: named import props as compose',
    ]);
  });

  it('rejects namespace and member aliases where the direct-use escape originates', () => {
    expect(
      stylexSourceProblems(
        `import * as sx from '@stylexjs/stylex';
let zeroIterationAlias = sx;
for (zeroIterationAlias of []) {}
zeroIterationAlias.firstThatWorks('red', 'blue');
const memberAlias = sx.create;
let assigned;
assigned = sx;
const {props} = sx;
const arrayAggregate = [sx];
const objectAggregate = {value: sx};
const arraySpread = [...sx];
const objectSpread = {...sx};`,
        'direct-use-escapes.stylex.ts',
      ),
    ).toEqual([
      'direct-use-escapes.stylex.ts:2 uses unsupported StyleX capability: StyleX namespace escape via sx (variable initializer)',
      'direct-use-escapes.stylex.ts:5 uses unsupported StyleX capability: indirect StyleX capability use: sx.create (variable initializer)',
      'direct-use-escapes.stylex.ts:7 uses unsupported StyleX capability: StyleX namespace escape via sx (assignment)',
      'direct-use-escapes.stylex.ts:8 uses unsupported StyleX capability: StyleX namespace escape via sx (destructuring source)',
      'direct-use-escapes.stylex.ts:9 uses unsupported StyleX capability: StyleX namespace escape via sx (array aggregate)',
      'direct-use-escapes.stylex.ts:10 uses unsupported StyleX capability: StyleX namespace escape via sx (object aggregate)',
      'direct-use-escapes.stylex.ts:11 uses unsupported StyleX capability: StyleX namespace escape via sx (array spread)',
      'direct-use-escapes.stylex.ts:12 uses unsupported StyleX capability: StyleX namespace escape via sx (object spread)',
    ]);
  });

  it('resolves shorthand and local export wrappers to the imported namespace', () => {
    expect(
      stylexSourceProblems(
        `import * as sx from '@stylexjs/stylex';
const holder = {sx};
holder.sx.firstThatWorks('red', 'blue');
export {sx};
export {sx as stylex};
export type {sx};`,
        'wrapped-namespace.stylex.ts',
      ),
    ).toEqual([
      'wrapped-namespace.stylex.ts:2 uses unsupported StyleX capability: StyleX namespace escape via sx (object aggregate)',
      'wrapped-namespace.stylex.ts:4 uses unsupported StyleX capability: StyleX namespace escape via sx (export)',
      'wrapped-namespace.stylex.ts:5 uses unsupported StyleX capability: StyleX namespace escape via sx (export)',
      'wrapped-namespace.stylex.ts:6 uses unsupported StyleX capability: StyleX namespace escape via sx (export)',
    ]);
  });

  it('rejects dynamic and import-type references to the StyleX module', () => {
    expect(
      stylexSourceProblems(
        `const dynamic = await import('@stylexjs/stylex');
type Styles = import('@stylexjs/stylex').StyleXStyles;`,
        'dynamic-imports.stylex.ts',
      ),
    ).toEqual([
      'dynamic-imports.stylex.ts:1 uses unsupported StyleX capability: dynamic StyleX import',
      'dynamic-imports.stylex.ts:2 uses unsupported StyleX capability: StyleX import type',
    ]);
  });

  it('rejects import-equals and every non-value-namespace static import', () => {
    expect(
      stylexSourceProblems(
        `import sx = require('@stylexjs/stylex');
import '@stylexjs/stylex';
import {} from '@stylexjs/stylex';
import type * as types from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';`,
        'noncanonical-imports.stylex.ts',
      ),
    ).toEqual([
      'noncanonical-imports.stylex.ts:1 uses unsupported StyleX capability: import-equals StyleX import sx',
      'noncanonical-imports.stylex.ts:2 uses unsupported StyleX capability: side-effect StyleX import',
      'noncanonical-imports.stylex.ts:3 uses unsupported StyleX capability: empty named StyleX import',
      'noncanonical-imports.stylex.ts:4 uses unsupported StyleX capability: type-only namespace import types',
      'noncanonical-imports.stylex.ts:5 uses unsupported StyleX capability: type named import StyleXStyles',
    ]);
  });

  it('rejects namespace, star, named, aliased, and type StyleX re-exports', () => {
    expect(
      stylexSourceProblems(
        `export * from '@stylexjs/stylex';
export * as sx from '@stylexjs/stylex';
export {create} from '@stylexjs/stylex';
export {create as makeStyles} from '@stylexjs/stylex';
export {default as stylex} from '@stylexjs/stylex';
export type {StyleXStyles} from '@stylexjs/stylex';
export {type StyleXStyles as Styles} from '@stylexjs/stylex';
export type * from '@stylexjs/stylex';`,
        'stylex-reexports.stylex.ts',
      ),
    ).toEqual([
      'stylex-reexports.stylex.ts:1 uses unsupported StyleX capability: star StyleX re-export',
      'stylex-reexports.stylex.ts:2 uses unsupported StyleX capability: namespace StyleX re-export sx',
      'stylex-reexports.stylex.ts:3 uses unsupported StyleX capability: named StyleX re-export create',
      'stylex-reexports.stylex.ts:4 uses unsupported StyleX capability: named StyleX re-export create as makeStyles',
      'stylex-reexports.stylex.ts:5 uses unsupported StyleX capability: named StyleX re-export default as stylex',
      'stylex-reexports.stylex.ts:6 uses unsupported StyleX capability: type StyleX re-export StyleXStyles',
      'stylex-reexports.stylex.ts:7 uses unsupported StyleX capability: type StyleX re-export StyleXStyles as Styles',
      'stylex-reexports.stylex.ts:8 uses unsupported StyleX capability: type star StyleX re-export',
    ]);
  });

  it('rejects captures and timing-sensitive escapes at their source expression', () => {
    expect(
      stylexSourceProblems(
        `import * as sx from '@stylexjs/stylex';
function returned() { return sx; }
const captured = () => sx;
function defaulted(alias = sx) { return alias; }
async function asyncCapture() { const alias = sx; }
function* generatorCapture() { yield sx; }
if (ready) { const alias = sx; }
escapeLabel: { const alias = sx; break escapeLabel; }
class Example {
  field = sx;
  get value() { return sx.create; }
  set value(next) { if (next) { const alias = sx; } }
  static { const alias = sx; }
}`,
        'captured-escapes.stylex.ts',
      ),
    ).toEqual([
      'captured-escapes.stylex.ts:2 uses unsupported StyleX capability: StyleX namespace escape via sx (return)',
      'captured-escapes.stylex.ts:3 uses unsupported StyleX capability: StyleX namespace escape via sx (function return)',
      'captured-escapes.stylex.ts:4 uses unsupported StyleX capability: StyleX namespace escape via sx (default parameter)',
      'captured-escapes.stylex.ts:5 uses unsupported StyleX capability: StyleX namespace escape via sx (variable initializer)',
      'captured-escapes.stylex.ts:6 uses unsupported StyleX capability: StyleX namespace escape via sx (yield)',
      'captured-escapes.stylex.ts:7 uses unsupported StyleX capability: StyleX namespace escape via sx (variable initializer)',
      'captured-escapes.stylex.ts:8 uses unsupported StyleX capability: StyleX namespace escape via sx (variable initializer)',
      'captured-escapes.stylex.ts:10 uses unsupported StyleX capability: StyleX namespace escape via sx (class field)',
      'captured-escapes.stylex.ts:11 uses unsupported StyleX capability: indirect StyleX capability use: sx.create (return)',
      'captured-escapes.stylex.ts:12 uses unsupported StyleX capability: StyleX namespace escape via sx (variable initializer)',
      'captured-escapes.stylex.ts:13 uses unsupported StyleX capability: StyleX namespace escape via sx (variable initializer)',
    ]);
  });

  it('rejects unsupported, dynamic, and indirect invocations at the imported member', () => {
    expect(
      stylexSourceProblems(
        `import * as sx from '@stylexjs/stylex';
sx.firstThatWorks('red', 'blue');
sx['firstThatWorks']('red', 'blue');
sx[key]('red', 'blue');
sx.create.call(null, {});
new sx.create({});
sx.create\`color: red\`;
consume(sx);`,
        'indirect-invocations.stylex.ts',
      ),
    ).toEqual([
      'indirect-invocations.stylex.ts:2 uses unsupported StyleX capability: stylex.firstThatWorks',
      'indirect-invocations.stylex.ts:3 uses unsupported StyleX capability: stylex.firstThatWorks',
      'indirect-invocations.stylex.ts:4 uses unsupported StyleX capability: dynamic StyleX property via sx',
      'indirect-invocations.stylex.ts:5 uses unsupported StyleX capability: indirect StyleX capability invocation: sx.create.call',
      'indirect-invocations.stylex.ts:6 uses unsupported StyleX capability: indirect StyleX capability invocation: new sx.create',
      'indirect-invocations.stylex.ts:7 uses unsupported StyleX capability: indirect StyleX capability invocation: tagged sx.create',
      'indirect-invocations.stylex.ts:8 uses unsupported StyleX capability: StyleX namespace escape via sx (call argument)',
    ]);
  });

  it('rejects optional invocation of a supported member', () => {
    expect(
      stylexSourceProblems(
        `import * as sx from '@stylexjs/stylex';
sx?.create({});
sx.create?.({});`,
        'optional-invocations.stylex.ts',
      ),
    ).toEqual([
      'optional-invocations.stylex.ts:2 uses unsupported StyleX capability: indirect StyleX capability invocation: optional sx.create',
      'optional-invocations.stylex.ts:3 uses unsupported StyleX capability: indirect StyleX capability invocation: optional sx.create',
    ]);
  });

  it('rejects an unsupported call evaluated inside a computed destructuring key', () => {
    expect(
      stylexSourceProblems(
        `import * as sx from '@stylexjs/stylex';
const local = {red: 'red'};
const {[sx.firstThatWorks('red', 'blue')]: value} = local;`,
        'computed-destructuring-call.stylex.ts',
      ),
    ).toEqual([
      'computed-destructuring-call.stylex.ts:3 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);
  });

  it('keeps local, parameter, catch, loop, class-name, and static-block shadows clean', () => {
    expect(
      stylexSourceProblems(
        `import * as sx from '@stylexjs/stylex';
const local = {create: (value: unknown) => value, ':hover': {color: 'red'}};
{ const sx = local; sx.create({}); }
function parameter(sx = local) { return sx.create({}); }
try { throw local; } catch (sx) { sx.create({}); }
for (const sx of [local]) { sx.create({}); }
const Named = class sx { static use() { return sx.create({}); } };
class StaticBlock { static { var sx = local; sx.create({}); } }
{ const sx = local; const holder = {sx}; holder.sx.create({}); }
sx.create({root: {color: 'red'}});`,
        'direct-use-shadows.stylex.ts',
      ),
    ).toEqual([]);
  });

  it('keeps a hoisted function shadow distinct from the imported binding', () => {
    expect(
      stylexSourceProblems(
        `import * as stylex from '@stylexjs/stylex';
function inspectLocal() {
  stylex.create({});
  function stylex() {}
}
stylex.firstThatWorks('red', 'blue');`,
        'hoisted-shadow.stylex.ts',
      ),
    ).toEqual([
      'hoisted-shadow.stylex.ts:6 uses unsupported StyleX capability: stylex.firstThatWorks',
    ]);
  });

  it('keeps public core authoring within the declared direct-use policy', async () => {
    await expect(workspaceStylexCapabilityProblems()).resolves.toEqual([]);
  });
});
