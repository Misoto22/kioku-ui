import {describe, expect, it} from 'vitest';

import {componentDocs, validateComponentDoc} from './index.js';

describe('componentDocs', () => {
  it('catalogs every stable component with complete, explicit inherited attributes', () => {
    expect(componentDocs.map(({name}) => name)).toEqual([
      'Text',
      'Heading',
      'Stack',
      'Grid',
      'Section',
      'Card',
      'CardHeader',
      'CardFooter',
      'Divider',
      'Center',
      'VisuallyHidden',
    ]);

    for (const doc of componentDocs) {
      expect(validateComponentDoc(doc)).toEqual([]);
      expect(doc.inheritedProps).toHaveLength(1);
    }
  });
});
