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

// The box is one micro-control tall — the same block a switch track occupies,
// so a row of checkboxes and a row of switches sit on the same rhythm. Its
// offset is the relationship that matters: it centres on the *first line* of
// the label rather than on the label's whole box, so a label that wraps to two
// lines does not drag the box down with it. Both survive a density change
// because neither is a measurement.
const boxSize = semanticTokens.spacingLg;
const boxFirstLineOffset = `calc((${semanticTokens.fontSizeMd} * ${semanticTokens.lineHeightBody} - ${boxSize}) / 2)`;

// The mark inside the box. It is stroked at twice the hairline — one hairline
// disappears inside a 14px square — and sized as a fraction of the box rather
// than as a length, so it follows a density change the way the box does.
const markStroke = `calc(2 * ${semanticTokens.borderWidth})`;

const styles = stylex.create({
  row: {
    alignItems: 'flex-start',
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingSm,
  },
  // The box is drawn here, not by the engine. Left native, this component
  // contributed exactly one declaration — `accent-color` — and the browser
  // supplied the white fill, the #767676 edge, the radius, the check glyph and
  // every disabled grey. None of those are in this system, and no amount of
  // tinting makes them join it. `appearance: none` is what hands authorship
  // back; `Slider` makes the same move for the same reason.
  //
  // It is still a real `<input type="checkbox">`: the click target, the label
  // association, the form value, the space key and the accessibility tree all
  // stay where they were. Only the paint changes.
  box: {
    appearance: 'none',
    backgroundColor: semanticTokens.colorSurfaceMuted,
    blockSize: boxSize,
    borderColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxSizing: 'border-box',
    cursor: 'pointer',
    display: 'inline-block',
    flexShrink: 0,
    inlineSize: boxSize,
    // The UA gives a checkbox 3px/4px of its own margin. Left in place it
    // insets the box from the row's start edge and pushes the label to 9px,
    // so the 6px gap declared above was never the gap on screen.
    marginBlockEnd: 0,
    marginBlockStart: boxFirstLineOffset,
    marginInline: 0,
    position: 'relative',
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, border-color',
    transitionTimingFunction: semanticTokens.easingStandard,
    ':disabled': {
      backgroundColor: semanticTokens.colorDisabledSurface,
      borderColor: semanticTokens.borderDisabled,
      cursor: 'default',
    },
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover:not(:disabled)': {borderColor: semanticTokens.borderInteractive},
  },
  // Holding is a mark, not a fill: a tick stroked in ink inside the same well.
  // It is two edges of an empty box stood on its corner, so it takes its
  // colour from the palette — an image could not, across four skins and two
  // appearances.
  boxChecked: {
    '::before': {
      blockSize: '58%',
      borderBlockEndColor: semanticTokens.colorText,
      borderBlockEndStyle: semanticTokens.borderStyle,
      borderBlockEndWidth: markStroke,
      borderInlineEndColor: semanticTokens.colorText,
      borderInlineEndStyle: semanticTokens.borderStyle,
      borderInlineEndWidth: markStroke,
      content: '',
      inlineSize: '30%',
      insetBlockStart: '50%',
      insetInlineStart: '50%',
      position: 'absolute',
      transform: 'translate(-50%, -58%) rotate(45deg)',
    },
  },
  boxCheckedDisabled: {
    '::before': {
      borderBlockEndColor: semanticTokens.colorDisabledText,
      borderInlineEndColor: semanticTokens.colorDisabledText,
    },
  },
  // Partly held is a rule rather than a tick: the question has an answer, but
  // not one this box can state.
  boxIndeterminate: {
    '::before': {
      backgroundColor: semanticTokens.colorText,
      blockSize: markStroke,
      content: '',
      inlineSize: '50%',
      insetBlockStart: '50%',
      insetInlineStart: '50%',
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
    },
  },
  boxIndeterminateDisabled: {
    '::before': {backgroundColor: semanticTokens.colorDisabledText},
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

  // `indeterminate` is a DOM property rather than an attribute, so it is set
  // imperatively; the mark it draws is the same fact read back out.
  const showsDash = indeterminate && !isChecked;

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.indeterminate = showsDash;
    }
  }, [showsDash]);

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
        {...stylex.props(
          styles.box,
          isChecked && styles.boxChecked,
          isChecked && disabled && styles.boxCheckedDisabled,
          showsDash && styles.boxIndeterminate,
          showsDash && disabled && styles.boxIndeterminateDisabled,
        )}
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
