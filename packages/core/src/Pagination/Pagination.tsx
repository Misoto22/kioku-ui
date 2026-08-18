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
  control: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    color: semanticTokens.colorText,
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    height: semanticTokens.sizeControlSm,
    justifyContent: 'center',
    minWidth: semanticTokens.sizeControlSm,
    paddingInline: semanticTokens.spacingSm,
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
    ':hover:not(:disabled)': {
      backgroundColor: semanticTokens.colorOverlayHover,
    },
  },
  current: {
    backgroundColor: semanticTokens.colorAccent,
    borderColor: semanticTokens.colorAccent,
    color: semanticTokens.colorTextOnAccent,
  },
  ellipsis: {
    color: semanticTokens.colorTextMuted,
    fontSize: semanticTokens.fontSizeSm,
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
            type="button"
            {...stylex.props(styles.control)}
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
                aria-current={entry === page ? 'page' : undefined}
                aria-label={`Page ${entry}`}
                onClick={() => {
                  onChange(entry);
                }}
                type="button"
                {...stylex.props(
                  styles.control,
                  entry === page && styles.current,
                )}
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
            type="button"
            {...stylex.props(styles.control)}
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
