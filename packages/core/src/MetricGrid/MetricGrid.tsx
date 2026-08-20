import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const minimumColumnWidth = `calc(${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl})`;

const styles = stylex.create({
  // One plate, ruled by its own gaps. The grid paints itself in the hairline
  // colour and the tiles cover it, so every interior rule is drawn once — a
  // border on each tile would draw the shared ones twice and leave the outer
  // edge heavier than the inside.
  root: {
    backgroundColor: semanticTokens.borderDefault,
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusContainer,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    display: 'grid',
    gap: semanticTokens.borderWidth,
    gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minimumColumnWidth}), 1fr))`,
    margin: 0,
    overflow: 'hidden',
  },
  item: {
    backgroundColor: semanticTokens.colorSurface,
    display: 'grid',
    gap: semanticTokens.spacingXs,
    padding: semanticTokens.spacingLg,
  },
  // Three ranks in one tile: the label names, the figure states, the detail
  // qualifies. The label is an eyebrow, so it never competes with the figure.
  label: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeXs,
    letterSpacing: semanticTokens.letterSpacingEyebrow,
    lineHeight: semanticTokens.lineHeightHeading,
  },
  // A metric is a figure: mono and tabular, so a row of tiles lines its
  // numbers up on the same stems instead of drifting by digit.
  // A metric's headline figure is one number on its own card, not a column of
  // them: nothing beneath it has to line up, so the mono face buys nothing and
  // costs the page its voice — 27px of monospace reads as output, not as a
  // figure of record. It takes the display face, like every other title here,
  // and the tighter leading a large figure wants; a heading's 1.25 leaves a
  // single line sitting low in its own box. No added weight either: this
  // system's display face states a figure by its size.
  value: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyDisplay,
    fontSize: semanticTokens.fontSizeXl,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: semanticTokens.letterSpacingTitle,
    lineHeight: 1.15,
    margin: 0,
  },
  detail: {
    color: semanticTokens.colorTextMuted,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingLabel,
    margin: 0,
  },
});

export interface MetricGridItem {
  readonly detail?: ReactNode;
  readonly label: ReactNode;
  readonly value: ReactNode;
}

export interface MetricGridProps extends Omit<
  HTMLAttributes<HTMLDListElement>,
  'children' | 'className'
> {
  readonly items: readonly MetricGridItem[];
}

export function MetricGrid({items, ...props}: MetricGridProps) {
  return (
    <dl {...props} {...stylex.props(styles.root)}>
      {items.map((item, index) => (
        <div key={index} {...stylex.props(styles.item)}>
          <dt {...stylex.props(styles.label)}>{item.label}</dt>
          <dd {...stylex.props(styles.value)}>{item.value}</dd>
          {item.detail ? (
            <dd {...stylex.props(styles.detail)}>{item.detail}</dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
