import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';

import {Composition, Tones} from './Alert.stories.js';

function renderStory(story: typeof Tones) {
  const render = story.render;
  expect(render).toBeTypeOf('function');
  return renderToStaticMarkup(render?.({}, {} as never) ?? null);
}

describe('Alert stories', () => {
  it('shows every default tone icon and a custom icon composition', () => {
    const tonesMarkup = renderStory(Tones);
    const compositionMarkup = renderStory(Composition);

    expect(
      tonesMarkup.match(/data-alert-icon="(info|success|warning|danger)"/g),
    ).toHaveLength(4);
    expect(compositionMarkup).toContain('data-alert-icon="custom"');
  });
});
