import assert from 'node:assert/strict';
import test from 'node:test';

import {
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
