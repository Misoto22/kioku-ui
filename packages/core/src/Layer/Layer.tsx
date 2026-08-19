import {useEffect, useState, type ReactNode} from 'react';
import {createPortal} from 'react-dom';

import {useOptionalTheme} from '../theme/Theme.js';

/** Props for the portal boundary shared by every floating surface. */
export interface LayerProps {
  readonly children: ReactNode;
  readonly container?: Element | null;
}

/**
 * Renders its children outside the current DOM position so a floating surface
 * escapes ancestor overflow and stacking contexts. Nothing is portalled during
 * the server render, so hydration matches the markup React sent.
 *
 * The default target is the theme root, not `document.body`. A theme writes its
 * custom properties onto its own element, so a surface portalled past it
 * resolves every `var()` to nothing and renders with no background, no radius
 * and no shadow — which is what every floating surface in this library was
 * doing. Falling back to the body keeps a Layer working with no provider above
 * it, which is how the primitive is used on its own.
 */
export function Layer({children, container}: LayerProps) {
  const [mounted, setMounted] = useState(false);
  const theme = useOptionalTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(children, container ?? theme?.root ?? document.body);
}
