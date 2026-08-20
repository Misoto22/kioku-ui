import {
  AppShell,
  Badge,
  Button,
  Card,
  Eyebrow,
  HStack,
  Heading,
  Link,
  MetricGrid,
  NavIcon,
  NavItem,
  NavMenu,
  Numeral,
  SideNav,
  SideNavSection,
  Stack,
  StatusDot,
  Text,
  Timestamp,
  TopNav,
} from '@misoto22/kioku-ui';

// A console opens on a page, not on a chrome. What separates this from the
// plain shells is that the first screen answers three questions before the
// reader clicks anything: what changed, what is waiting on them, and where the
// figures stand. Everything below is one column of paper — the rail is the
// binding edge, not a second surface.

interface Destination {
  readonly count?: number;
  readonly label: string;
  readonly scope?: string;
}

interface Section {
  readonly destinations: readonly Destination[];
  readonly title: string;
}

// Two named groups plus the loose rows above and below them. The group titles
// are what let a rail hold eleven destinations without reading as a list of
// eleven unrelated words.
const sections: readonly Section[] = [
  {
    title: 'Sources',
    destinations: [
      {label: 'Inbox', scope: 'Private'},
      {label: 'Documents', scope: 'Private'},
      {label: 'Clippings', scope: 'Shared'},
    ],
  },
  {
    title: 'Records',
    destinations: [
      {label: 'Activity', scope: 'Private'},
      {label: 'Messages', scope: 'Private'},
      {label: 'Timeline', scope: 'Shared'},
    ],
  },
];

const metrics = [
  {detail: 'Up 12% on yesterday', label: 'Items captured', value: '9,412'},
  {detail: 'Within budget', label: 'Storage used', value: '3.2 GB'},
  {detail: '2 need a reply', label: 'Unread', value: '5'},
] as const;

// A dot and a sentence. Deliberately not a traffic light: three tones across a
// feed reads as an alarm panel, and most of what lands here is neither good
// news nor bad.
const activity = [
  {
    detail: 'Health export, 614 records',
    time: '2026-08-19T09:12:00Z',
    title: 'Sync finished',
    tone: 'success',
  },
  {
    detail: 'Messages',
    time: '2026-08-19T08:40:00Z',
    title: 'Authorisation expires in seven days',
    tone: 'warning',
  },
  {
    detail: 'Clippings',
    time: '2026-08-18T22:05:00Z',
    title: 'Import queued',
    tone: 'info',
  },
] as const;

const approvals = [
  {detail: 'Agent · Messages', title: 'Send two drafted replies'},
  {detail: 'Backfill · Records', title: 'Write 214 records from 2019'},
] as const;

export function ConsoleHomePage() {
  return (
    <AppShell
      header={
        <TopNav
          actions={
            <HStack align="center" gap="sm">
              <Button size="sm" variant="secondary">
                Capture
              </Button>
            </HStack>
          }
          title="Workspace"
        />
      }
      sidebar={
        <SideNav>
          <NavMenu label="Current">
            <NavItem current href="#/now" leading={<NavIcon>◷</NavIcon>}>
              <HStack align="center" gap="sm" justify="between">
                <span>Now</span>
                <Badge tone="neutral">5</Badge>
              </HStack>
            </NavItem>
          </NavMenu>

          {sections.map((section) => (
            <SideNavSection key={section.title} title={section.title}>
              <NavMenu label={section.title}>
                {section.destinations.map((destination) => (
                  <NavItem
                    href={`#/${destination.label.toLowerCase()}`}
                    key={destination.label}
                    leading={<NavIcon>◦</NavIcon>}
                  >
                    <HStack align="center" gap="sm" justify="between">
                      <span>{destination.label}</span>
                      {destination.scope === undefined ? null : (
                        <Eyebrow tone="muted">{destination.scope}</Eyebrow>
                      )}
                    </HStack>
                  </NavItem>
                ))}
              </NavMenu>
            </SideNavSection>
          ))}

          <NavMenu label="Tools">
            <NavItem href="#/agent" leading={<NavIcon>◇</NavIcon>}>
              <HStack align="center" gap="sm" justify="between">
                <span>Agent</span>
                <Badge tone="neutral">1</Badge>
              </HStack>
            </NavItem>
            <NavItem href="#/settings" leading={<NavIcon>◎</NavIcon>}>
              <HStack align="center" gap="sm" justify="between">
                <span>Settings</span>
                <Badge tone="neutral">2</Badge>
              </HStack>
            </NavItem>
          </NavMenu>
        </SideNav>
      }
      /*
        `pageIndex` hangs the numeral in the page margin and leaves the title on
        the text edge, so the head begins where the prose beneath it begins.
      */
      pageHead={
        <>
          <Heading level={1} size="page">
            Now
          </Heading>
          <Text size="sm" tone="muted">
            Wednesday 19 August · four days before the turn of the season
          </Text>
        </>
      }
      pageIndex="01"
    >
      <Stack gap="xl">
        <MetricGrid items={[...metrics]} />

        <Stack gap="md">
          <HStack align="baseline" justify="between">
            <Heading level={2} size="section">
              Recent activity
            </Heading>
            <Link href="#/activity">See all</Link>
          </HStack>
          <Card>
            <Stack gap="sm">
              {activity.map((entry) => (
                <HStack align="center" gap="md" key={entry.title}>
                  <StatusDot aria-label={entry.title} tone={entry.tone} />
                  <Text style={{flex: 1, minWidth: 0}}>
                    {entry.title} <Text tone="muted">· {entry.detail}</Text>
                  </Text>
                  <Timestamp value={entry.time} />
                </HStack>
              ))}
            </Stack>
          </Card>
        </Stack>

        <Stack gap="md">
          <HStack align="baseline" gap="sm">
            <Heading level={2} size="section">
              Awaiting approval
            </Heading>
            <Numeral>{approvals.length}</Numeral>
          </HStack>
          <Card>
            <Stack gap="sm">
              {approvals.map((approval) => (
                <HStack align="center" gap="md" key={approval.title}>
                  <Text style={{flex: 1, minWidth: 0}}>
                    {approval.title}{' '}
                    <Text tone="muted">· {approval.detail}</Text>
                  </Text>
                  <Button size="sm" variant="secondary">
                    Review
                  </Button>
                  <Button size="sm">Approve</Button>
                </HStack>
              ))}
            </Stack>
          </Card>
        </Stack>
      </Stack>
    </AppShell>
  );
}
