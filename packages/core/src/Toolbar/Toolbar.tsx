import * as stylex from '@stylexjs/stylex';
import {useRef, type HTMLAttributes, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useListFocus} from '../hooks/useListFocus.js';
import type {ListOrientation} from '../hooks/useListFocus.js';

// Tools sit against each other, parted by the width of a rule rather than by
// a gutter. Spread on the spacing scale they read as three separate buttons
// that happen to be near each other; closed up they read as one instrument.
const toolGap = `calc(2 * ${semanticTokens.borderWidth})`;

const styles = stylex.create({
  // The strip carries no ground of its own: the controls inside it are the
  // only marks, so the toolbar reads as a row of tools rather than a bar.
  toolbar: {
    alignItems: 'center',
    color: semanticTokens.colorText,
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingLabel,
    minWidth: 0,
  },
  horizontal: {
    columnGap: toolGap,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: toolGap,
  },
  vertical: {
    alignItems: 'stretch',
    flexDirection: 'column',
    rowGap: toolGap,
  },
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
