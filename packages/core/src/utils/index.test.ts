import {describe, expect, it} from 'vitest';

import {clamp, mergeIds, resolveInvalid} from './index.js';

describe('mergeIds', () => {
  it('joins the ids that are present', () => {
    expect(mergeIds('a', undefined, 'b')).toBe('a b');
  });

  it('reports nothing rather than an empty string', () => {
    expect(mergeIds(undefined, false, null)).toBeUndefined();
  });
});

describe('resolveInvalid', () => {
  it('treats the string "false" as valid', () => {
    expect(resolveInvalid('false')).toBe(false);
  });

  it('treats any other declared value as invalid', () => {
    expect(resolveInvalid(true)).toBe(true);
    expect(resolveInvalid('spelling')).toBe(true);
  });

  it('treats an absent value as valid', () => {
    expect(resolveInvalid(undefined)).toBe(false);
  });
});

describe('clamp', () => {
  it('holds a number inside its range', () => {
    expect(clamp(140, 0, 100)).toBe(100);
    expect(clamp(-5, 0, 100)).toBe(0);
    expect(clamp(40, 0, 100)).toBe(40);
  });
});
