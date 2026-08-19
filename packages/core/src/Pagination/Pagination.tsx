import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useInternationalization} from '../i18n/index.js';
import {Icon} from '../Icon/index.js';

const styles = stylex.create({
  nav: {fontFamily: semanticTokens.fontFamilyBody},
  list: {
    alignItems: 'center',
    display: 'flex',
    gap: semanticTokens.spacingXs,
    listStyleType: 'none',
    marginBlock: 0,
    paddingInlineStart: 0,
  },
  step: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxSizing: 'border-box',
    color: semanticTokens.colorText,
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    height: semanticTokens.sizeControlSm,
    justifyContent: 'center',
    letterSpacing: semanticTokens.letterSpacingLabel,
    minWidth: semanticTokens.sizeControlSm,
    paddingInline: semanticTokens.spacingSm,
    transitionDuration: semanticTokens.durationFast,
    transitionProperty:
      'background-color, background-image, border-color, color',
    transitionTimingFunction: semanticTokens.easingStandard,
    ':disabled': {
      backgroundColor: semanticTokens.colorDisabledSurface,
      borderColor: semanticTokens.borderDisabled,
      color: semanticTokens.colorDisabledText,
      cursor: 'default',
    },
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    // The step stands on `colorSurface`, so its wash is laid over that fill
    // rather than replacing it: swapping the background colour for a 4%
    // overlay drops the surface and lets the canvas through on hover.
    ':active:not(:disabled)': {
      backgroundImage: `linear-gradient(${semanticTokens.colorOverlayActive}, ${semanticTokens.colorOverlayActive})`,
      borderColor: semanticTokens.borderInteractive,
    },
    ':hover:not(:disabled):not(:active)': {
      backgroundImage: `linear-gradient(${semanticTokens.colorOverlayHover}, ${semanticTokens.colorOverlayHover})`,
      borderColor: semanticTokens.borderInteractive,
    },
  },
  // A page number is a link in a row of links, not a control with an edge:
  // the strip stays quiet until one number is marked as the current page.
  //
  // It is also a figure, so it is set in the mono face with tabular figures.
  // Proportional digits make 8 wider than 1, and a strip whose numbers change
  // width as the reader walks through the pages wobbles under the cursor.
  page: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBlockEndColor: 'transparent',
    borderBlockEndStyle: semanticTokens.borderStyle,
    borderBlockEndWidth: semanticTokens.focusWidth,
    borderBlockStartStyle: 'none',
    borderBlockStartWidth: 0,
    borderInlineStyle: 'none',
    borderInlineWidth: 0,
    borderRadius: semanticTokens.radiusElement,
    boxSizing: 'border-box',
    color: semanticTokens.colorTextSecondary,
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyMono,
    fontSize: semanticTokens.fontSizeSm,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: semanticTokens.fontWeightRegular,
    height: semanticTokens.sizeControlSm,
    justifyContent: 'center',
    letterSpacing: semanticTokens.letterSpacingMono,
    minWidth: semanticTokens.sizeControlSm,
    paddingInline: semanticTokens.spacingSm,
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, border-color, color',
    transitionTimingFunction: semanticTokens.easingStandard,
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  unselected: {
    ':active:not(:disabled)': {
      backgroundColor: semanticTokens.colorOverlayActive,
      color: semanticTokens.colorText,
    },
    ':hover:not(:disabled):not(:active)': {
      backgroundColor: semanticTokens.colorOverlayHover,
      color: semanticTokens.colorText,
    },
  },
  current: {
    borderBlockEndColor: semanticTokens.colorText,
    color: semanticTokens.colorText,
    cursor: 'default',
    fontWeight: semanticTokens.fontWeightMedium,
  },
  // The gap sits in the run of figures, so it takes the figures' face and the
  // third rank of ink: it is context, not a page you can go to.
  ellipsis: {
    color: semanticTokens.colorTextMuted,
    fontFamily: semanticTokens.fontFamilyMono,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingMono,
    paddingInline: semanticTokens.spacingXs,
  },
});

// Keeps the first page, the last page, and a window around the current one.
function pageWindow(page: number, pageCount: number, span: number) {
  const pages = new Set<number>([1, pageCount]);
  for (let offset = -span; offset <= span; offset += 1) {
    const candidate = page + offset;
    if (candidate >= 1 && candidate <= pageCount) {
      pages.add(candidate);
    }
  }

  const ordered = [...pages].sort((left, right) => left - right);
  const entries: Array<number | 'gap'> = [];
  let previous: number | undefined;

  for (const value of ordered) {
    if (previous !== undefined && value - previous > 1) {
      entries.push('gap');
    }
    entries.push(value);
    previous = value;
  }

  return entries;
}

/** Props for page-number navigation over a bounded result set. */
export interface PaginationProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'className' | 'onChange'
> {
  readonly label?: string;
  readonly onChange: (page: number) => void;
  readonly page: number;
  readonly pageCount: number;
  readonly siblingCount?: number;
}

/**
 * Moves between pages of a bounded result set. Use it only when a reader
 * needs to jump to a specific page; otherwise prefer cursor navigation.
 */
export function Pagination({
  label = 'Pagination',
  onChange,
  page,
  pageCount,
  siblingCount = 1,
  ...props
}: PaginationProps) {
  const {messages} = useInternationalization();
  const entries = pageWindow(page, pageCount, siblingCount);

  return (
    <nav {...props} aria-label={label} {...stylex.props(styles.nav)}>
      <ul {...stylex.props(styles.list)}>
        <li>
          <button
            aria-label={messages.paginationPrevious}
            disabled={page <= 1}
            onClick={() => {
              onChange(page - 1);
            }}
            {...stylex.props(styles.step)}
            type="button"
          >
            <Icon>
              <path
                d="m15 6-6 6 6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </Icon>
          </button>
        </li>
        {entries.map((entry, index) =>
          entry === 'gap' ? (
            <li key={`gap-${index}`} {...stylex.props(styles.ellipsis)}>
              <span aria-hidden="true">…</span>
            </li>
          ) : (
            <li key={entry}>
              <button
                {...(entry === page ? {'aria-current': 'page'} : {})}
                aria-label={`Page ${entry}`}
                onClick={() => {
                  onChange(entry);
                }}
                {...stylex.props(
                  styles.page,
                  entry === page ? styles.current : styles.unselected,
                )}
                type="button"
              >
                {entry}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            aria-label={messages.paginationNext}
            disabled={page >= pageCount}
            onClick={() => {
              onChange(page + 1);
            }}
            {...stylex.props(styles.step)}
            type="button"
          >
            <Icon>
              <path
                d="m9 6 6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </Icon>
          </button>
        </li>
      </ul>
    </nav>
  );
}
