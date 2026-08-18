import * as stylex from '@stylexjs/stylex';
import {useRef, type HTMLAttributes, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useListFocus} from '../hooks/useListFocus.js';
import type {ListOrientation} from '../hooks/useListFocus.js';

const styles = stylex.create({
  toolbar: {
    alignItems: 'center',
    display: 'flex',
    gap: semanticTokens.spacingXs,
  },
  horizontal: {flexDirection: 'row', flexWrap: 'wrap'},
  vertical: {alignItems: 'stretch', flexDirection: 'column'},
});

/** Props for a grouped set of controls that shares one tab stop. */
export interface ToolbarProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'role'
> {
  readonly children: ReactNode;
  readonly label: string;
  readonly orientation?: ListOrientation;
}

/**
 * Groups related controls into one tab stop. Arrow keys move between the
 * controls, so a toolbar of ten buttons does not cost ten Tab presses.
 */
export function Toolbar({
  children,
  label,
  orientation = 'horizontal',
  ...props
}: ToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const {onKeyDown} = useListFocus(toolbarRef, {orientation});

  return (
    <div
      {...props}
      aria-label={label}
      aria-orientation={orientation}
      onKeyDown={onKeyDown}
      ref={toolbarRef}
      role="toolbar"
      {...stylex.props(styles.toolbar, styles[orientation])}
    >
      {children}
    </div>
  );
}
