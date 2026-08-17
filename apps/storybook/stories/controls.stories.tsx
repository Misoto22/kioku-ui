import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  Badge as BadgeComponent,
  Button as ButtonComponent,
  Field as FieldComponent,
  IconButton as IconButtonComponent,
  SegmentedControl as SegmentedControlComponent,
  StatusDot as StatusDotComponent,
  TextArea as TextAreaComponent,
  TextInput as TextInputComponent,
  Toggle as ToggleComponent,
} from '@misoto22/kioku-ui';

const meta = {
  title: 'Controls',
  component: ButtonComponent,
} satisfies Meta<typeof ButtonComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Button: Story = {
  render: () => <ButtonComponent>Continue</ButtonComponent>,
};

export const IconButton: Story = {
  render: () => (
    <IconButtonComponent aria-label="Close">
      <span aria-hidden="true">×</span>
    </IconButtonComponent>
  ),
};

export const Badge: Story = {
  render: () => <BadgeComponent tone="success">Available</BadgeComponent>,
};

export const StatusDot: Story = {
  render: () => (
    <StatusDotComponent aria-label="Service available" tone="success" />
  ),
};

export const Field: Story = {
  render: () => (
    <FieldComponent description="Use a short descriptive value." label="Label">
      <TextInputComponent />
    </FieldComponent>
  ),
};

export const TextInput: Story = {
  render: () => (
    <FieldComponent label="Single-line value">
      <TextInputComponent />
    </FieldComponent>
  ),
};

export const TextArea: Story = {
  render: () => (
    <FieldComponent label="Multi-line value">
      <TextAreaComponent />
    </FieldComponent>
  ),
};

export const Toggle: Story = {
  render: () => <ToggleComponent aria-label="Enable option" />,
};

export const SegmentedControl: Story = {
  render: () => (
    <SegmentedControlComponent
      aria-label="Alignment"
      defaultValue="start"
      options={[
        {label: 'Start', value: 'start'},
        {label: 'Center', value: 'center'},
        {label: 'End', value: 'end'},
      ]}
    />
  ),
};
