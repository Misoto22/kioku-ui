// @vitest-environment jsdom

import {cleanup, renderHook, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {afterEach, describe, expect, it, vi} from 'vitest';

vi.mock('@stylexjs/stylex', () => ({
  create: <Styles,>(styles: Styles) => styles,
  defineVars: <Vars,>(variables: Vars) => variables,
  keyframes: () => 'test-spin',
  props: (...styles: Array<Record<string, unknown> | undefined | false>) => ({
    style: Object.assign({}, ...styles.filter(Boolean)),
  }),
}));

import {renderUi} from '@misoto22/kioku-ui-test-utils';

import {Pagination} from '../Pagination/index.js';
import {Token} from '../Token/index.js';

import {
  InternationalizationProvider,
  defaultMessages,
  useInternationalization,
  useMessage,
  type Messages,
} from './index.js';

afterEach(() => {
  cleanup();
});

describe('InternationalizationProvider', () => {
  it('marks its subtree with the active language and direction', () => {
    const {container} = renderUi(
      <InternationalizationProvider direction="rtl" locale="ar">
        <p>content</p>
      </InternationalizationProvider>,
    );

    const wrapper = container.querySelector('div');
    expect(wrapper).toHaveAttribute('lang', 'ar');
    expect(wrapper).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText('content')).toBeVisible();
  });

  it('supplies a replacement message set to descendants', () => {
    const messages: Messages = {...defaultMessages, close: 'Fermer'};

    const {result} = renderHook(() => useMessage('close'), {
      wrapper: ({children}) => (
        <InternationalizationProvider messages={messages}>
          {children}
        </InternationalizationProvider>
      ),
    });

    expect(result.current).toBe('Fermer');
  });
});

describe('useInternationalization', () => {
  it('reports English defaults with no provider above it', () => {
    const {result} = renderHook(() => useInternationalization());

    expect(result.current.locale).toBe('en');
    expect(result.current.direction).toBe('ltr');
    expect(result.current.messages.close).toBe('Close');
  });
});

describe('message wiring', () => {
  it('renames built-in control labels through the provider', () => {
    const messages: Messages = {
      ...defaultMessages,
      paginationNext: 'Page suivante',
      paginationPrevious: 'Page précédente',
    };

    renderUi(
      <InternationalizationProvider locale="fr" messages={messages}>
        <Pagination onChange={() => {}} page={2} pageCount={5} />
      </InternationalizationProvider>,
    );

    expect(screen.getByRole('button', {name: 'Page précédente'})).toBeVisible();
    expect(screen.getByRole('button', {name: 'Page suivante'})).toBeVisible();
  });

  it('falls back to the message set when no prop is given', () => {
    renderUi(
      <InternationalizationProvider
        messages={{...defaultMessages, remove: 'Supprimer'}}
      >
        <Token onRemove={() => {}}>Ada</Token>
      </InternationalizationProvider>,
    );

    expect(screen.getByRole('button', {name: 'Supprimer'})).toBeVisible();
  });

  it('keeps an explicit prop ahead of the message set', () => {
    renderUi(
      <InternationalizationProvider
        messages={{...defaultMessages, remove: 'Supprimer'}}
      >
        <Token onRemove={() => {}} removeLabel="Remove Ada">
          Ada
        </Token>
      </InternationalizationProvider>,
    );

    expect(screen.getByRole('button', {name: 'Remove Ada'})).toBeVisible();
  });
});
