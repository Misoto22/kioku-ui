import * as stylex from '@stylexjs/stylex';
import {
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useFieldControl} from '../Field/index.js';

const styles = stylex.create({
  // An input sinks below the card it sits on: a muted fill with a real
  // hairline edge, never a shadow. The figures are monospaced and tabular —
  // this field is usually one of a stacked column of them, and proportional
  // digits put every value on its own margin. Mono is also the one type role
  // that tightens rather than opens.
  // The well is the frame now, because something else lives inside it. Left as
  // one bare `<input type="number">`, this control drew a careful well and then
  // let Chrome grow a pair of grey arrows in the corner of it — the one part of
  // the field the component had no say over.
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
  // The steppers are a column inside the well, parted from the figure by the
  // same hairline that parts anything from anything here — not a pair of
  // buttons floating on top of it.
  steppers: {
    borderInlineStartColor: semanticTokens.borderDefault,
    borderInlineStartStyle: semanticTokens.borderStyle,
    borderInlineStartWidth: semanticTokens.borderWidth,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    inlineSize: semanticTokens.spacingXl,
  },
  // Pointer affordances only: `aria-hidden` and out of the tab order, because
  // the input already steps on the arrow keys and a screen reader already
  // hears a spinbutton. Two more tab stops per field would be two more than
  // the control needs.
  step: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    cursor: 'pointer',
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'center',
    padding: 0,
    position: 'relative',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color',
    transitionTimingFunction: semanticTokens.easingStandard,
    ':hover': {backgroundColor: semanticTokens.colorOverlayHover},
    ':active': {backgroundColor: semanticTokens.colorOverlayActive},
    // The chevron: two edges of an empty square stood on a corner, the same
    // way the checkbox draws its tick. It takes its colour from the palette,
    // which is the whole point of not letting the engine draw it.
    '::before': {
      blockSize: semanticTokens.spacingSm,
      borderBlockStartColor: semanticTokens.colorTextSecondary,
      borderBlockStartStyle: semanticTokens.borderStyle,
      borderBlockStartWidth: semanticTokens.borderWidth,
      borderInlineStartColor: semanticTokens.colorTextSecondary,
      borderInlineStartStyle: semanticTokens.borderStyle,
      borderInlineStartWidth: semanticTokens.borderWidth,
      content: '',
      inlineSize: semanticTokens.spacingSm,
      position: 'absolute',
    },
  },
  stepUp: {
    borderBlockEndColor: semanticTokens.borderDefault,
    borderBlockEndStyle: semanticTokens.borderStyle,
    borderBlockEndWidth: semanticTokens.borderWidth,
    '::before': {transform: 'translateY(25%) rotate(45deg)'},
  },
  stepDown: {
    '::before': {transform: 'translateY(-25%) rotate(225deg)'},
  },
  control: {
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: 0,
    boxSizing: 'border-box',
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyMono,
    fontSize: semanticTokens.fontSizeMd,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: semanticTokens.letterSpacingMono,
    lineHeight: semanticTokens.lineHeightBody,
    minWidth: 0,
    // Firefox and Blink each grow their own stepper in the corner of a number
    // field. Neither can be styled into this system, and the component draws
    // its own beside them, so both are turned off rather than tinted.
    MozAppearance: 'textfield',
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    textAlign: 'end',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, border-color, color',
    transitionTimingFunction: semanticTokens.easingStandard,
    width: '100%',
    '::-webkit-inner-spin-button': {appearance: 'none', margin: 0},
    '::-webkit-outer-spin-button': {appearance: 'none', margin: 0},
    '::placeholder': {color: semanticTokens.colorTextMuted},
    ':disabled': {color: semanticTokens.colorDisabledText},
    ':focus-visible': {outlineStyle: 'none'},
  },
  // Read-only is not disabled: the figure still reads at full strength, but
  // the control stops looking like a well you can type into — and it loses
  // the steppers, because there is nothing to step.
  readOnly: {color: semanticTokens.colorText},
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
  const controlRef = useRef<HTMLInputElement>(null);
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

  function report(raw: string) {
    if (!controlled) {
      setInternalValue(raw);
    }
    onValueChange?.(raw === '' ? undefined : Number(raw));
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    report(event.currentTarget.value);
  }

  // The step is taken by the input itself: `stepUp`/`stepDown` already honour
  // `step`, `min` and `max`, and re-implementing that arithmetic here would be
  // a second, worse copy of a rule the platform already keeps.
  function step(direction: 'down' | 'up') {
    const control = controlRef.current;
    if (!control) {
      return;
    }
    if (direction === 'up') {
      control.stepUp();
    } else {
      control.stepDown();
    }
    report(control.value);
  }

  const steppable = !disabled && !readOnly;

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
        {...rest}
        aria-describedby={describedBy}
        aria-invalid={resolvedInvalid}
        disabled={disabled}
        id={field?.controlId ?? id}
        inputMode="decimal"
        onChange={handleChange}
        readOnly={readOnly}
        ref={controlRef}
        required={required ?? field?.required}
        {...stylex.props(
          styles.control,
          readOnly && !disabled ? styles.readOnly : undefined,
        )}
        type="number"
        value={
          controlled
            ? value === undefined
              ? ''
              : String(value)
            : internalValue
        }
      />
      {steppable ? (
        <span {...stylex.props(styles.steppers)}>
          <button
            aria-hidden="true"
            onClick={() => {
              step('up');
            }}
            tabIndex={-1}
            type="button"
            {...stylex.props(styles.step, styles.stepUp)}
          />
          <button
            aria-hidden="true"
            onClick={() => {
              step('down');
            }}
            tabIndex={-1}
            type="button"
            {...stylex.props(styles.step, styles.stepDown)}
          />
        </span>
      ) : null}
    </span>
  );
}
