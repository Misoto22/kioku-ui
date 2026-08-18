import {
  Badge,
  Button,
  Card,
  CardHeader,
  Code,
  Divider,
  Field,
  HStack,
  Heading,
  Item,
  MetricGrid,
  SegmentedControl,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  TextInput,
  useTheme,
} from '@misoto22/kioku-ui';

import {PageContainer} from '../layout/PageContainer.js';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

const metrics = [
  {label: 'Open', value: '12'},
  {label: 'In review', value: '4'},
  {label: 'Published', value: '7'},
];

/**
 * The theme picker with a live sample beneath it. The sample is deliberately
 * ordinary product furniture — a heading, a table, a form, a status — because
 * a theme is only convincing against the things it will actually dress.
 */
export function ThemesPage() {
  const {density, setDensity, setThemeId, theme} = useTheme();

  return (
    <PageContainer>
      <Stack gap="xl">
        <Stack align="center" gap="md">
          <Heading level={1} size="page">
            Themes
          </Heading>
          <Text
            size="lg"
            style={{maxWidth: '52ch', textAlign: 'center'}}
            tone="secondary"
          >
            A theme fills every role in the token contract for one visual
            identity. Components never name a colour, so switching one changes
            everything below without touching a component.
          </Text>
        </Stack>

        <Stack gap="md">
          <Heading level={2} size="subsection">
            Choose a theme
          </Heading>
          <div
            style={{
              display: 'grid',
              gap: 'var(--kioku-ui-spacing-md)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
            }}
          >
            {kiokuThemes.map((entry) => {
              const active = entry.id === theme.id;

              return (
                <Card elevation={active ? 'medium' : 'low'} key={entry.id}>
                  <Stack gap="sm">
                    <HStack gap="sm" justify="between">
                      <Heading level={2} size="subsection">
                        {entry.label}
                      </Heading>
                      {active ? <Badge tone="success">In use</Badge> : null}
                    </HStack>
                    <Text size="sm" tone="secondary">
                      <Code>{entry.id}</Code>
                    </Text>
                    <Button
                      aria-pressed={active}
                      onClick={() => setThemeId(entry.id)}
                      variant={active ? 'primary' : 'secondary'}
                    >
                      {active ? 'Applied' : 'Use this theme'}
                    </Button>
                  </Stack>
                </Card>
              );
            })}
          </div>
        </Stack>

        <Stack gap="md">
          <Heading level={2} size="subsection">
            Density
          </Heading>
          <SegmentedControl
            aria-label="Density"
            onValueChange={(value) =>
              setDensity(value === 'standard' ? 'standard' : 'compact')
            }
            options={[
              {label: 'Compact', value: 'compact'},
              {label: 'Standard', value: 'standard'},
            ]}
            value={density}
          />
        </Stack>

        <Divider />

        <Stack gap="md">
          <Heading level={2} size="section">
            The same page, dressed by {theme.label}
          </Heading>

          <MetricGrid items={metrics} />

          <Card>
            <CardHeader>
              <Heading level={3} size="subsection">
                Recent releases
              </Heading>
            </CardHeader>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell scope="col">Release</TableHeaderCell>
                  <TableHeaderCell scope="col">Owner</TableHeaderCell>
                  <TableHeaderCell scope="col">Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Release 12</TableCell>
                  <TableCell>Ada Lovelace</TableCell>
                  <TableCell>
                    <Badge tone="info">Open</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Release 11</TableCell>
                  <TableCell>Grace Hopper</TableCell>
                  <TableCell>
                    <Badge tone="success">Published</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>

          <Card>
            <Stack gap="md">
              <Field label="Release title">
                <TextInput defaultValue="Release 12" />
              </Field>
              <Item
                description="Applies as soon as it is flipped"
                trailing={<Switch aria-label="Live updates" defaultPressed />}
              >
                Live updates
              </Item>
              <HStack gap="sm" justify="end">
                <Button variant="secondary">Cancel</Button>
                <Button>Publish</Button>
              </HStack>
            </Stack>
          </Card>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
