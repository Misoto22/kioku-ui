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
      Button: ['variant'],
      EmptyState: ['action', 'detail', 'title'],
      Field: ['controlId', 'description', 'label', 'status', 'statusTone'],
      IconButton: ['aria-label'],
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
      Table: ['children'],
      TableBody: ['children'],
      TableCaption: ['children'],
      TableCell: ['children'],
      TableHead: ['children'],
      TableHeaderCell: ['children', 'scope'],
      TableRow: ['children'],
      TextArea: ['defaultValue', 'onValueChange', 'value'],
      TextInput: ['defaultValue', 'onValueChange', 'value'],
      Toggle: ['defaultPressed', 'onPressedChange', 'pressed'],
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
    ).toBe('themes--theme-provider');
  });
});
