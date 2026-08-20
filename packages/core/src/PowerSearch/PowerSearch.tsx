import * as stylex from '@stylexjs/stylex';
import {
  useState,
  type FormEvent,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Button} from '../Button/index.js';
import {Icon} from '../Icon/index.js';
import {Token} from '../Token/index.js';

const styles = stylex.create({
  form: {
    display: 'grid',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingSm,
  },
  row: {
    alignItems: 'center',
    display: 'flex',
    gap: semanticTokens.spacingSm,
  },
  // The glass and the query are one line of text with a well drawn round it,
  // so they are separated by the same step that separates any icon from the
  // word beside it — not by the hairline step used inside a token.
  field: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxSizing: 'border-box',
    display: 'flex',
    flexGrow: 1,
    gap: semanticTokens.spacingSm,
    minHeight: semanticTokens.sizeControlMd,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'border-color',
    transitionTimingFunction: semanticTokens.easingStandard,
    ':hover': {borderColor: semanticTokens.borderInteractive},
    ':focus-within': {borderColor: semanticTokens.borderInteractive},
  },
  input: {
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    color: semanticTokens.colorText,
    flexGrow: 1,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    minWidth: 0,
    padding: 0,
    // WebKit grows its own cancel cross inside a search field. The filters
    // directly beneath this row are drawn by `Token`, down to the hit target
    // on their remove control — one engine-drawn cross in the middle of them
    // is the only mark on this component nobody chose.
    '::-webkit-search-cancel-button': {appearance: 'none'},
    '::placeholder': {color: semanticTokens.colorTextMuted},
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  // The same recipe `Token` uses for its remove control, because it is the
  // same gesture one line higher up: a visual box that tracks the type and a
  // reachable box that stays a full target.
  clear: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: semanticTokens.radiusInner,
    borderStyle: 'none',
    borderWidth: 0,
    color: semanticTokens.colorTextSecondary,
    cursor: 'pointer',
    display: 'inline-flex',
    flexShrink: 0,
    padding: 0,
    position: 'relative',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'color',
    transitionTimingFunction: semanticTokens.easingStandard,
    '::before': {
      content: '',
      height: semanticTokens.sizeHitTarget,
      insetBlockStart: '50%',
      insetInlineStart: '50%',
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      width: semanticTokens.sizeHitTarget,
    },
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover:not(:disabled)': {color: semanticTokens.colorText},
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: semanticTokens.spacingSm,
    listStyleType: 'none',
    marginBlock: 0,
    paddingInlineStart: 0,
  },
});

/** One applied search filter. */
export interface SearchFilter {
  readonly id: string;
  readonly label: string;
}

/** Props for a search field that carries applied filters. */
export interface PowerSearchProps extends Omit<
  HTMLAttributes<HTMLFormElement>,
  'children' | 'className' | 'onSubmit' | 'role'
> {
  readonly filters?: readonly SearchFilter[];
  readonly label: string;
  readonly onFiltersChange?: (filters: readonly SearchFilter[]) => void;
  readonly onSearch: (query: string) => void;
  readonly clearLabel?: string;
  readonly placeholder?: string;
  readonly submitLabel?: ReactNode;
}

/**
 * Searches with the filters already applied shown beside the query, so a
 * reader can see and undo each narrowing rather than wondering why a result
 * set looks short.
 */
export function PowerSearch({
  clearLabel = 'Clear search',
  filters = [],
  label,
  onFiltersChange,
  onSearch,
  placeholder,
  submitLabel = 'Search',
  ...props
}: PowerSearchProps) {
  const [query, setQuery] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(query);
  }

  return (
    <form
      {...props}
      onSubmit={handleSubmit}
      role="search"
      {...stylex.props(styles.form)}
    >
      <div {...stylex.props(styles.row)}>
        <div {...stylex.props(styles.field)}>
          {/* Sized off the type scale rather than an inherited em, so the
              glass keeps its proportion to the query at any density. */}
          <Icon size="md" tone="muted">
            <path
              d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </Icon>
          <input
            aria-label={label}
            onChange={(event) => {
              setQuery(event.currentTarget.value);
            }}
            placeholder={placeholder}
            value={query}
            {...stylex.props(styles.input)}
            type="search"
          />
          {query === '' ? null : (
            <button
              aria-label={clearLabel}
              onClick={() => {
                setQuery('');
              }}
              type="button"
              {...stylex.props(styles.clear)}
            >
              <Icon size="sm" tone="inherit">
                <path
                  d="M6 6 18 18M18 6 6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </Icon>
            </button>
          )}
        </div>
        <Button type="submit">{submitLabel}</Button>
      </div>
      {filters.length === 0 ? null : (
        <ul {...stylex.props(styles.filters)}>
          {filters.map((filter) => (
            <li key={filter.id}>
              <Token
                onRemove={() => {
                  onFiltersChange?.(
                    filters.filter((entry) => entry.id !== filter.id),
                  );
                }}
                removeLabel={`Remove filter ${filter.label}`}
              >
                {filter.label}
              </Token>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
