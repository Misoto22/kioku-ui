import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  Card as CardComponent,
  CardFooter as CardFooterComponent,
  CardHeader as CardHeaderComponent,
  Center as CenterComponent,
  Divider as DividerComponent,
  Grid as GridComponent,
  Heading as HeadingComponent,
  Section as SectionComponent,
  Stack as StackComponent,
  Text as TextComponent,
  VisuallyHidden as VisuallyHiddenComponent,
} from '@misoto22/kioku-ui';

const meta = {
  title: 'Foundations',
  component: StackComponent,
} satisfies Meta<typeof StackComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  render: () => <TextComponent>Readable body copy.</TextComponent>,
};

export const Heading: Story = {
  render: () => <HeadingComponent level={2}>Section title</HeadingComponent>,
};

export const Stack: Story = {
  render: () => (
    <StackComponent>
      <TextComponent>First item</TextComponent>
      <TextComponent>Second item</TextComponent>
    </StackComponent>
  ),
};

export const Grid: Story = {
  render: () => (
    <GridComponent columns={2}>
      <TextComponent>First column</TextComponent>
      <TextComponent>Second column</TextComponent>
    </GridComponent>
  ),
};

export const Section: Story = {
  render: () => (
    <SectionComponent aria-label="Example section">
      Section content
    </SectionComponent>
  ),
};

function CardFixture() {
  return (
    <CardComponent style={{maxWidth: '34rem'}}>
      <CardHeaderComponent>
        <HeadingComponent level={2}>Delivery summary</HeadingComponent>
      </CardHeaderComponent>
      <DividerComponent />
      <SectionComponent padding="md">
        <StackComponent gap="xs">
          <TextComponent>Orders are ready for dispatch.</TextComponent>
          <TextComponent size="sm">Updated a few moments ago</TextComponent>
        </StackComponent>
      </SectionComponent>
      <DividerComponent />
      <CardFooterComponent>
        <TextComponent size="sm">View delivery details</TextComponent>
      </CardFooterComponent>
    </CardComponent>
  );
}

export const Card: Story = {
  parameters: {controls: {disable: true}},
  render: () => <CardFixture />,
};

export const CardHeader: Story = {
  parameters: {controls: {disable: true}},
  render: () => <CardFixture />,
};

export const CardFooter: Story = {
  parameters: {controls: {disable: true}},
  render: () => <CardFixture />,
};

export const Divider: Story = {
  render: () => <DividerComponent />,
};

export const Center: Story = {
  render: () => <CenterComponent>Centered content</CenterComponent>,
};

export const VisuallyHidden: Story = {
  render: () => (
    <button type="button">
      <VisuallyHiddenComponent>Open navigation</VisuallyHiddenComponent>
    </button>
  ),
};
