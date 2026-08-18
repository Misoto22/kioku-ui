import {useEffect, useState, type ReactNode} from 'react';
import {createPortal} from 'react-dom';

/** Props for the portal boundary shared by every floating surface. */
export interface LayerProps {
  readonly children: ReactNode;
  readonly container?: Element | null;
}

/**
 * Renders its children outside the current DOM position so a floating surface
 * escapes ancestor overflow and stacking contexts. Nothing is portalled during
 * the server render, so hydration matches the markup React sent.
 */
export function Layer({children, container}: LayerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(children, container ?? document.body);
}
