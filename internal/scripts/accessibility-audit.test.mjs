import assert from 'node:assert/strict';
import test from 'node:test';

import {
  accessibilityAuditScope,
  accessibilityBaselineScopeProblems,
  accessibilityViolationFingerprints,
  newAccessibilityViolations,
} from '../../.github/scripts/accessibility-audit.js';

const knownAudit = {
  mode: 'light',
  storyId: 'controls--button',
  theme: 'washi',
  violations: [
    {
      id: 'color-contrast',
      nodes: [{target: ['button']}],
    },
  ],
};

test('the accessibility baseline tolerates only matching known violations', () => {
  const baseline = {
    version: 1,
    violations: accessibilityViolationFingerprints([knownAudit]),
  };
  const current = [
    knownAudit,
    {
      ...knownAudit,
      storyId: 'controls--toggle',
      violations: [
        {
          id: 'button-name',
          nodes: [{target: ['button[role="switch"]']}],
        },
      ],
    },
  ];

  assert.deepEqual(newAccessibilityViolations(current, baseline), [
    {
      mode: 'light',
      ruleId: 'button-name',
      storyId: 'controls--toggle',
      target: 'button[role="switch"]',
      theme: 'washi',
    },
  ]);
});

test('accessibility fingerprints are stable across axe result ordering', () => {
  const reversed = {
    ...knownAudit,
    violations: [
      {
        id: 'label',
        nodes: [{target: ['#second']}, {target: ['#first']}],
      },
      ...knownAudit.violations,
    ],
  };

  assert.deepEqual(accessibilityViolationFingerprints([reversed]), [
    {
      mode: 'light',
      ruleId: 'color-contrast',
      storyId: 'controls--button',
      target: 'button',
      theme: 'washi',
    },
    {
      mode: 'light',
      ruleId: 'label',
      storyId: 'controls--button',
      target: '#first',
      theme: 'washi',
    },
    {
      mode: 'light',
      ruleId: 'label',
      storyId: 'controls--button',
      target: '#second',
      theme: 'washi',
    },
  ]);
});

const fullScope = {
  modes: ['light', 'dark'],
  storyIds: ['controls--button', 'controls--toggle'],
  themes: ['washi', 'muji', 'sumi'],
};

test('audit scope is derived from Storybook toolbar values and canonical story IDs', () => {
  const index = {
    entries: {
      'docs--introduction': {id: 'docs--introduction', type: 'docs'},
      'controls--toggle': {id: 'controls--toggle', type: 'story'},
      'controls--button': {id: 'controls--button', type: 'story'},
    },
  };
  const globalTypes = {
    mode: {toolbar: {items: [{value: 'dim'}, {value: 'bright'}]}},
    theme: {toolbar: {items: [{value: 'linen'}, {value: 'graphite'}]}},
  };

  assert.deepEqual(accessibilityAuditScope(index, globalTypes), {
    modes: ['dim', 'bright'],
    storyIds: ['controls--button', 'controls--toggle'],
    themes: ['linen', 'graphite'],
  });
});

test('a changed Storybook theme cannot reuse the committed baseline', () => {
  const baseline = {
    scope: {
      ...fullScope,
      themes: ['washi', 'muji', 'graphite'],
    },
    version: 1,
    violations: [],
  };

  assert.deepEqual(accessibilityBaselineScopeProblems(baseline, fullScope), [
    'themes: expected [washi, muji, sumi], received [washi, muji, graphite]',
  ]);
});

test('a changed Storybook mode cannot reuse the committed baseline', () => {
  const baseline = {
    scope: {...fullScope, modes: ['light', 'contrast']},
    version: 1,
    violations: [],
  };

  assert.deepEqual(accessibilityBaselineScopeProblems(baseline, fullScope), [
    'modes: expected [light, dark], received [light, contrast]',
  ]);
});

test('an equal-count Storybook story replacement cannot reuse the baseline', () => {
  const baseline = {
    scope: {
      ...fullScope,
      storyIds: ['controls--button', 'controls--segmented-control'],
    },
    version: 1,
    violations: [],
  };

  assert.deepEqual(accessibilityBaselineScopeProblems(baseline, fullScope), [
    'story IDs: expected [controls--button, controls--toggle], received [controls--button, controls--segmented-control]',
  ]);
});
