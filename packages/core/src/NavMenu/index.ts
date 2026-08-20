export {NavMenu, type NavMenuProps} from './NavMenu.js';
// The orientation lives beside the context that carries it, because `NavItem`
// reads it without going through `NavMenu` itself.
export {useNavMenuOrientation, type NavMenuOrientation} from './orientation.js';
