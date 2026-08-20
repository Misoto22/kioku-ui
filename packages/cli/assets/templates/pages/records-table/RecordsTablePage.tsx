import {useState} from 'react';

import {
  Badge,
  Button,
  Card,
  HStack,
  Heading,
  Numeral,
  Pagination,
  PowerSearch,
  SegmentedControl,
  Stack,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
} from '@misoto22/kioku-ui';

// A page of records, which is a different job from a dashboard: the reader
// arrives knowing what they are looking for. So the narrowing sits above the
// data — a query, the filters already applied, and the period — and the table
// gets the rest of the page. Figures are end-aligned and tabular so a column
// of them reads as a column.

interface Record {
  readonly account: string;
  readonly amount: string;
  readonly category: string;
  readonly date: string;
  readonly merchant: string;
  readonly settled: boolean;
}

const records: readonly Record[] = [
  {
    account: 'Everyday',
    amount: '−23.50',
    category: 'Food',
    date: '08-19',
    merchant: 'Corner store',
    settled: true,
  },
  {
    account: 'Card ····6021',
    amount: '−58.00',
    category: 'Subscriptions',
    date: '08-18',
    merchant: 'Streaming service',
    settled: true,
  },
  {
    account: 'Everyday',
    amount: '−42.00',
    category: 'Transport',
    date: '08-18',
    merchant: 'Transit top-up',
    settled: false,
  },
  {
    account: 'Savings',
    amount: '+1,400.00',
    category: 'Income',
    date: '08-15',
    merchant: 'Payroll',
    settled: true,
  },
];

const periods = [
  {label: '30 days', value: 'recent'},
  {label: 'Quarter', value: 'quarter'},
  {label: 'Year', value: 'year'},
  {label: 'All', value: 'all'},
] as const;

export function RecordsTablePage() {
  const [period, setPeriod] = useState<string>('recent');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState([
    {id: 'account', label: 'Account · Everyday'},
  ]);

  return (
    <Stack gap="xl">
      <HStack align="baseline" justify="between">
        <HStack align="baseline" gap="sm">
          <Heading level={1} size="page">
            Records
          </Heading>
          <Numeral>128</Numeral>
        </HStack>
        <Button size="sm">Add record</Button>
      </HStack>

      {/*
        The query and the filters are one control, not two rows: a reader who
        cannot see which narrowings are already applied cannot tell a short
        result set from an empty one.
      */}
      <PowerSearch
        filters={filters}
        label="Search records"
        onFiltersChange={(next) => setFilters([...next])}
        onSearch={() => undefined}
        placeholder="Merchant or note"
      />

      <SegmentedControl
        aria-label="Period"
        onValueChange={setPeriod}
        options={periods.map((entry) => ({
          label: entry.label,
          value: entry.value,
        }))}
        value={period}
      />

      <Card>
        <Table dividers="rows">
          <TableCaption>Recent activity</TableCaption>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Merchant</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Account</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell numeric>Amount</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={`${record.date}-${record.merchant}`}>
                <TableCell numeric>{record.date}</TableCell>
                <TableCell>{record.merchant}</TableCell>
                <TableCell>
                  <Text tone="muted">{record.category}</Text>
                </TableCell>
                <TableCell>
                  <Text tone="muted">{record.account}</Text>
                </TableCell>
                <TableCell>
                  {record.settled ? (
                    <Badge tone="neutral">Settled</Badge>
                  ) : (
                    <Badge tone="warning">Needs review</Badge>
                  )}
                </TableCell>
                <TableCell numeric>{record.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Pagination onChange={setPage} page={page} pageCount={9} />
    </Stack>
  );
}
