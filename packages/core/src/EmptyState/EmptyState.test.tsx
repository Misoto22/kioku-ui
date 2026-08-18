// @vitest-environment jsdom

import {cleanup, screen} from '@testing-library/react';
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

import {EmptyState} from './index.js';
import {Button} from '../Button/index.js';

afterEach(() => {
  cleanup();
});

describe('EmptyState', () => {
  it('places the optional EmptyState visual before readable copy and actions', () => {
    renderUi(
      <EmptyState
        action={<Button>Review filters</Button>}
        data-testid="empty-state"
        detail="No saved records match the current view."
        size="compact"
        title="No matching records"
        visual={
          <span aria-hidden="true" data-testid="empty-visual">
            ◇
          </span>
        }
      />,
    );

    const root = screen.getByTestId('empty-state');
    const visual = screen.getByTestId('empty-visual');
    const title = screen.getByText('No matching records');
    const detail = screen.getByText('No saved records match the current view.');
    const action = screen.getByRole('button', {name: 'Review filters'});

    expect(screen.getAllByRole('status')).toEqual([root]);
    expect(root).not.toHaveAttribute('size');
    expect(visual.compareDocumentPosition(title)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(title.compareDocumentPosition(detail)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(detail.compareDocumentPosition(action)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
});
