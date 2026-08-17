import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';

import {Composition} from './MetricGrid.stories.js';

describe('MetricGrid stories', () => {
  it('renders the composition without a redundant outer Card boundary', () => {
    const render = Composition.render;
    expect(render).toBeTypeOf('function');

    const markup = renderToStaticMarkup(
      render?.({items: []}, {} as never) ?? null,
    );

    expect(markup).toContain('<dl');
    expect(markup).not.toContain('<article');
  });
});
