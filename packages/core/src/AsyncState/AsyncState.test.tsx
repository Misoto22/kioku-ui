// @vitest-environment jsdom

import {cleanup, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {userEvent} from '@testing-library/user-event';
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

import {AsyncState} from './index.js';
import {Button} from '../Button/index.js';
import {EmptyState} from '../EmptyState/index.js';

afterEach(() => {
  cleanup();
});

describe('AsyncState', () => {
  it('does not represent a failed request as an empty result', () => {
    renderUi(<AsyncState state={{kind: 'error', title: 'Request failed'}} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Request failed');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
  it('maps loading, empty, and ready async states to distinct content', () => {
    const {rerender} = renderUi(
      <AsyncState state={{kind: 'loading', label: 'Loading items'}} />,
    );
    const liveRegion = screen.getByRole('status', {name: 'Loading items'});
    expect(liveRegion).toBeVisible();

    rerender(
      <AsyncState
        state={{
          kind: 'empty',
          title: 'Nothing here',
          detail: 'Try another view',
        }}
      />,
    );
    expect(screen.getByRole('status')).toBe(liveRegion);
    expect(liveRegion).toHaveTextContent('Nothing here');
    expect(liveRegion).toHaveTextContent('Try another view');

    rerender(
      <AsyncState state={{kind: 'ready', data: 3}}>
        {(count) => <p>{count} items</p>}
      </AsyncState>,
    );
    expect(screen.getByRole('status')).toBe(liveRegion);
    expect(screen.getByText('3 items')).toBeVisible();
  });
  it('rejects a ready state that has no data renderer', () => {
    expect(() =>
      renderUi(
        <AsyncState
          {...({state: {kind: 'ready', data: 3}} as unknown as Parameters<
            typeof AsyncState
          >[0])}
        />,
      ),
    ).toThrow('AsyncState requires a renderer for ready data');
  });
  it('renders empty-state and error recovery actions as real buttons', async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    const {rerender} = renderUi(
      <EmptyState
        action={<Button>Change filters</Button>}
        title="No matches"
      />,
    );
    expect(screen.getByRole('button', {name: 'Change filters'})).toBeEnabled();

    rerender(
      <AsyncState
        state={{
          kind: 'error',
          retry: <Button onClick={retry}>Try again</Button>,
          title: 'Unable to load',
        }}
      />,
    );
    await user.click(screen.getByRole('button', {name: 'Try again'}));
    expect(retry).toHaveBeenCalledOnce();
  });
  it('keeps one persistent polite region when AsyncState renders an empty result', () => {
    const {rerender} = renderUi(
      <AsyncState state={{kind: 'loading', label: 'Loading saved views'}} />,
    );
    const liveRegion = screen.getByRole('status', {
      name: 'Loading saved views',
    });

    rerender(
      <AsyncState
        state={{
          kind: 'empty',
          title: 'No saved views',
          detail: 'Save a view to return to it later.',
        }}
      />,
    );

    expect(screen.getAllByRole('status')).toEqual([liveRegion]);
    expect(liveRegion.querySelector('[aria-live]')).toBeNull();
    expect(liveRegion).toHaveTextContent('No saved views');
  });
});
