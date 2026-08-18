import * as stylex from '@stylexjs/stylex';
import {useRef, type HTMLAttributes, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useListFocus, type ListOrientation} from '../hooks/useListFocus.js';

const styles = stylex.create({
  group: {
    alignItems: 'center',
    display: 'inline-flex',
    gap: semanticTokens.spacingXs,
  },
  horizontal: {flexDirection: 'row'},
  vertical: {alignItems: 'stretch', flexDirection: 'column'},
});

/** Props for a set of related actions treated as one control. */
export interface ButtonGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'aria-label' | 'children' | 'className' | 'role'
> {
  readonly children: ReactNode;
  readonly label: string;
  readonly orientation?: ListOrientation;
}

/**
 * Groups related actions so they read as one control. Unlike `Toolbar` the
 * actions here are alternatives to each other rather than separate commands.
 */
export function ButtonGroup({
  children,
  label,
  orientation = 'horizontal',
  ...props
}: ButtonGroupProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const {onKeyDown} = useListFocus(groupRef, {orientation});

  return (
    <div
      {...props}
      aria-label={label}
      onKeyDown={onKeyDown}
      ref={groupRef}
      role="group"
      {...stylex.props(styles.group, styles[orientation])}
    >
      {children}
    </div>
  );
}
