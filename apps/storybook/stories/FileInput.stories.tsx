import type {Meta, StoryObj} from '@storybook/react-vite';

import {Field, FileInput} from '@misoto22/kioku-ui';

import {DemoFrame, StateGrid} from './support/StoryFrame';

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
      <StateGrid
        items={[
          {
            label: 'One file',
            content: <FileInput {...args} aria-label="Attachments" />,
          },
          {
            label: 'Several files',
            content: <FileInput aria-label="Screenshots" multiple />,
          },
          {
            label: 'Disabled',
            content: <FileInput aria-label="Archived uploads" disabled />,
          },
        ]}
      />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <StateGrid
        items={[
          {
            label: 'In a field',
            content: (
              <Field
                label="Attachments"
                description="Release notes and screenshots."
              >
                <FileInput multiple />
              </Field>
            ),
          },
        ]}
      />
    </DemoFrame>
  ),
};
