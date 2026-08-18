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
  groups,
  id,
  onValueChange,
  placeholder,
  required,
  ...props
}: ComplexSelectorProps) {
  const field = useFieldControl();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onValueChange?.(event.currentTarget.value);
  }

  return (
    <select
      {...props}
      aria-describedby={field?.describedBy}
      id={field?.controlId ?? id}
      onChange={handleChange}
      required={required ?? field?.required}
      {...stylex.props(styles.control)}
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
