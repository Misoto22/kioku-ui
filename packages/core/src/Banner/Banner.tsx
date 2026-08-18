import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {StatusTone} from '../Badge/index.js';

const styles = stylex.create({
  banner: {
    alignItems: 'center',
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    gap: semanticTokens.spacingMd,
    lineHeight: semanticTokens.lineHeightBody,
    paddingBlock: semanticTokens.spacingSm,
    paddingInline: semanticTokens.spacingLg,
  },
  info: {
    backgroundColor: semanticTokens.statusInfoSurface,
    color: semanticTokens.statusInfoText,
  },
  success: {
    backgroundColor: semanticTokens.statusSuccessSurface,
    color: semanticTokens.statusSuccessText,
  },
  warning: {
    backgroundColor: semanticTokens.statusWarningSurface,
    color: semanticTokens.statusWarningText,
  },
  danger: {
    backgroundColor: semanticTokens.statusDangerSurface,
    color: semanticTokens.statusDangerText,
  },
  message: {flexGrow: 1, minWidth: 0},
  actions: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    gap: semanticTokens.spacingSm,
  },
});

/** Props for a page-width announcement. */
export interface BannerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> {
  readonly actions?: ReactNode;
  readonly children: ReactNode;
  readonly tone?: StatusTone;
}

/**
 * Announces something about the whole page or account, spanning its full
 * width. Use `Alert` for a message about one region and `Toast` for one that
 * passes on its own.
 */
export function Banner({
  actions,
  children,
  tone = 'info',
  ...props
}: BannerProps) {
  return (
    <div
      {...props}
      {...(tone === 'danger' ? {role: 'alert'} : {role: 'status'})}
      {...stylex.props(styles.banner, styles[tone])}
    >
      <div {...stylex.props(styles.message)}>{children}</div>
      {actions === undefined ? null : (
        <div {...stylex.props(styles.actions)}>{actions}</div>
      )}
    </div>
  );
}
