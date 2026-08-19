import type {ComponentDoc} from '../docs/types.js';

export const toastDoc = {
  name: 'Toast',
  description: 'Renders one transient notification.',
  props: [
    {
      name: 'action',
      description: 'Places a follow-up action in the notification.',
    },
    {name: 'description', description: 'Adds detail under the title.'},
    {name: 'title', description: 'States what happened.'},
    {name: 'tone', description: 'Selects a semantic status colour.'},
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except children, className, role, and title',
  ],
  example: '<Toast title="Draft saved" tone="success" />',
  storyId: 'core-toast--default',
} satisfies ComponentDoc;

export const toastProviderDoc = {
  name: 'ToastProvider',
  description: 'Hosts the notification queue and its live region.',
  props: [
    {name: 'children', description: 'Supplies the tree that can raise toasts.'},
    {
      name: 'label',
      description: 'Names the live region for assistive technology.',
    },
  ],
  inheritedProps: ['None; ToastProvider owns its live region'],
  example: '<ToastProvider>{app}</ToastProvider>',
  storyId: 'core-toast-provider--default',
} satisfies ComponentDoc;
