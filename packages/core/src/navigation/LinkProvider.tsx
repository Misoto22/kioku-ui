import {
  createContext,
  useContext,
  type AnchorHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export type LinkRenderer = (props: LinkProps) => ReactElement | null;

export interface LinkProviderProps {
  readonly children: ReactNode;
  readonly renderLink?: LinkRenderer;
}

const LinkContext = createContext<LinkRenderer | undefined>(undefined);

export function LinkProvider({children, renderLink}: LinkProviderProps) {
  return <LinkContext value={renderLink}>{children}</LinkContext>;
}

export function Link(props: LinkProps) {
  const renderLink = useContext(LinkContext);

  if (renderLink) {
    return renderLink(props);
  }

  return <a {...props} />;
}
