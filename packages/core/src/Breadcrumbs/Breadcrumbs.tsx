import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Link} from '../navigation/index.js';

const styles = stylex.create({
  nav: {fontFamily: semanticTokens.fontFamilyBody},
  list: {
    alignItems: 'center',
    columnGap: semanticTokens.spacingXs,
    display: 'flex',
    flexWrap: 'wrap',
    listStyleType: 'none',
    marginBlock: 0,
    marginInline: 0,
    paddingInlineStart: 0,
    rowGap: semanticTokens.spacingXs,
  },
  item: {
    alignItems: 'center',
    columnGap: semanticTokens.spacingXs,
    display: 'flex',
  },
  // A trail is text and separators. There is no chip, no fill and no radius
  // here: the path is read, not clicked as a set of objects.
  separator: {
    color: semanticTokens.colorTextMuted,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingLabel,
  },
  current: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: semanticTokens.letterSpacingLabel,
  },
  // The trail reads as one line, so the links match the current-page text
  // rather than inheriting the surrounding body size.
  link: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingLabel,
    textDecorationLine: 'none',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'color',
    transitionTimingFunction: semanticTokens.easingStandard,
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
