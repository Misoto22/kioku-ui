import {useRef, useState, type ReactNode} from 'react';

import {DropdownMenu} from '../DropdownMenu/index.js';
import type {Alignment, Placement} from '../hooks/useAnchoredPosition.js';
import {Icon} from '../Icon/index.js';
import {IconButton} from '../IconButton/index.js';

/** Props for the self-managed overflow menu. */
export interface MoreMenuProps {
  readonly alignment?: Alignment;
  readonly children: ReactNode;
  readonly label: string;
  readonly placement?: Placement;
}

/**
 * Collects secondary actions behind one trigger and owns its own open state,
 * so a caller that has no other reason to hold state does not grow one.
 */
export function MoreMenu({
  alignment,
  children,
  label,
  placement,
}: MoreMenuProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <span ref={anchorRef} style={{display: 'inline-flex'}}>
        <IconButton
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={label}
          onClick={() => {
            setOpen((value) => !value);
          }}
          variant="ghost"
        >
          <Icon>
            <circle cx="5" cy="12" r="1.75" />
            <circle cx="12" cy="12" r="1.75" />
            <circle cx="19" cy="12" r="1.75" />
          </Icon>
        </IconButton>
      </span>
      <DropdownMenu
        {...(alignment ? {alignment} : {})}
        anchorRef={anchorRef}
        label={label}
        onDismiss={() => {
          setOpen(false);
        }}
        open={open}
        {...(placement ? {placement} : {})}
      >
        {children}
      </DropdownMenu>
    </>
  );
}
