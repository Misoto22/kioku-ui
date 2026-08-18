// @vitest-environment jsdom

import {cleanup, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
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

import {Pagination} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Pagination', () => {
  it('marks the current page', () => {
    renderUi(<Pagination onChange={() => {}} page={3} pageCount={9} />);

    expect(screen.getByRole('button', {name: 'Page 3'})).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('disables the previous control on the first page', () => {
    renderUi(<Pagination onChange={() => {}} page={1} pageCount={9} />);

    expect(screen.getByRole('button', {name: 'Previous page'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Next page'})).toBeEnabled();
  });

  it('disables the next control on the last page', () => {
    renderUi(<Pagination onChange={() => {}} page={9} pageCount={9} />);

    expect(screen.getByRole('button', {name: 'Next page'})).toBeDisabled();
  });

  it('reports the requested page', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderUi(<Pagination onChange={onChange} page={3} pageCount={9} />);

    await user.click(screen.getByRole('button', {name: 'Page 4'}));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('keeps the first and last page reachable behind an ellipsis', () => {
    renderUi(<Pagination onChange={() => {}} page={5} pageCount={20} />);

    expect(screen.getByRole('button', {name: 'Page 1'})).toBeVisible();
    expect(screen.getByRole('button', {name: 'Page 20'})).toBeVisible();
    expect(screen.getAllByText('…')).toHaveLength(2);
  });
});
