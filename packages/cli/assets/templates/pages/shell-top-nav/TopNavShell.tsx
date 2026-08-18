import type {ReactNode} from 'react';

import {
  AppShell,
  Avatar,
  Button,
  DropdownMenuItem,
  MobileNav,
  MoreMenu,
  NavItem,
  NavMenu,
  TopNav,
  useMediaQuery,
} from '@misoto22/kioku-ui';

const destinations = [
  {href: '/releases', label: 'Releases'},
  {href: '/reviews', label: 'Reviews'},
  {href: '/archive', label: 'Archive'},
];

interface TopNavShellProps {
  readonly children: ReactNode;
  readonly currentHref?: string;
}

/**
 * A banner-led shell. The same destinations render horizontally when there is
 * room and inside a drawer when there is not — one list, two presentations,
 * so a narrow viewport never loses a destination.
 */
export function TopNavShell({
  children,
  currentHref = '/releases',
}: TopNavShellProps) {
  const wide = useMediaQuery('(min-width: 48rem)');

  const links = destinations.map((destination) => (
    <NavItem
      current={destination.href === currentHref}
      href={destination.href}
      key={destination.href}
    >
      {destination.label}
    </NavItem>
  ));

  return (
    <AppShell
      header={
        <TopNav
          actions={
            <>
              {wide ? <Button variant="secondary">New release</Button> : null}
              <Avatar name="Ada Lovelace" size="sm" />
              <MoreMenu label="Account actions">
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </MoreMenu>
            </>
          }
          brand="Your product"
        >
          {wide ? (
            <NavMenu label="Primary" orientation="horizontal">
              {links}
            </NavMenu>
          ) : (
            <MobileNav label="Open navigation" title="Your product">
              <NavMenu label="Primary">{links}</NavMenu>
            </MobileNav>
          )}
        </TopNav>
      }
    >
      {children}
    </AppShell>
  );
}
