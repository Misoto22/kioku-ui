import {
  Badge,
  Card,
  DropdownMenuItem,
  MoreMenu,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Timestamp,
} from '@misoto22/kioku-ui';

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

/** A table of records with a status column and per-row actions. */
export function DataTable({caption, rows}: DataTableProps) {
  return (
    <Card>
      <Table>
        <TableCaption>{caption}</TableCaption>
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
                <MoreMenu label={`Actions for ${row.title}`}>
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
