import * as stylex from '@stylexjs/stylex';
import {useId, type ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import {useInternationalization} from '../i18n/index.js';
import {Layout} from '../Layout/index.js';

const styles = stylex.create({
  skipLink: {
    backgroundColor: semanticTokens.colorSurfaceRaised,
    borderRadius: semanticTokens.radiusElement,
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    insetBlockStart: semanticTokens.spacingSm,
    insetInlineStart: semanticTokens.spacingSm,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
    position: 'fixed',
    textDecorationLine: 'none',
    transform: 'translateY(-200%)',
    zIndex: 1,
    ':focus-visible': {
      outlineColor: semanticTokens.colorFocus,
      outlineOffset: semanticTokens.focusOffset,
      outlineStyle: semanticTokens.borderStyle,
      outlineWidth: semanticTokens.focusWidth,
      transform: 'translateY(0)',
    },
  },
});

/** Props for the application frame. */
export interface AppShellProps {
  readonly aside?: ReactNode;
  readonly children: ReactNode;
  readonly contentPadding?: boolean;
  readonly footer?: ReactNode;
  readonly header?: ReactNode;
  readonly sidebar?: ReactNode;
  readonly skipLinkLabel?: string;
}

/**
 * Wraps `Layout` with the one thing every application needs and most forget:
 * a skip link that jumps a keyboard reader past the banner and rails straight
 * into the main region.
 */
export function AppShell({
  aside,
  children,
  contentPadding = true,
  footer,
  header,
  sidebar,
  skipLinkLabel,
}: AppShellProps) {
  const {messages} = useInternationalization();
  const mainId = useId();

  return (
    <>
      <a href={`#${mainId}`} {...stylex.props(styles.skipLink)}>
        {skipLinkLabel ?? messages.skipToContent}
      </a>
      <Layout
        {...(aside === undefined ? {} : {aside})}
        contentPadding={contentPadding}
        {...(footer === undefined ? {} : {footer})}
        {...(header === undefined ? {} : {header})}
        mainId={mainId}
        {...(sidebar === undefined ? {} : {sidebar})}
      >
        {children}
      </Layout>
    </>
  );
}
