import * as stylex from '@stylexjs/stylex';
import type {ChangeEvent, SelectHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useFieldControl} from '../Field/index.js';
import type {SelectorOption} from '../Selector/index.js';

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
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, border-color, color',
    transitionTimingFunction: semanticTokens.easingStandard,
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
  invalid: {
    borderColor: semanticTokens.statusDangerText,
    ':focus-visible': {borderColor: semanticTokens.statusDangerText},
    ':hover:not(:disabled)': {borderColor: semanticTokens.statusDangerText},
  },
});

/** A named group of related options. */
export interface SelectorGroup {
  readonly disabled?: boolean;
  readonly label: string;
  readonly options: readonly SelectorOption[];
}

type SharedComplexSelectorProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'children' | 'className' | 'defaultValue' | 'onChange' | 'value'
> & {
  readonly groups: readonly SelectorGroup[];
  readonly onValueChange?: (value: string) => void;
  readonly placeholder?: string;
};

type ControlledComplexSelectorProps = SharedComplexSelectorProps & {
  readonly defaultValue?: never;
  readonly onValueChange: (value: string) => void;
  readonly value: string;
};

type UncontrolledComplexSelectorProps = SharedComplexSelectorProps & {
  readonly defaultValue?: string;
  readonly value?: never;
};

/** Props for choosing one option from grouped lists. */
export type ComplexSelectorProps =
  ControlledComplexSelectorProps | UncontrolledComplexSelectorProps;

/**
 * Chooses one option from grouped lists. Groups become native `optgroup`
 * elements, so a screen reader announces which group an option belongs to.
 */
export function ComplexSelector({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  disabled,
  groups,
  id,
  onValueChange,
  placeholder,
  required,
  ...props
}: ComplexSelectorProps) {
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
      disabled={disabled}
      id={field?.controlId ?? id}
      onChange={handleChange}
      required={required ?? field?.required}
      {...stylex.props(
        styles.control,
        invalid && !disabled ? styles.invalid : undefined,
      )}
    >
      {placeholder === undefined ? null : (
        <option disabled value="">
          {placeholder}
        </option>
      )}
      {groups.map((group) => (
        <optgroup
          disabled={group.disabled ?? false}
          key={group.label}
          label={group.label}
        >
          {group.options.map((option) => (
            <option
              disabled={option.disabled ?? false}
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
