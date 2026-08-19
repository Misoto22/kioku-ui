import * as stylex from '@stylexjs/stylex';
import {useState, type ChangeEvent, type InputHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useFieldControl} from '../Field/index.js';

const styles = stylex.create({
  // An input sinks below the card it sits on: a muted fill with a real
  // hairline edge, never a shadow. The figures are monospaced and tabular —
  // this field is usually one of a stacked column of them, and proportional
  // digits put every value on its own margin. Mono is also the one type role
  // that tightens rather than opens.
  control: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxSizing: 'border-box',
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyMono,
    fontSize: semanticTokens.fontSizeMd,
    fontVariantNumeric: 'tabular-nums',
    height: semanticTokens.sizeControlMd,
    letterSpacing: semanticTokens.letterSpacingMono,
    lineHeight: semanticTokens.lineHeightBody,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    textAlign: 'end',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, border-color, color',
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
    ':active:not(:disabled):not(:read-only):not(:focus-visible)': {
      borderColor: semanticTokens.colorAccentActive,
    },
    ':hover:not(:disabled):not(:read-only):not(:focus-visible)': {
      borderColor: semanticTokens.borderInteractive,
    },
  },
  // Read-only is not disabled: the figure still reads at full strength, but
  // the control stops looking like a well you can type into.
  readOnly: {
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderDefault,
    color: semanticTokens.colorText,
  },
  invalid: {
    borderColor: semanticTokens.statusDangerText,
    ':focus-visible': {borderColor: semanticTokens.statusDangerText},
    ':active:not(:disabled):not(:read-only):not(:focus-visible)': {
      borderColor: semanticTokens.statusDangerText,
    },
    ':hover:not(:disabled):not(:read-only):not(:focus-visible)': {
      borderColor: semanticTokens.statusDangerText,
    },
  },
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
    disabled,
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
      disabled={disabled}
      id={field?.controlId ?? id}
      inputMode="decimal"
      onChange={handleChange}
      readOnly={readOnly}
      required={required ?? field?.required}
      {...stylex.props(
        styles.control,
        readOnly && !disabled ? styles.readOnly : undefined,
        invalid && !disabled ? styles.invalid : undefined,
      )}
      type="number"
      value={
        controlled ? (value === undefined ? '' : String(value)) : internalValue
      }
    />
  );
}
