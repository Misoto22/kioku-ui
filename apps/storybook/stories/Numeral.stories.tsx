import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  Card,
  CardHeader,
  Eyebrow,
  HStack,
  Heading,
  Numeral,
  Stack,
  Text,
} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  title: 'Core/Numeral',
  component: Numeral,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Numeral>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Numeral {...args}>1,204</Numeral>
    </DemoFrame>
  ),
};

/*
 * The same component at three scales. `Numeral` sets no size and no colour, so
 * the figure in the title is title-sized and the figure in the footnote is
 * footnote-sized — only the face and the tabular figures are its own.
 */
export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Card>
        <CardHeader>
          <HStack align="baseline" gap="md" justify="between">
            <Eyebrow>Outstanding invoices</Eyebrow>
            <Text size="sm" tone="muted">
              <Numeral>18</Numeral> of <Numeral>24</Numeral>
            </Text>
          </HStack>
        </CardHeader>
        <Stack gap="xs">
          <Heading level={2} size="page">
            <Numeral>1,204.50</Numeral>
          </Heading>
          <Text size="sm" tone="secondary">
            Settled <Numeral>2026-08-18</Numeral>, and every figure above lines
            up on the same stems.
          </Text>
        </Stack>
      </Card>
    </DemoFrame>
  ),
};
