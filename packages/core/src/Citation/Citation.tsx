import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Link} from '../navigation/index.js';

const styles = stylex.create({
  citation: {
    color: semanticTokens.colorTextMuted,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    fontStyle: 'normal',
    letterSpacing: semanticTokens.letterSpacingLabel,
    lineHeight: semanticTokens.lineHeightBody,
  },
  // The marker is a figure, not a word: mono and tabular, so a page of
  // citations keeps its superscripts on one width.
  marker: {
    fontFamily: semanticTokens.fontFamilyMono,
    fontSize: semanticTokens.fontSizeXs,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: semanticTokens.letterSpacingMono,
    verticalAlign: 'super',
  },
});

/** Props for a reference to a source. */
export interface CitationProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'className'
> {
  readonly children: ReactNode;
  readonly href?: string;
  readonly marker?: ReactNode;
}

/**
 * Names the source of a claim. When a marker is supplied it is superscripted
 * and the source name stays in the accessible name, so a reader hears what
 * "1" refers to rather than the digit alone.
 */
export function Citation({children, href, marker, ...props}: CitationProps) {
  const body =
    href === undefined ? children : <Link href={href}>{children}</Link>;

  return (
    <cite {...props} {...stylex.props(styles.citation)}>
      {marker === undefined ? null : (
        <span aria-hidden="true" {...stylex.props(styles.marker)}>
          {marker}
        </span>
      )}
      {body}
    </cite>
  );
}
