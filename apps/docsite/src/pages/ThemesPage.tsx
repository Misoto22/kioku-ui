import {useEffect, useRef, useState, type ReactNode} from 'react';

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
  SelectableCard,
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
  tokenContract,
  tokenNames,
  useTheme,
} from '@misoto22/kioku-ui';

import {PageContainer} from '../layout/PageContainer.js';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

/**
 * What each skin is, in the words its own stylesheet uses. The theme package
 * publishes ids and labels but no prose, so the sentences live with the page
 * that shows them.
 */
const skinNotes: Readonly<Record<string, {name: string; note: string}>> = {
  muji: {
    name: '無印',
    note: 'Cool walls, light timber where you touch it, a green-grey accent.',
  },
  sumi: {
    name: '墨',
    note: 'High contrast, near monochrome, one indigo accent, no grain.',
  },
  washi: {
    name: '和紙',
    note: 'Warm paper and sumi ink, with indigo, moss, kerria and madder.',
  },
};

/**
 * The six roles that decide whether a skin reads at a glance: the surface
 * ladder, the ink on it, the one accent, and the hairline that separates
 * everything.
 */
const swatchRoles: readonly {label: string; property: string}[] = [
  {label: 'GROUND', property: '--kioku-ui-color-canvas'},
  {label: 'PAPER', property: '--kioku-ui-color-surface'},
  {label: 'SUNKEN', property: '--kioku-ui-color-surface-muted'},
  {label: 'INK', property: '--kioku-ui-color-text'},
  {label: 'ACCENT', property: '--kioku-ui-color-accent'},
  {label: 'EDGE', property: '--kioku-ui-border-default'},
];

const spacingRoles = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

// Tracking is paired with size rather than chosen per component, so the scale
// is only honest when it is shown at its own tracking. Each row renders itself
// with the pair it names.
const typeScale = [
  {
    role: 'Page title',
    size: 'font-size2xl',
    tracking: 'letter-spacing-title',
  },
  {role: 'Section', size: 'font-size-xl', tracking: 'letter-spacing-title'},
  {
    role: 'Subsection',
    size: 'font-size-lg',
    tracking: 'letter-spacing-heading',
  },
  {role: 'Body', size: 'font-size-md', tracking: 'letter-spacing-body'},
  {role: 'Label', size: 'font-size-sm', tracking: 'letter-spacing-label'},
  {role: 'Eyebrow', size: 'font-size-xs', tracking: 'letter-spacing-eyebrow'},
];

const releases = [
  {owner: 'Ada Lovelace', release: 'Release 12', status: 'Open'},
  {owner: 'Grace Hopper', release: 'Release 11', status: 'Published'},
  {owner: 'Katherine Johnson', release: 'Release 10', status: 'In review'},
] as const;

const statusTones = {
  'In review': 'warning',
  Open: 'info',
  Published: 'success',
} as const;

const swatchHeight = 'calc(2 * var(--kioku-ui-spacing-lg))';

