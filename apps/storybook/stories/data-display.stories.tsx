import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  Alert as AlertComponent,
  AsyncState as AsyncStateComponent,
  Button as ButtonComponent,
  EmptyState as EmptyStateComponent,
  MetricGrid as MetricGridComponent,
  Skeleton as SkeletonComponent,
  Spinner as SpinnerComponent,
  Table as TableComponent,
  TableBody as TableBodyComponent,
  TableCaption as TableCaptionComponent,
  TableCell as TableCellComponent,
  TableHead as TableHeadComponent,
  TableHeaderCell as TableHeaderCellComponent,
  TableRow as TableRowComponent,
} from '@misoto22/kioku-ui';

const meta = {
  title: 'Data Display',
  component: EmptyStateComponent,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const EmptyState: Story = {
  render: () => (
    <EmptyStateComponent
      action={<ButtonComponent>Change view</ButtonComponent>}
      detail="Try another set of options."
      title="No results"
    />
  ),
};

export const AsyncState: Story = {
  render: () => (
    <AsyncStateComponent state={{kind: 'loading', label: 'Loading items'}} />
  ),
};

export const Spinner: Story = {
  render: () => <SpinnerComponent label="Loading items" />,
};

export const Skeleton: Story = {
  render: () => <SkeletonComponent label="Loading summary" />,
};

export const Alert: Story = {
  render: () => (
    <AlertComponent tone="warning">Review this value.</AlertComponent>
  ),
};

export const Table: Story = {
  render: () => (
    <TableComponent>
      <TableCaptionComponent>Example values</TableCaptionComponent>
      <TableHeadComponent>
        <TableRowComponent>
          <TableHeaderCellComponent>Label</TableHeaderCellComponent>
          <TableHeaderCellComponent>Value</TableHeaderCellComponent>
        </TableRowComponent>
      </TableHeadComponent>
      <TableBodyComponent>
        <TableRowComponent>
          <TableCellComponent>Alpha</TableCellComponent>
          <TableCellComponent>24</TableCellComponent>
        </TableRowComponent>
      </TableBodyComponent>
    </TableComponent>
  ),
};

function TableFixture() {
  return (
    <TableComponent>
      <TableCaptionComponent>Example values</TableCaptionComponent>
      <TableHeadComponent>
        <TableRowComponent>
          <TableHeaderCellComponent>Label</TableHeaderCellComponent>
          <TableHeaderCellComponent>Value</TableHeaderCellComponent>
        </TableRowComponent>
      </TableHeadComponent>
      <TableBodyComponent>
        <TableRowComponent>
          <TableCellComponent>Alpha</TableCellComponent>
          <TableCellComponent>24</TableCellComponent>
        </TableRowComponent>
      </TableBodyComponent>
    </TableComponent>
  );
}

export const TableCaption: Story = {render: () => <TableFixture />};
export const TableHead: Story = {render: () => <TableFixture />};
export const TableBody: Story = {render: () => <TableFixture />};
export const TableRow: Story = {render: () => <TableFixture />};
export const TableHeaderCell: Story = {render: () => <TableFixture />};
export const TableCell: Story = {render: () => <TableFixture />};

export const MetricGrid: Story = {
  render: () => (
    <MetricGridComponent
      items={[
        {detail: 'Updated recently', label: 'First metric', value: '24'},
        {label: 'Second metric', value: '18%'},
      ]}
    />
  ),
};
