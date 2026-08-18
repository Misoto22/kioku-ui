import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

// A rail wide enough for two words and a glyph. The scale cannot name it, so
// it is built from the scale rather than written as a length.
const railWidth = `calc(9 * ${semanticTokens.spacing2xl})`;

const styles = stylex.create({
  // The rail is a surface standing on the canvas, and the edge between them is
  // a rule, not a shadow: nothing in this system blurs.
  rail: {
    backgroundColor: semanticTokens.colorSurface,
    borderInlineEndColor: semanticTokens.borderStrong,
    borderInlineEndStyle: semanticTokens.borderStyle,
    borderInlineEndWidth: semanticTokens.borderWidth,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    rowGap: semanticTokens.spacingXl,
    paddingBlock: semanticTokens.spacingLg,
    paddingInline: semanticTokens.spacingMd,
    width: railWidth,
  },
  heading: {
    color: semanticTokens.colorTextMuted,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeXs,
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: semanticTokens.letterSpacingEyebrow,
    margin: 0,
    paddingBlockEnd: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    textTransform: 'uppercase',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: semanticTokens.spacingXs,
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
