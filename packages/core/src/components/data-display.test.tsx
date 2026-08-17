// @vitest-environment happy-dom

import {cleanup, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {userEvent} from '@testing-library/user-event';
import {afterEach, describe, expect, it, vi} from 'vitest';

vi.mock('@stylexjs/stylex', () => ({
  create: <Styles,>(styles: Styles) => styles,
  defineVars: <Vars,>(variables: Vars) => variables,
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
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders progress and loading feedback with accessible state', () => {
    renderUi(<Spinner label="Loading records" />);

    expect(
      screen.getByRole('status', {name: 'Loading records'}),
    ).toHaveAttribute('aria-busy', 'true');
  });

  it('maps loading, empty, and ready async states to distinct content', () => {
    const {rerender} = renderUi(
      <AsyncState state={{kind: 'loading', label: 'Loading items'}} />,
    );
    expect(screen.getByRole('status', {name: 'Loading items'})).toBeVisible();

    rerender(
      <AsyncState
        state={{
          kind: 'empty',
          title: 'Nothing here',
          detail: 'Try another view',
        }}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Nothing here');
    expect(screen.getByRole('status')).toHaveTextContent('Try another view');

    rerender(
      <AsyncState state={{kind: 'ready', data: 3}}>
        {(count) => <p>{count} items</p>}
      </AsyncState>,
    );
    expect(screen.getByText('3 items')).toBeVisible();
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
});

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

  it('renders metric labels and values as a description list', () => {
    renderUi(
      <MetricGrid
        items={[
          {detail: 'Updated recently', label: 'First metric', value: '24'},
          {label: 'Second metric', value: '18%'},
        ]}
      />,
    );

    const list = screen.getByRole('list');
    expect(list.tagName).toBe('DL');
    expect(screen.getByText('First metric').tagName).toBe('DT');
    expect(screen.getByText('24').tagName).toBe('DD');
    expect(screen.getByText('Updated recently')).toBeVisible();
  });
});
