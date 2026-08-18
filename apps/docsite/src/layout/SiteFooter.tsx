import {Divider, HStack, Stack, Text} from '@misoto22/kioku-ui';

import {routeHref, type Route} from '../router.js';

const columns: readonly {
  links: readonly {href: string; label: string}[];
  title: string;
}[] = [
  {
    title: 'Learn',
    links: [
      {href: routeHref('docs'), label: 'Docs'},
      {href: routeHref('components'), label: 'Components'},
      {href: routeHref('templates'), label: 'Templates'},
      {href: routeHref('themes'), label: 'Themes'},
    ],
  },
  {
    title: 'Project',
    links: [
      {href: 'https://github.com/Misoto22/kioku-ui', label: 'GitHub'},
      {
        href: 'https://github.com/Misoto22/kioku-ui/issues',
        label: 'Report an issue',
      },
      {
        href: 'https://github.com/Misoto22/kioku-ui/blob/main/CONTRIBUTING.md',
        label: 'Contributing',
      },
    ],
  },
  {
    title: 'Policy',
    links: [
      {
        href: 'https://github.com/Misoto22/kioku-ui/blob/main/CODE_OF_CONDUCT.md',
        label: 'Code of conduct',
      },
      {
        href: 'https://github.com/Misoto22/kioku-ui/blob/main/SECURITY.md',
        label: 'Security',
      },
      {
        href: 'https://github.com/Misoto22/kioku-ui/blob/main/LICENSE',
        label: 'MIT licence',
      },
    ],
  },
];

interface SiteFooterProps {
  readonly onNavigate: (route: Route) => void;
}

/** The site footer: every destination again, plus the project's own links. */
export function SiteFooter({onNavigate}: SiteFooterProps) {
  return (
    <Stack
      gap="lg"
      style={{
        borderBlockStart:
          'var(--kioku-ui-border-width) var(--kioku-ui-border-style) var(--kioku-ui-border-default)',
        marginBlockStart: 'var(--kioku-ui-spacing-2xl)',
        marginInline: 'auto',
        maxWidth: '76rem',
        paddingBlock: 'var(--kioku-ui-spacing-xl)',
        paddingInline: 'var(--kioku-ui-spacing-lg)',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: 'var(--kioku-ui-spacing-xl)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))',
        }}
      >
        {columns.map((column) => (
          <Stack gap="sm" key={column.title}>
            <Text size="sm" tone="muted">
              {column.title}
            </Text>
            <Stack gap="xs">
              {column.links.map((link) => (
                <a
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
                    color: 'var(--kioku-ui-color-text-secondary)',
                    display: 'inline-flex',
                    fontSize: 'var(--kioku-ui-typography-font-size-sm)',
                    minHeight: '24px',
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                </a>
              ))}
            </Stack>
          </Stack>
        ))}
      </div>

      <Divider />

      <HStack gap="sm" justify="between" wrap>
        <Text size="sm" tone="muted">
          Kioku UI — a product-neutral React design system.
        </Text>
        <Text size="sm" tone="muted">
          MIT licensed
        </Text>
      </HStack>
    </Stack>
  );
}
