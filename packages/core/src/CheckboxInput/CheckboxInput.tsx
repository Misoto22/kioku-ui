import * as stylex from '@stylexjs/stylex';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useFieldControl} from '../Field/index.js';

const styles = stylex.create({
  row: {
    alignItems: 'flex-start',
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingSm,
  },
  box: {
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
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingLabel,
    lineHeight: semanticTokens.lineHeightBody,
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'color',
    transitionTimingFunction: semanticTokens.easingStandard,
  },
  // Holding is a mark on the label, not a fill behind the row.
  labelChecked: {
    color: semanticTokens.colorText,
    fontWeight: semanticTokens.fontWeightMedium,
  },
  labelClear: {
    color: semanticTokens.colorTextSecondary,
    fontWeight: semanticTokens.fontWeightRegular,
  },
  labelDisabled: {
    color: semanticTokens.colorDisabledText,
    fontWeight: semanticTokens.fontWeightRegular,
  },
  description: {
    color: semanticTokens.colorTextMuted,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
  },
  descriptionDisabled: {color: semanticTokens.colorDisabledText},
});

type SharedCheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'checked' | 'children' | 'className' | 'defaultChecked' | 'onChange' | 'type'
> & {
  readonly description?: ReactNode;
  readonly indeterminate?: boolean;
  readonly label: ReactNode;
  readonly onCheckedChange?: (checked: boolean) => void;
};

type ControlledCheckboxProps = SharedCheckboxProps & {
  readonly checked: boolean;
  readonly defaultChecked?: never;
  readonly onCheckedChange: (checked: boolean) => void;
};

type UncontrolledCheckboxProps = SharedCheckboxProps & {
  readonly checked?: never;
  readonly defaultChecked?: boolean;
};

/** Props for a single independent choice. */
export type CheckboxInputProps =
  ControlledCheckboxProps | UncontrolledCheckboxProps;

/**
 * Records one independent choice. `indeterminate` is a display state only —
 * it never survives a click, because the DOM has no third value to submit.
 */
export function CheckboxInput({
  'aria-describedby': ariaDescribedBy,
  checked,
  defaultChecked = false,
  description,
  disabled,
  id,
  indeterminate = false,
  label,
  onCheckedChange,
  required,
  ...props
}: CheckboxInputProps) {
  const field = useFieldControl();
  const boxRef = useRef<HTMLInputElement>(null);
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = checked ?? internalChecked;
  const describedBy =
    [field?.describedBy, ariaDescribedBy].filter(Boolean).join(' ') ||
    undefined;

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.indeterminate = indeterminate && !isChecked;
    }
  }, [indeterminate, isChecked]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.currentTarget.checked;
    if (checked === undefined) {
      setInternalChecked(next);
    }
    onCheckedChange?.(next);
  }

  return (
    <label {...stylex.props(styles.row)}>
      <input
        {...props}
        aria-describedby={describedBy}
        checked={isChecked}
        disabled={disabled}
        id={field?.controlId ?? id}
        onChange={handleChange}
        ref={boxRef}
        required={required ?? field?.required}
        {...stylex.props(styles.box)}
        type="checkbox"
      />
      <span {...stylex.props(styles.text)}>
        <span
          {...stylex.props(
            styles.label,
            disabled
              ? styles.labelDisabled
              : isChecked
                ? styles.labelChecked
                : styles.labelClear,
          )}
        >
          {label}
        </span>
        {description === undefined ? null : (
          <span
            {...stylex.props(
              styles.description,
              disabled && styles.descriptionDisabled,
            )}
          >
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
