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

import {BottomSheetSwitcher, type BottomSheetSwitcherView} from './index.js';

const shareViews: readonly BottomSheetSwitcherView[] = [
  {
    content: <p>Anyone with the link can view.</p>,
    id: 'share',
    title: 'Share release',
  },
  {
    content: <p>Dana Okoye can edit.</p>,
    id: 'people',
    parentId: 'share',
    title: 'People with access',
  },
];

afterEach(() => {
  cleanup();
});

describe('BottomSheetSwitcher', () => {
  it('renders nothing while closed', () => {
    renderUi(<BottomSheetSwitcher open={false} views={shareViews} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('names the sheet with the view it is showing', () => {
    renderUi(<BottomSheetSwitcher open views={shareViews} />);

    expect(screen.getByRole('dialog', {name: 'Share release'})).toBeVisible();
    expect(
      screen.queryByRole('button', {name: 'Back'}),
    ).not.toBeInTheDocument();
  });

  it('walks back to the parent and lands focus on its heading', async () => {
    const user = userEvent.setup();
    renderUi(
      <BottomSheetSwitcher defaultViewId="people" open views={shareViews} />,
    );

    expect(screen.getByText('Dana Okoye can edit.')).toBeVisible();

    await user.click(screen.getByRole('button', {name: 'Back'}));

    expect(screen.getByRole('dialog', {name: 'Share release'})).toBeVisible();
    expect(screen.getByText('Anyone with the link can view.')).toBeVisible();
    expect(document.activeElement).toHaveTextContent('Share release');
  });

  it('leaves a controlled switcher for its owner to move', async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();
    const {rerender} = renderUi(
      <BottomSheetSwitcher
        onViewChange={onViewChange}
        open
        viewId="people"
        views={shareViews}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Back'}));

    expect(onViewChange).toHaveBeenCalledWith('share');
    expect(
      screen.getByRole('dialog', {name: 'People with access'}),
    ).toBeVisible();

    rerender(
      <BottomSheetSwitcher
        onViewChange={onViewChange}
        open
        viewId="share"
        views={shareViews}
      />,
    );

    expect(document.activeElement).toHaveTextContent('Share release');
  });

  it('renames the back control when a caller supplies its own word', () => {
    renderUi(
      <BottomSheetSwitcher
        backLabel="Back to share"
        defaultViewId="people"
        open
        views={shareViews}
      />,
    );

    expect(
      screen.getByRole('button', {name: 'Back to share'}),
    ).toBeInTheDocument();
  });

  it('refuses to render without a view to show', () => {
    expect(() => {
      renderUi(<BottomSheetSwitcher open views={[]} />);
    }).toThrow('BottomSheetSwitcher requires at least one view');
  });
});
