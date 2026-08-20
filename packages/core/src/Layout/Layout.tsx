import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

// The margin the page head hangs its numeral into. The scale has no name for
// it, so it is built from the scale: one full step plus the row step, which
// lands on the console's 2.4rem gutter at either density.
const marginColumn = `calc(${semanticTokens.spacing2xl} + ${semanticTokens.spacingMd})`;

// Hanging means the numeral goes into the margin and the title keeps the text
// edge. The pull is exactly the page's own side margin — the same token
// `content` spends on `paddingInline` — so the numeral comes to rest on the
// paper's edge and never overhangs it. Change the margin and the hang follows.
const hangColumn = `calc(${semanticTokens.spacing2xl} - ${semanticTokens.spacingSm})`;

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
  // The page's own margins. The side margin is a step wider than the head and
  // foot, the way a printed page is set: the column of text wants more air
  // beside it than above it, and the rail already supplies an edge on one side.
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0,
    paddingBlock: semanticTokens.spacingXl,
    paddingInline: semanticTokens.spacing2xl,
    rowGap: semanticTokens.spacingXl,
  },
  flush: {paddingBlock: 0, paddingInline: 0, rowGap: 0},
  // A chapter opening, not a stacked title. The numeral hangs in the margin
  // the way a printed opening sets it — and it does so in the flow, because
  // positioning it out of the flow makes it collide with the title the moment
  // the column has room to centre itself.
  pageHead: {
    alignItems: 'baseline',
    columnGap: semanticTokens.spacingSm,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  // The two-column grid this used to be pushed the *title* inward by the width
  // of the numeral column plus the gap — 44px — so the head no longer began
  // where the prose beneath it began. Pulling the whole grid back by the page
  // margin puts the title on the text edge and sends the numeral out into the
  // margin, which is the arrangement the comment above always described.
  pageHeadIndexed: {
    gridTemplateColumns: `${hangColumn} minmax(0, 1fr)`,
    marginInlineStart: `calc(-1 * ${semanticTokens.spacing2xl})`,
  },
  // With the page margins off there is no margin to hang into, so the numeral
  // takes a column in the flow rather than overhanging the frame.
  pageHeadIndexedFlush: {
    gridTemplateColumns: `${marginColumn} minmax(0, 1fr)`,
    marginInlineStart: 0,
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
  // The rule closes the chapter head across the measure the text occupies. It
  // sits here rather than on the grid so that a hanging numeral stays outside
  // it: a rule that ran under the numeral too would end 28px left of every
  // other edge on the page.
  pageHeadBody: {
    borderBlockEndColor: semanticTokens.borderStrong,
    borderBlockEndStyle: semanticTokens.borderStyle,
    borderBlockEndWidth: semanticTokens.borderWidth,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    paddingBlockEnd: semanticTokens.spacingLg,
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
                pageIndex !== undefined &&
                  !contentPadding &&
                  styles.pageHeadIndexedFlush,
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
