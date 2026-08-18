import {
  AppShell,
  Badge,
  Card,
  Heading,
  MetricGrid,
  NavItem,
  NavMenu,
  SideNav,
  SideNavSection,
  Stack,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Timestamp,
  TopNav,
} from '@misoto22/kioku-ui';

const metrics = [
  {label: 'Open releases', value: '12'},
  {label: 'Awaiting review', value: '4'},
  {label: 'Published this week', value: '7'},
];

const activity = [
  {
    id: '12',
    owner: 'Ada Lovelace',
    status: 'Open',
    updated: '2026-08-18T09:30:00Z',
  },
  {
    id: '11',
    owner: 'Grace Hopper',
    status: 'In review',
    updated: '2026-08-17T16:05:00Z',
  },
  {
    id: '10',
    owner: 'Alan Turing',
    status: 'Published',
    updated: '2026-08-16T11:20:00Z',
  },
];

/** A metric overview. Replace the sample arrays with your own data source. */
export function DashboardPage() {
  return (
    <AppShell
      header={<TopNav brand="Your product" />}
      sidebar={
        <SideNav>
          <SideNavSection title="Work">
            <NavMenu label="Work">
              <NavItem current href="/dashboard">
                Dashboard
              </NavItem>
              <NavItem href="/releases">Releases</NavItem>
            </NavMenu>
          </SideNavSection>
        </SideNav>
      }
    >
      <Stack gap="lg">
        <Heading level={1} size="section">
          Dashboard
        </Heading>
        <MetricGrid items={metrics} />
        <Card>
          <Table>
            <TableCaption>Recent activity</TableCaption>
            <TableHead>
              <TableRow>
                <TableHeaderCell scope="col">Release</TableHeaderCell>
                <TableHeaderCell scope="col">Owner</TableHeaderCell>
                <TableHeaderCell scope="col">Status</TableHeaderCell>
                <TableHeaderCell scope="col">Updated</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activity.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>Release {entry.id}</TableCell>
                  <TableCell>{entry.owner}</TableCell>
                  <TableCell>
                    <Badge
                      tone={entry.status === 'Published' ? 'success' : 'info'}
                    >
                      {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Timestamp value={entry.updated} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Stack>
    </AppShell>
  );
}
