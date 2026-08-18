import type {ComponentDoc} from '../docs/types.js';

export const toggleButtonGroupDoc = {
  name: 'ToggleButtonGroup',
  description: 'A set of toggle buttons acting as one control.',
  props: [
    {name: 'label', description: 'Names the group for assistive technology.'},
    {name: 'onValueChange', description: 'Receives the next selection.'},
    {name: 'options', description: 'Supplies the options in reading order.'},
    {
      name: 'orientation',
      description: 'Selects the axis arrow keys travel along.',
    },
    {name: 'selectionMode', description: 'Allows one option or several.'},
    {name: 'size', description: 'Selects the fixed control height.'},
    {name: 'value', description: 'Controls which options are pressed.'},
  ],
  inheritedProps: ['None; ToggleButtonGroup owns its group element'],
  example:
    '<ToggleButtonGroup label="Alignment" onValueChange={setAlign} options={aligns} value={align} />',
  storyId: 'core-toggle-button-group--default',
} satisfies ComponentDoc;
