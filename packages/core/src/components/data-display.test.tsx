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

import {
  Alert,
  AsyncState,
  Button,
  EmptyState,
  MetricGrid,
  Skeleton,
  Spinner,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from './index.js';

afterEach(() => {
  cleanup();
});

describe('async feedback', () => {
  it('does not represent a failed request as an empty result', () => {
    renderUi(<AsyncState state={{kind: 'error', title: 'Request failed'}} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Request failed');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('renders progress and loading feedback with accessible state', () => {
    renderUi(<Spinner label="Loading records" />);

    const status = screen.getByRole('status', {
      name: 'Loading records',
    });
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status.firstElementChild).toHaveAttribute('aria-hidden', 'true');
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

function ReadyAsyncStateTypeProbe() {
  // @ts-expect-error A ready AsyncState requires a child renderer.
  return <AsyncState state={{kind: 'ready', data: 3}} />;
}

void ReadyAsyncStateTypeProbe;

describe('live feedback', () => {
  it('uses assertive alert semantics only for danger feedback', () => {
    renderUi(
      <>
        <Alert tone="info">Saved for later</Alert>
        <Alert tone="danger">Could not save</Alert>
      </>,
    );

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });

  it('keeps decorative skeletons hidden and labels announced loading placeholders', () => {
    renderUi(
      <>
        <Skeleton data-testid="decorative" />
        <Skeleton label="Loading summary" />
      </>,
    );

    expect(screen.getByTestId('decorative')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(
      screen.getByRole('status', {name: 'Loading summary'}),
    ).toHaveAttribute('aria-busy', 'true');
  });

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

describe('semantic data display', () => {
  it('renders table primitives with native caption, header, row, and cell semantics', () => {
    renderUi(
      <Table>
        <TableCaption>Example values</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Value</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Alpha</TableCell>
            <TableCell>12</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const table = screen.getByRole('table', {name: 'Example values'});
    expect(table).toBeVisible();
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getAllByRole('cell')).toHaveLength(2);
  });

  it('keeps Table density and divider policy out of native table markup', () => {
    renderUi(
      <>
        <Table density="compact" dividers="grid">
          <TableBody>
            <TableRow>
              <TableCell>Queued</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Table density="spacious" dividers="none">
          <TableBody>
            <TableRow>
              <TableCell>Completed</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </>,
    );

    const tables = screen.getAllByRole('table');
    expect(tables).toHaveLength(2);
    for (const table of tables) {
      expect(table).not.toHaveAttribute('density');
      expect(table).not.toHaveAttribute('dividers');
    }
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getAllByRole('cell')).toHaveLength(2);
    expect(screen.getByText('Queued').tagName).toBe('TD');
    expect(screen.getByText('Completed').tagName).toBe('TD');
  });

  it('keeps native definition-list groups without overriding their semantics', () => {
    const {container} = renderUi(
      <MetricGrid
        items={[
          {detail: 'Updated recently', label: 'First metric', value: '24'},
          {label: 'Second metric', value: '18%'},
        ]}
      />,
    );

    const list = container.querySelector('dl');
    expect(list).not.toBeNull();
    expect(list).not.toHaveAttribute('role');
    expect([...list!.children].map(({tagName}) => tagName)).toEqual([
      'DIV',
      'DIV',
    ]);
    expect(
      [...list!.children].map((group) => group.getAttribute('role')),
    ).toEqual([null, null]);
    expect(
      [...list!.children].map((group) =>
        [...group.children].map(({tagName}) => tagName),
      ),
    ).toEqual([
      ['DT', 'DD', 'DD'],
      ['DT', 'DD'],
    ]);
    expect(screen.getByText('First metric').tagName).toBe('DT');
    expect(screen.getByText('24').tagName).toBe('DD');
    expect(screen.getByText('Updated recently')).toBeVisible();
  });
});
