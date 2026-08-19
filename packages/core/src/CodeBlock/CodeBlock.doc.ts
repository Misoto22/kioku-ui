import type {ComponentDoc} from '../docs/types.js';

export const codeBlockDoc = {
  name: 'CodeBlock',
  description: 'Shows a block of source with a copy control.',
  props: [
    {
      name: 'wrap',
      description: 'Wraps long lines instead of scrolling them out of view.',
    },
    {name: 'code', description: 'Supplies the source to show and copy.'},
    {name: 'copiedLabel', description: 'Names the control after a copy.'},
    {name: 'copyLabel', description: 'Names the copy control.'},
    {name: 'language', description: 'Records which language the source is in.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children and className',
  ],
  example: '<CodeBlock code="pnpm add @misoto22/kioku-ui" language="bash" />',
  storyId: 'core-code-block--default',
} satisfies ComponentDoc;
