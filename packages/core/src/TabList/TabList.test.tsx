// @vitest-environment jsdom

import {cleanup, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {useState} from 'react';
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

import {TabList} from './index.js';

afterEach(() => {
  cleanup();
});

const tabs = [
  {id: 'open', label: 'Open'},
  {id: 'merged', label: 'Merged'},
  {id: 'closed', label: 'Closed', disabled: true},
];

function TabFixture() {
  const [selectedId, setSelectedId] = useState('open');
  return (
    <TabList
      label="Views"
      onSelect={setSelectedId}
      selectedId={selectedId}
      tabs={tabs}
    />
  );
}

describe('TabList', () => {
  it('names the strip and marks the selected tab', () => {
    renderUi(<TabFixture />);

    expect(screen.getByRole('tablist', {name: 'Views'})).toBeVisible();
    expect(screen.getByRole('tab', {name: 'Open'})).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('keeps the strip to one tab stop', () => {
    renderUi(<TabFixture />);

    expect(screen.getByRole('tab', {name: 'Open'})).toHaveAttribute(
      'tabindex',
      '0',
    );
    expect(screen.getByRole('tab', {name: 'Merged'})).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });

  it('selects the next tab with the arrow key', async () => {
    const user = userEvent.setup();
    renderUi(<TabFixture />);

    screen.getByRole('tab', {name: 'Open'}).focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', {name: 'Merged'})).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('selects a tab on click', async () => {
    const user = userEvent.setup();
    renderUi(<TabFixture />);

    await user.click(screen.getByRole('tab', {name: 'Merged'}));

    expect(screen.getByRole('tab', {name: 'Merged'})).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('skips a disabled tab', () => {
    renderUi(<TabFixture />);

    expect(screen.getByRole('tab', {name: 'Closed'})).toBeDisabled();
  });
});
