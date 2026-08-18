import * as stylex from '@stylexjs/stylex';
import {
  createContext,
  useContext,
  type AnchorHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  link: {
    borderRadius: semanticTokens.radiusInner,
    color: semanticTokens.colorAccent,
    textDecorationLine: 'underline',
    textDecorationThickness: '1px',
    textUnderlineOffset: '0.2em',
    ':active': {color: semanticTokens.colorAccentActive},
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
    },
    ':hover': {color: semanticTokens.colorAccentHover},
  },
});

/** The props a host's renderer receives, with styling already resolved. */
export type LinkRenderProps = AnchorHTMLAttributes<HTMLAnchorElement>;

/** Renders a link with the host application's own routing component. */
export type LinkRenderer = (props: LinkRenderProps) => ReactElement | null;

/** Props for a link into the host application's routing. */
export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

/** Props for the routing boundary. */
export interface LinkProviderProps {
  readonly children: ReactNode;
  readonly renderLink?: LinkRenderer;
}

const LinkContext = createContext<LinkRenderer | undefined>(undefined);

/**
 * Injects the host application's routing component. Without one, links fall
 * back to plain anchors, so the package depends on no routing library.
 */
export function LinkProvider({children, renderLink}: LinkProviderProps) {
  return <LinkContext value={renderLink}>{children}</LinkContext>;
}

/**
 * Renders a link through the host's router when one is provided.
 *
 * It carries the system's own link treatment rather than the browser default.
 * A caller that needs a different look — navigation, an outline entry — passes
 * its own StyleX class, which replaces the default rather than merging with it.
 */
export function Link(props: LinkProps) {
  const renderLink = useContext(LinkContext);
  // The default treatment comes first so a caller that brings its own StyleX
  // class replaces it outright. Merging two atomic class strings would leave
  // which rule wins undefined.
  const styled: LinkRenderProps = {...stylex.props(styles.link), ...props};

  if (renderLink) {
    return renderLink(styled);
  }

  return <a {...styled} />;
}
