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

  it('keeps public core authoring within the declared capability policy', async () => {
    await expect(workspaceStylexCapabilityProblems()).resolves.toEqual([]);
  });
});
