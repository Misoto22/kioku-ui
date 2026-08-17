import type {PropsWithChildren} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it, vi} from 'vitest';

vi.mock('@misoto22/kioku-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@misoto22/kioku-ui')>();
  return {
    ...actual,
    Card: ({children}: PropsWithChildren) => (
      <div data-card-boundary="instrumented">{children}</div>
    ),
  };
});

import {Composition} from './MetricGrid.stories.js';

describe('MetricGrid stories', () => {
  it('renders the composition without a redundant outer Card boundary', () => {
    const render = Composition.render;
    expect(render).toBeTypeOf('function');

    const markup = renderToStaticMarkup(
      render?.({items: []}, {} as never) ?? null,
    );

    expect(markup).toContain('<dl');
    expect(markup).not.toContain('data-card-boundary="instrumented"');
  });
});
