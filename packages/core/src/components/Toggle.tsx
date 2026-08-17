import * as stylex from '@stylexjs/stylex';
import {useState, type ButtonHTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    alignItems: 'center',
    borderColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusRound,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    display: 'inline-flex',
    minHeight: semanticTokens.densityControlBlock,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
  },
  off: {
    backgroundColor: semanticTokens.colorSurface,
    color: semanticTokens.colorText,
  },
  on: {
    backgroundColor: semanticTokens.statusSuccessSurface,
    color: semanticTokens.statusSuccessText,
  },
  indicator: {
    backgroundColor: semanticTokens.borderStrong,
    borderRadius: semanticTokens.radiusRound,
    display: 'inline-block',
    height: semanticTokens.spacingMd,
    width: semanticTokens.spacingMd,
  },
  indicatorOn: {backgroundColor: semanticTokens.statusSuccessText},
});

type SharedToggleProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-checked' | 'aria-pressed' | 'className' | 'onChange' | 'role'
> & {
  readonly onPressedChange?: (pressed: boolean) => void;
};

type ControlledToggleProps = SharedToggleProps & {
  readonly defaultPressed?: never;
  readonly onPressedChange: (pressed: boolean) => void;
  readonly pressed: boolean;
};

type UncontrolledToggleProps = SharedToggleProps & {
  readonly defaultPressed?: boolean;
  readonly pressed?: never;
};

export type ToggleProps = ControlledToggleProps | UncontrolledToggleProps;

export function Toggle({
  children,
  defaultPressed = false,
  disabled,
  onClick,
  onPressedChange,
  pressed,
  type = 'button',
  ...props
}: ToggleProps) {
  const [internalPressed, setInternalPressed] = useState(defaultPressed);
  const isPressed = pressed ?? internalPressed;

  return (
    <button
      {...props}
      aria-checked={isPressed}
      disabled={disabled}
      onClick={(event) => {
        const nextPressed = !isPressed;
        if (pressed === undefined) {
          setInternalPressed(nextPressed);
        }
        onPressedChange?.(nextPressed);
        onClick?.(event);
      }}
      role="switch"
      {...stylex.props(styles.base, isPressed ? styles.on : styles.off)}
      type={type}
    >
      {children ?? (
        <span
          aria-hidden="true"
          {...stylex.props(
            styles.indicator,
            isPressed ? styles.indicatorOn : undefined,
          )}
        />
      )}
    </button>
  );
}
