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
    ':hover:not(:disabled):not(:read-only):not(:focus-visible)': {
      borderColor: semanticTokens.borderInteractive,
    },
  },
  invalid: {borderColor: semanticTokens.statusDangerText},
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
      id={field?.controlId ?? id}
      onChange={handleChange}
      readOnly={readOnly}
      required={required ?? field?.required}
      type={type}
      value={value ?? internalValue}
      {...stylex.props(styles.control, invalid && styles.invalid)}
    />
  );
}
