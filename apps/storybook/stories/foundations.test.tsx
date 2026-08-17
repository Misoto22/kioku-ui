import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';

import {Card, CardFooter, CardHeader} from './foundations.stories.js';

function renderStory(story: typeof Card) {
  const render = story.render;
  expect(render).toBeTypeOf('function');

  return renderToStaticMarkup(render?.({}, {} as never) ?? null);
}

describe('foundation Card stories', () => {
  it.each([
    ['Card', Card],
    ['CardHeader', CardHeader],
    ['CardFooter', CardFooter],
  ])(
    'renders %s in one complete Card composition without duplicate separators',
    (_name, story) => {
      const markup = renderStory(story);

      expect(markup.match(/<article\b/g)).toHaveLength(1);
      expect(markup.match(/<header\b/g)).toHaveLength(1);
      expect(markup.match(/<footer\b/g)).toHaveLength(1);
      expect(markup).not.toContain('<hr');
    },
  );
});
