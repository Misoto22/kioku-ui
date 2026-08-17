import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {StatusTone} from './Badge.js';

const styles = stylex.create({
  base: {
    alignItems: 'flex-start',
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    gap: semanticTokens.spacingMd,
    lineHeight: semanticTokens.lineHeightBody,
    padding: semanticTokens.spacingMd,
  },
  info: {
    backgroundColor: semanticTokens.statusInfoSurface,
    borderColor: semanticTokens.statusInfoText,
    color: semanticTokens.statusInfoText,
  },
  success: {
    backgroundColor: semanticTokens.statusSuccessSurface,
    borderColor: semanticTokens.statusSuccessText,
    color: semanticTokens.statusSuccessText,
  },
  warning: {
    backgroundColor: semanticTokens.statusWarningSurface,
    borderColor: semanticTokens.statusWarningText,
    color: semanticTokens.statusWarningText,
  },
  danger: {
    backgroundColor: semanticTokens.statusDangerSurface,
    borderColor: semanticTokens.statusDangerText,
    color: semanticTokens.statusDangerText,
  },
  icon: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    height: semanticTokens.spacingLg,
    justifyContent: 'center',
    width: semanticTokens.spacingLg,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
});

export interface AlertProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'role'
> {
  readonly icon?: ReactNode;
  readonly tone?: StatusTone;
}

function DefaultAlertIcon({tone}: {readonly tone: StatusTone}) {
  const sharedProps = {
    fill: 'none',
    height: '100%',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 2,
    viewBox: '0 0 20 20',
    width: '100%',
  };

  if (tone === 'success') {
    return (
      <svg {...sharedProps}>
        <circle cx="10" cy="10" r="8" />
        <path d="m6.5 10 2.2 2.2 4.8-5" />
      </svg>
    );
  }
  if (tone === 'warning') {
    return (
      <svg {...sharedProps}>
        <path d="M10 2.5 18 17H2L10 2.5Z" />
        <path d="M10 7v4" />
        <path d="M10 14h.01" />
      </svg>
    );
  }
  if (tone === 'danger') {
    return (
      <svg {...sharedProps}>
        <circle cx="10" cy="10" r="8" />
        <path d="m7 7 6 6M13 7l-6 6" />
      </svg>
    );
  }
  return (
    <svg {...sharedProps}>
      <circle cx="10" cy="10" r="8" />
      <path d="M10 9v5" />
      <path d="M10 6h.01" />
    </svg>
  );
}

export function Alert({children, icon, tone = 'info', ...props}: AlertProps) {
  const isDanger = tone === 'danger';
  const hasCustomIcon = icon !== undefined && icon !== null && icon !== false;

  return (
    <div
      {...props}
      aria-live={isDanger ? 'assertive' : 'polite'}
      role={isDanger ? 'alert' : 'status'}
      {...stylex.props(styles.base, styles[tone])}
    >
      <span
        aria-hidden="true"
        data-alert-icon={hasCustomIcon ? 'custom' : tone}
        {...stylex.props(styles.icon)}
      >
        {hasCustomIcon ? icon : <DefaultAlertIcon tone={tone} />}
      </span>
      <div {...stylex.props(styles.content)}>{children}</div>
    </div>
  );
}
