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

// Two hairlines wide, so the mark reads at the same weight as the underline a
// selected tab carries. Written as a calc over the border token rather than as
// 2px, so a theme that draws heavier lines gets a heavier mark with them.
const selectionRule = `inset calc(2 * ${semanticTokens.borderWidth}) 0 0 ${semanticTokens.colorAccent}`;

const styles = stylex.create({
  table: {
    borderCollapse: 'collapse',
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingBody,
    // Nothing above a table sets a line-height to inherit — not the theme, not
    // the provider — so without this the rows were spaced by whatever the
    // browser's default happened to be while `List` and `Item` beside them
    // were on the system's own leading.
    lineHeight: semanticTokens.lineHeightBody,
    width: '100%',
  },
  // The caption is the page's title, so it is set as one: the heading face at
  // card-title size, opened to the heading tracking, and only medium — a page
  // of accounts is titled, not shouted at.
  caption: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeLg,
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: semanticTokens.letterSpacingHeading,
    lineHeight: semanticTokens.lineHeightHeading,
    paddingBlock: semanticTokens.spacingSm,
    // The title sits on the same margin as the first column: a caption that
    // starts flush with the table box and cells that start one step in read
    // as two documents stacked on each other.
    paddingInline: semanticTokens.spacingLg,
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
  // A ledger header is an eyebrow, not a filled strip: smallest size, opened
  // right up, one rank of ink below the rows it names. The rule under it does
  // the separating, which is why it is drawn in the strong border while the
  // row rules stay in the default one.
  headerCell: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeXs,
    fontWeight: semanticTokens.fontWeightRegular,
    letterSpacing: semanticTokens.letterSpacingEyebrow,
    paddingInline: semanticTokens.spacingLg,
    textAlign: 'start',
  },
  cell: {
    paddingInline: semanticTokens.spacingLg,
  },
  // A selected row is marked, not filled: the fill is what hover uses, and a
  // row that is both selected and pointed at must still show both.
  selectedRow: {boxShadow: selectionRule},
  // A column of figures only reads as a column when the digits are the same
  // width and the last one is flush. Mono, tabular and end-aligned; the header
  // above it takes the alignment alone so it stays an eyebrow.
  // No size of its own: `Numeral`, which is where this recipe lives, declares
  // only the face, the figures and the tracking. A step down put the column of
  // figures a rank below the words it belongs to.
  numericCell: {
    fontFamily: semanticTokens.fontFamilyMono,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: semanticTokens.letterSpacingMono,
    textAlign: 'end',
  },
  numericHeaderCell: {textAlign: 'end'},
  compact: {paddingBlock: semanticTokens.spacingSm},
  default: {paddingBlock: semanticTokens.spacingMd},
  spacious: {paddingBlock: semanticTokens.spacingLg},
  // The header sits one step tighter than the rows it names at every density.
  // It carries a line of 11px eyebrow, not a line of data, so matching the row
  // height would give the strip more air than the entries underneath it.
  headCompact: {paddingBlock: semanticTokens.spacingXs},
  headDefault: {paddingBlock: semanticTokens.spacingSm},
  headSpacious: {paddingBlock: semanticTokens.spacingMd},
  rowDivider: {
    ':not(:last-child)': {
      borderBlockEndColor: semanticTokens.borderDefault,
      borderBlockEndStyle: semanticTokens.borderStyle,
      borderBlockEndWidth: semanticTokens.borderWidth,
    },
  },
  // This rule is not a divider between rows — it is what says the row above it
  // is a legend and the rows below it are data. `dividers` decides whether the
  // body is ruled; it has no say in whether the table has a head.
  headerRowDivider: {
    borderBlockEndColor: semanticTokens.borderStrong,
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

const headerDensities = {
  compact: styles.headCompact,
  default: styles.headDefault,
  spacious: styles.headSpacious,
} satisfies Record<TableDensity, (typeof styles)[keyof typeof styles]>;

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
export interface TableRowProps extends Omit<
  HTMLAttributes<HTMLTableRowElement>,
  'aria-selected' | 'className'
> {
  /**
   * Marks the row as the chosen one. A rule down its leading edge, and
   * `aria-selected` so the choice is not carried by the mark alone.
   */
  readonly selected?: boolean;
}
export interface TableHeaderCellProps extends Omit<
  ThHTMLAttributes<HTMLTableCellElement>,
  'className'
> {
  readonly numeric?: boolean;
}
export interface TableCellProps extends Omit<
  TdHTMLAttributes<HTMLTableCellElement>,
  'className'
> {
  readonly numeric?: boolean;
}

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

export function TableRow({children, selected, ...props}: TableRowProps) {
  const {dividers, section} = useContext(TableStyleContext);
  return (
    <tr
      {...props}
      {...(selected === undefined ? {} : {'aria-selected': selected})}
      {...stylex.props(
        section === 'body' && styles.bodyRow,
        section === 'body' && usesRowDividers(dividers) && styles.rowDivider,
        section === 'body' && selected === true && styles.selectedRow,
      )}
    >
      {children}
    </tr>
  );
}

export function TableHeaderCell({
  children,
  numeric = false,
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
        headerDensities[density],
        numeric && styles.numericHeaderCell,
        styles.headerRowDivider,
        usesColumnDividers(dividers) && styles.columnDivider,
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  numeric = false,
  ...props
}: TableCellProps) {
  const {density, dividers} = useContext(TableStyleContext);
  return (
    <td
      {...props}
      {...stylex.props(
        styles.cell,
        styles[density],
        numeric && styles.numericCell,
        usesColumnDividers(dividers) && styles.columnDivider,
      )}
    >
      {children}
    </td>
  );
}
