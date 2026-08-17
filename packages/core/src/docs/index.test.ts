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
      'Button',
      'IconButton',
      'Badge',
      'StatusDot',
      'Field',
      'TextInput',
      'TextArea',
      'Toggle',
      'SegmentedControl',
      'EmptyState',
      'AsyncState',
      'Spinner',
      'Skeleton',
      'Alert',
      'Table',
      'TableCaption',
      'TableHead',
      'TableBody',
      'TableRow',
      'TableHeaderCell',
      'TableCell',
      'MetricGrid',
      'Link',
      'LinkProvider',
      'ThemeProvider',
    ]);

    for (const doc of componentDocs) {
      expect(validateComponentDoc(doc)).toEqual([]);
      expect(doc.inheritedProps).toHaveLength(1);
    }

    const documentedProps = Object.fromEntries(
      componentDocs.map((doc) => [
        doc.name,
        doc.props.map((prop) => prop.name),
      ]),
    );
    expect(documentedProps).toMatchObject({
      Alert: ['tone'],
      AsyncState: ['children', 'state'],
      Badge: ['tone'],
      Button: ['loading', 'size', 'variant'],
      Card: ['children', 'elevation'],
      CardFooter: ['children'],
      CardHeader: ['children'],
      EmptyState: ['action', 'detail', 'size', 'title', 'visual'],
      Field: [
        'controlId',
        'description',
        'label',
        'necessity',
        'status',
        'statusTone',
      ],
      IconButton: ['aria-label', 'loading', 'size', 'variant'],
      Heading: ['family', 'level', 'size'],
      MetricGrid: ['items'],
      Link: ['href'],
      LinkProvider: ['children', 'renderLink'],
      SegmentedControl: [
        'aria-label',
        'aria-labelledby',
        'defaultValue',
        'disabled',
        'onValueChange',
        'options',
        'orientation',
        'value',
      ],
      Skeleton: ['label'],
      Spinner: ['label'],
      StatusDot: ['aria-label', 'tone'],
      Table: ['children', 'density', 'dividers'],
      TableBody: ['children'],
      TableCaption: ['children'],
      TableCell: ['children'],
      TableHead: ['children'],
      TableHeaderCell: ['children', 'scope'],
      TableRow: ['children'],
      Text: ['size', 'tone'],
      TextArea: [
        'aria-invalid',
        'defaultValue',
        'disabled',
        'onValueChange',
        'readOnly',
        'required',
        'value',
      ],
      TextInput: [
        'aria-invalid',
        'defaultValue',
        'disabled',
        'onValueChange',
        'readOnly',
        'required',
        'value',
      ],
      Toggle: ['defaultPressed', 'disabled', 'onPressedChange', 'pressed'],
      ThemeProvider: ['children', 'defaultThemeId', 'persistence', 'themes'],
    });
  });

  it('documents ThemeProvider with host-supplied theme configuration', () => {
    expect(
      componentDocs.find(({name}) => name === 'ThemeProvider')?.example,
    ).toBe(
      '<ThemeProvider defaultThemeId={hostDefaultThemeId} themes={hostThemes}>...</ThemeProvider>',
    );
  });

  it('links ThemeProvider metadata to a product-neutral Storybook fixture', () => {
    expect(
      componentDocs.find(({name}) => name === 'ThemeProvider')?.storyId,
    ).toBe('core-theme-provider--default');
  });
});
