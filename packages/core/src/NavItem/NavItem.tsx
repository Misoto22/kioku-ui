import * as stylex from '@stylexjs/stylex';
import type {AnchorHTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Link} from '../navigation/index.js';

const styles = stylex.create({
  item: {
    alignItems: 'center',
    borderRadius: semanticTokens.radiusElement,
    color: semanticTokens.colorTextSecondary,
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    gap: semanticTokens.spacingSm,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    textDecorationLine: 'none',
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover': {
      backgroundColor: semanticTokens.colorOverlayHover,
      color: semanticTokens.colorText,
    },
  },
  current: {
    backgroundColor: semanticTokens.colorOverlayActive,
    color: semanticTokens.colorText,
    fontWeight: semanticTokens.fontWeightMedium,
  },
});

/** Props for one destination inside a navigation menu. */
export interface NavItemProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'aria-current' | 'className' | 'href'
> {
  readonly current?: boolean;
  readonly href: string;
  readonly leading?: ReactNode;
}

/**
 * Links to one destination. `current` marks the reader's location with
 * `aria-current="page"` rather than colour alone.
 */
export function NavItem({
  children,
  current = false,
  href,
  leading,
  ...props
}: NavItemProps) {
  return (
    <Link
      {...props}
      {...(current ? {'aria-current': 'page' as const} : {})}
      href={href}
      {...stylex.props(styles.item, current && styles.current)}
    >
      {leading}
      {children}
    </Link>
  );
}
