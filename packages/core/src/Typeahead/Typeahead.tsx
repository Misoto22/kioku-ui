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

// The popup hangs one hairline gap below the field it belongs to.
const listboxOffset = `calc(100% + ${semanticTokens.spacingXs})`;
// Roughly eight rows before the list starts scrolling.
const listboxHeight = `calc(8 * ${semanticTokens.spacing2xl})`;

const styles = stylex.create({
  root: {display: 'grid', position: 'relative'},
  // A field sinks: the muted fill and the strong edge are what every other
  // text control in the system is painted with. Surface plus a hairline is
  // the read-only treatment, and wearing it at rest flattened the ladder.
  input: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxSizing: 'border-box',
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    height: semanticTokens.sizeControlMd,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'border-color',
    transitionTimingFunction: semanticTokens.easingStandard,
    width: '100%',
    '::placeholder': {color: semanticTokens.colorTextMuted},
    ':disabled': {
      backgroundColor: semanticTokens.colorDisabledSurface,
      borderColor: semanticTokens.borderDisabled,
      color: semanticTokens.colorDisabledText,
    },
    ':focus-visible': {
      borderColor: semanticTokens.borderInteractive,
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover:not(:disabled):not(:read-only):not(:focus-visible)': {
      borderColor: semanticTokens.borderInteractive,
    },
  },
  readOnly: {
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderDefault,
    color: semanticTokens.colorText,
  },
  invalid: {
    borderColor: semanticTokens.statusDangerText,
    ':focus-visible': {borderColor: semanticTokens.statusDangerText},
    ':hover:not(:disabled):not(:read-only):not(:focus-visible)': {
      borderColor: semanticTokens.statusDangerText,
    },
  },
  panel: {
    backgroundColor: semanticTokens.colorSurfaceRaised,
    borderRadius: semanticTokens.radiusContainer,
    boxShadow: semanticTokens.elevationMedium,
    insetBlockStart: listboxOffset,
    insetInline: 0,
    maxHeight: listboxHeight,
    overflowY: 'auto',
    paddingBlock: semanticTokens.spacingXs,
    position: 'absolute',
    zIndex: 1,
  },
  listbox: {listStyleType: 'none', marginBlock: 0, paddingInlineStart: 0},
  // A suggestion that is merely on offer is set in the second rank; the one
  // the keys are pointing at rises to the first.
  option: {
    color: semanticTokens.colorTextSecondary,
    cursor: 'pointer',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingLabel,
    lineHeight: semanticTokens.lineHeightBody,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, color',
    transitionTimingFunction: semanticTokens.easingStandard,
  },
  idle: {
    ':hover': {
      backgroundColor: semanticTokens.colorOverlayHover,
      color: semanticTokens.colorText,
    },
  },
  // The combobox keeps focus, so the wash and the ink together are the only
  // sign of where it points.
  active: {
    backgroundColor: semanticTokens.colorOverlayHover,
    color: semanticTokens.colorText,
  },
  empty: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    marginBlock: 0,
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
  | 'aria-activedescendant'
  | 'aria-autocomplete'
  | 'aria-controls'
  | 'aria-expanded'
  | 'autoComplete'
  | 'children'
  | 'className'
  | 'onChange'
  | 'onKeyDown'
  | 'onSelect'
  | 'role'
  | 'type'
  | 'value'
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
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  disabled,
  emptyMessage,
  id,
  inputValue,
  onInputValueChange,
  onSelect,
  options,
  readOnly,
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
  const describedBy =
    [field?.describedBy, ariaDescribedBy].filter(Boolean).join(' ') ||
    undefined;
  const resolvedInvalid = ariaInvalid ?? field?.invalid;
  const isInvalid =
    resolvedInvalid !== undefined &&
    resolvedInvalid !== false &&
    resolvedInvalid !== 'false';

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
    if (event.key === 'Home' || event.key === 'End') {
      if (!expanded || options.length === 0) {
        return;
      }
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? 0 : options.length - 1);
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
        // Named only while the popup it points at is rendered.
        aria-controls={expanded ? listboxId : undefined}
        aria-describedby={describedBy}
        aria-expanded={expanded}
        aria-invalid={resolvedInvalid}
        autoComplete="off"
        disabled={disabled}
        id={field?.controlId ?? id}
        onChange={(event) => {
          onInputValueChange(event.currentTarget.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        required={required ?? field?.required}
        role="combobox"
        value={inputValue}
        {...stylex.props(
          styles.input,
          readOnly && !disabled ? styles.readOnly : undefined,
          isInvalid && !disabled ? styles.invalid : undefined,
        )}
        type="text"
      />
      {!expanded ? null : (
        <div {...stylex.props(styles.panel)}>
          <ul id={listboxId} role="listbox" {...stylex.props(styles.listbox)}>
            {options.map((option, index) => (
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
                  index === activeIndex ? styles.active : styles.idle,
                )}
              >
                {option.label}
              </li>
            ))}
          </ul>
          {options.length === 0 ? (
            // A listbox may own nothing but options, so the notice sits beside
            // it and announces itself instead.
            <p role="status" {...stylex.props(styles.empty)}>
              {emptyMessage ?? messages.typeaheadEmpty}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
