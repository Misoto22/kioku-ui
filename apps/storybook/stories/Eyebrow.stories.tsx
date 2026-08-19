import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  Card,
  CardHeader,
  Eyebrow,
  HStack,
  Heading,
  Item,
  List,
  ListItem,
  Stack,
  Timestamp,
} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Eyebrow',
  component: Eyebrow,
  argTypes: {
    tone: {control: 'select', options: ['secondary', 'muted', 'danger']},
  },
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Eyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Eyebrow {...args}>Recent activity</Eyebrow>
    </DemoFrame>
  ),
};

export const Tones: Story = {
  render: () => (
    <StateGrid
      items={[
        {label: 'Secondary', content: <Eyebrow>Workspace</Eyebrow>},
        {label: 'Muted', content: <Eyebrow tone="muted">Owner</Eyebrow>},
        {
          label: 'Danger',
          content: <Eyebrow tone="danger">Danger zone</Eyebrow>,
        },
      ]}
    />
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <CardHeader>
          <HStack align="baseline" gap="md" justify="between">
            <Stack gap="xs">
              <Eyebrow>Recent activity</Eyebrow>
              <Heading level={2} size="subsection">
                Releases updated this month
              </Heading>
            </Stack>
            <Eyebrow tone="muted">Sorted by updated</Eyebrow>
          </HStack>
        </CardHeader>
        <List gap="md" variant="plain">
          <ListItem>
            <Item
              description="Ada Lovelace asked for review"
              trailing={<Timestamp value="2026-08-18T09:30:00" />}
            >
              Ledger export
            </Item>
          </ListItem>
          <ListItem>
            <Item
              description="Grace Hopper asked for review"
              trailing={<Timestamp value="2026-08-17T16:05:00" />}
            >
              Invoice reconciliation
            </Item>
          </ListItem>
        </List>
      </Card>
    </DemoFrame>
  ),
};
