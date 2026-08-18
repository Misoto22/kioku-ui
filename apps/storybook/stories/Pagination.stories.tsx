import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {Pagination, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Pagination',
  component: Pagination,
  args: {onChange: () => {}, page: 1, pageCount: 1},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

function PaginationDemo({
  initialPage = 3,
  pageCount = 9,
  ...paginationProps
}: {readonly initialPage?: number} & Partial<
  Parameters<typeof Pagination>[0]
>) {
  const [page, setPage] = useState(initialPage);

  return (
    <Pagination
      {...paginationProps}
      onChange={setPage}
      page={page}
      pageCount={pageCount}
    />
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <PaginationDemo {...args} />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {label: 'first page', content: <PaginationDemo initialPage={1} />},
          {label: 'middle', content: <PaginationDemo initialPage={5} />},
          {label: 'last page', content: <PaginationDemo initialPage={9} />},
          {
            label: 'many pages',
            content: <PaginationDemo initialPage={12} pageCount={40} />,
          },
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack align="center" gap="sm">
        <Text tone="secondary">Showing 41–60 of 180 releases</Text>
        <PaginationDemo />
      </Stack>
    </DemoFrame>
  ),
};
