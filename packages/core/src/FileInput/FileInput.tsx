import * as stylex from '@stylexjs/stylex';
import {useState, type ChangeEvent, type InputHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useInternationalization} from '../i18n/index.js';
import {useFieldControl} from '../Field/index.js';

const styles = stylex.create({
  // The control and the name it reports are one field, so the gap between
  // them belongs to this container rather than to a margin on either.
  field: {display: 'grid', gap: semanticTokens.spacingXs},
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
    cursor: 'pointer',
    display: 'block',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingLabel,
    lineHeight: semanticTokens.lineHeightBody,
    minHeight: semanticTokens.sizeControlMd,
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
      cursor: 'default',
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
  summary: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingLabel,
    lineHeight: semanticTokens.lineHeightBody,
    margin: 0,
  },
});

/** Props for choosing one or more files. */
export interface FileInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'className' | 'onChange' | 'type' | 'value'
> {
  readonly onFilesChange?: (files: readonly File[]) => void;
}

/**
 * Chooses files through the native picker and names the current selection in
 * text, because the file list itself is not announced by the control alone.
 */
export function FileInput({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  disabled,
  id,
  multiple,
  onFilesChange,
  required,
  ...props
}: FileInputProps) {
  const field = useFieldControl();
  const {messages} = useInternationalization();
  const [names, setNames] = useState<readonly string[]>([]);
  const describedBy =
    [field?.describedBy, ariaDescribedBy].filter(Boolean).join(' ') ||
    undefined;
  const resolvedInvalid = ariaInvalid ?? field?.invalid;
  const invalid =
    resolvedInvalid !== undefined &&
    resolvedInvalid !== false &&
    resolvedInvalid !== 'false';

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.currentTarget.files ?? [])];
    setNames(files.map((file) => file.name));
    onFilesChange?.(files);
  }

  return (
    <div {...stylex.props(styles.field)}>
      <input
        {...props}
        aria-describedby={describedBy}
        aria-invalid={resolvedInvalid}
        disabled={disabled}
        id={field?.controlId ?? id}
        multiple={multiple}
        onChange={handleChange}
        required={required ?? field?.required}
        {...stylex.props(
          styles.control,
          invalid && !disabled ? styles.invalid : undefined,
        )}
        type="file"
      />
      <p aria-live="polite" role="status" {...stylex.props(styles.summary)}>
        {names.length === 0 ? messages.fileInputEmpty : names.join(', ')}
      </p>
    </div>
  );
}
