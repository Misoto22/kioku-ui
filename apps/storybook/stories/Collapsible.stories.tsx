import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Collapsible, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Collapsible',
  component: Collapsible,
  args: {children: null, label: ''},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Collapsible {...args} label="Advanced settings">
        <Text>Nothing here needs changing for a normal release.</Text>
      </Collapsible>
    </DemoFrame>
  ),
};

export const States: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {
            label: 'folded',
            content: (
              <Collapsible label="Advanced settings">
                <Text>Hidden until asked for.</Text>
              </Collapsible>
            ),
          },
          {
            label: 'open',
            content: (
              <Collapsible defaultOpen label="Advanced settings">
                <Text>Shown from the start.</Text>
              </Collapsible>
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
        <Stack gap="sm">
          <Collapsible defaultOpen label="Release notes">
            <Text>Twelve changes are ready to review.</Text>
          </Collapsible>
          <Collapsible label="Advanced settings">
            <Text>
              The panel stays in the DOM, so find-in-page still works.
            </Text>
          </Collapsible>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
