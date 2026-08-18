import * as stylex from '@stylexjs/stylex';
import {useState, type ChangeEvent, type InputHTMLAttributes} from 'react';

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
    fontFamily: semanticTokens.fontFamilyMono,
    fontSize: semanticTokens.fontSizeMd,
    height: semanticTokens.sizeControlMd,
    lineHeight: semanticTokens.lineHeightBody,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    textAlign: 'end',
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
    ':hover:not(:disabled):not(:read-only):not(:focus-visible)': {
      borderColor: semanticTokens.borderInteractive,
    },
  },
  invalid: {borderColor: semanticTokens.statusDangerText},
});

type SharedNumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'className' | 'defaultValue' | 'onChange' | 'type' | 'value'
> & {
  readonly onValueChange?: (value: number | undefined) => void;
};

type ControlledNumberInputProps = SharedNumberInputProps & {
  readonly defaultValue?: never;
  readonly onValueChange: (value: number | undefined) => void;
  readonly value: number | undefined;
};

type UncontrolledNumberInputProps = SharedNumberInputProps & {
  readonly defaultValue?: number;
  readonly value?: never;
};

/** Props for a numeric entry field. */
export type NumberInputProps =
  ControlledNumberInputProps | UncontrolledNumberInputProps;

/**
 * Accepts a number. An empty field reports `undefined` rather than `0`, so a
 * caller can tell "not answered" apart from "answered zero".
 */
export function NumberInput(props: NumberInputProps) {
  // `value` may legitimately be undefined while controlled, so presence of the
  // prop — not its value — decides which mode the field is in.
  const controlled = 'value' in props;
  const {
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    defaultValue,
    id,
    onValueChange,
    readOnly,
    required,
    value,
    ...rest
  } = props;

  const field = useFieldControl();
  const [internalValue, setInternalValue] = useState(
    defaultValue === undefined ? '' : String(defaultValue),
  );
  const describedBy =
    [field?.describedBy, ariaDescribedBy].filter(Boolean).join(' ') ||
    undefined;
  const resolvedInvalid = ariaInvalid ?? field?.invalid;
  const invalid =
    resolvedInvalid !== undefined &&
    resolvedInvalid !== false &&
    resolvedInvalid !== 'false';

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.currentTarget.value;
    if (!controlled) {
      setInternalValue(raw);
    }
    onValueChange?.(raw === '' ? undefined : Number(raw));
  }

  return (
    <input
      {...rest}
      aria-describedby={describedBy}
      aria-invalid={resolvedInvalid}
      id={field?.controlId ?? id}
      inputMode="decimal"
      onChange={handleChange}
      readOnly={readOnly}
      required={required ?? field?.required}
      type="number"
      value={
        controlled ? (value === undefined ? '' : String(value)) : internalValue
      }
      {...stylex.props(styles.control, invalid && styles.invalid)}
    />
  );
}
