import type {CSSProperties} from 'react';

import {
  Badge,
  Card,
  DropdownMenuItem,
  HStack,
  MoreMenu,
  Numeral,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Timestamp,
} from '@misoto22/kioku-ui';

// `Numeral` sets the face; the caption beside it is a title, so the count
// drops to the smallest size and the third rank of ink rather than competing
// with the words it qualifies.
const rowCount: CSSProperties = {
  color: 'var(--kioku-ui-color-text-muted)',
  fontSize: 'var(--kioku-ui-typography-font-size-xs)',
};

interface Row {
  readonly id: string;
  readonly owner: string;
  readonly status: 'open' | 'published' | 'review';
  readonly title: string;
  readonly updated: string;
}

interface DataTableProps {
  readonly caption: string;
  readonly rows: readonly Row[];
}

const tones = {
  open: 'info',
  published: 'success',
  review: 'warning',
} as const;

/**
 * A table of records with a status column and per-row actions.
 *
 * The caption carries the count beside it: a ledger says how long it is before
 * the reader starts counting rows. Column headers are eyebrows and the row
 * rules do the separating, both of which the `Table` primitives already draw —
 * this block only supplies the data and the actions.
 */
export function DataTable({caption, rows}: DataTableProps) {
  return (
    <Card>
      <Table>
        <TableCaption>
          <HStack align="baseline" gap="md" justify="between">
            <span>{caption}</span>
            <span style={rowCount}>
              <Numeral>
                {rows.length === 1 ? '1 row' : `${rows.length} rows`}
              </Numeral>
            </span>
          </HStack>
        </TableCaption>
        <TableHead>
          <TableRow>
            <TableHeaderCell scope="col">Title</TableHeaderCell>
            <TableHeaderCell scope="col">Owner</TableHeaderCell>
            <TableHeaderCell scope="col">Status</TableHeaderCell>
            <TableHeaderCell scope="col">Updated</TableHeaderCell>
            <TableHeaderCell scope="col">Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.title}</TableCell>
              <TableCell>{row.owner}</TableCell>
              <TableCell>
                <Badge tone={tones[row.status]}>{row.status}</Badge>
              </TableCell>
              <TableCell>
                <Timestamp value={row.updated} />
              </TableCell>
              <TableCell>
                <MoreMenu alignment="end" label={`Actions for ${row.title}`}>
                  <DropdownMenuItem>Open</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem>Archive</DropdownMenuItem>
                </MoreMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
