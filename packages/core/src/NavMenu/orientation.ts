import {createContext, useContext} from 'react';

/** Axis a navigation menu lays its destinations along. */
export type NavMenuOrientation = 'horizontal' | 'vertical';

/**
 * The axis a `NavItem` is being laid along.
 *
 * An item cannot see its siblings, and the mark it draws depends on them: down
 * the inline edge it belongs beside the word, across the block edge it belongs
 * beneath it. Vertical is the default because an item outside any menu is a
 * row in a rail.
 */
const NavMenuOrientationContext = createContext<NavMenuOrientation>('vertical');

export const NavMenuOrientationProvider = NavMenuOrientationContext.Provider;

export function useNavMenuOrientation() {
  return useContext(NavMenuOrientationContext);
}
