import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  list: {
    display: 'grid',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingSm,
    marginBlock: 0,
  },
  stacked: {gridTemplateColumns: '1fr'},
  inline: {
    alignItems: 'baseline',
    columnGap: semanticTokens.spacingLg,
    gridTemplateColumns: 'auto 1fr',
  },
  term: {
    color: semanticTokens.colorTextSecondary,
    fontSize: semanticTokens.fontSizeSm,
    lineHeight: semanticTokens.lineHeightBody,
    margin: 0,
  },
  detail: {
    color: semanticTokens.colorText,
    fontSize: semanticTokens.fontSizeMd,
    lineHeight: semanticTokens.lineHeightBody,
    margin: 0,
  },
});

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
        <div
          key={index}
          style={layout === 'inline' ? {display: 'contents'} : undefined}
        >
          <dt {...stylex.props(styles.term)}>{term}</dt>
          <dd {...stylex.props(styles.detail)}>{detail}</dd>
        </div>
      ))}
    </dl>
  );
}
