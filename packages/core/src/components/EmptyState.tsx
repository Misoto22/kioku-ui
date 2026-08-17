import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  root: {
    alignItems: 'center',
    color: semanticTokens.colorText,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingSm,
    padding: semanticTokens.spacingXl,
    textAlign: 'center',
  },
  title: {
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeLg,
    fontWeight: semanticTokens.fontWeightStrong,
    margin: 0,
  },
  detail: {
    fontSize: semanticTokens.fontSizeMd,
    lineHeight: semanticTokens.lineHeightBody,
    margin: 0,
  },
});

export interface EmptyStateProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'title'
> {
  readonly action?: ReactNode;
  readonly detail?: ReactNode;
  readonly title: ReactNode;
}

export function EmptyState({action, detail, title, ...props}: EmptyStateProps) {
  return (
    <div {...props} aria-live="polite" role="status">
      <EmptyStateContent action={action} detail={detail} title={title} />
    </div>
  );
}

export function EmptyStateContent({action, detail, title}: EmptyStateProps) {
  return (
    <div {...stylex.props(styles.root)}>
      <p {...stylex.props(styles.title)}>{title}</p>
      {detail ? <p {...stylex.props(styles.detail)}>{detail}</p> : null}
      {action}
    </div>
  );
}
