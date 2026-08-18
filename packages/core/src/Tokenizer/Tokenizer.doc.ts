import type {ComponentDoc} from '../docs/types.js';

export const tokenizerDoc = {
  name: 'Tokenizer',
  description: 'Turns typed text into discrete removable tokens.',
  props: [
    {name: 'label', description: 'Names the entry field.'},
    {name: 'onValueChange', description: 'Receives the next set of tokens.'},
    {name: 'placeholder', description: 'Hints at what to type.'},
    {
      name: 'removeLabel',
      description: 'Builds the name of each remove control.',
    },
    {name: 'value', description: 'Controls the current tokens.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children, className, defaultValue, and onChange',
  ],
  example: '<Tokenizer label="Tags" onValueChange={setTags} value={tags} />',
  storyId: 'core-tokenizer--default',
} satisfies ComponentDoc;
