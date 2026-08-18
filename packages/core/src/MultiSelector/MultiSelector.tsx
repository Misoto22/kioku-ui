import * as stylex from '@stylexjs/stylex';
import {useState, type HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Icon} from '../Icon/index.js';
import {Typeahead, type TypeaheadOption} from '../Typeahead/index.js';

const styles = stylex.create({
  root: {display: 'grid', gap: semanticTokens.spacingSm},
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: semanticTokens.spacingXs,
    listStyleType: 'none',
    marginBlock: 0,
    paddingInlineStart: 0,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderRadius: semanticTokens.radiusFull,
    color: semanticTokens.colorText,
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    gap: semanticTokens.spacingXs,
    paddingBlock: semanticTokens.spacingXs,
    paddingInlineEnd: semanticTokens.spacingXs,
    paddingInlineStart: semanticTokens.spacingSm,
  },
  remove: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    borderRadius: semanticTokens.radiusFull,
    color: semanticTokens.colorTextSecondary,
    cursor: 'pointer',
    display: 'inline-flex',
    padding: 0,
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover': {color: semanticTokens.colorText},
  },
});

/** Props for choosing several options through a typeahead. */
export interface MultiSelectorProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'defaultValue' | 'onChange'
> {
  readonly emptyMessage?: string;
  readonly label: string;
  readonly onValueChange: (values: readonly string[]) => void;
  readonly options: readonly TypeaheadOption[];
  readonly removeLabel?: (label: string) => string;
  readonly value: readonly string[];
}

/**
 * Chooses several options through a typeahead. Each choice becomes a removable
 * chip with its own labelled button, so a keyboard reader can undo one pick
 * without clearing the rest.
 */
export function MultiSelector({
  emptyMessage,
  label,
  onValueChange,
  options,
  removeLabel = (chosen) => `Remove ${chosen}`,
  value,
  ...props
}: MultiSelectorProps) {
  const [query, setQuery] = useState('');

  const chosen = options.filter((option) => value.includes(option.value));
  const available = options.filter(
    (option) =>
      !value.includes(option.value) &&
      option.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div {...props} {...stylex.props(styles.root)}>
      <ul {...stylex.props(styles.chips)}>
        {chosen.map((option) => (
          <li key={option.value} {...stylex.props(styles.chip)}>
            {option.label}
            <button
              aria-label={removeLabel(option.label)}
              onClick={() => {
                onValueChange(value.filter((entry) => entry !== option.value));
              }}
              type="button"
              {...stylex.props(styles.remove)}
            >
              <Icon size="sm">
                <path
                  d="m6 6 12 12M18 6 6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </Icon>
            </button>
          </li>
        ))}
      </ul>
      <Typeahead
        aria-label={label}
        {...(emptyMessage === undefined ? {} : {emptyMessage})}
        inputValue={query}
        onInputValueChange={setQuery}
        onSelect={(option) => {
          onValueChange([...value, option.value]);
          setQuery('');
        }}
        options={available}
      />
    </div>
  );
}
