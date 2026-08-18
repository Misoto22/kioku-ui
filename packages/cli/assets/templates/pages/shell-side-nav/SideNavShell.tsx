import type {ReactNode} from 'react';

import {
  AppShell,
  Avatar,
  DropdownMenuItem,
  Icon,
  Item,
  MoreMenu,
  NavIcon,
  NavItem,
  NavMenu,
  SideNav,
  SideNavSection,
  TopNav,
} from '@misoto22/kioku-ui';

function Glyph({d}: {readonly d: string}) {
  return (
    <NavIcon>
      <Icon>
        <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
      </Icon>
    </NavIcon>
  );
}

const sections = [
  {
    title: 'Work',
    items: [
      {href: '/releases', icon: 'M4 6h16M4 12h16M4 18h10', label: 'Releases'},
      {href: '/reviews', icon: 'm5 13 4 4L19 7', label: 'Reviews'},
    ],
  },
  {
    title: 'Archive',
    items: [
      {
        href: '/archive',
        icon: 'M4 7h16v13H4Zm0 0V4h16v3',
        label: 'Older releases',
      },
    ],
  },
];

interface SideNavShellProps {
  readonly children: ReactNode;
  readonly currentHref?: string;
}

/**
 * A rail-led shell for applications with more destinations than a banner can
 * hold. Every group carries a heading, so the rail reads as an outline rather
 * than one long list.
 */
export function SideNavShell({
  children,
  currentHref = '/releases',
}: SideNavShellProps) {
  return (
    <AppShell
      header={<TopNav brand="Your product" />}
      sidebar={
        <SideNav
          footer={
            <Item
              leading={<Avatar name="Ada Lovelace" size="sm" />}
              trailing={
                <MoreMenu label="Account actions">
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </MoreMenu>
              }
            >
              Ada Lovelace
            </Item>
          }
        >
          {sections.map((section) => (
            <SideNavSection key={section.title} title={section.title}>
              <NavMenu label={section.title}>
                {section.items.map((item) => (
                  <NavItem
                    current={item.href === currentHref}
                    href={item.href}
                    key={item.href}
                    leading={<Glyph d={item.icon} />}
                  >
                    {item.label}
                  </NavItem>
                ))}
              </NavMenu>
            </SideNavSection>
          ))}
        </SideNav>
      }
    >
      {children}
    </AppShell>
  );
}
