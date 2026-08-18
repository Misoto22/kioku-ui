import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';

import {ThemeMatrix} from './kioku-themes.stories.js';

describe('Kioku ThemeMatrix story', () => {
  it('renders every theme and mode on the compact scale it defaults to', () => {
    const render = ThemeMatrix.render;
    expect(render).toBeTypeOf('function');

    const markup = renderToStaticMarkup(
      render?.({title: 'Themes/Kioku'}, {} as never) ?? null,
    );

    expect(markup.match(/data-theme=/g)).toHaveLength(6);
    expect(markup.match(/light mode/g)).toHaveLength(3);
    expect(markup.match(/dark mode/g)).toHaveLength(3);
    expect(markup).toContain('gap:var(--kioku-ui-spacing-sm)');
    expect(markup).toContain('gap:var(--kioku-ui-spacing-xl)');
    expect(markup.match(/data-density="compact"/g)).toHaveLength(6);
    expect(markup).not.toContain('data-density="standard"');
    expect(markup).not.toContain('--kioku-ui-density-');
  });
});
