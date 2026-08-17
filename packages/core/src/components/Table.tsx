import * as stylex from '@stylexjs/stylex';
import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  table: {
    borderCollapse: 'collapse',
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    width: '100%',
  },
  caption: {
    fontFamily: semanticTokens.fontFamilyHeading,
    fontWeight: semanticTokens.fontWeightStrong,
    paddingBlock: semanticTokens.spacingSm,
    textAlign: 'start',
  },
  row: {
    borderBlockEndColor: semanticTokens.borderDefault,
    borderBlockEndStyle: semanticTokens.borderStyle,
    borderBlockEndWidth: semanticTokens.borderWidth,
  },
  headerCell: {
    fontWeight: semanticTokens.fontWeightStrong,
    paddingBlock: semanticTokens.spacingSm,
    paddingInline: semanticTokens.spacingMd,
    textAlign: 'start',
  },
  cell: {
    paddingBlock: semanticTokens.spacingSm,
    paddingInline: semanticTokens.spacingMd,
  },
});

export type TableProps = Omit<
  TableHTMLAttributes<HTMLTableElement>,
  'className'
>;
export type TableCaptionProps = Omit<
  HTMLAttributes<HTMLTableCaptionElement>,
  'className'
>;
export type TableHeadProps = Omit<
  HTMLAttributes<HTMLTableSectionElement>,
  'className'
>;
export type TableBodyProps = TableHeadProps;
export type TableRowProps = Omit<
  HTMLAttributes<HTMLTableRowElement>,
  'className'
>;
export type TableHeaderCellProps = Omit<
  ThHTMLAttributes<HTMLTableCellElement>,
  'className'
>;
export type TableCellProps = Omit<
  TdHTMLAttributes<HTMLTableCellElement>,
  'className'
>;

export function Table({children, ...props}: TableProps) {
  return (
    <table {...props} {...stylex.props(styles.table)}>
      {children}
    </table>
  );
}

export function TableCaption({children, ...props}: TableCaptionProps) {
  return (
    <caption {...props} {...stylex.props(styles.caption)}>
      {children}
    </caption>
  );
}

export function TableHead({children, ...props}: TableHeadProps) {
  return <thead {...props}>{children}</thead>;
}

export function TableBody({children, ...props}: TableBodyProps) {
  return <tbody {...props}>{children}</tbody>;
}

export function TableRow({children, ...props}: TableRowProps) {
  return (
    <tr {...props} {...stylex.props(styles.row)}>
      {children}
    </tr>
  );
}

export function TableHeaderCell({
  children,
  scope = 'col',
  ...props
}: TableHeaderCellProps) {
  return (
    <th {...props} scope={scope} {...stylex.props(styles.headerCell)}>
      {children}
    </th>
  );
}

export function TableCell({children, ...props}: TableCellProps) {
  return (
    <td {...props} {...stylex.props(styles.cell)}>
      {children}
    </td>
  );
}
