// @vitest-environment happy-dom

import {act, type ReactNode} from 'react';
import {cleanup, render as renderUi} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {type ThemeDefinition, tokenCustomProperties, tokenNames} from '../tokens/contracts.js';
import {ThemeProvider, useTheme} from './Theme.js';

afterEach(() => {
  cleanup();
});

const paper = {
  id: 'paper',
  label: 'Paper',
  tokens: Object.fromEntries(
    tokenNames.map((name) => [name, `paper-${name}`]),
  ) as ThemeDefinition['tokens'],
} satisfies ThemeDefinition;

const ink = {
  ...paper,
  id: 'ink',
  label: 'Ink',
  tokens: Object.fromEntries(
    tokenNames.map((name) => [name, `ink-${name}`]),
  ) as ThemeDefinition['tokens'],
} satisfies ThemeDefinition;

function Probe() {
  const {setThemeId, theme} = useTheme();

  return (
    <>
      <output data-testid="theme">{theme.id}</output>
      <button onClick={() => setThemeId('paper')} type="button">
        Select paper
      </button>
    </>
  );
}

function provider(children: ReactNode, themes = [paper], defaultThemeId = 'paper') {
  return (
    <ThemeProvider defaultThemeId={defaultThemeId} themes={themes}>
      {children}
    </ThemeProvider>
  );
}

describe('ThemeProvider', () => {
  it('uses the supplied default theme rather than a built-in theme name', () => {
    const {getByTestId} = renderUi(provider(<Probe />));

    expect(getByTestId('theme').textContent).toBe('paper');
  });

  it('applies the selected host theme ID and semantic tokens to its root', () => {
    const {getByTestId} = renderUi(provider(<Probe />));
    const root = getByTestId('theme').parentElement;

    expect(root?.getAttribute('data-theme')).toBe('paper');
    expect(root?.style.getPropertyValue(tokenCustomProperties['color.canvas'])).toBe(
      'paper-color.canvas',
    );
  });

  it('uses a host persistence adapter and writes later selections through it', () => {
    const persistence = {read: vi.fn(() => 'ink'), write: vi.fn()};
    const {getByRole, getByTestId} = renderUi(
      <ThemeProvider
        defaultThemeId="paper"
        persistence={persistence}
        themes={[paper, ink]}
      >
        <Probe />
      </ThemeProvider>,
    );

    expect(getByTestId('theme').textContent).toBe('ink');

    act(() => {
      getByRole('button', {name: 'Select paper'}).click();
    });

    expect(getByTestId('theme').textContent).toBe('paper');
    expect(persistence.write).toHaveBeenCalledWith('paper');
  });

  it('rejects duplicate host theme IDs before rendering children', () => {
    expect(() => renderUi(provider(<Probe />, [paper, {...paper}]))).toThrow(
      'Duplicate theme ID: paper',
    );
  });

  it('rejects host themes with missing semantic token roles before rendering children', () => {
    const incomplete = {
      ...paper,
      tokens: {...paper.tokens, 'color.canvas': undefined},
    } as unknown as ThemeDefinition;

    expect(() => renderUi(provider(<Probe />, [incomplete]))).toThrow(
      'Theme "paper" is missing token roles: color.canvas',
    );
  });
});
