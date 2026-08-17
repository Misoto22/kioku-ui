import type {ComponentDoc} from '../docs/types.js';

export const metricGridDoc = {
  name: 'MetricGrid',
  description:
    'Presents consumer-supplied labels and values with responsive description-list hierarchy.',
  props: [
    {
      name: 'items',
      description: 'Supplies metric labels, values, and optional detail.',
      required: true,
    },
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDListElement> except children and className',
  ],
  example: '<MetricGrid items={[{label: "Total", value: "24"}]} />',
  storyId: 'data-display--metric-grid',
} satisfies ComponentDoc;
