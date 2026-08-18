import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {Card, Stack, TabList, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  id: 'core-tab-list',
  title: 'Core/TabList',
  component: TabList,
  args: {label: '', onSelect: () => {}, selectedId: 'open', tabs: []},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof TabList>;

export default meta;
type Story = StoryObj<typeof meta>;

const tabs = [
  {id: 'open', label: 'Open'},
  {id: 'merged', label: 'Merged'},
  {id: 'closed', label: 'Closed'},
];

function TabDemo({...tabProps}: Partial<Parameters<typeof TabList>[0]>) {
  const [selectedId, setSelectedId] = useState('open');

  return (
    <TabList
      {...tabProps}
      label="Release views"
      onSelect={setSelectedId}
      selectedId={selectedId}
      tabs={tabProps.tabs?.length ? tabProps.tabs : tabs}
    />
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <TabDemo {...args} />
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {label: 'default', content: <TabDemo />},
          {
            label: 'with a disabled tab',
            content: (
              <TabDemo
                tabs={[...tabs, {id: 'draft', label: 'Draft', disabled: true}]}
              />
            ),
          },
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <Stack gap="md">
          <TabDemo />
          <Text tone="secondary">
            The strip is one tab stop; arrow keys move between tabs and
            selection follows focus.
          </Text>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
