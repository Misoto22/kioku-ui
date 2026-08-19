import {useState} from 'react';

import {
  AppShell,
  Avatar,
  Button,
  Card,
  CardFooter,
  CardHeader,
  DropdownMenuItem,
  Eyebrow,
  HStack,
  Heading,
  Icon,
  IconButton,
  Item,
  List,
  ListItem,
  MetricGrid,
  MoreMenu,
  NavIcon,
  NavItem,
  NavMenu,
  Numeral,
  SideNav,
  SideNavSection,
  Stack,
  StatusDot,
  TabList,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  TextInput,
  Timestamp,
  TopNav,
  VisuallyHidden,
} from '@misoto22/kioku-ui';

// The two measures the body is set to. The spacing scale has no name for a
// measure, so they are built out of the scale rather than written as lengths;
// when the frame cannot hold both, the rail wraps under the table.
const railMeasure = 'calc(11 * var(--kioku-ui-spacing-2xl))';
const tableMeasure = 'calc(20 * var(--kioku-ui-spacing-2xl))';

// `Eyebrow` carries the type, so a card title that has to stay in the document
// outline keeps only its own box: no margin, and no inline strut of its own to
// make the row taller than the label inside it.
const eyebrowHeading = {display: 'flex', margin: 0} as const;

// Everything in the rail happened today, so the clock is all it shows.
const clock = (value: Date) =>
  value.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'});

const navSections = [
  {
    items: [
      {
        href: '/dashboard',
        icon: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
        label: 'Dashboard',
      },
      {href: '/releases', icon: 'M4 6h16M4 12h16M4 18h10', label: 'Releases'},
      {href: '/reviews', icon: 'm5 13 4 4L19 7', label: 'Reviews'},
    ],
    title: 'Work',
  },
  {
    items: [
      {
        href: '/archive',
        icon: 'M4 7h16v13H4Zm0 0V4h16v3M9.5 11h5',
        label: 'Older releases',
      },
    ],
    title: 'Archive',
  },
];

// The figures are zero-padded so the three tiles rank as a column: two digits
// wide in the mono face, they line up on the same stems whatever the count.
const metrics = [
  {
    detail: 'Owned across three people',
    label: 'Open releases',
    status: 'open',
    value: '12',
  },
  {
    detail: 'Oldest waiting since 17 Aug',
    label: 'Awaiting review',
    status: 'review',
    value: '04',
  },
  {
    detail: 'Last published 16 Aug',
    label: 'Published this week',
    status: 'published',
    value: '07',
  },
] as const;

const statusLabels = {
  open: 'Open',
  published: 'Published',
  review: 'In review',
} as const;

const statusTones = {
  open: 'warning',
  published: 'success',
  review: 'info',
} as const;

const tabs = [
  {id: 'all', label: 'All'},
  {id: 'open', label: 'Open'},
  {id: 'review', label: 'In review'},
  {id: 'published', label: 'Published'},
];

const releases = [
  {
    id: '12',
    owner: 'Ada Lovelace',
    status: 'open',
    updated: '2026-08-18T09:30:00',
  },
  {
    id: '11',
    owner: 'Grace Hopper',
    status: 'review',
    updated: '2026-08-17T16:05:00',
  },
  {
    id: '10',
    owner: 'Alan Turing',
    status: 'published',
    updated: '2026-08-16T11:20:00',
  },
  {
    id: '09',
    owner: 'Ada Lovelace',
    status: 'review',
    updated: '2026-08-15T14:05:00',
  },
  {
    id: '08',
    owner: 'Grace Hopper',
    status: 'open',
    updated: '2026-08-14T10:40:00',
  },
  {
    id: '07',
    owner: 'Alan Turing',
    status: 'published',
    updated: '2026-08-12T17:15:00',
  },
  {
    id: '06',
    owner: 'Ada Lovelace',
    status: 'published',
    updated: '2026-08-11T08:50:00',
  },
] as const;

