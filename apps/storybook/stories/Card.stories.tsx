import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  Button,
  Card,
  CardFooter as CardFooterComponent,
  CardHeader as CardHeaderComponent,
  Heading,
  Stack,
  Text,
  type CardElevation,
} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/Card',
  component: Card,
  args: {elevation: 'none'},
  argTypes: {
    elevation: {control: 'select', options: ['none', 'low', 'medium']},
  },
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

interface CardExampleProps {
  readonly elevation?: CardElevation;
  readonly focus?: 'footer' | 'header';
}

function CardExample({elevation, focus}: CardExampleProps) {
  return (
    <DemoFrame>
      <Card elevation={elevation}>
        <CardHeaderComponent>
          <Stack gap="xs">
            <Heading level={2} size="subsection">
              {focus === 'header'
                ? 'Card header — Workspace access'
                : 'Workspace access'}
            </Heading>
            <Text tone="secondary">
              Review membership before publishing changes.
            </Text>
          </Stack>
        </CardHeaderComponent>
        <Stack gap="sm">
          <Text>18 active members</Text>
          <Text size="sm" tone="muted">
            Access was reviewed this week.
          </Text>
        </Stack>
        <CardFooterComponent>
          <Button variant="secondary">
            {focus === 'footer'
              ? 'Card footer — Review access'
              : 'Review access'}
          </Button>
        </CardFooterComponent>
      </Card>
    </DemoFrame>
  );
}

export const Default: Story = {render: (args) => <CardExample {...args} />};

export const Elevations: Story = {
  render: () => (
    <StateGrid
      items={[
        {label: 'No elevation', content: <CardExample elevation="none" />},
        {label: 'Low elevation', content: <CardExample elevation="low" />},
        {
          label: 'Medium elevation',
          content: <CardExample elevation="medium" />,
        },
      ]}
    />
  ),
};

export const CardHeader: Story = {render: () => <CardExample focus="header" />};
export const CardFooter: Story = {render: () => <CardExample focus="footer" />};

export const Composition: Story = {
  render: () => <CardExample elevation="low" />,
};
