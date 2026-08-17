import {describe, expect, it} from 'vitest';

import {validateComponentDoc} from './types.js';

describe('validateComponentDoc', () => {
  it('requires a canonical name, public props, example, and story ID in component metadata', () => {
    expect(validateComponentDoc({name: 'Button'})).toEqual([
      'description',
      'props',
      'inheritedProps',
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

  it('rejects blank, undocumented, and duplicate public prop entries', () => {
    const base = {
      name: 'Field',
      description: 'Connects field metadata.',
      inheritedProps: ['HTMLAttributes<HTMLDivElement> except className'],
      example: '<Field label="Name"><TextInput /></Field>',
      storyId: 'controls--field',
    };

    expect(
      validateComponentDoc({
        ...base,
        props: [{name: '', description: 'Missing prop name.'}],
      }),
    ).toEqual(['props']);
    expect(
      validateComponentDoc({
        ...base,
        props: [{name: 'label', description: ''}],
      }),
    ).toEqual(['props']);
    expect(
      validateComponentDoc({
        ...base,
        props: [
          {name: 'label', description: 'Names the field.'},
          {name: 'label', description: 'Names the field again.'},
        ],
      }),
    ).toEqual(['props']);
  });

  it('requires an explicit inherited native-props contract', () => {
    const base = {
      name: 'Field',
      description: 'Connects field metadata.',
      props: [{name: 'label', description: 'Names the field.'}],
      example: '<Field label="Name"><TextInput /></Field>',
      storyId: 'controls--field',
    };

    expect(validateComponentDoc(base)).toEqual(['inheritedProps']);
    expect(validateComponentDoc({...base, inheritedProps: ['']})).toEqual([
      'inheritedProps',
    ]);
  });
});
