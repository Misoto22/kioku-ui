import * as stylex from '@stylexjs/stylex';
import type {ChangeEvent, ReactNode, SelectHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useFieldControl} from '../Field/index.js';

const styles = stylex.create({
  control: {
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
    lineHeight: semanticTokens.lineHeightBody,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    width: '100%',
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
    ':hover:not(:disabled)': {borderColor: semanticTokens.borderInteractive},
  },
  invalid: {borderColor: semanticTokens.statusDangerText},
});

/** One option in a `Selector`. */
export interface SelectorOption {
  readonly disabled?: boolean;
  readonly label: ReactNode;
  readonly value: string;
}

type SharedSelectorProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'children' | 'className' | 'defaultValue' | 'onChange' | 'value'
> & {
  readonly onValueChange?: (value: string) => void;
  readonly options: readonly SelectorOption[];
  readonly placeholder?: string;
};

type ControlledSelectorProps = SharedSelectorProps & {
  readonly defaultValue?: never;
  readonly onValueChange: (value: string) => void;
  readonly value: string;
};

type UncontrolledSelectorProps = SharedSelectorProps & {
  readonly defaultValue?: string;
  readonly value?: never;
};

/** Props for choosing one option from a closed list. */
export type SelectorProps = ControlledSelectorProps | UncontrolledSelectorProps;

/**
 * Chooses one option from a closed list using the native control, so the
 * platform supplies its own keyboard, touch, and screen-reader behaviour.
 */
export function Selector({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  id,
  onValueChange,
  options,
  placeholder,
  required,
  ...props
}: SelectorProps) {
  const field = useFieldControl();
  const describedBy =
    [field?.describedBy, ariaDescribedBy].filter(Boolean).join(' ') ||
    undefined;
  const resolvedInvalid = ariaInvalid ?? field?.invalid;
  const invalid =
    resolvedInvalid !== undefined &&
    resolvedInvalid !== false &&
    resolvedInvalid !== 'false';

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onValueChange?.(event.currentTarget.value);
  }

  return (
    <select
      {...props}
      aria-describedby={describedBy}
      aria-invalid={resolvedInvalid}
      id={field?.controlId ?? id}
      onChange={handleChange}
      required={required ?? field?.required}
      {...stylex.props(styles.control, invalid && styles.invalid)}
    >
      {placeholder === undefined ? null : (
        <option disabled value="">
          {placeholder}
        </option>
      )}
      {options.map(({disabled, label, value: optionValue}) => (
        <option
          disabled={disabled ?? false}
          key={optionValue}
          value={optionValue}
        >
          {label}
        </option>
      ))}
    </select>
  );
}
