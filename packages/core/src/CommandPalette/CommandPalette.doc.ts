import type {ComponentDoc} from '../docs/types.js';

export const commandPaletteDoc = {
  name: 'CommandPalette',
  description: 'Runs a command by searching for it by name.',
  props: [
    {name: 'commands', description: 'Supplies every runnable command.'},
    {name: 'emptyMessage', description: 'States that nothing matched.'},
    {name: 'label', description: 'Names the palette for assistive technology.'},
    {name: 'onDismiss', description: 'Runs on Escape or an outside click.'},
    {name: 'onRun', description: 'Receives the command the reader chose.'},
    {name: 'open', description: 'Controls whether the palette renders.'},
    {name: 'placeholder', description: 'Names and hints at the search field.'},
  ],
  inheritedProps: ['None; CommandPalette owns its modal surface'],
  example:
    '<CommandPalette commands={commands} onDismiss={close} onRun={run} open={open} />',
  storyId: 'core-command-palette--default',
} satisfies ComponentDoc;
