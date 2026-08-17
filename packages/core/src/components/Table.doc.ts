import type {ComponentDoc} from '../docs/types.js';

export const tableDoc = {
  name: 'Table',
  description:
    'Composes native table, caption, section, row, header, and cell primitives.',
  props: [
    {
      name: 'children',
      description: 'Supplies semantic table primitives.',
      required: true,
    },
  ],
  inheritedProps: ['TableHTMLAttributes<HTMLTableElement> except className'],
  example: '<Table><TableCaption>Values</TableCaption><TableBody /></Table>',
  storyId: 'data-display--table',
} satisfies ComponentDoc;

export const tableCaptionDoc = {
  name: 'TableCaption',
  description: 'Provides the native accessible name and context for a table.',
  props: [
    {
      name: 'children',
      description: 'Describes the table contents.',
      required: true,
    },
  ],
  inheritedProps: ['HTMLAttributes<HTMLTableCaptionElement> except className'],
  example: '<TableCaption>Quarterly values</TableCaption>',
  storyId: 'data-display--table-caption',
} satisfies ComponentDoc;

export const tableHeadDoc = {
  name: 'TableHead',
  description: 'Groups a table’s column header rows with native semantics.',
  props: [
    {
      name: 'children',
      description: 'Supplies header rows.',
      required: true,
    },
  ],
  inheritedProps: ['HTMLAttributes<HTMLTableSectionElement> except className'],
  example: '<TableHead><TableRow /></TableHead>',
  storyId: 'data-display--table-head',
} satisfies ComponentDoc;

export const tableBodyDoc = {
  name: 'TableBody',
  description: 'Groups a table’s data rows with native semantics.',
  props: [
    {name: 'children', description: 'Supplies data rows.', required: true},
  ],
  inheritedProps: ['HTMLAttributes<HTMLTableSectionElement> except className'],
  example: '<TableBody><TableRow /></TableBody>',
  storyId: 'data-display--table-body',
} satisfies ComponentDoc;

export const tableRowDoc = {
  name: 'TableRow',
  description: 'Groups related header or data cells in a native table row.',
  props: [{name: 'children', description: 'Supplies cells.', required: true}],
  inheritedProps: ['HTMLAttributes<HTMLTableRowElement> except className'],
  example: '<TableRow><TableCell>Value</TableCell></TableRow>',
  storyId: 'data-display--table-row',
} satisfies ComponentDoc;

export const tableHeaderCellDoc = {
  name: 'TableHeaderCell',
  description: 'Labels a row or column through native table-header semantics.',
  props: [
    {
      name: 'children',
      description: 'Supplies the header label.',
      required: true,
    },
    {name: 'scope', description: 'Associates the header with a row or column.'},
  ],
  inheritedProps: ['ThHTMLAttributes<HTMLTableCellElement> except className'],
  example: '<TableHeaderCell scope="col">Name</TableHeaderCell>',
  storyId: 'data-display--table-header-cell',
} satisfies ComponentDoc;

export const tableCellDoc = {
  name: 'TableCell',
  description: 'Renders one native data cell in a table row.',
  props: [
    {name: 'children', description: 'Supplies the cell value.', required: true},
  ],
  inheritedProps: ['TdHTMLAttributes<HTMLTableCellElement> except className'],
  example: '<TableCell>24</TableCell>',
  storyId: 'data-display--table-cell',
} satisfies ComponentDoc;
