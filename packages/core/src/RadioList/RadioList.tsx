import * as stylex from '@stylexjs/stylex';
import {useId, useState, type HTMLAttributes, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

// The same block and the same centring `CheckboxInput` uses: one micro-control
// tall, sitting on the first line of its label rather than on the label's whole
// box, so a radio and a checkbox in the same form line up and a wrapped label
// does not drag the dot downwards. Written as a relationship so a density
// change carries both.
const dotSize = semanticTokens.spacingLg;
const dotFirstLineOffset = `calc((${semanticTokens.fontSizeMd} * ${semanticTokens.lineHeightBody} - ${dotSize}) / 2)`;

const styles = stylex.create({
  group: {
    borderStyle: 'none',
    borderWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: semanticTokens.fontFamilyBody,
    gap: semanticTokens.spacingSm,
    margin: 0,
    padding: 0,
  },
  // The question above the answers, set as the same eyebrow `Field` gives its
  // label: a legend and a field label do one job, and a form that mixes the
  // two sizes reads as two forms.
  legend: {
    color: semanticTokens.colorTextSecondary,
    fontFamily: semanticTokens.fontFamilyHeading,
    fontSize: semanticTokens.fontSizeXs,
    fontWeight: semanticTokens.fontWeightMedium,
    letterSpacing: semanticTokens.letterSpacingEyebrow,
    lineHeight: semanticTokens.lineHeightHeading,
    // A legend is not a flex item: the browser lifts it out of the fieldset's
    // formatting context and draws it in the border box, so the group's `gap`
    // never reaches it and the first row sat flush against the question. The
    // step has to be spent here, and it has to match the group's own gap.
    marginBlockEnd: semanticTokens.spacingSm,
    padding: 0,
  },
  row: {
    alignItems: 'flex-start',
    display: 'flex',
    gap: semanticTokens.spacingSm,
  },
  // One answer out of several, so the mark is a filled centre rather than the
  // tick a checkbox draws. Sized as a fraction of the well so it follows a
  // density change with it.
  dotChosen: {
    '::before': {
      backgroundColor: semanticTokens.colorText,
      blockSize: '50%',
      borderRadius: semanticTokens.radiusFull,
      content: '',
      inlineSize: '50%',
      insetBlockStart: '50%',
      insetInlineStart: '50%',
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
    },
  },
  dotChosenDisabled: {
    '::before': {backgroundColor: semanticTokens.colorDisabledText},
  },
  // Drawn here, not by the engine — the same move `CheckboxInput` makes, and
  // for the same reason: left native this contributed `accent-color` and took
  // the white fill, the grey edge and every disabled tone from the browser,
  // none of which are in this system. It is still a real radio: the click
  // target, the group behaviour, the arrow keys and the form value stay.
  dot: {
    appearance: 'none',
    backgroundColor: semanticTokens.colorSurfaceMuted,
    blockSize: dotSize,
    borderColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusFull,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxSizing: 'border-box',
    cursor: 'pointer',
    display: 'inline-block',
    flexShrink: 0,
    inlineSize: dotSize,
    marginBlockEnd: 0,
    marginBlockStart: dotFirstLineOffset,
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
    ':hover:not(:disabled)': {borderColor: semanticTokens.borderInteractive},
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
  // The answer that holds is marked in ink and weight, never filled.
  labelChosen: {
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
      {options.map(({description, disabled, label, value: optionValue}) => {
        const isChosen = selected === optionValue;

        return (
          <label key={optionValue} {...stylex.props(styles.row)}>
            <input
              checked={isChosen}
              disabled={disabled ?? false}
              name={name}
              onChange={() => {
                if (value === undefined) {
                  setInternalValue(optionValue);
                }
                onValueChange?.(optionValue);
              }}
              value={optionValue}
              {...stylex.props(
                styles.dot,
                isChosen && styles.dotChosen,
                isChosen && disabled && styles.dotChosenDisabled,
              )}
              type="radio"
            />
            <span {...stylex.props(styles.text)}>
              <span
                {...stylex.props(
                  styles.label,
                  disabled
                    ? styles.labelDisabled
                    : isChosen
                      ? styles.labelChosen
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
      })}
    </fieldset>
  );
}
