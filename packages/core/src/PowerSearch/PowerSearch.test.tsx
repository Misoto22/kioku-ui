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

import {PowerSearch} from './index.js';

afterEach(() => {
  cleanup();
});

describe('PowerSearch', () => {
  it('exposes a search landmark', () => {
    renderUi(<PowerSearch label="Search releases" onSearch={() => {}} />);

    expect(screen.getByRole('search')).toBeVisible();
  });

  it('reports the submitted query', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    renderUi(<PowerSearch label="Search releases" onSearch={onSearch} />);

    await user.type(
      screen.getByRole('searchbox', {name: 'Search releases'}),
      'release 12',
    );
    await user.click(screen.getByRole('button', {name: 'Search'}));

    expect(onSearch).toHaveBeenCalledWith('release 12');
  });

  it('shows each applied filter with its own remove control', async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    renderUi(
      <PowerSearch
        filters={[
          {id: 'open', label: 'Status: open'},
          {id: 'mine', label: 'Owner: me'},
        ]}
        label="Search releases"
        onFiltersChange={onFiltersChange}
        onSearch={() => {}}
      />,
    );

    await user.click(
      screen.getByRole('button', {name: 'Remove filter Status: open'}),
    );

    expect(onFiltersChange).toHaveBeenCalledWith([
      {id: 'mine', label: 'Owner: me'},
    ]);
  });
});
