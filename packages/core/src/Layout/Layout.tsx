import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

// The margin the page head hangs its numeral into. The scale has no name for
// it, so it is built from the scale: one full step plus the row step, which
// lands on the console's 2.4rem gutter at either density.
const marginColumn = `calc(${semanticTokens.spacing2xl} + ${semanticTokens.spacingMd})`;

const styles = stylex.create({
  frame: {
    backgroundColor: semanticTokens.colorCanvas,
    color: semanticTokens.colorText,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    minHeight: '100%',
  },
  body: {display: 'flex', flexGrow: 1, minHeight: 0},
  rail: {flexShrink: 0},
  // The trailing rail is the one region that carries no surface of its own, so
  // the frame draws the rule that parts it from the content.
  asideRail: {
    borderInlineStartColor: semanticTokens.borderStrong,
    borderInlineStartStyle: semanticTokens.borderStyle,
    borderInlineStartWidth: semanticTokens.borderWidth,
    flexShrink: 0,
    paddingBlock: semanticTokens.spacingLg,
    paddingInline: semanticTokens.spacingMd,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0,
    padding: semanticTokens.spacingXl,
    rowGap: semanticTokens.spacingXl,
  },
  flush: {padding: 0, rowGap: 0},
  // A chapter opening, not a stacked title. The numeral hangs in the margin
  // the way a printed opening sets it — and it does so in the flow, because
  // positioning it out of the flow makes it collide with the title the moment
  // the column has room to centre itself.
  pageHead: {
    alignItems: 'baseline',
    borderBlockEndColor: semanticTokens.borderStrong,
    borderBlockEndStyle: semanticTokens.borderStyle,
    borderBlockEndWidth: semanticTokens.borderWidth,
    columnGap: semanticTokens.spacingSm,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    paddingBlockEnd: semanticTokens.spacingLg,
  },
  pageHeadIndexed: {
    gridTemplateColumns: `${marginColumn} minmax(0, 1fr)`,
  },
  // Set in the display face and the third rank of ink: it is wayfinding, and
  // a numeral drawn at the title's weight would compete with the title.
  pageIndex: {
    color: semanticTokens.colorTextMuted,
    fontFamily: semanticTokens.fontFamilyDisplay,
    fontSize: semanticTokens.fontSizeLg,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: semanticTokens.letterSpacingHeading,
    lineHeight: semanticTokens.lineHeightHeading,
    marginBlock: 0,
    marginInline: 0,
    textAlign: 'end',
  },
  pageHeadBody: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    rowGap: semanticTokens.spacingXs,
  },
  footer: {
    borderBlockStartColor: semanticTokens.borderStrong,
    borderBlockStartStyle: semanticTokens.borderStyle,
    borderBlockStartWidth: semanticTokens.borderWidth,
    paddingBlock: semanticTokens.spacingMd,
    paddingInline: semanticTokens.spacingLg,
  },
});

/** Props for the page frame that positions banner, rails, and content. */
export interface LayoutProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> {
  readonly aside?: ReactNode;
  readonly children: ReactNode;
  readonly contentPadding?: boolean;
  readonly footer?: ReactNode;
  readonly header?: ReactNode;
  readonly mainId?: string;
  readonly pageHead?: ReactNode;
  readonly pageIndex?: ReactNode;
  readonly sidebar?: ReactNode;
}

/**
 * Positions the page regions. `children` is emitted as `main`, so a skip link
 * has a landmark to reach and every page has exactly one main region.
 *
 * Set `contentPadding={false}` when the page supplies its own container; two
 * layers of padding otherwise fight over the gutter. `mainId` lands on the
 * `main` element itself, which is what a skip link must target — put it on
 * the frame and the reader is dropped before the banner again.
 *
 * `pageHead` opens the main region with a chapter head rather than a flat
 * stacked title, and `pageIndex` hangs a numeral in the margin beside it.
 */
export function Layout({
  aside,
  children,
  contentPadding = true,
  footer,
  header,
  mainId,
  pageHead,
  pageIndex,
  sidebar,
  ...props
}: LayoutProps) {
  return (
    <div {...props} {...stylex.props(styles.frame)}>
      {header}
      <div {...stylex.props(styles.body)}>
        {sidebar === undefined ? null : (
          <div {...stylex.props(styles.rail)}>{sidebar}</div>
        )}
        <main
          {...(mainId === undefined ? {} : {id: mainId})}
          {...stylex.props(styles.content, !contentPadding && styles.flush)}
        >
          {pageHead === undefined ? null : (
            <header
              {...stylex.props(
                styles.pageHead,
                pageIndex !== undefined && styles.pageHeadIndexed,
              )}
            >
              {pageIndex === undefined ? null : (
                <p {...stylex.props(styles.pageIndex)}>{pageIndex}</p>
              )}
              <div {...stylex.props(styles.pageHeadBody)}>{pageHead}</div>
            </header>
          )}
          {children}
        </main>
        {aside === undefined ? null : (
          <div {...stylex.props(styles.asideRail)}>{aside}</div>
        )}
      </div>
      {footer === undefined ? null : (
        <footer {...stylex.props(styles.footer)}>{footer}</footer>
      )}
    </div>
  );
}
