import type {Meta, StoryObj} from '@storybook/react-vite';

import {Item, List, ListItem} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

const meta = {
  title: 'Core/List',
  component: List,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <List {...args}>
        <ListItem>Draft the release notes</ListItem>
        <ListItem>Review the accessibility baseline</ListItem>
        <ListItem>Publish the changeset</ListItem>
      </List>
    </DemoFrame>
  ),
};

export const Variants: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={(['unordered', 'ordered', 'plain'] as const).map((variant) => ({
          label: variant,
          content: (
            <List variant={variant}>
              <ListItem>Install the package</ListItem>
              <ListItem>Wrap the app in ThemeProvider</ListItem>
              <ListItem>Import the compiled CSS</ListItem>
            </List>
          ),
        }))}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <List gap="md" variant="plain">
        <ListItem>
          <Item description="Ready to publish">Release notes</Item>
        </ListItem>
        <ListItem>
          <Item description="Waiting on review">Accessibility baseline</Item>
        </ListItem>
      </List>
    </DemoFrame>
  ),
};