/** The label of last resort: it names a thing without competing with it. */
function Eyebrow({children}: {readonly children: ReactNode}) {
  return (
    <span
      style={{
        color: 'var(--kioku-ui-color-text-secondary)',
        fontFamily: 'var(--kioku-ui-typography-font-family-heading)',
        fontSize: 'var(--kioku-ui-typography-font-size-xs)',
        letterSpacing: 'var(--kioku-ui-typography-letter-spacing-eyebrow)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

/** A figure is set in the mono face and tabular, so a column of them lines up. */
function Mono({children}: {readonly children: ReactNode}) {
  return (
    <span
      style={{
        color: 'var(--kioku-ui-color-text-muted)',
        fontFamily: 'var(--kioku-ui-typography-font-family-mono)',
        fontSize: 'var(--kioku-ui-typography-font-size-xs)',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: 'var(--kioku-ui-typography-letter-spacing-mono)',
      }}
    >
      {children}
    </span>
  );
}

/** An eyebrow, an optional note, and a rule that runs out to the margin. */
function SectionRule({
  label,
  note,
}: {
  readonly label: string;
  readonly note?: string;
}) {
  return (
    <HStack align="center" gap="md">
      <Eyebrow>{label}</Eyebrow>
      {note === undefined ? null : (
        <Text size="sm" tone="muted">
          {note}
        </Text>
      )}
      <span
        aria-hidden="true"
        style={{
          backgroundColor: 'var(--kioku-ui-border-default)',
          blockSize: 'var(--kioku-ui-border-width)',
          flex: 1,
        }}
      />
    </HStack>
  );
}

/**
 * A painted colour as the hex a stylesheet would have been written with.
 * Anything the browser could not resolve returns nothing rather than a
 * misleading `#000000`.
 */
function toHex(color: string): string {
  const channels = color.match(/\d+(\.\d+)?/g);

  if (channels === null || channels.length < 3 || channels[3] === '0') {
    return '';
  }

  return channels
    .slice(0, 3)
    .reduce(
      (hex, channel) =>
        hex + Math.round(Number(channel)).toString(16).padStart(2, '0'),
      '#',
    );
}

/**
 * One role of one skin.
 *
 * The swatch is painted by the token itself inside a `data-theme` probe, so a
 * skin that is not currently applied still shows its own colours, and the
 * caption underneath is read back off the painted pixel rather than copied out
 * of the stylesheet. Nothing here can drift from the theme package, because
 * nothing here restates it.
 */
function Swatch({
  label,
  property,
  skin,
}: {
  readonly label: string;
  readonly property: string;
  readonly skin: string;
}) {
  const probe = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (probe.current !== null) {
      setValue(toHex(getComputedStyle(probe.current).backgroundColor));
    }
  }, [property, skin]);

  return (
    <span
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--kioku-ui-spacing-xs)',
      }}
    >
      <Eyebrow>{label}</Eyebrow>
      <span
        data-theme={skin}
        ref={probe}
        style={{
          backgroundColor: `var(${property})`,
          blockSize: swatchHeight,
          borderRadius: 'var(--kioku-ui-radius-inner)',
          boxShadow:
            'inset 0 0 0 var(--kioku-ui-border-width) var(--kioku-ui-border-strong)',
          display: 'block',
        }}
      />
      <Mono>{value}</Mono>
    </span>
  );
}

/**
 * The six roles that decide how a skin reads, in the appearance the reader is
 * in. Light and dark are not shown side by side because a theme's two
 * appearances are chosen by the reader's own setting, not by an attribute this
 * page could put on a swatch — so a second row would only repeat the first.
 *
 * It lives inside the card's own `<label>`, so it is built from inline
 * elements and hidden from assistive technology: a colour value read aloud is
 * noise in the middle of a radio's name, and the skin's sentence beside it
 * already says what the swatches show.
 */
function SkinSpecimen({skin}: {readonly skin: string}) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'grid',
        gap: 'var(--kioku-ui-spacing-sm)',
        gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
      }}
    >
      {swatchRoles.map((role) => (
        <Swatch
          key={role.property}
          label={role.label}
          property={role.property}
          skin={skin}
        />
      ))}
    </span>
  );
}

/**
 * The spacing scale, drawn at its own values. It is the fastest way to see
 * what density actually does, because every bar re-measures itself when the
 * scale underneath changes.
 */
function SpacingSpecimen() {
  return (
    <HStack align="end" gap="sm">
      {spacingRoles.map((role) => (
        <Stack align="center" gap="xs" key={role}>
          <span
            aria-hidden="true"
            style={{
              backgroundColor: 'var(--kioku-ui-color-text-muted)',
              blockSize: 'var(--kioku-ui-spacing-sm)',
              display: 'block',
              inlineSize: `var(--kioku-ui-spacing-${role})`,
            }}
          />
          <Mono>{role}</Mono>
        </Stack>
      ))}
    </HStack>
  );
}

