import type {ComponentDoc} from '../docs/types.js';

export const progressBarDoc = {
  name: 'ProgressBar',
  description: 'Reports how far a task has run.',
  props: [
    {name: 'label', description: 'Names what is progressing.'},
    {name: 'max', description: 'Sets the value that counts as complete.'},
    {name: 'value', description: 'Sets progress so far; omit when unknown.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children, className, and role',
  ],
  example: '<ProgressBar label="Uploading" value={40} />',
  storyId: 'core-progress-bar--default',
} satisfies ComponentDoc;
