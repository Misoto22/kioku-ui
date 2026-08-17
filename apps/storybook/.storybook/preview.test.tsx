// @vitest-environment jsdom

import {act, type ReactElement} from 'react';
import {createRoot} from 'react-dom/client';
import {afterEach, describe, expect, it} from 'vitest';

import preview from './preview';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const decorator = preview.decorators?.[0];

function decoratedStory(theme: 'sumi' | 'washi', mode: 'dark' | 'light') {
  if (!decorator) throw new Error('Storybook theme decorator is missing');
  return decorator(() => <button type="button">Save changes</button>, {
    globals: {mode, theme},
  } as never) as ReactElement;
}

afterEach(() => {
  document.body.replaceChildren();
});

describe('Storybook preview decorator', () => {
  it('applies a changed toolbar theme instead of retaining provider state', () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(decoratedStory('washi', 'light')));
    expect(container.firstElementChild?.getAttribute('data-theme')).toBe(
      'washi',
    );

    act(() => root.render(decoratedStory('sumi', 'light')));
    expect(container.firstElementChild?.getAttribute('data-theme')).toBe(
      'sumi',
    );

    act(() => root.unmount());
  });

  it('compensates Storybook padding while keeping the themed content inset', () => {
    const element = decoratedStory('washi', 'dark');
    const surface = element.props.children as ReactElement<{
      readonly 'data-story-mode'?: string;
      readonly 'data-story-surface'?: string;
      readonly style?: Record<string, string>;
    }>;

    expect(surface.props['data-story-mode']).toBe('dark');
    expect(surface.props['data-story-surface']).toBe('true');
    expect(surface.props.style).toMatchObject({
      boxSizing: 'border-box',
      margin: '-1rem',
      minHeight: '100vh',
      padding: '1rem',
    });
  });
});
