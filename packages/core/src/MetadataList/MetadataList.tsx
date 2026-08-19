import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  list: {
    display: 'grid',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingSm,
    margin: 0,
  },
  stacked: {gridTemplateColumns: '1fr'},
  inline: {
    alignItems: 'baseline',
    columnGap: semanticTokens.spacingLg,
    gridTemplateColumns: 'auto 1fr',
  },
  // Inline pairs hand their term and detail to the list's own grid; stacked
  // pairs keep the label a hair above the fact it names.
  pairInline: {display: 'contents'},
  pairStacked: {display: 'grid', rowGap: semanticTokens.spacingXs},
  // The term is an eyebrow: the smallest size in the scale, opened up so the
  // display face does not close into a smudge at 11px, and set a rank below
  // the fact it names.
  term: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeXs,
    fontWeight: semanticTokens.fontWeightRegular,
    letterSpacing: semanticTokens.letterSpacingEyebrow,
    lineHeight: semanticTokens.lineHeightBody,
    margin: 0,
  },
  detail: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    margin: 0,
  },
});

const pairs = {
  inline: styles.pairInline,
  stacked: styles.pairStacked,
} as const;

/** One labelled fact about the subject. */
export interface MetadataEntry {
  readonly detail: ReactNode;
  readonly term: ReactNode;
}

/** Layouts a metadata list can take. */
export type MetadataListLayout = 'inline' | 'stacked';

/** Props for a list of labelled facts. */
export interface MetadataListProps extends Omit<
  HTMLAttributes<HTMLDListElement>,
  'children' | 'className'
> {
  readonly entries: readonly MetadataEntry[];
  readonly layout?: MetadataListLayout;
}

/**
 * Lists labelled facts about one subject. It emits a description list, so the
 * pairing between a term and its detail survives without visual layout.
 */
export function MetadataList({
  entries,
  layout = 'stacked',
  ...props
}: MetadataListProps) {
  return (
    <dl {...props} {...stylex.props(styles.list, styles[layout])}>
      {entries.map(({detail, term}, index) => (
        <div key={index} {...stylex.props(pairs[layout])}>
          <dt {...stylex.props(styles.term)}>{term}</dt>
          <dd {...stylex.props(styles.detail)}>{detail}</dd>
        </div>
      ))}
    </dl>
  );
}
