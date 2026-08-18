import {useRef, useState, type MouseEvent, type ReactNode} from 'react';

import {DropdownMenu} from '../DropdownMenu/index.js';

/** Props for a menu opened by a secondary click on a region. */
export interface ContextMenuProps {
  readonly children: ReactNode;
  readonly label: string;
  readonly menu: ReactNode;
}

/**
 * Opens a menu at the pointer on a secondary click. The menu anchors to a
 * zero-size marker placed at the click point, so it positions and flips with
 * the same rules as any other anchored surface.
 */
export function ContextMenu({children, label, menu}: ContextMenuProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [point, setPoint] = useState<{left: number; top: number} | undefined>(
    undefined,
  );

  function handleContextMenu(event: MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    setPoint({left: event.clientX, top: event.clientY});
  }

  return (
    <>
      <div onContextMenu={handleContextMenu}>{children}</div>
      {point === undefined ? null : (
        <span
          aria-hidden="true"
          ref={anchorRef}
          style={{
            height: 0,
            left: point.left,
            position: 'fixed',
            top: point.top,
            width: 0,
          }}
        />
      )}
      <DropdownMenu
        anchorRef={anchorRef}
        label={label}
        onDismiss={() => {
          setPoint(undefined);
        }}
        open={point !== undefined}
        placement="bottom"
      >
        {menu}
      </DropdownMenu>
    </>
  );
}
