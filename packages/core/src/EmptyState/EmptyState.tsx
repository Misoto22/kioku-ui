import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const copyWidth = `calc(${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl} + ${semanticTokens.spacing2xl})`;

const styles = stylex.create({
  // A page with nothing written on it is still a page. Without an edge the
  // block reads as content that failed to arrive rather than as a place
  // waiting for it, so the empty state sits on a plate like any other set.
  root: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurface,
    borderRadius: semanticTokens.radiusContainer,
    boxShadow: semanticTokens.elevationMedium,
    color: semanticTokens.colorText,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingSm,
    // The foot is tighter than the head: the actions close the block, and an
    // even inset leaves them stranded in the middle of the lower half.
    paddingBlockEnd: semanticTokens.spacingXl,
    paddingBlockStart: semanticTokens.spacing2xl,
    paddingInline: semanticTokens.spacing2xl,
    textAlign: 'center',
  },
  // Written as the same three longhands the default size uses: a shorthand
  // here would lose to them whichever order the two objects arrive in.
  compact: {
    gap: semanticTokens.spacingSm,
    paddingBlockEnd: semanticTokens.spacingLg,
    paddingBlockStart: semanticTokens.spacingLg,
    paddingInline: semanticTokens.spacingLg,
  },
  // Three ranks, not one. The sentence naming the absence is what is current
  // and takes the display face; the sentence explaining what to do about it is
  // context, and setting both in full ink made the block read as a warning.
  title: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyDisplay,
    fontSize: semanticTokens.fontSizeLg,
    letterSpacing: semanticTokens.letterSpacingHeading,
    lineHeight: semanticTokens.lineHeightHeading,
    fontWeight: semanticTokens.fontWeightMedium,
    margin: 0,
    maxInlineSize: copyWidth,
  },
  detail: {
    color: semanticTokens.colorTextMuted,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
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
