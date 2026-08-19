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
  args: {density: 'default', dividers: 'rows'},
  argTypes: {
    density: {
      control: 'select',
      options: ['compact', 'default', 'spacious'],
    },
    dividers: {
      control: 'select',
      options: ['rows', 'columns', 'grid', 'none'],
    },
  },
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

interface TableExampleProps {
  readonly density?: TableDensity;
  readonly dividers?: TableDividers;
  readonly focus?: 'body' | 'caption' | 'cell' | 'head' | 'headerCell' | 'row';
  readonly states?: boolean;
}

function TableExample({density, dividers, focus, states}: TableExampleProps) {
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
              <TableHeaderCellComponent numeric>Units</TableHeaderCellComponent>
            </TableRowComponent>
          </TableHeadComponent>
          <TableBodyComponent>
            <TableRowComponent data-story-state={states ? 'rest' : undefined}>
              <TableCellComponent>
                {states
                  ? 'Rest — North region'
                  : focus === 'cell'
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
              <TableCellComponent numeric>1,248</TableCellComponent>
            </TableRowComponent>
            <TableRowComponent data-story-state={states ? 'focus' : undefined}>
              <TableCellComponent>
                {states
                  ? 'Focus within — Central region'
                  : focus === 'row'
                    ? 'Row — Central region'
                    : 'Central region'}
              </TableCellComponent>
              <TableCellComponent>
                <Badge tone="warning">Review</Badge>
              </TableCellComponent>
              <TableCellComponent>
                <Link href="/owners/support">Support</Link>
              </TableCellComponent>
              <TableCellComponent numeric>96</TableCellComponent>
            </TableRowComponent>
            {states ? (
              <>
                <TableRowComponent data-story-state="hover">
                  <TableCellComponent>Hover — South region</TableCellComponent>
                  <TableCellComponent>
                    <Badge tone="info">Scheduled</Badge>
                  </TableCellComponent>
                  <TableCellComponent>
                    <Link href="/owners/planning">Planning</Link>
                  </TableCellComponent>
                  <TableCellComponent numeric>7,310</TableCellComponent>
                </TableRowComponent>
                <TableRowComponent data-story-state="active">
                  <TableCellComponent>Active — West region</TableCellComponent>
                  <TableCellComponent>
                    <Badge tone="warning">Review</Badge>
                  </TableCellComponent>
                  <TableCellComponent>
                    <Link
                      href="/owners/review"
                      onMouseDown={(event) => event.preventDefault()}
                    >
                      Review team
                    </Link>
                  </TableCellComponent>
                  <TableCellComponent numeric>412</TableCellComponent>
                </TableRowComponent>
              </>
            ) : null}
          </TableBodyComponent>
        </Table>
      </Card>
    </DemoFrame>
  );
}

export const Default: Story = {render: (args) => <TableExample {...args} />};

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
  render: () => <TableExample states />,
  play: async ({canvasElement, userEvent}) => {
    const focusTarget = canvasElement.querySelector<HTMLElement>(
      '[data-story-state="focus"] a',
    );
    const activeTarget = canvasElement.querySelector<HTMLElement>(
      '[data-story-state="active"] a',
    );
    const hoverTarget = canvasElement.querySelector<HTMLElement>(
      '[data-story-state="hover"] a',
    );
    if (!focusTarget || !activeTarget || !hoverTarget) {
      throw new Error('Table state targets are missing');
    }

    focusTarget.focus();
    await userEvent.pointer({keys: '[MouseLeft>]', target: activeTarget});
    await userEvent.hover(hoverTarget);
  },
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
