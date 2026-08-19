import {HStack, Link} from '@misoto22/kioku-ui';

import {pageMeasure} from './PageContainer.js';
import type {Route} from '../router.js';

/**
 * What the library actually runs on. Every figure here is read off the
 * workspace's own manifests rather than written from memory, so the line is a
 * statement about this build and not a slogan.
 */
const platform =
  'React 19 · StyleX 0.19.0 · TypeScript 6 · Node 24+ · pnpm 11.10.0 · MIT';

const links: readonly {href: string; label: string}[] = [
  {href: 'https://github.com/Misoto22/kioku-ui', label: 'GitHub'},
  {
    href: 'https://github.com/Misoto22/kioku-ui/issues',
    label: 'Report an issue',
  },
  {
    href: 'https://github.com/Misoto22/kioku-ui/blob/main/docs/operations/release.md',
    label: 'Release runbook',
  },
];

interface SiteFooterProps {
  readonly onNavigate: (route: Route) => void;
}

/**
 * The site footer, drawn as the banner's answering rule: one line of facts and
 * the project's own links, on the same paper as the banner. The destinations
 * are not repeated here — the banner is sticky, so they never leave the
 * screen.
 *
 * `AppShell` supplies the `<footer>` element and its padding, so the bar
 * negates that padding exactly rather than adding a second gutter inside it.
 */
export function SiteFooter({onNavigate}: SiteFooterProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--kioku-ui-color-surface)',
        marginBlock: 'calc(-1 * var(--kioku-ui-spacing-md))',
        marginInline: 'calc(-1 * var(--kioku-ui-spacing-lg))',
      }}
    >
      <HStack
        align="center"
        justify="between"
        style={{
          gap: 'var(--kioku-ui-spacing-lg)',
          marginInline: 'auto',
          maxWidth: pageMeasure,
          paddingBlock: 'var(--kioku-ui-spacing-md)',
          paddingInline: 'var(--kioku-ui-spacing-2xl)',
          width: '100%',
        }}
        wrap
      >
        <span
          style={{
            color: 'var(--kioku-ui-color-text-muted)',
            fontFamily: 'var(--kioku-ui-typography-font-family-mono)',
            fontSize: 'var(--kioku-ui-typography-font-size-xs)',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: 'var(--kioku-ui-typography-letter-spacing-mono)',
          }}
        >
          {platform}
        </span>

        <HStack gap="lg" wrap>
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.label}
              onClick={() => {
                if (link.href.startsWith('#/')) {
                  onNavigate(link.href.slice(2) as Route);
                }
              }}
              {...(link.href.startsWith('http')
                ? {rel: 'noreferrer', target: '_blank'}
                : {})}
              style={{
                // WCAG 2.2 asks for a 24px target; the line box alone is
                // shorter than that at this font size.
                alignItems: 'center',
                display: 'inline-flex',
                fontFamily: 'var(--kioku-ui-typography-font-family-body)',
                fontSize: 'var(--kioku-ui-typography-font-size-sm)',
                letterSpacing:
                  'var(--kioku-ui-typography-letter-spacing-label)',
                minBlockSize: 'var(--kioku-ui-size-control-md)',
              }}
            >
              {link.label}
            </Link>
          ))}
        </HStack>
      </HStack>
    </div>
  );
}