// The row the reader opened last. `selected` draws the rule down its leading
// edge and carries `aria-selected` with it, so the choice is never styled by
// hand.
const selectedRelease = '11';

const reviews = [
  {asked: '2026-08-17T16:05:00', id: '11', who: 'Grace Hopper'},
  {asked: '2026-08-15T14:05:00', id: '09', who: 'Ada Lovelace'},
];

const activity = [
  {
    at: '2026-08-18T09:30:00',
    status: 'open',
    text: 'Ada Lovelace opened Release 12',
  },
  {
    at: '2026-08-17T16:05:00',
    status: 'review',
    text: 'Grace Hopper sent Release 11 to review',
  },
  {
    at: '2026-08-16T11:20:00',
    status: 'published',
    text: 'Alan Turing published Release 10',
  },
  {
    at: '2026-08-16T08:15:00',
    status: 'published',
    text: 'The accessibility audit finished clean',
  },
] as const;

/** One navigation glyph, sized by the rail rather than by the path. */
function Glyph({d}: {readonly d: string}) {
  return (
    <NavIcon>
      <Icon>
        <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
      </Icon>
    </NavIcon>
  );
}

/** A release is named by a figure, so the numeral is set in the mono face. */
function ReleaseName({id}: {readonly id: string}) {
  return (
    <>
      Release <Numeral>{id}</Numeral>
    </>
  );
}

/**
 * A metric overview with a rail beside it. Replace the sample arrays with your
 * own data source; the tabs filter in place, which is all a template can
 * honestly show without a query behind it.
 */
