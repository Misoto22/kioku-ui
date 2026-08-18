import * as stylex from '@stylexjs/stylex';
import {useState, type HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Stack} from '../Stack/index.js';
import {Token} from '../Token/index.js';
import {Typeahead, type TypeaheadOption} from '../Typeahead/index.js';

const styles = stylex.create({
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: semanticTokens.spacingXs,
    listStyleType: 'none',
    marginBlock: 0,
    paddingInlineStart: 0,
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
    <Stack {...props} gap="sm">
      {chosen.length === 0 ? null : (
        <ul {...stylex.props(styles.chips)}>
          {chosen.map((option) => (
            <li key={option.value}>
              <Token
                onRemove={() => {
                  onValueChange(
                    value.filter((entry) => entry !== option.value),
                  );
                }}
                removeLabel={removeLabel(option.label)}
              >
                {option.label}
              </Token>
            </li>
          ))}
        </ul>
      )}
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
    </Stack>
  );
}
