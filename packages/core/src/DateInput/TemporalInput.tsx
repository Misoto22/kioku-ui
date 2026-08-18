import * as stylex from '@stylexjs/stylex';
import {useState, type ChangeEvent, type InputHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useFieldControl} from '../Field/index.js';

const styles = stylex.create({
  // An input sinks below the card it sits on: a muted fill with a real
  // hairline edge, never a shadow.
  control: {
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
    ':active:not(:disabled):not(:read-only):not(:focus-visible)': {
      borderColor: semanticTokens.colorAccentActive,
    },
    ':hover:not(:disabled):not(:read-only):not(:focus-visible)': {
      borderColor: semanticTokens.borderInteractive,
    },
  },
  // Read-only is not disabled: the value still reads at full strength, but the
  // control stops looking like a well you can type into.
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

/** Native input types that accept a point in time. */
export type TemporalInputType = 'date' | 'datetime-local' | 'time';

type SharedTemporalProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'className' | 'defaultValue' | 'onChange' | 'type' | 'value'
> & {
  readonly onValueChange?: (value: string) => void;
};

type ControlledTemporalProps = SharedTemporalProps & {
  readonly defaultValue?: never;
  readonly onValueChange: (value: string) => void;
  readonly value: string;
};

type UncontrolledTemporalProps = SharedTemporalProps & {
  readonly defaultValue?: string;
  readonly value?: never;
};

/** Props shared by every single-value temporal field. */
export type TemporalInputProps =
  ControlledTemporalProps | UncontrolledTemporalProps;

/**
 * @internal Shared native implementation for the temporal inputs. Values are
 * exchanged in the ISO form the platform control uses, never a localized one.
 */
export function TemporalInput({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  defaultValue = '',
  disabled,
  id,
  onValueChange,
  readOnly,
  required,
  type,
  value,
  ...props
}: TemporalInputProps & {readonly type: TemporalInputType}) {
  const field = useFieldControl();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const describedBy =
    [field?.describedBy, ariaDescribedBy].filter(Boolean).join(' ') ||
    undefined;
  const resolvedInvalid = ariaInvalid ?? field?.invalid;
  const invalid =
    resolvedInvalid !== undefined &&
    resolvedInvalid !== false &&
    resolvedInvalid !== 'false';

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.currentTarget.value;
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  }

  return (
    <input
      {...props}
      aria-describedby={describedBy}
      aria-invalid={resolvedInvalid}
      disabled={disabled}
      id={field?.controlId ?? id}
      onChange={handleChange}
      readOnly={readOnly}
      required={required ?? field?.required}
      {...stylex.props(
        styles.control,
        readOnly && !disabled ? styles.readOnly : undefined,
        invalid && !disabled ? styles.invalid : undefined,
      )}
      type={type}
      value={value ?? internalValue}
    />
  );
}
