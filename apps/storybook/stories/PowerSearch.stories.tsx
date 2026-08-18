import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {PowerSearch, Stack, Text, type SearchFilter} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-power-search',
  title: 'Core/PowerSearch',
  component: PowerSearch,
  args: {label: '', onSearch: () => {}},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof PowerSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

function PowerSearchDemo() {
  const [filters, setFilters] = useState<readonly SearchFilter[]>([
    {id: 'open', label: 'Status: open'},
    {id: 'mine', label: 'Owner: me'},
  ]);
  const [query, setQuery] = useState('');

  return (
    <Stack gap="sm">
      <PowerSearch
        filters={filters}
        label="Search releases"
        onFiltersChange={setFilters}
        onSearch={setQuery}
        placeholder="Search releases"
      />
      {query === '' ? null : (
        <Text size="sm" tone="secondary">
          Searched for: {query}
        </Text>
      )}
    </Stack>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <PowerSearch
        {...args}
        label="Search releases"
        placeholder="Search releases"
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <PowerSearchDemo />
        <Text size="sm" tone="muted">
          Each narrowing is visible and removable, so a short result set never
          looks like a bug.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
