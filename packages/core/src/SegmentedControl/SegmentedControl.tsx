import * as stylex from '@stylexjs/stylex';
import {
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  // A groove cut into the paper: the well colour, closed by the control's own
  // edge at the strong rank so the channel reads as sunk rather than as a
  // paler card. The edge is a real border, not a ring — this is a control.
  root: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusElement,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    boxSizing: 'border-box',
    display: 'inline-flex',
    // The options are adjacent segments of one channel, so nothing separates
    // them but the edge of the block that floats.
    gap: 0,
    padding: semanticTokens.spacingXs,
  },
  option: {
    backgroundColor: 'transparent',
    borderRadius: semanticTokens.radiusInner,
    borderStyle: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    letterSpacing: semanticTokens.letterSpacingLabel,
    minHeight: semanticTokens.sizeControlSm,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingMd,
    transitionDuration: semanticTokens.durationFast,
    transitionProperty: 'background-color, box-shadow, color',
    transitionTimingFunction: semanticTokens.easingStandard,
    ':disabled': {color: semanticTokens.colorDisabledText, cursor: 'default'},
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
  },
  // Three ranks of ink carry the choice. An option you could still take is
  // available, not current, and saying so in secondary ink is what lets the
  // raised block underneath the current one stay as quiet as it is.
  unselected: {
    color: semanticTokens.colorTextSecondary,
    ':active:not(:disabled)': {
      backgroundColor: semanticTokens.colorOverlayActive,
      color: semanticTokens.colorText,
    },
    ':hover:not(:disabled):not(:active)': {
      backgroundColor: semanticTokens.colorOverlayHover,
      color: semanticTokens.colorText,
    },
  },
  selected: {
    backgroundColor: semanticTokens.colorSurfaceRaised,
    boxShadow: semanticTokens.elevationLow,
    color: semanticTokens.colorText,
  },
  vertical: {flexDirection: 'column'},
});

export interface SegmentedControlOption<Value extends string = string> {
  readonly disabled?: boolean;
  readonly label: ReactNode;
  readonly value: Value;
}

type SharedSegmentedControlProps<Value extends string> = Omit<
  HTMLAttributes<HTMLDivElement>,
  'aria-label' | 'aria-labelledby' | 'className' | 'defaultValue' | 'onChange'
> & {
  readonly disabled?: boolean;
  readonly onValueChange?: (value: Value) => void;
  readonly options: readonly SegmentedControlOption<Value>[];
  readonly orientation?: 'horizontal' | 'vertical';
};

type SegmentedControlAccessibleName =
  | {
      readonly 'aria-label': string;
      readonly 'aria-labelledby'?: string;
    }
  | {
      readonly 'aria-label'?: string;
      readonly 'aria-labelledby': string;
    };

type ControlledSegmentedControlProps<Value extends string> =
  SharedSegmentedControlProps<Value> & {
    readonly defaultValue?: never;
    readonly onValueChange: (value: Value) => void;
    readonly value: Value;
  };

type UncontrolledSegmentedControlProps<Value extends string> =
  SharedSegmentedControlProps<Value> & {
    readonly defaultValue?: Value;
    readonly value?: never;
  };

export type SegmentedControlProps<Value extends string = string> = (
  | ControlledSegmentedControlProps<Value>
  | UncontrolledSegmentedControlProps<Value>
) &
  SegmentedControlAccessibleName;

export function SegmentedControl<Value extends string = string>({
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  defaultValue,
  disabled = false,
  onValueChange,
  options,
  orientation = 'horizontal',
  value,
  ...props
}: SegmentedControlProps<Value>) {
  if (!ariaLabel?.trim() && !ariaLabelledBy?.trim()) {
    throw new Error('SegmentedControl requires an accessible name');
  }

  const firstEnabledValue = options.find((option) => !option.disabled)?.value;
  const [internalValue, setInternalValue] = useState<Value | undefined>(
    defaultValue ?? firstEnabledValue,
  );
  const requestedValue = value ?? internalValue;
  const selectedValue = options.some(
    (option) => option.value === requestedValue && !option.disabled,
  )
    ? requestedValue
    : firstEnabledValue;
  const optionRefs = useRef(new Map<Value, HTMLButtonElement>());
  const enabledOptions = options.filter(
    (option) => !disabled && !option.disabled,
  );

  function select(nextValue: Value) {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  }

  function moveSelection(
    currentValue: Value,
    direction: 'first' | 'last' | 'next' | 'previous',
  ) {
    if (enabledOptions.length === 0) {
      return;
    }

    const currentIndex = enabledOptions.findIndex(
      (option) => option.value === currentValue,
    );
    let nextIndex: number;

    if (direction === 'first') {
      nextIndex = 0;
    } else if (direction === 'last') {
      nextIndex = enabledOptions.length - 1;
    } else if (direction === 'next') {
      nextIndex =
        (currentIndex + 1 + enabledOptions.length) % enabledOptions.length;
    } else {
      nextIndex =
        (currentIndex - 1 + enabledOptions.length) % enabledOptions.length;
    }

    const nextOption = enabledOptions[nextIndex];
    if (!nextOption) {
      return;
    }
    select(nextOption.value);
    optionRefs.current.get(nextOption.value)?.focus();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentValue: Value,
  ) {
    const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const previousKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const direction =
      event.key === nextKey
        ? 'next'
        : event.key === previousKey
          ? 'previous'
          : event.key === 'Home'
            ? 'first'
            : event.key === 'End'
              ? 'last'
              : undefined;

    if (direction) {
      event.preventDefault();
      moveSelection(currentValue, direction);
    }
  }

  return (
    <div
      {...props}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-disabled={disabled || undefined}
      aria-orientation={orientation}
      role="radiogroup"
      {...stylex.props(
        styles.root,
        orientation === 'vertical' ? styles.vertical : undefined,
      )}
    >
      {options.map((option) => {
        const isDisabled = disabled || Boolean(option.disabled);
        const isSelected = option.value === selectedValue;

        return (
          <button
            aria-checked={isSelected}
            disabled={isDisabled}
            key={option.value}
            onClick={() => select(option.value)}
            onKeyDown={(event) => handleKeyDown(event, option.value)}
            ref={(element) => {
              if (element) {
                optionRefs.current.set(option.value, element);
              } else {
                optionRefs.current.delete(option.value);
              }
            }}
            role="radio"
            tabIndex={isSelected && !isDisabled ? 0 : -1}
            {...stylex.props(
              styles.option,
              isSelected ? styles.selected : styles.unselected,
            )}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