/** The 11 groups of the token contract, counted off the contract itself. */
function roleGroupItems() {
  const groups = Object.entries(tokenContract).map(([group, roles]) => {
    const names = Object.values(roles);

    return {
      detail: <Mono>{names[0] ?? group}</Mono>,
      label: group,
      value: names.length,
    };
  });

  return [
    ...groups,
    {
      detail: <Mono>{`${groups.length} groups`}</Mono>,
      label: 'total',
      value: tokenNames.length,
    },
  ];
}

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
        <HStack align="start" gap="2xl" justify="between" wrap>
          <Stack gap="sm">
            <Eyebrow>TOKEN CONTRACT</Eyebrow>
            <Heading level={1} size="page">
              Themes
            </Heading>
            <Text style={{maxWidth: '72ch'}} tone="secondary">
              A theme fills every role in the token contract for one visual
              identity. Components never name a colour, so switching one changes
              everything below without touching a component.
            </Text>
          </Stack>

          <Stack gap="md">
            <HStack align="center" gap="md">
              <Eyebrow>DENSITY</Eyebrow>
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
            </HStack>
            <HStack align="end" gap="md">
              <Eyebrow>SPACING</Eyebrow>
              <SpacingSpecimen />
            </HStack>
          </Stack>
        </HStack>

        <Divider />

        <Stack gap="md">
          <SectionRule
            label="SKINS"
            note="every one fills all 79 roles; the sample below is dressed by the marked skin"
          />
          <div
            style={{
              display: 'grid',
              gap: 'var(--kioku-ui-spacing-lg)',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(100%, calc(13 * var(--kioku-ui-spacing-2xl))), 1fr))',
            }}
          >
            {kiokuThemes.map((entry) => {
              const active = entry.id === theme.id;
              const skin = skinNotes[entry.id];

              return (
                <SelectableCard
                  checked={active}
                  description={
                    <span
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--kioku-ui-spacing-md)',
                      }}
                    >
                      {skin === undefined ? null : <span>{skin.note}</span>}
                      <SkinSpecimen skin={entry.id} />
                    </span>
                  }
                  key={entry.id}
                  label={
                    <span
                      style={{
                        alignItems: 'baseline',
                        display: 'flex',
                        gap: 'var(--kioku-ui-spacing-sm)',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span
                        style={{
                          alignItems: 'baseline',
                          display: 'flex',
                          gap: 'var(--kioku-ui-spacing-sm)',
                        }}
                      >
                        <span>{entry.label}</span>
                        {skin === undefined ? null : (
                          <span
                            lang="ja"
                            style={{
                              color: 'var(--kioku-ui-color-text-secondary)',
                              fontFamily:
                                'var(--kioku-ui-typography-font-family-display)',
                              fontSize:
                                'var(--kioku-ui-typography-font-size-sm)',
                              letterSpacing:
                                'var(--kioku-ui-typography-letter-spacing-label)',
                            }}
                          >
                            {skin.name}
                          </span>
                        )}
                        <Mono>{entry.id}</Mono>
                      </span>
                      {active ? (
                        <span
                          style={{
                            color: 'var(--kioku-ui-color-accent)',
                            fontFamily:
                              'var(--kioku-ui-typography-font-family-heading)',
                            fontSize: 'var(--kioku-ui-typography-font-size-xs)',
                            letterSpacing:
                              'var(--kioku-ui-typography-letter-spacing-eyebrow)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          IN USE
                        </span>
                      ) : null}
                    </span>
                  }
                  name="skin"
                  onChange={() => setThemeId(entry.id)}
                  value={entry.id}
                />
              );
            })}
          </div>
        </Stack>

        <Stack gap="md">
          <SectionRule
            label="ROLE GROUPS"
            note="a skin that leaves one role unfilled is not a theme"
          />
          <MetricGrid items={roleGroupItems()} />
        </Stack>

        <Stack gap="md">
          <SectionRule
            label="TYPE SCALE"
            note="tracking runs inverse to size — the smaller the type, the further it opens"
          />
          <Card elevation="low">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell scope="col">Role</TableHeaderCell>
                  <TableHeaderCell scope="col">Size token</TableHeaderCell>
                  <TableHeaderCell scope="col">Tracking token</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {typeScale.map((entry) => (
                  <TableRow key={entry.role}>
                    <TableCell>
                      <span
                        style={{
                          fontSize: `var(--kioku-ui-typography-${entry.size})`,
                          letterSpacing: `var(--kioku-ui-typography-${entry.tracking})`,
                        }}
                      >
                        {entry.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Code>{entry.size}</Code>
                    </TableCell>
                    <TableCell>
                      <Code>{entry.tracking}</Code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Stack>

        <Stack gap="md">
          <SectionRule
            label={`THE SAME PAGE, DRESSED BY ${theme.label.toLocaleUpperCase('en')}`}
            note="ordinary furniture, because a skin is only convincing against what it will actually dress"
          />

          <MetricGrid
            items={[
              {label: 'Open', value: '12'},
              {label: 'In review', value: '4'},
              {label: 'Published', value: '7'},
            ]}
          />

          <div
            style={{
              display: 'grid',
              gap: 'var(--kioku-ui-spacing-lg)',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(100%, calc(12 * var(--kioku-ui-spacing-2xl))), 1fr))',
            }}
          >
            <Card elevation="low">
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
                  {releases.map((entry) => (
                    <TableRow key={entry.release}>
                      <TableCell>{entry.release}</TableCell>
                      <TableCell>{entry.owner}</TableCell>
                      <TableCell>
                        <Badge tone={statusTones[entry.status]}>
                          {entry.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card elevation="low">
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
          </div>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
