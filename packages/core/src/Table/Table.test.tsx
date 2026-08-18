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

import {
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

describe('Table', () => {
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
});
