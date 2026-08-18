import type {ComponentDoc} from '../docs/types.js';

export const fileInputDoc = {
  name: 'FileInput',
  description: 'Chooses files and names the current selection in text.',
  props: [{name: 'onFilesChange', description: 'Receives the chosen files.'}],
  inheritedProps: [
    'InputHTMLAttributes<HTMLInputElement> except children, className, onChange, type, and value',
  ],
  example: '<FileInput multiple onFilesChange={setFiles} />',
  storyId: 'core-file-input--default',
} satisfies ComponentDoc;
