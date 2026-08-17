import {
  ActionControl,
  type ButtonProps,
  type ButtonVariant,
  type ControlSize,
} from './Button.js';

/** Props for an icon-only native action button with a required name. */
export interface IconButtonProps extends Omit<ButtonProps, 'aria-label'> {
  readonly 'aria-label': string;
  readonly loading?: boolean;
  readonly size?: ControlSize;
  readonly variant?: ButtonVariant;
}

export function IconButton(props: IconButtonProps) {
  return <ActionControl {...props} iconOnly />;
}
