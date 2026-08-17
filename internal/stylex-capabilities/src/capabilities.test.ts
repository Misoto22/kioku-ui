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

  it('keeps public core authoring within the declared capability policy', async () => {
    await expect(workspaceStylexCapabilityProblems()).resolves.toEqual([]);
  });
});