export function DashboardPage() {
  const [tab, setTab] = useState('all');
  const shown =
    tab === 'all'
      ? releases
      : releases.filter((release) => release.status === tab);

  return (
    <AppShell
      header={
        <TopNav
          actions={
            <>
              <TextInput
                aria-label="Search releases"
                placeholder="Search releases"
                type="search"
              />
              <IconButton aria-label="Notifications" variant="ghost">
                <Icon>
                  <path
                    d="M6 10a6 6 0 0 1 12 0c0 3.9 1.2 5.5 1.8 6.3H4.2C4.8 15.5 6 13.9 6 10ZM9.9 19.5a2.4 2.4 0 0 0 4.2 0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </Icon>
              </IconButton>
              <Avatar name="Ada Lovelace" size="sm" />
            </>
          }
          brand={
            <>
              <Icon size="lg">
                <rect
                  fill="none"
                  height="17"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="17"
                  x="3.5"
                  y="3.5"
                />
                <path
                  d="M3.5 14h17M12 3.5v17"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </Icon>
              Your product
            </>
          }
        />
      }
      sidebar={
        <SideNav
          footer={
            <Item
              description="Owner"
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
          {navSections.map((section) => (
            <SideNavSection key={section.title} title={section.title}>
              <NavMenu label={section.title}>
                {section.items.map((item) => (
                  <NavItem
                    current={item.href === '/dashboard'}
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
      <HStack align="end" gap="xl" justify="between">
        <Stack gap="xs">
          <Heading level={1} size="section">
            Dashboard
          </Heading>
          <HStack gap="sm">
            <Eyebrow>Updated</Eyebrow>
            <Timestamp value="2026-08-18T09:30:00" />
          </HStack>
        </Stack>
        <HStack gap="sm">
          <Button variant="secondary">
            <Icon>
              <path
                d="M3.5 5h17l-6.3 7.5v6.6l-3.9 1.6V12.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </Icon>
            Filter
          </Button>
          <Button>
            <Icon>
              <path
                d="M12 5v14M5 12h14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </Icon>
            New release
          </Button>
        </HStack>
      </HStack>

      <MetricGrid
        items={metrics.map((metric) => ({
          detail: (
            <HStack gap="sm">
              <StatusDot
                aria-label={statusLabels[metric.status]}
                tone={statusTones[metric.status]}
              />
              {metric.detail}
            </HStack>
          ),
          label: metric.label,
          value: metric.value,
        }))}
      />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--kioku-ui-spacing-xl)',
        }}
      >
        <div style={{flexBasis: tableMeasure, flexGrow: 3, minWidth: 0}}>
          <Card>
            <CardHeader>
              <HStack align="baseline" gap="xl" justify="between">
                <Stack gap="xs">
                  <Eyebrow>Recent activity</Eyebrow>
                  <Heading level={2} size="subsection">
                    Releases updated this month
                  </Heading>
                </Stack>
                <Text size="sm" tone="muted">
                  Sorted by updated
                </Text>
              </HStack>
            </CardHeader>

            <Stack gap="lg">
              <TabList
                label="Filter releases by status"
                onSelect={setTab}
                selectedId={tab}
                tabs={tabs}
              />

              <Table>
                <TableCaption>
                  <VisuallyHidden>Releases updated this month</VisuallyHidden>
                </TableCaption>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell scope="col">Release</TableHeaderCell>
                    <TableHeaderCell scope="col">Owner</TableHeaderCell>
                    <TableHeaderCell scope="col">Status</TableHeaderCell>
                    <TableHeaderCell scope="col">Updated</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shown.map((release) => (
                    <TableRow
                      key={release.id}
                      selected={release.id === selectedRelease}
                    >
                      <TableCell>
                        <ReleaseName id={release.id} />
                      </TableCell>
                      <TableCell>
                        <Item
                          leading={<Avatar name={release.owner} size="sm" />}
                        >
                          {release.owner}
                        </Item>
                      </TableCell>
                      <TableCell>
                        <HStack gap="sm">
                          <StatusDot
                            aria-label={statusLabels[release.status]}
                            tone={statusTones[release.status]}
                          />
                          {statusLabels[release.status]}
                        </HStack>
                      </TableCell>
                      <TableCell>
                        <Timestamp value={release.updated} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>

            <CardFooter>
              <HStack gap="lg" justify="between">
                <Text size="sm" tone="secondary">
                  <Numeral>
                    {shown.length} of {releases.length}
                  </Numeral>
                </Text>
                <Button size="sm" variant="secondary">
                  Older releases
                </Button>
              </HStack>
            </CardFooter>
          </Card>
        </div>

        <div style={{flexBasis: railMeasure, flexGrow: 1, minWidth: 0}}>
          <Stack gap="xl">
            <Card>
              <Stack gap="lg">
                <HStack align="baseline" gap="md" justify="between">
                  <h2 style={eyebrowHeading}>
                    <Eyebrow>Awaiting your review</Eyebrow>
                  </h2>
                  <Text size="sm">
                    <Numeral>{String(reviews.length).padStart(2, '0')}</Numeral>
                  </Text>
                </HStack>
                <List gap="md" variant="plain">
                  {reviews.map((review) => (
                    <ListItem key={review.id}>
                      <Item
                        description={`${review.who} asked for review`}
                        leading={<Avatar name={review.who} size="sm" />}
                        trailing={
                          <Timestamp format={clock} value={review.asked} />
                        }
                      >
                        <ReleaseName id={review.id} />
                      </Item>
                    </ListItem>
                  ))}
                </List>
                <Button variant="secondary">Open the review queue</Button>
              </Stack>
            </Card>

            <Card>
              <Stack gap="lg">
                <h2 style={eyebrowHeading}>
                  <Eyebrow>Activity</Eyebrow>
                </h2>
                <List gap="lg" variant="plain">
                  {activity.map((entry) => (
                    <ListItem key={entry.text}>
                      <HStack align="baseline" gap="md">
                        <StatusDot
                          aria-label={statusLabels[entry.status]}
                          tone={statusTones[entry.status]}
                        />
                        <Stack gap="xs">
                          <Text size="sm">{entry.text}</Text>
                          <Timestamp value={entry.at} />
                        </Stack>
                      </HStack>
                    </ListItem>
                  ))}
                </List>
              </Stack>
            </Card>
          </Stack>
        </div>
      </div>
    </AppShell>
  );
}
