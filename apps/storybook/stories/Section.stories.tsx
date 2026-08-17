import type {Meta, StoryObj} from '@storybook/react-vite';

import {Card, Heading, Section, Stack, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Section',
  component: Section,
  argTypes: {
    padding: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
  },
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

function SectionContent({title}: {readonly title: string}) {
  return (
    <Card>
      <Stack gap="xs">
        <Heading level={2} size="subsection">
          {title}
        </Heading>
        <Text tone="secondary">
          Supporting workspace information appears here.
        </Text>
      </Stack>
    </Card>
  );
}

export const Default: Story = {
  args: {
    'aria-label': 'Delivery overview',
    children: <SectionContent title="Delivery overview" />,
    padding: 'xl',
  },
  render: (args) => (
    <DemoFrame>
      <Section {...args} />
    </DemoFrame>
  ),
};

export const Variants: Story = {
  render: () => (
    <StateGrid
      items={[
        {
          label: 'Small block padding',
          content: (
            <Section aria-label="Compact activity" padding="sm">
              <SectionContent title="Compact activity" />
            </Section>
          ),
        },
        {
          label: 'Default block padding',
          content: (
            <Section aria-label="Workspace activity">
              <SectionContent title="Workspace activity" />
            </Section>
          ),
        },
        {
          label: 'Large block padding',
          content: (
            <Section aria-label="Focused review" padding="2xl">
              <SectionContent title="Focused review" />
            </Section>
          ),
        },
      ]}
    />
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Section aria-labelledby="delivery-heading">
        <Stack gap="lg">
          <Stack gap="xs">
            <Heading id="delivery-heading" level={2}>
              Upcoming deliveries
            </Heading>
            <Text tone="secondary">Plan work across the next seven days.</Text>
          </Stack>
          <SectionContent title="North region" />
        </Stack>
      </Section>
    </DemoFrame>
  ),
};
