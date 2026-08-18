import * as stylex from '@stylexjs/stylex';
import {
  useId,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useInternationalization} from '../i18n/index.js';
import {useFieldControl} from '../Field/index.js';

const styles = stylex.create({
  root: {display: 'grid', gap: semanticTokens.spacingXs, position: 'relative'},
  input: {
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxSizing: 'border-box',
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    height: semanticTokens.sizeControlMd,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    width: '100%',
    ':focus-visible': {
      borderColor: semanticTokens.borderInteractive,
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  listbox: {
    backgroundColor: semanticTokens.colorSurfaceRaised,
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusContainer,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxShadow: semanticTokens.elevationMedium,
    listStyleType: 'none',
    marginBlock: 0,
    maxHeight: '14rem',
    overflowY: 'auto',
    paddingBlock: semanticTokens.spacingXs,
    paddingInlineStart: 0,
  },
  option: {
    color: semanticTokens.colorText,
    cursor: 'pointer',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
  },
  active: {backgroundColor: semanticTokens.colorOverlayHover},
  empty: {
    color: semanticTokens.colorTextMuted,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
  },
});

/** One suggestion offered by a `Typeahead`. */
export interface TypeaheadOption {
  readonly label: string;
  readonly value: string;
}

/** Props for a text field with filtered suggestions. */
export interface TypeaheadProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'className' | 'onChange' | 'onSelect' | 'type' | 'value'
> {
  readonly emptyMessage?: ReactNode;
  readonly inputValue: string;
  readonly onInputValueChange: (value: string) => void;
  readonly onSelect: (option: TypeaheadOption) => void;
  readonly options: readonly TypeaheadOption[];
}

/**
 * Filters suggestions as the reader types, following the ARIA combobox
 * pattern: the input keeps focus and `aria-activedescendant` names the
 * highlighted option, so a screen reader announces it without focus moving.
 */
export function Typeahead({
  emptyMessage,
  id,
  inputValue,
  onInputValueChange,
  onSelect,
  options,
  required,
  ...props
}: TypeaheadProps) {
  const field = useFieldControl();
  const {messages} = useInternationalization();
  const listboxId = useId();
  const optionPrefix = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const expanded = open && inputValue !== '';
  const activeOption = options[activeIndex];

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      if (options.length > 0) {
        const step = event.key === 'ArrowDown' ? 1 : -1;
        setActiveIndex(
          (index) => (index + step + options.length) % options.length,
        );
      }
      return;
    }
    if (event.key === 'Enter' && expanded && activeOption) {
      event.preventDefault();
      onSelect(activeOption);
      setOpen(false);
      return;
    }
    if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div {...stylex.props(styles.root)}>
      <input
        {...props}
        aria-activedescendant={
          expanded && activeOption
            ? `${optionPrefix}-${activeIndex}`
            : undefined
        }
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-describedby={field?.describedBy}
        aria-expanded={expanded}
        autoComplete="off"
        id={field?.controlId ?? id}
        onChange={(event) => {
          onInputValueChange(event.currentTarget.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        required={required ?? field?.required}
        role="combobox"
        type="text"
        value={inputValue}
        {...stylex.props(styles.input)}
      />
      <ul id={listboxId} role="listbox" {...stylex.props(styles.listbox)}>
        {!expanded ? null : options.length === 0 ? (
          <li {...stylex.props(styles.empty)}>
            {emptyMessage ?? messages.typeaheadEmpty}
          </li>
        ) : (
          options.map((option, index) => (
            <li
              aria-selected={index === activeIndex}
              id={`${optionPrefix}-${index}`}
              key={option.value}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
              role="option"
              {...stylex.props(
                styles.option,
                index === activeIndex && styles.active,
              )}
            >
              {option.label}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
