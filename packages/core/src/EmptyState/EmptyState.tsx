import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const copyWidth = `calc(${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl})`;

const styles = stylex.create({
  root: {
    alignItems: 'center',
    color: semanticTokens.colorText,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingMd,
    padding: semanticTokens.spacing2xl,
    textAlign: 'center',
  },
  compact: {
    gap: semanticTokens.spacingSm,
    padding: semanticTokens.spacingLg,
  },
  // Two ranks, not one. The sentence naming the absence is what is current;
  // the sentence explaining what to do about it is context, and setting both
  // in full ink made the block read as a warning rather than as a blank page.
  title: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeLg,
    letterSpacing: semanticTokens.letterSpacingHeading,
    lineHeight: semanticTokens.lineHeightHeading,
    fontWeight: semanticTokens.fontWeightStrong,
    margin: 0,
    maxInlineSize: copyWidth,
  },
  detail: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    margin: 0,
    maxInlineSize: copyWidth,
  },
});

export type EmptyStateSize = 'compact' | 'default';

export interface EmptyStateProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'title'
> {
  readonly action?: ReactNode;
  readonly detail?: ReactNode;
  readonly size?: EmptyStateSize;
  readonly title: ReactNode;
  readonly visual?: ReactNode;
}

export function EmptyState({
  action,
  detail,
  size = 'default',
  title,
  visual,
  ...props
}: EmptyStateProps) {
  return (
    <div {...props} aria-live="polite" role="status">
      <EmptyStateContent
        action={action}
        detail={detail}
        size={size}
        title={title}
        visual={visual}
      />
    </div>
  );
}

export function EmptyStateContent({
  action,
  detail,
  size = 'default',
  title,
  visual,
}: EmptyStateProps) {
  return (
    <div {...stylex.props(styles.root, size === 'compact' && styles.compact)}>
      {visual}
      <p {...stylex.props(styles.title)}>{title}</p>
      {detail ? <p {...stylex.props(styles.detail)}>{detail}</p> : null}
      {action}
    </div>
  );
}
