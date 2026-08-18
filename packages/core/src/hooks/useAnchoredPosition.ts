import {useCallback, useEffect, useState, type RefObject} from 'react';

import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect.js';

/** Side of the anchor a floating surface prefers to occupy. */
export type Placement = 'bottom' | 'left' | 'right' | 'top';

/** How a floating surface lines up along the anchor's cross axis. */
export type Alignment = 'center' | 'end' | 'start';

/** Options controlling where a floating surface settles. */
export interface AnchoredPositionOptions {
  readonly alignment?: Alignment;
  readonly offset?: number;
  readonly placement?: Placement;
}

/** Resolved viewport coordinates for a floating surface. */
export interface AnchoredPosition {
  readonly left: number;
  readonly placement: Placement;
  readonly top: number;
}

/** The measured position plus the ref that feeds it. */
export interface AnchoredPositionResult {
  readonly position: AnchoredPosition | undefined;
  readonly surface: HTMLElement | null;
  readonly surfaceRef: (node: HTMLElement | null) => void;
}

const opposite: Record<Placement, Placement> = {
  bottom: 'top',
  left: 'right',
  right: 'left',
  top: 'bottom',
};

function alignAcross(
  anchorStart: number,
  anchorSize: number,
  surfaceSize: number,
  alignment: Alignment,
) {
  if (alignment === 'center') {
    return anchorStart + (anchorSize - surfaceSize) / 2;
  }
  return alignment === 'start'
    ? anchorStart
    : anchorStart + anchorSize - surfaceSize;
}

function place(
  anchor: DOMRect,
  surface: DOMRect,
  placement: Placement,
  alignment: Alignment,
  offset: number,
) {
  switch (placement) {
    case 'top':
      return {
        left: alignAcross(anchor.left, anchor.width, surface.width, alignment),
        top: anchor.top - surface.height - offset,
      };
    case 'bottom':
      return {
        left: alignAcross(anchor.left, anchor.width, surface.width, alignment),
        top: anchor.bottom + offset,
      };
    case 'left':
      return {
        left: anchor.left - surface.width - offset,
        top: alignAcross(anchor.top, anchor.height, surface.height, alignment),
      };
    case 'right':
      return {
        left: anchor.right + offset,
        top: alignAcross(anchor.top, anchor.height, surface.height, alignment),
      };
  }
}

function fitsInViewport(
  {left, top}: {left: number; top: number},
  surface: DOMRect,
) {
  return (
    left >= 0 &&
    top >= 0 &&
    left + surface.width <= window.innerWidth &&
    top + surface.height <= window.innerHeight
  );
}

function clampToViewport(
  {left, top}: {left: number; top: number},
  surface: DOMRect,
) {
  return {
    left: Math.max(0, Math.min(left, window.innerWidth - surface.width)),
    top: Math.max(0, Math.min(top, window.innerHeight - surface.height)),
  };
}

/**
 * Positions a floating surface against an anchor, flipping to the opposite
 * side when the preferred one would leave the viewport and clamping whatever
 * survives back inside it. Recomputed on scroll and resize while open.
 *
 * The surface is tracked through a callback ref rather than a plain ref
 * because portalled surfaces mount after the caller renders; a ref would
 * still read `null` when the first measurement runs.
 */
export function useAnchoredPosition(
  anchorRef: RefObject<HTMLElement | null>,
  open: boolean,
  {
    alignment = 'center',
    offset = 8,
    placement = 'bottom',
  }: AnchoredPositionOptions = {},
): AnchoredPositionResult {
  const [position, setPosition] = useState<AnchoredPosition | undefined>(
    undefined,
  );
  const [surfaceElement, setSurfaceElement] = useState<HTMLElement | null>(
    null,
  );

  const measure = useCallback(() => {
    const anchorElement = anchorRef.current;
    if (!anchorElement || !surfaceElement) {
      return;
    }

    const anchor = anchorElement.getBoundingClientRect();
    const surface = surfaceElement.getBoundingClientRect();

    const preferred = place(anchor, surface, placement, alignment, offset);
    const resolved = fitsInViewport(preferred, surface)
      ? {...preferred, placement}
      : {
          ...place(anchor, surface, opposite[placement], alignment, offset),
          placement: opposite[placement],
        };

    setPosition({
      ...clampToViewport(resolved, surface),
      placement: resolved.placement,
    });
  }, [alignment, anchorRef, offset, placement, surfaceElement]);

  useIsomorphicLayoutEffect(() => {
    if (open) {
      measure();
    } else {
      setPosition(undefined);
    }
  }, [measure, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure, open]);

  return {position, surface: surfaceElement, surfaceRef: setSurfaceElement};
}
