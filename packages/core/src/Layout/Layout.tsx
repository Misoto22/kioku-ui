import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

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
 */
export function Layout({
  aside,
  children,
  contentPadding = true,
  footer,
  header,
  mainId,
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
