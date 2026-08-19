import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

// A rail wide enough for two words and a glyph. The scale cannot name it, so
// it is built from the scale rather than written as a length.
const railWidth = `calc(9 * ${semanticTokens.spacing2xl})`;

const styles = stylex.create({
  // The rail is the binding edge of the same sheet the page is printed on, not
  // a panel standing on it: the strong rule down its inline end is the fold,
  // and it is the only thing that parts the two. A `colorSurface` rail put the
  // navigation on the same rung as the cards it leads to.
  rail: {
    backgroundColor: semanticTokens.colorCanvas,
    borderInlineEndColor: semanticTokens.borderStrong,
    borderInlineEndStyle: semanticTokens.borderStyle,
    borderInlineEndWidth: semanticTokens.borderWidth,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    rowGap: semanticTokens.spacingLg,
    paddingBlockEnd: semanticTokens.spacingLg,
    paddingBlockStart: semanticTokens.spacingMd,
    paddingInline: semanticTokens.spacingMd,
    width: railWidth,
  },
  // An eyebrow: the smallest size, opened right up, in the second rank of ink
  // and cut in the display face — group labels and table headers are the two
  // places this system sets mincho, because a run of destinations wants a
  // caption above it rather than another destination. It is indented to the
  // destinations' own text, so the labels and the words they name share a
  // margin and the selection mark keeps the edge to itself.
  heading: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyDisplay,
    fontSize: semanticTokens.fontSizeXs,
    fontSynthesis: 'none',
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: semanticTokens.letterSpacingEyebrow,
    lineHeight: semanticTokens.lineHeightHeading,
    margin: 0,
    paddingBlockEnd: semanticTokens.spacingXs,
    paddingInlineEnd: 0,
    paddingInlineStart: semanticTokens.spacingMd,
  },
  // The rows tile: one hairline apart, so the run reads as a single column of
  // destinations rather than a stack of separated buttons.
  section: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: semanticTokens.borderWidth,
  },
  // `auto` pins the block to the end of the rail; it is a position, not the
  // gutter between siblings, which the rail's own gap already owns.
  footer: {
    borderBlockStartColor: semanticTokens.borderDefault,
    borderBlockStartStyle: semanticTokens.borderStyle,
    borderBlockStartWidth: semanticTokens.borderWidth,
    marginBlockStart: 'auto',
    paddingBlockStart: semanticTokens.spacingMd,
  },
});

/** Props for the vertical navigation rail. */
export interface SideNavProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> {
  readonly children: ReactNode;
  readonly footer?: ReactNode;
}

/** Holds persistent navigation beside the main content. */
export function SideNav({children, footer, ...props}: SideNavProps) {
  return (
    <div {...props} {...stylex.props(styles.rail)}>
      {children}
      {footer === undefined ? null : (
        <div {...stylex.props(styles.footer)}>{footer}</div>
      )}
    </div>
  );
}

/** Props for one titled group inside a `SideNav`. */
export interface SideNavSectionProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'title'
> {
  readonly children: ReactNode;
  readonly title?: ReactNode;
}

/** Groups related destinations under an optional heading. */
export function SideNavSection({
  children,
  title,
  ...props
}: SideNavSectionProps) {
  return (
    <div {...props} {...stylex.props(styles.section)}>
      {title === undefined ? null : (
        <p {...stylex.props(styles.heading)}>{title}</p>
      )}
      {children}
    </div>
  );
}
