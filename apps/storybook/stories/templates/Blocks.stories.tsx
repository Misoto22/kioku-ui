import type {Meta, StoryObj} from '@storybook/react-vite';

import {Button, Card, Stack} from '@misoto22/kioku-ui';

import {DataTable} from '../../../../packages/cli/assets/templates/blocks/components/data-table/DataTable';
import {ResultsEmptyState} from '../../../../packages/cli/assets/templates/blocks/components/empty-state/ResultsEmptyState';
import {PageHeader} from '../../../../packages/cli/assets/templates/blocks/components/page-header/PageHeader';

const meta = {
  id: 'templates-blocks',
  title: 'Templates/Blocks',
  parameters: {layout: 'padded'},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
  {
    id: '12',
    owner: 'Ada Lovelace',
    status: 'open' as const,
    title: 'Release 12',
    updated: '2026-08-18T09:30:00Z',
  },
  {
    id: '11',
    owner: 'Grace Hopper',
    status: 'review' as const,
    title: 'Release 11',
    updated: '2026-08-17T16:05:00Z',
  },
  {
    id: '10',
    owner: 'Alan Turing',
    status: 'published' as const,
    title: 'Release 10',
    updated: '2026-08-16T11:20:00Z',
  },
];

export const PageHeaderBlock: Story = {
  render: () => (
    <PageHeader
      actions={<Button>Publish</Button>}
      breadcrumbs={[{href: '/', label: 'Home'}, {label: 'Release 12'}]}
      description="Twelve changes are ready to review."
      title="Release 12"
    />
  ),
};

export const DataTableBlock: Story = {
  render: () => <DataTable caption="Recent releases" rows={rows} />,
};

export const EmptyStateBlock: Story = {
  render: () => (
    <Stack gap="lg">
      <ResultsEmptyState />
      <ResultsEmptyState searched />
    </Stack>
  ),
};

export const Composed: Story = {
  render: () => (
    <Stack gap="lg">
      <PageHeader
        actions={<Button>Publish</Button>}
        description="Twelve changes are ready to review."
        title="Releases"
      />
      <DataTable caption="Recent releases" rows={rows} />
      <Card>
        <ResultsEmptyState searched />
      </Card>
    </Stack>
  ),
};
