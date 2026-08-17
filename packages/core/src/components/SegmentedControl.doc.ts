import type {ComponentDoc} from '../docs/types.js';

export const segmentedControlDoc = {
  name: 'SegmentedControl',
  description:
    'Chooses one supplied option with roving radio-group keyboard behavior.',
  props: [
    {
      name: 'options',
      description: 'Supplies labels, values, and disabled states.',
      required: true,
    },
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except className, defaultValue, and onChange',
  ],
  example: '<SegmentedControl aria-label="Alignment" options={options} />',
  storyId: 'controls--segmented-control',
} satisfies ComponentDoc;
