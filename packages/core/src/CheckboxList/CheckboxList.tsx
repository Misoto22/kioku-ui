import * as stylex from '@stylexjs/stylex';
import {useState, type HTMLAttributes, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {CheckboxInput} from '../CheckboxInput/index.js';

const styles = stylex.create({
  group: {
    borderStyle: 'none',
    borderWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingSm,
    margin: 0,
    padding: 0,
  },
  legend: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: semanticTokens.letterSpacingLabel,
    lineHeight: semanticTokens.lineHeightBody,
    padding: 0,
  },
});

/** One independently selectable option. */
export interface CheckboxOption {
  readonly description?: ReactNode;
  readonly disabled?: boolean;
  readonly label: ReactNode;
  readonly value: string;
}

type SharedCheckboxListProps = Omit<
  HTMLAttributes<HTMLFieldSetElement>,
  'children' | 'className' | 'defaultValue' | 'onChange'
> & {
  readonly legend: ReactNode;
  readonly onValueChange?: (values: readonly string[]) => void;
  readonly options: readonly CheckboxOption[];
};

type ControlledCheckboxListProps = SharedCheckboxListProps & {
  readonly defaultValue?: never;
  readonly onValueChange: (values: readonly string[]) => void;
  readonly value: readonly string[];
};

type UncontrolledCheckboxListProps = SharedCheckboxListProps & {
  readonly defaultValue?: readonly string[];
  readonly value?: never;
};

/** Props for a set of independent choices under one question. */
export type CheckboxListProps =
  ControlledCheckboxListProps | UncontrolledCheckboxListProps;

/**
 * Collects independent choices under one question. Unlike `RadioList` any
 * number of options can hold at once.
 */
export function CheckboxList({
  defaultValue,
  legend,
  onValueChange,
  options,
  value,
  ...props
}: CheckboxListProps) {
  const [internalValue, setInternalValue] = useState<readonly string[]>(
    defaultValue ?? [],
  );
  const selected = value ?? internalValue;

  function toggle(optionValue: string, checked: boolean) {
    const next = checked
      ? [...selected, optionValue]
      : selected.filter((entry) => entry !== optionValue);

    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  }

  return (
    <fieldset {...props} {...stylex.props(styles.group)}>
      <legend {...stylex.props(styles.legend)}>{legend}</legend>
      {options.map(({description, disabled, label, value: optionValue}) => (
        <CheckboxInput
          checked={selected.includes(optionValue)}
          {...(description === undefined ? {} : {description})}
          disabled={disabled ?? false}
          key={optionValue}
          label={label}
          onCheckedChange={(checked) => {
            toggle(optionValue, checked);
          }}
        />
      ))}
    </fieldset>
  );
}
