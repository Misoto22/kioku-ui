import type {Meta, StoryObj} from '@storybook/react-vite';

import {Field, FileInput} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-file-input',
  title: 'Core/FileInput',
  component: FileInput,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof FileInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <FileInput {...args} aria-label="Attachments" />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Field label="Attachments" description="Release notes and screenshots.">
        <FileInput multiple />
      </Field>
    </DemoFrame>
  ),
};
