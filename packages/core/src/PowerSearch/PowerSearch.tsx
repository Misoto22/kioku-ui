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
    '::placeholder': {color: semanticTokens.colorTextMuted},
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
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
  readonly placeholder?: string;
  readonly submitLabel?: ReactNode;
}

/**
 * Searches with the filters already applied shown beside the query, so a
 * reader can see and undo each narrowing rather than wondering why a result
 * set looks short.
 */
export function PowerSearch({
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
