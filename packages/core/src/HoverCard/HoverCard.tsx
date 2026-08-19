import {
  Children,
  cloneElement,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import type {Alignment, Placement} from '../hooks/useAnchoredPosition.js';
import {Popover} from '../Popover/index.js';

interface TriggerProps {
  readonly onBlur?: (event: FocusEvent<HTMLElement>) => void;
  readonly onFocus?: (event: FocusEvent<HTMLElement>) => void;
  readonly onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
  readonly onMouseLeave?: (event: MouseEvent<HTMLElement>) => void;
  readonly ref?: unknown;
}

/** Props for a rich preview shown on hover and on focus. */
export interface HoverCardProps {
  readonly alignment?: Alignment;
  readonly children: ReactElement<TriggerProps>;
  readonly closeDelay?: number;
  readonly content: ReactNode;
  /**
   * Names the surface. The content is interactive, so it is announced as a
   * dialog, and a dialog with no name is one an assistive technology can enter
   * but not describe. Required for that reason rather than for styling.
   */
  readonly label: string;
  readonly openDelay?: number;
  readonly placement?: Placement;
}

/**
 * Previews related detail beside its trigger. Unlike Tooltip the content is
 * interactive and stays open while the pointer is inside it, so it can hold
 * links and actions.
 */
export function HoverCard({
  alignment,
  children,
  closeDelay = 150,
  content,
  label,
  openDelay = 300,
  placement = 'bottom',
}: HoverCardProps) {
  const anchorRef = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );

  function scheduleOpen() {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setOpen(true);
    }, openDelay);
  }

  function scheduleClose() {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setOpen(false);
    }, closeDelay);
  }

  const trigger = Children.only(children);
  const anchor = cloneElement(trigger, {
    onBlur: (event: FocusEvent<HTMLElement>) => {
      trigger.props.onBlur?.(event);
      scheduleClose();
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      trigger.props.onFocus?.(event);
      scheduleOpen();
    },
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      trigger.props.onMouseEnter?.(event);
      scheduleOpen();
    },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => {
      trigger.props.onMouseLeave?.(event);
      scheduleClose();
    },
    ref: anchorRef,
  });

  return (
    <>
      {anchor}
      <Popover
        {...(alignment ? {alignment} : {})}
        anchorRef={anchorRef}
        aria-label={label}
        onDismiss={() => {
          setOpen(false);
        }}
        onMouseEnter={() => {
          clearTimeout(timer.current);
        }}
        onMouseLeave={scheduleClose}
        open={open}
        placement={placement}
      >
        {content}
      </Popover>
    </>
  );
}
