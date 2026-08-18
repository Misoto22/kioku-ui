import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Heading, Text, VStack} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-v-stack',
  title: 'Core/VStack',
  component: VStack,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof VStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <VStack {...args}>
        <Text>Draft the release notes</Text>
        <Text>Review the accessibility baseline</Text>
      </VStack>
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <VStack gap="sm">
          <Heading level={2} size="subsection">
            Release 12
          </Heading>
          <Text tone="secondary">Twelve changes are ready to review.</Text>
        </VStack>
      </Card>
    </DemoFrame>
  ),
};
