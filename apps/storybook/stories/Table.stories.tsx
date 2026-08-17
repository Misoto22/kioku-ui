import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  Badge,
  Card,
  Link,
  Table,
  TableBody as TableBodyComponent,
  TableCaption as TableCaptionComponent,
  TableCell as TableCellComponent,
  TableHead as TableHeadComponent,
  TableHeaderCell as TableHeaderCellComponent,
  TableRow as TableRowComponent,
  type TableDensity,
  type TableDividers,
} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Table',
  component: Table,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

interface TableExampleProps {
  readonly density?: TableDensity;
  readonly dividers?: TableDividers;
  readonly focus?: 'body' | 'caption' | 'cell' | 'head' | 'headerCell' | 'row';
}

function TableExample({density, dividers, focus}: TableExampleProps) {
  return (
    <DemoFrame>
      <Card>
        <Table density={density} dividers={dividers}>
          <TableCaptionComponent>
            {focus === 'caption'
              ? 'Caption — upcoming delivery activity'
              : 'Upcoming delivery activity'}
          </TableCaptionComponent>
          <TableHeadComponent>
            <TableRowComponent>
              <TableHeaderCellComponent>
                {focus === 'headerCell'
                  ? 'Header cell — Delivery'
                  : focus === 'head'
                    ? 'Table head — Delivery'
                    : 'Delivery'}
              </TableHeaderCellComponent>
              <TableHeaderCellComponent>Status</TableHeaderCellComponent>
              <TableHeaderCellComponent>Owner</TableHeaderCellComponent>
            </TableRowComponent>
          </TableHeadComponent>
          <TableBodyComponent>
            <TableRowComponent>
              <TableCellComponent>
                {focus === 'cell'
                  ? 'Cell — North region'
                  : focus === 'body'
                    ? 'Table body — North region'
                    : 'North region'}
              </TableCellComponent>
              <TableCellComponent>
                <Badge tone="success">Ready</Badge>
              </TableCellComponent>
              <TableCellComponent>
                <Link href="/owners/operations">Operations</Link>
              </TableCellComponent>
            </TableRowComponent>
            <TableRowComponent>
              <TableCellComponent>
                {focus === 'row' ? 'Row — Central region' : 'Central region'}
              </TableCellComponent>
              <TableCellComponent>
                <Badge tone="warning">Review</Badge>
              </TableCellComponent>
              <TableCellComponent>
                <Link href="/owners/support">Support</Link>
              </TableCellComponent>
            </TableRowComponent>
          </TableBodyComponent>
        </Table>
      </Card>
    </DemoFrame>
  );
}

export const Default: Story = {render: () => <TableExample />};

export const Densities: Story = {
  render: () => (
    <StateGrid
      items={[
        {label: 'Compact', content: <TableExample density="compact" />},
        {label: 'Default', content: <TableExample />},
        {label: 'Spacious', content: <TableExample density="spacious" />},
      ]}
    />
  ),
};

export const Dividers: Story = {
  render: () => (
    <StateGrid
      items={[
        {label: 'Rows', content: <TableExample dividers="rows" />},
        {label: 'Columns', content: <TableExample dividers="columns" />},
        {label: 'Grid', content: <TableExample dividers="grid" />},
        {label: 'None', content: <TableExample dividers="none" />},
      ]}
    />
  ),
};

export const States: Story = {
  render: () => <TableExample focus="row" />,
};

export const TableCaption: Story = {
  render: () => <TableExample focus="caption" />,
};
export const TableHead: Story = {render: () => <TableExample focus="head" />};
export const TableBody: Story = {render: () => <TableExample focus="body" />};
export const TableRow: Story = {render: () => <TableExample focus="row" />};
export const TableHeaderCell: Story = {
  render: () => <TableExample focus="headerCell" />,
};
export const TableCell: Story = {render: () => <TableExample focus="cell" />};

export const Composition: Story = {
  render: () => <TableExample density="spacious" dividers="rows" />,
};
