import type {ComponentDoc} from '../docs/types.js';

export const switchDoc = {
  name: 'Switch',
  description: 'Turns a setting on or off, taking effect immediately.',
  props: [
    {
      name: 'defaultPressed',
      description: 'Sets the initial uncontrolled state.',
    },
    {name: 'disabled', description: 'Blocks activation.'},
    {name: 'onPressedChange', description: 'Receives the next state.'},
    {name: 'pressed', description: 'Controls the current state.'},
  ],
  inheritedProps: ['ToggleProps, which Switch forwards unchanged'],
  example:
    '<Switch onPressedChange={setLive} pressed={live}>Live updates</Switch>',
  storyId: 'core-switch--default',
} satisfies ComponentDoc;
