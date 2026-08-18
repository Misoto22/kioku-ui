import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';

import {
  Button,
  CommandPalette,
  Stack,
  Text,
  type Command,
} from '@misoto22/kioku-ui';

import {DemoFrame} from './support/StoryFrame';

const meta = {
  id: 'core-command-palette',
  title: 'Core/CommandPalette',
  component: CommandPalette,
  args: {commands: [], onDismiss: () => {}, onRun: () => {}, open: false},
  parameters: {layout: 'padded'},
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

const commands: readonly Command[] = [
  {
    group: 'Release',
    id: 'publish',
    label: 'Publish release',
    shortcut: 'mod+p',
  },
  {group: 'Release', id: 'archive', label: 'Archive release'},
  {group: 'View', id: 'theme', label: 'Switch theme', shortcut: 'mod+k'},
  {group: 'View', id: 'density', label: 'Toggle density'},
];

function PaletteDemo({
  label = 'Open command palette',
}: {
  readonly label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState('');

  return (
    <Stack gap="sm">
      <Button onClick={() => setOpen(true)}>{label}</Button>
      {last === '' ? null : (
        <Text size="sm" tone="secondary">
          Ran: {last}
        </Text>
      )}
      <CommandPalette
        commands={commands}
        onDismiss={() => setOpen(false)}
        onRun={(command) => {
          setLast(command.label);
          setOpen(false);
        }}
        open={open}
      />
    </Stack>
  );
}

export const Default: Story = {
  render: (args) => (
    <DemoFrame>
      <PaletteDemo label={args.placeholder ?? 'Open command palette'} />
    </DemoFrame>
  ),
};

export const Composition: Story = {
  render: () => (
    <DemoFrame>
      <Stack gap="md">
        <PaletteDemo label="Open" />
        <Text size="sm" tone="muted">
          Focus stays in the search field while aria-activedescendant names the
          highlighted command, so typing and choosing never fight for focus.
        </Text>
      </Stack>
    </DemoFrame>
  ),
};
