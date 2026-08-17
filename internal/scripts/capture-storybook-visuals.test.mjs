import assert from 'node:assert/strict';
import test from 'node:test';

import {
  forcedPseudoStateTargets,
  visualCaptureCases,
} from './capture-storybook-visuals.mjs';

const storyIds = [
  'core-alert--tones',
  'core-badge--tones',
  'core-button--states',
  'core-card--composition',
  'core-empty-state--composition',
  'core-grid--composition',
  'core-metric-grid--composition',
  'core-segmented-control--states',
  'core-table--composition',
  'core-text-input--states',
  'core-toggle--states',
];
const modes = ['light', 'dark'];
const themes = ['washi', 'muji', 'sumi'];
const viewports = [
  {height: 900, name: 'desktop-1440x900', width: 1440},
  {height: 844, name: 'narrow-390x844', width: 390},
];

test('visual capture matrix covers the approved stories, themes, modes, and viewports', () => {
  const cases = visualCaptureCases({storyIds, themes, modes, viewports});
  const filenames = cases.map(({filename}) => filename);

  assert.equal(cases.length, 68);
  assert.equal(new Set(filenames).size, filenames.length);
  assert.deepEqual(
    filenames,
    [...filenames].sort((left, right) => left.localeCompare(right)),
  );
  assert.deepEqual(cases[0], {
    filename: 'core-alert--tones-washi-dark-desktop-1440x900.png',
    globals: 'theme:washi;mode:dark',
    mode: 'dark',
    storyId: 'core-alert--tones',
    theme: 'washi',
    viewport: viewports[0],
  });

  for (const storyId of storyIds) {
    for (const mode of modes) {
      for (const viewport of viewports) {
        assert.ok(
          filenames.includes(`${storyId}-washi-${mode}-${viewport.name}.png`),
        );
      }
    }
  }

  for (const storyId of [
    'core-button--states',
    'core-card--composition',
    'core-table--composition',
  ]) {
    for (const theme of ['muji', 'sumi']) {
      for (const mode of modes) {
        for (const viewport of viewports) {
          assert.ok(
            filenames.includes(
              `${storyId}-${theme}-${mode}-${viewport.name}.png`,
            ),
          );
        }
      }
    }
  }
});

test('visual capture matrix rejects a missing canonical story ID', () => {
  assert.throws(
    () =>
      visualCaptureCases({
        storyIds: storyIds.filter(
          (storyId) => storyId !== 'core-grid--composition',
        ),
        themes,
        modes,
        viewports,
      }),
    /Missing visual story: core-grid--composition/,
  );
});

test('visual capture matrix rejects colliding output filenames', () => {
  assert.throws(
    () =>
      visualCaptureCases({
        storyIds,
        themes: ['washi', 'washi'],
        modes,
        viewports,
      }),
    /Visual capture filename collision: core-button--states-washi-light-desktop-1440x900.png/,
  );
});

test('visual captures force simultaneous inspectable interaction states', () => {
  assert.deepEqual(forcedPseudoStateTargets(), [
    {pseudoClasses: ['hover'], selector: '[data-story-state="hover"]'},
    {
      pseudoClasses: ['hover', 'active'],
      selector: '[data-story-state="active"]',
    },
    {
      pseudoClasses: ['focus', 'focus-visible'],
      selector: '[data-story-state="focus"]',
    },
  ]);
});
