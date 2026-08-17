import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  root: {
    display: 'grid',
    gap: semanticTokens.spacingMd,
    gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
    margin: 0,
  },
  item: {
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusContainer,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    display: 'grid',
    gap: semanticTokens.spacingXs,
    padding: semanticTokens.spacingMd,
  },
  label: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
  },
  value: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeXl,
    fontWeight: semanticTokens.fontWeightStrong,
    margin: 0,
  },
  detail: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
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
