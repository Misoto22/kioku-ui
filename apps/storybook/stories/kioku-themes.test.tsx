import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';

import {KasumiFrost, ThemeMatrix} from './kioku-themes.stories.js';

describe('Kioku ThemeMatrix story', () => {
  it('renders every theme and mode on the compact scale it defaults to', () => {
    const render = ThemeMatrix.render;
    expect(render).toBeTypeOf('function');

    const markup = renderToStaticMarkup(
      render?.({title: 'Themes/Kioku'}, {} as never) ?? null,
    );

    expect(markup.match(/data-theme=/g)).toHaveLength(8);
    expect(markup.match(/light mode/g)).toHaveLength(4);
    expect(markup.match(/dark mode/g)).toHaveLength(4);
    expect(markup).toContain('gap:var(--kioku-ui-spacing-sm)');
    expect(markup).toContain('gap:var(--kioku-ui-spacing-xl)');
    expect(markup.match(/data-density="compact"/g)).toHaveLength(8);
    expect(markup).not.toContain('data-density="standard"');
    expect(markup).not.toContain('--kioku-ui-density-');
  });
});

describe('Kasumi frost story', () => {
  const markup = () =>
    renderToStaticMarkup(
      KasumiFrost.render?.({title: 'Themes/Kioku'}, {} as never) ?? null,
    );

  it('runs the lever across three settings in both modes', () => {
    const rendered = markup();

    expect(rendered.match(/data-theme="kasumi"/g)).toHaveLength(6);
    for (const keep of [100, 64, 40]) {
      expect(rendered).toContain(`keep ${keep}%`);
      expect(rendered).toContain(`--kioku-theme-kasumi-frost-keep: ${keep}%;`);
    }
  });

  it('overrides the lever with a rule that outranks the pack, not an inherited value', () => {
    // The pack declares the lever ON the theme root, so an ancestor's inline
    // value would lose to it. Only a more specific selector wins.
    expect(markup()).toContain(
      ".frost-40 [data-theme='kasumi'] { --kioku-theme-kasumi-frost-keep: 40%; }",
    );
  });

  it('leaves the host backdrop sharp, the theme owning the blur', () => {
    const rendered = markup();

    expect(rendered.match(/data-specimen-backdrop/g)).toHaveLength(6);
    // The frost lives on the theme's own ::before. A story that pre-blurs its
    // backdrop is hiding whether the theme actually does anything.
    expect(rendered).not.toContain('filter:blur');
    expect(rendered).not.toContain('backdrop-filter');
  });
});
