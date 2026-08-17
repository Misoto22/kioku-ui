import type {ComponentDoc} from '../docs/types.js';

export const segmentedControlDoc = {
  name: 'SegmentedControl',
  description:
    'Chooses one supplied option with roving radio-group keyboard behavior.',
  props: [
    {
      name: 'aria-label',
      description:
        'Directly names the radiogroup when no external label is used.',
    },
    {
      name: 'aria-labelledby',
      description: 'References the element that names the radiogroup.',
    },
    {
      name: 'defaultValue',
      description: 'Sets the initial value for uncontrolled selection.',
    },
    {
      name: 'disabled',
      description:
        'Disables every option and removes the group from tab order.',
    },
    {
      name: 'onValueChange',
      description: 'Receives the next value selected by pointer or keyboard.',
    },
    {
      name: 'options',
      description: 'Supplies labels, values, and disabled states.',
      required: true,
    },
    {
      name: 'orientation',
      description: 'Selects horizontal or vertical arrow-key behavior.',
    },
    {
      name: 'value',
      description: 'Controls the current selected value.',
    },
  ],
  inheritedProps: [
    'HTMLAttributes<HTMLDivElement> except aria-label, aria-labelledby, className, defaultValue, and onChange',
  ],
  example: '<SegmentedControl aria-label="Alignment" options={options} />',
  storyId: 'controls--segmented-control',
} satisfies ComponentDoc;
