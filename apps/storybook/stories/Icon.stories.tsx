import type {Meta, StoryObj} from '@storybook/react-vite';

import {Icon, Text} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

function CheckPath() {
  return (
    <path
      d="M20 6 9 17l-5-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
  );
}

const meta = {
  title: 'Core/Icon',
  component: Icon,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <Icon {...args} label="Completed">
        <CheckPath />
      </Icon>
    </DemoFrame>
  ),
};

export const Sizes: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {
            label: 'inherit',
            content: (
              <Text>
                Inline{' '}
                <Icon label="Completed">
                  <CheckPath />
                </Icon>{' '}
                with text
              </Text>
            ),
          },
          {
            label: 'sm',
            content: (
              <Icon label="Completed" size="sm">
                <CheckPath />
              </Icon>
            ),
          },
          {
            label: 'md',
            content: (
              <Icon label="Completed" size="md">
                <CheckPath />
              </Icon>
            ),
          },
          {
            label: 'lg',
            content: (
              <Icon label="Completed" size="lg">
                <CheckPath />
              </Icon>
            ),
          },
        ]}
      />
    </DemoFrame>
  ),
};

export const Tones: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={(['primary', 'secondary', 'muted', 'accent'] as const).map(
          (tone) => ({
            label: tone,
            content: (
              <Icon label={tone} size="lg" tone={tone}>
                <CheckPath />
              </Icon>
            ),
          }),
        )}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Text>
        An unlabelled icon{' '}
        <Icon>
          <CheckPath />
        </Icon>{' '}
        stays out of the accessibility tree.
      </Text>
    </DemoFrame>
  ),
};
