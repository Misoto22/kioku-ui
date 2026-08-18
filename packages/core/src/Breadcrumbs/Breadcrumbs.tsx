import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Link} from '../navigation/index.js';

const styles = stylex.create({
  nav: {fontFamily: semanticTokens.fontFamilyBody},
  list: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: semanticTokens.spacingXs,
    listStyleType: 'none',
    marginBlock: 0,
    paddingInlineStart: 0,
  },
  item: {
    alignItems: 'center',
    display: 'flex',
    gap: semanticTokens.spacingXs,
  },
  separator: {
    color: semanticTokens.colorTextMuted,
    fontSize: semanticTokens.fontSizeSm,
  },
  current: {
    color: semanticTokens.colorText,
    fontSize: semanticTokens.fontSizeSm,
    fontWeight: semanticTokens.fontWeightMedium,
  },
  // The trail reads as one line, so the links match the current-page text
  // rather than inheriting the surrounding body size.
  link: {
    color: semanticTokens.colorTextSecondary,
    fontSize: semanticTokens.fontSizeSm,
    textDecorationLine: 'none',
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover': {
      color: semanticTokens.colorText,
      textDecorationLine: 'underline',
    },
  },
});

/** One step on the path to the current page. */
export interface BreadcrumbItem {
  readonly href?: string;
  readonly label: ReactNode;
}

/** Props for the trail leading to the current page. */
export interface BreadcrumbsProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'className'
> {
  readonly items: readonly BreadcrumbItem[];
  readonly label?: string;
  readonly separator?: ReactNode;
}

/**
 * Shows the path to the current page. The last item is rendered as text and
 * marked `aria-current`, because a link to the page you are on is not a link.
 */
export function Breadcrumbs({
  items,
  label = 'Breadcrumb',
  separator = '/',
  ...props
}: BreadcrumbsProps) {
  return (
    <nav {...props} aria-label={label} {...stylex.props(styles.nav)}>
      <ol {...stylex.props(styles.list)}>
        {items.map(({href, label: itemLabel}, index) => {
          const last = index === items.length - 1;

          return (
            <li key={index} {...stylex.props(styles.item)}>
              {href === undefined || last ? (
                <span
                  {...(last ? {'aria-current': 'page' as const} : {})}
                  {...stylex.props(styles.current)}
                >
                  {itemLabel}
                </span>
              ) : (
                <Link href={href} {...stylex.props(styles.link)}>
                  {itemLabel}
                </Link>
              )}
              {last ? null : (
                <span aria-hidden="true" {...stylex.props(styles.separator)}>
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
