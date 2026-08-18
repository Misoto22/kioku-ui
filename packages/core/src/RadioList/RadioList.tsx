import * as stylex from '@stylexjs/stylex';
import {useId, useState, type HTMLAttributes, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  group: {
    border: 0,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingSm,
    margin: 0,
    padding: 0,
  },
  legend: {
    color: semanticTokens.colorText,
    fontSize: semanticTokens.fontSizeSm,
    fontWeight: semanticTokens.fontWeightMedium,
    padding: 0,
  },
  row: {
    alignItems: 'flex-start',
    display: 'flex',
    gap: semanticTokens.spacingSm,
  },
  dot: {
    accentColor: semanticTokens.colorAccent,
    blockSize: semanticTokens.spacingMd,
    flexShrink: 0,
    inlineSize: semanticTokens.spacingMd,
    marginBlockStart: semanticTokens.spacingXs,
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  text: {
    display: 'flex',
    flexDirection: 'column',
    gap: semanticTokens.spacingXs,
  },
  label: {
    color: semanticTokens.colorText,
    fontSize: semanticTokens.fontSizeMd,
    lineHeight: semanticTokens.lineHeightBody,
  },
  description: {
    color: semanticTokens.colorTextSecondary,
    fontSize: semanticTokens.fontSizeSm,
    lineHeight: semanticTokens.lineHeightBody,
  },
  disabled: {color: semanticTokens.colorDisabledText},
});

/** One mutually exclusive choice. */
export interface RadioOption {
  readonly description?: ReactNode;
  readonly disabled?: boolean;
  readonly label: ReactNode;
  readonly value: string;
}

type SharedRadioListProps = Omit<
  HTMLAttributes<HTMLFieldSetElement>,
  'children' | 'className' | 'defaultValue' | 'onChange'
> & {
  readonly legend: ReactNode;
  readonly onValueChange?: (value: string) => void;
  readonly options: readonly RadioOption[];
};

type ControlledRadioListProps = SharedRadioListProps & {
  readonly defaultValue?: never;
  readonly onValueChange: (value: string) => void;
  readonly value: string;
};

type UncontrolledRadioListProps = SharedRadioListProps & {
  readonly defaultValue?: string;
  readonly value?: never;
};

/** Props for a set of mutually exclusive choices. */
export type RadioListProps =
  ControlledRadioListProps | UncontrolledRadioListProps;

/**
 * Offers mutually exclusive choices. It emits a `fieldset` with a `legend`, so
 * assistive technology announces the question before the answers.
 */
export function RadioList({
  defaultValue,
  legend,
  onValueChange,
  options,
  value,
  ...props
}: RadioListProps) {
  const name = useId();
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const selected = value ?? internalValue;

  return (
    <fieldset {...props} {...stylex.props(styles.group)}>
      <legend {...stylex.props(styles.legend)}>{legend}</legend>
      {options.map(({description, disabled, label, value: optionValue}) => (
        <label key={optionValue} {...stylex.props(styles.row)}>
          <input
            checked={selected === optionValue}
            disabled={disabled ?? false}
            name={name}
            onChange={() => {
              if (value === undefined) {
                setInternalValue(optionValue);
              }
              onValueChange?.(optionValue);
            }}
            type="radio"
            value={optionValue}
            {...stylex.props(styles.dot)}
          />
          <span {...stylex.props(styles.text)}>
            <span {...stylex.props(styles.label, disabled && styles.disabled)}>
              {label}
            </span>
            {description === undefined ? null : (
              <span
                {...stylex.props(
                  styles.description,
                  disabled && styles.disabled,
                )}
              >
                {description}
              </span>
            )}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
