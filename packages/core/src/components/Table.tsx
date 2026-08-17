import * as stylex from '@stylexjs/stylex';
import {createContext, useContext} from 'react';
import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

export type TableDensity = 'compact' | 'default' | 'spacious';
export type TableDividers = 'rows' | 'columns' | 'grid' | 'none';

type TableSection = 'body' | 'head' | undefined;

interface TableStyleContextValue {
  readonly density: TableDensity;
  readonly dividers: TableDividers;
  readonly section: TableSection;
}

const defaultTableStyle: TableStyleContextValue = {
  density: 'default',
  dividers: 'rows',
  section: undefined,
};

const TableStyleContext = createContext(defaultTableStyle);

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
  bodyRow: {
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color',
    transitionTimingFunction: semanticTokens.easingStandard,
    ':hover:not(:active)': {
      backgroundColor: semanticTokens.colorOverlayHover,
    },
    ':focus-within:not(:active)': {
      backgroundColor: semanticTokens.colorOverlayHover,
    },
    ':active': {
      backgroundColor: semanticTokens.colorOverlayActive,
    },
  },
  headerCell: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    color: semanticTokens.colorTextSecondary,
    fontWeight: semanticTokens.fontWeightStrong,
    paddingInline: semanticTokens.spacingMd,
    textAlign: 'start',
  },
  cell: {
    paddingInline: semanticTokens.spacingMd,
  },
  compact: {paddingBlock: semanticTokens.spacingSm},
  default: {paddingBlock: semanticTokens.spacingMd},
  spacious: {paddingBlock: semanticTokens.spacingLg},
  rowDivider: {
    ':not(:last-child)': {
      borderBlockEndColor: semanticTokens.borderDefault,
      borderBlockEndStyle: semanticTokens.borderStyle,
      borderBlockEndWidth: semanticTokens.borderWidth,
    },
  },
  headerRowDivider: {
    borderBlockEndColor: semanticTokens.borderDefault,
    borderBlockEndStyle: semanticTokens.borderStyle,
    borderBlockEndWidth: semanticTokens.borderWidth,
  },
  columnDivider: {
    ':not(:last-child)': {
      borderInlineEndColor: semanticTokens.borderDefault,
      borderInlineEndStyle: semanticTokens.borderStyle,
      borderInlineEndWidth: semanticTokens.borderWidth,
    },
  },
});

export interface TableProps extends Omit<
  TableHTMLAttributes<HTMLTableElement>,
  'className'
> {
  readonly density?: TableDensity;
  readonly dividers?: TableDividers;
}
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

function usesRowDividers(dividers: TableDividers) {
  return dividers === 'rows' || dividers === 'grid';
}

function usesColumnDividers(dividers: TableDividers) {
  return dividers === 'columns' || dividers === 'grid';
}

export function Table({
  children,
  density = 'default',
  dividers = 'rows',
  ...props
}: TableProps) {
  return (
    <TableStyleContext.Provider value={{density, dividers, section: undefined}}>
      <table {...props} {...stylex.props(styles.table)}>
        {children}
      </table>
    </TableStyleContext.Provider>
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
  const tableStyle = useContext(TableStyleContext);
  return (
    <TableStyleContext.Provider value={{...tableStyle, section: 'head'}}>
      <thead {...props}>{children}</thead>
    </TableStyleContext.Provider>
  );
}

export function TableBody({children, ...props}: TableBodyProps) {
  const tableStyle = useContext(TableStyleContext);
  return (
    <TableStyleContext.Provider value={{...tableStyle, section: 'body'}}>
      <tbody {...props}>{children}</tbody>
    </TableStyleContext.Provider>
  );
}

export function TableRow({children, ...props}: TableRowProps) {
  const {dividers, section} = useContext(TableStyleContext);
  return (
    <tr
      {...props}
      {...stylex.props(
        section === 'body' && styles.bodyRow,
        section === 'body' && usesRowDividers(dividers) && styles.rowDivider,
      )}
    >
      {children}
    </tr>
  );
}

export function TableHeaderCell({
  children,
  scope = 'col',
  ...props
}: TableHeaderCellProps) {
  const {density, dividers} = useContext(TableStyleContext);
  return (
    <th
      {...props}
      scope={scope}
      {...stylex.props(
        styles.headerCell,
        styles[density],
        usesRowDividers(dividers) && styles.headerRowDivider,
        usesColumnDividers(dividers) && styles.columnDivider,
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({children, ...props}: TableCellProps) {
  const {density, dividers} = useContext(TableStyleContext);
  return (
    <td
      {...props}
      {...stylex.props(
        styles.cell,
        styles[density],
        usesColumnDividers(dividers) && styles.columnDivider,
      )}
    >
      {children}
    </td>
  );
}
