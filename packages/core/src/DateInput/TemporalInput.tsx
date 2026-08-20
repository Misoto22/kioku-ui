import * as stylex from '@stylexjs/stylex';
import {
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {Icon} from '../Icon/index.js';
import {useFieldControl} from '../Field/index.js';

const styles = stylex.create({
  // An input sinks below the card it sits on: a muted fill with a real
  // hairline edge, never a shadow. What it holds is a figure, so it is set in
  // the mono face with tabular figures — a date whose digits shift width as
  // the reader steps a month is the loudest thing a quiet field can do, and
  // two of these side by side in a range would never line up.
  // The well is the frame, because the trigger lives inside it. What the
  // engine used to put there was its own glyph — a blue calendar in Blink, a
  // grey one in WebKit — sitting in a field this system had otherwise drawn
  // down to the hairline.
  frame: {
    alignItems: 'stretch',
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxSizing: 'border-box',
    display: 'flex',
    height: semanticTokens.sizeControlMd,
    overflow: 'hidden',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, border-color',
    transitionTimingFunction: semanticTokens.easingStandard,
    width: '100%',
    ':focus-within': {borderColor: semanticTokens.borderInteractive},
    ':hover': {borderColor: semanticTokens.borderInteractive},
  },
  frameDisabled: {
    backgroundColor: semanticTokens.colorDisabledSurface,
    borderColor: semanticTokens.borderDisabled,
    ':hover': {borderColor: semanticTokens.borderDisabled},
  },
  frameReadOnly: {
    backgroundColor: semanticTokens.colorSurface,
    borderColor: semanticTokens.borderDefault,
  },
  frameInvalid: {
    borderColor: semanticTokens.statusDangerText,
    ':focus-within': {borderColor: semanticTokens.statusDangerText},
    ':hover': {borderColor: semanticTokens.statusDangerText},
  },
  // Our own trigger, in the well rather than on it — the same column the
  // number field gives its steppers. It opens the platform's picker, which is
  // the half of this control worth keeping: the wheel on a phone, the reader's
  // own date order, and the whole accessibility tree come with it.
  trigger: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderInlineStartColor: semanticTokens.borderDefault,
    borderInlineStartStyle: semanticTokens.borderStyle,
    borderInlineStartWidth: semanticTokens.borderWidth,
    color: semanticTokens.colorTextSecondary,
    cursor: 'pointer',
    display: 'flex',
    flexShrink: 0,
    inlineSize: semanticTokens.spacing2xl,
    justifyContent: 'center',
    padding: 0,
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, color',
    transitionTimingFunction: semanticTokens.easingStandard,
    ':active': {backgroundColor: semanticTokens.colorOverlayActive},
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: `calc(-1 * ${semanticTokens.focusOffset})`,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover': {
      backgroundColor: semanticTokens.colorOverlayHover,
      color: semanticTokens.colorText,
    },
  },
  control: {
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    boxSizing: 'border-box',
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyMono,
    fontSize: semanticTokens.fontSizeSm,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: semanticTokens.letterSpacingMono,
    lineHeight: semanticTokens.lineHeightBody,
    minWidth: 0,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    width: '100%',
    // The engine's own trigger, turned off. The component draws one beside it
    // and calls `showPicker()`, so the platform's picker still opens — this
    // hides the glyph, not the behaviour.
    '::-webkit-calendar-picker-indicator': {display: 'none'},
    // The separators are not data. Set at the same weight as the figures they
    // part, a date reads as one seven-digit run rather than as three fields.
    '::-webkit-datetime-edit-text': {
      color: semanticTokens.colorTextMuted,
      paddingInline: 0,
    },
    ':disabled': {color: semanticTokens.colorDisabledText},
    ':focus-visible': {outlineStyle: 'none'},
  },
  // An empty control shows `dd/mm/yyyy`, and it used to show it in the same
  // ink as a real date directly above it — the reader could not tell an
  // answered field from an unanswered one. The engine gives no selector for
  // "no value", so the component supplies the fact it already holds.
  empty: {
    color: semanticTokens.colorTextMuted,
    '::-webkit-datetime-edit': {color: semanticTokens.colorTextMuted},
  },
  // Read-only is not disabled: the value still reads at full strength, but the
  // control stops looking like a well you can type into.
  readOnly: {color: semanticTokens.colorText},
});

/** Native input types that accept a point in time. */
export type TemporalInputType = 'date' | 'datetime-local' | 'time';

const defaultPickerLabels: Record<TemporalInputType, string> = {
  date: 'Choose a date',
  'datetime-local': 'Choose a date and time',
  time: 'Choose a time',
};

type SharedTemporalProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'className' | 'defaultValue' | 'onChange' | 'type' | 'value'
> & {
  readonly onValueChange?: (value: string) => void;
  /**
   * Opens a picker of the caller's own instead of the platform's. `DatePicker`
   * supplies one; without it the trigger opens the platform picker, which is
   * the right default because that picker brings the phone wheel, the reader's
   * date order and the accessibility tree with it.
   */
  readonly onPickerOpen?: () => void;
  /** Names the control that opens the picker. */
  readonly pickerLabel?: string;
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
  onPickerOpen,
  onValueChange,
  pickerLabel,
  readOnly,
  required,
  type,
  value,
  ...props
}: TemporalInputProps & {readonly type: TemporalInputType}) {
  const field = useFieldControl();
  const controlRef = useRef<HTMLInputElement>(null);
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

  const shown = value ?? internalValue;
  const opensPicker = !disabled && !readOnly;

  // `showPicker` is the only way to open the platform picker once its own
  // glyph is hidden. Where it is missing the trigger is not drawn at all — a
  // control that does nothing when pressed is worse than one that is absent,
  // and the field still types and steps on the keyboard without it.
  function openPicker() {
    if (onPickerOpen) {
      onPickerOpen();
      return;
    }
    const control = controlRef.current;
    if (typeof control?.showPicker === 'function') {
      control.showPicker();
    }
  }

  return (
    <span
      {...stylex.props(
        styles.frame,
        readOnly && !disabled ? styles.frameReadOnly : undefined,
        invalid && !disabled ? styles.frameInvalid : undefined,
        disabled ? styles.frameDisabled : undefined,
      )}
    >
      <input
        {...props}
        aria-describedby={describedBy}
        aria-invalid={resolvedInvalid}
        disabled={disabled}
        id={field?.controlId ?? id}
        onChange={handleChange}
        readOnly={readOnly}
        ref={controlRef}
        required={required ?? field?.required}
        {...stylex.props(
          styles.control,
          shown === '' && !disabled ? styles.empty : undefined,
          readOnly && !disabled ? styles.readOnly : undefined,
        )}
        type={type}
        value={shown}
      />
      {opensPicker ? (
        <button
          aria-label={pickerLabel ?? defaultPickerLabels[type]}
          onClick={openPicker}
          type="button"
          {...(onPickerOpen ? {} : {tabIndex: -1})}
          {...stylex.props(styles.trigger)}
        >
          <Icon size="sm" tone="inherit">
            {type === 'time' ? (
              <>
                <circle
                  cx="12"
                  cy="12"
                  fill="none"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 7v5l3 2"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </>
            ) : (
              <>
                <rect
                  fill="none"
                  height="16"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="18"
                  x="3"
                  y="5"
                />
                <path
                  d="M3 10h18M8 3v4M16 3v4"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </>
            )}
          </Icon>
        </button>
      ) : null}
    </span>
  );
}
