import type {ComponentDoc} from '../docs/types.js';

export const iconDoc = {
  name: 'Icon',
  description: 'Sizes and colours caller-supplied SVG paths.',
  props: [
    {
      name: 'label',
      description:
        'Names the icon for assistive technology; omit when decorative.',
    },
    {name: 'size', description: 'Selects the square size from the type scale.'},
    {name: 'tone', description: 'Selects a semantic colour role.'},
  ],
  inheritedProps: [
    'SVGAttributes<SVGSVGElement> except aria-hidden, aria-label, className, role',
  ],
  example:
    '<Icon label="Search"><path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z" /></Icon>',
  storyId: 'core-icon--default',
} satisfies ComponentDoc;
