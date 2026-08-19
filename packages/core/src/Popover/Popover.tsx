import * as stylex from '@stylexjs/stylex';
import {
  useEffect,
  useId,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {
  useAnchoredPosition,
  type Alignment,
  type Placement,
} from '../hooks/useAnchoredPosition.js';
import {Layer} from '../Layer/index.js';

const styles = stylex.create({
  surface: {
    backgroundColor: semanticTokens.colorSurfaceRaised,
    borderRadius: semanticTokens.radiusContainer,
    boxShadow: semanticTokens.elevationMedium,
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    padding: semanticTokens.spacingMd,
    position: 'fixed',
  },
  hidden: {visibility: 'hidden'},
});

/** Props for a surface anchored to a trigger element. */
export interface PopoverProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> {
  readonly alignment?: Alignment;
  readonly anchorRef: RefObject<HTMLElement | null>;
  readonly children: ReactNode;
  readonly offset?: number;
  readonly onDismiss?: () => void;
  readonly open: boolean;
  readonly placement?: Placement;
}

/**
 * Floats content beside an anchor. Dismissal is non-modal: Escape and a click
 * outside both close it, but the page behind stays scrollable and reachable.
 */
export function Popover({
  alignment,
  anchorRef,
  children,
  id,
  offset,
  onDismiss,
  open,
  placement,
  role = 'dialog',
  style,
  ...props
}: PopoverProps) {
  const generatedId = useId();
  const surfaceId = id ?? generatedId;
  const {position, surface, surfaceRef} = useAnchoredPosition(anchorRef, open, {
    ...(alignment ? {alignment} : {}),
    ...(offset === undefined ? {} : {offset}),
    ...(placement ? {placement} : {}),
  });

  useEffect(() => {
    if (!open || !onDismiss) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onDismiss?.();
      }
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (surface?.contains(target) || anchorRef.current?.contains(target)) {
        return;
      }
      onDismiss?.();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [anchorRef, onDismiss, open, surface]);

  if (!open) {
    return null;
  }

  return (
    <Layer>
      <div
        {...props}
        data-placement={position?.placement}
        id={surfaceId}
        ref={surfaceRef}
        role={role}
        {...stylex.props(
          styles.surface,
          position === undefined && styles.hidden,
        )}
        style={{...style, left: position?.left, top: position?.top}}
      >
        {children}
      </div>
    </Layer>
  );
}
