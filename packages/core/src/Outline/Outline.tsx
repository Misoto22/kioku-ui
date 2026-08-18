import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Link} from '../navigation/index.js';

const styles = stylex.create({
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingXs,
    listStyleType: 'none',
    marginBlock: 0,
    paddingInlineStart: 0,
  },
  entry: {
    borderInlineStartColor: semanticTokens.borderDefault,
    borderInlineStartStyle: semanticTokens.borderStyle,
    borderInlineStartWidth: semanticTokens.focusWidth,
    color: semanticTokens.colorTextSecondary,
    display: 'block',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    lineHeight: semanticTokens.lineHeightBody,
    paddingBlock: semanticTokens.spacingXs,
    textDecorationLine: 'none',
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover': {color: semanticTokens.colorText},
  },
  current: {
    borderInlineStartColor: semanticTokens.colorAccent,
    color: semanticTokens.colorText,
  },
  depth1: {paddingInlineStart: semanticTokens.spacingMd},
  depth2: {paddingInlineStart: semanticTokens.spacingXl},
  depth3: {paddingInlineStart: semanticTokens.spacing2xl},
});

const depths = {
  1: styles.depth1,
  2: styles.depth2,
  3: styles.depth3,
} as const;

/** One heading in the page outline. */
export interface OutlineEntry {
  readonly depth?: 1 | 2 | 3;
  readonly href: string;
  readonly label: ReactNode;
}

/** Props for the in-page table of contents. */
export interface OutlineProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'className'
> {
  readonly currentHref?: string;
  readonly entries: readonly OutlineEntry[];
  readonly label?: string;
}

/**
 * Lists the headings of the current page so a reader can jump between them.
 * The active entry is marked with `aria-current`, not colour alone.
 */
export function Outline({
  currentHref,
  entries,
  label = 'On this page',
  ...props
}: OutlineProps) {
  return (
    <nav {...props} aria-label={label}>
      <ul {...stylex.props(styles.list)}>
        {entries.map(({depth = 1, href, label: entryLabel}) => {
          const current = href === currentHref;

          return (
            <li key={href}>
              <Link
                {...(current ? {'aria-current': 'location' as const} : {})}
                href={href}
                {...stylex.props(
                  styles.entry,
                  depths[depth],
                  current && styles.current,
                )}
              >
                {entryLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
