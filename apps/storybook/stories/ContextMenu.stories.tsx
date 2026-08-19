import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  Card,
  ContextMenu,
  DropdownMenuItem,
  Stack,
  Text,
} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-context-menu',
  title: 'Core/ContextMenu',
  component: ContextMenu,
  args: {children: null, label: '', menu: null},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const menu = (
  <>
    <DropdownMenuItem>Open</DropdownMenuItem>
    <DropdownMenuItem>Duplicate</DropdownMenuItem>
    <DropdownMenuItem>Archive</DropdownMenuItem>
  </>
);

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <ContextMenu {...args} label="Release actions" menu={menu}>
        <Card>
          <Text>Secondary-click this card.</Text>
        </Card>
      </ContextMenu>
    </DemoFrame>
  ),
};

// The menu opens on a secondary click and nothing else, so the story performs
// one; a closed story shows a card and calls it a menu.
export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <Text tone="secondary">
          The menu anchors to the click point, so it flips and clamps with the
          same rules as any other anchored surface.
        </Text>
        <ContextMenu label="Release actions" menu={menu}>
          <Card data-story-target="region">
            <Text>Release 12 — secondary-click for actions</Text>
          </Card>
        </ContextMenu>
      </Stack>
    </DemoFrame>
  ),
  play: async ({canvasElement, userEvent}) => {
    const region = canvasElement.querySelector<HTMLElement>(
      '[data-story-target="region"]',
    );
    if (!region) {
      throw new Error('ContextMenu region is missing');
    }
    await userEvent.pointer({keys: '[MouseRight]', target: region});
  },
};
