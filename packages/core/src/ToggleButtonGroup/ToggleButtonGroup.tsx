import {useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';

import {semanticTokens} from '../authoring.stylex.js';
import type {ControlSize} from '../Button/index.js';
import {useListFocus, type ListOrientation} from '../hooks/useListFocus.js';
import {ToggleButton} from '../ToggleButton/index.js';

const styles = stylex.create({
  group: {display: 'inline-flex', gap: semanticTokens.spacingXs},
  horizontal: {flexDirection: 'row', flexWrap: 'wrap'},
  vertical: {alignItems: 'stretch', flexDirection: 'column'},
});

/** One option inside a toggle group. */
export interface ToggleOption {
  readonly disabled?: boolean;
  readonly label: ReactNode;
  readonly value: string;
}

interface SharedProps {
  readonly label: string;
  readonly options: readonly ToggleOption[];
  readonly orientation?: ListOrientation;
  readonly size?: ControlSize;
}

interface SingleProps extends SharedProps {
  readonly onValueChange: (value: string) => void;
  readonly selectionMode?: 'single';
  readonly value: string;
}

interface MultipleProps extends SharedProps {
  readonly onValueChange: (value: readonly string[]) => void;
  readonly selectionMode: 'multiple';
  readonly value: readonly string[];
}

/** Props for a set of toggle buttons acting as one control. */
export type ToggleButtonGroupProps = MultipleProps | SingleProps;

/**
 * A row of toggle buttons that behaves as one control: one tab stop, arrow
 * keys between options.
 *
 * `single` keeps exactly one option pressed, which is what `SegmentedControl`
 * also does — prefer that when the options are views of the same thing, and
 * this when they are formatting-style toggles that happen to be exclusive.
 */
export function ToggleButtonGroup(props: ToggleButtonGroupProps) {
  const {label, options, orientation = 'horizontal', size = 'md'} = props;
  const groupRef = useRef<HTMLDivElement>(null);
  const {onKeyDown} = useListFocus(groupRef, {orientation});

  const isPressed = (value: string) =>
    props.selectionMode === 'multiple'
      ? props.value.includes(value)
      : props.value === value;

  function choose(value: string, pressed: boolean) {
    if (props.selectionMode === 'multiple') {
      props.onValueChange(
        pressed
          ? [...props.value, value]
          : props.value.filter((entry) => entry !== value),
      );
      return;
    }
    // A single-select group never empties: pressing the active option again
    // would leave the control saying nothing is chosen.
    if (pressed) {
      props.onValueChange(value);
    }
  }

  return (
    <div
      aria-label={label}
      aria-orientation={orientation}
      onKeyDown={onKeyDown}
      ref={groupRef}
      role="group"
      {...stylex.props(styles.group, styles[orientation])}
    >
      {options.map((option) => (
        <ToggleButton
          disabled={option.disabled ?? false}
          key={option.value}
          onPressedChange={(pressed) => {
            choose(option.value, pressed);
          }}
          pressed={isPressed(option.value)}
          size={size}
        >
          {option.label}
        </ToggleButton>
      ))}
    </div>
  );
}
