import {describe, expect, it} from 'vitest';

import {validateComponentDoc} from './types.js';

describe('validateComponentDoc', () => {
  it('requires a canonical name, public props, example, and story ID in component metadata', () => {
    expect(validateComponentDoc({name: 'Button'})).toEqual([
      'description',
      'props',
      'example',
      'storyId',
    ]);
  });

  it('accepts complete, consumer-facing component metadata', () => {
    expect(
      validateComponentDoc({
        name: 'Text',
        description: 'Renders readable body copy.',
        props: [{name: 'size', description: 'Sets the semantic text size.'}],
        inheritedProps: [
          'HTMLAttributes<HTMLParagraphElement> except className',
        ],
        example: '<Text>Read me</Text>',
        storyId: 'foundations-text',
      }),
    ).toEqual([]);
  });
});
