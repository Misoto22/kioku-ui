import type {ReactNode} from 'react';

import {
  AppShell,
  Avatar,
  DropdownMenuItem,
  MoreMenu,
  NavItem,
  NavMenu,
  Outline,
  SideNav,
  SideNavSection,
  TopNav,
  type OutlineEntry,
} from '@misoto22/kioku-ui';

interface NavShellProps {
  readonly children: ReactNode;
  readonly currentHeading?: string;
  readonly headings?: readonly OutlineEntry[];
}

const defaultHeadings: readonly OutlineEntry[] = [
  {href: '#summary', label: 'Summary'},
  {depth: 2, href: '#scope', label: 'Scope'},
  {depth: 2, href: '#risks', label: 'Risks'},
  {href: '#approvals', label: 'Approvals'},
];

/**
 * Every region at once: banner, rail, main, and a secondary outline. Use this
 * where a reader both navigates between documents and moves within one — the
 * rail answers "where else", the outline answers "where in here".
 */
export function NavShell({
  children,
  currentHeading = '#summary',
  headings = defaultHeadings,
}: NavShellProps) {
  return (
    <AppShell
      aside={<Outline currentHref={currentHeading} entries={headings} />}
      header={
        <TopNav
          actions={
            <>
              <Avatar name="Ada Lovelace" size="sm" />
              <MoreMenu label="Account actions">
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </MoreMenu>
            </>
          }
          brand="Your product"
        />
      }
      sidebar={
        <SideNav>
          <SideNavSection title="Work">
            <NavMenu label="Work">
              <NavItem current href="/releases">
                Releases
              </NavItem>
              <NavItem href="/reviews">Reviews</NavItem>
            </NavMenu>
          </SideNavSection>
          <SideNavSection title="Reference">
            <NavMenu label="Reference">
              <NavItem href="/runbook">Runbook</NavItem>
              <NavItem href="/decisions">Decisions</NavItem>
            </NavMenu>
          </SideNavSection>
        </SideNav>
      }
    >
      {children}
    </AppShell>
  );
}
