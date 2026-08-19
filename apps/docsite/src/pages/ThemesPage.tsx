import {useLayoutEffect, useState, type ReactNode} from 'react';

import {
  Badge,
  Button,
  Card,
  CardHeader,
  Code,
  Divider,
  Eyebrow,
  Field,
  HStack,
  Heading,
  Item,
  MetadataList,
  MetricGrid,
  Numeral,
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
  type ColorMode,
  type StatusTone,
} from '@misoto22/kioku-ui';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

import {Emphasis, useCopy} from '../i18n/index.js';
import {themes, type ThemesRoleLabels} from '../i18n/themes.js';
import {PageContainer} from '../layout/PageContainer.js';

/**
 * The Japanese a skin is named after. It is the skin's own name rather than a
 * word about it, so it does not localise: 和紙 is 和紙 on either page.
 */
const skinNames: Readonly<Record<string, string>> = {
  kasumi: '霞',
  muji: '無印',
  sumi: '墨',
  washi: '和紙',
};

/** One of the six roles that decide whether a skin reads at a glance. */
interface RoleSpec {
  readonly key: keyof ThemesRoleLabels;
  readonly onGround: boolean;
  readonly property: string;
}

const groundProperty = '--kioku-ui-color-canvas';
const inkProperty = '--kioku-ui-color-text';
const raisedProperty = '--kioku-ui-color-surface';

/**
 * The surface ladder, the ink on it, the one accent, and the hairline that
 * separates everything.
 *
 * `onGround` is the difference between a fill and a rim. A fill lands on
 * whatever the host drew behind the app; a hairline is drawn *around*
 * something, so an alpha rim composites over the ground first and only then
 * over the backdrop.
 */
const swatchRoles: readonly RoleSpec[] = [
  {key: 'ground', onGround: false, property: groundProperty},
  {key: 'paper', onGround: false, property: raisedProperty},
  {key: 'sunken', onGround: false, property: '--kioku-ui-color-surface-muted'},
  {key: 'ink', onGround: false, property: inkProperty},
  {key: 'accent', onGround: false, property: '--kioku-ui-color-accent'},
  {key: 'edge', onGround: true, property: '--kioku-ui-border-default'},
];

const spacingRoles = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

// Tracking is paired with size rather than chosen per component, so the scale
// is only honest when it is shown at its own tracking. Each cell renders
// itself with the pair it names.
const typeScale = [
  {
    key: 'pageTitle',
    size: 'font-size2xl',
    tracking: 'letter-spacing-title',
  },
  {key: 'section', size: 'font-size-xl', tracking: 'letter-spacing-title'},
  {
    key: 'subsection',
    size: 'font-size-lg',
    tracking: 'letter-spacing-heading',
  },
  {key: 'body', size: 'font-size-md', tracking: 'letter-spacing-body'},
  {key: 'label', size: 'font-size-sm', tracking: 'letter-spacing-label'},
  {key: 'eyebrow', size: 'font-size-xs', tracking: 'letter-spacing-eyebrow'},
] as const;

const releases = [
  {index: 12, owner: 'Ada Lovelace', status: 'open'},
  {index: 11, owner: 'Grace Hopper', status: 'published'},
  {index: 10, owner: 'Katherine Johnson', status: 'review'},
] as const;

const statusTones: Readonly<Record<string, StatusTone>> = {
  open: 'info',
  published: 'success',
  review: 'warning',
};

const openCount = '12';
const reviewCount = '4';
const publishedCount = '7';

const swatchHeight = 'calc(2 * var(--kioku-ui-spacing-lg))';
const skinMeasure = 'calc(18 * var(--kioku-ui-spacing-2xl))';
const sampleMeasure = 'calc(12 * var(--kioku-ui-spacing-2xl))';
const typeCellMeasure = 'calc(5 * var(--kioku-ui-spacing-2xl))';
const ring =
  'inset 0 0 0 var(--kioku-ui-border-width) var(--kioku-ui-border-strong)';
const halfRule =
  'var(--kioku-ui-border-width) var(--kioku-ui-border-style) var(--kioku-ui-border-strong)';

/* ─────────── reading colour back off the stylesheet ─────────── */

/** A colour the browser resolved, kept as channels so it can be composited. */
interface Resolved {
  readonly alpha: number;
  readonly blue: number;
  readonly green: number;
  readonly red: number;
}

const channelPattern = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;

/**
 * Parses what `getComputedStyle` hands back.
 *
 * Two forms arrive, and the second is the one that bit. A plain colour comes
 * back as `rgb()` or `rgba()` with channels in 0–255. Anything that went
 * through `color-mix()` comes back as `color(srgb …)` with channels in 0–1 —
 * which is the form every surface of the glass skin takes, and the reason a
 * reader written for `rgb()` alone rounded `0.98 0.99 1` to `1, 1, 1` and
 * printed the fourth skin as `#010101`.
 */
function parseColour(value: string): Resolved | null {
  const numbers = value.match(channelPattern);

  if (numbers === null || numbers.length < 3) {
    return null;
  }

  const scale = value.startsWith('color(') ? 255 : 1;
  const [red, green, blue, alpha] = numbers.map(Number);

  if (red === undefined || green === undefined || blue === undefined) {
    return null;
  }

  return {
    alpha: alpha ?? 1,
    blue: blue * scale,
    green: green * scale,
    red: red * scale,
  };
}

function channelHex(value: number): string {
  return Math.round(Math.min(255, Math.max(0, value)))
    .toString(16)
    .padStart(2, '0');
}

/** The colour as the hex a stylesheet would have been written with. */
function hexOf({blue, green, red}: Resolved): string {
  return `#${channelHex(red)}${channelHex(green)}${channelHex(blue)}`;
}

/** The share of its own colour a tint keeps, as the stylesheet states it. */
function percentOf({alpha}: Resolved): string {
  return `${Math.round(alpha * 100)}%`;
}

function mix(tint: number, backdrop: number, alpha: number): number {
  // Rounded here, per layer, because that is what the screen does: a fill is
  // painted into eight bits per channel and the rim above it is composited
  // over that painted value, not over the unrounded arithmetic behind it.
  return Math.round(alpha * tint + (1 - alpha) * backdrop);
}

/** The tint as it lands on one backdrop. */
function compositeOver(tint: Resolved, backdrop: Resolved): Resolved {
  return {
    alpha: 1,
    blue: mix(tint.blue, backdrop.blue, tint.alpha),
    green: mix(tint.green, backdrop.green, tint.alpha),
    red: mix(tint.red, backdrop.red, tint.alpha),
  };
}

function brightness({blue, green, red}: Resolved): number {
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/**
 * The three knobs the glass skin exposes. A union rather than an array: each
 * one is read on its own line and phrased in its own sentence — blur is a
 * filter, keep is a percentage, saturate is a multiplier — so there is nothing
 * to iterate and a list would only be a type in disguise.
 */
type FrostKey = 'blur' | 'keep' | 'saturate';

function frostProperty(skin: string, key: FrostKey): string {
  return `--kioku-theme-${skin}-frost-${key}`;
}

/** Everything one skin says about itself, without being applied. */
interface SkinReading {
  readonly colours: ReadonlyMap<string, Resolved>;
  readonly frost: Readonly<Record<FrostKey, string>>;
}

const skinIds: readonly string[] = kiokuThemes.map(({id}) => id);
const probedProperties: readonly string[] = swatchRoles.map(
  ({property}) => property,
);

/**
 * Every skin's own colours, read off the stylesheet without applying any of
 * them.
 *
 * The probes are made, read and thrown away inside the effect rather than
 * rendered. An element carrying `data-theme` also carries that theme's
 * structural rules, and the glass skin's are a stacking context and a
 * backdrop-filtered `::before`; two dozen of those in the tree — one per
 * swatch, which is how this page used to draw them — stack one saturation
 * pass per swatch until the page yellows.
 */
function useSkinReadings(
  mode: ColorMode,
  root: HTMLElement | null,
): ReadonlyMap<string, SkinReading> {
  const [readings, setReadings] = useState<ReadonlyMap<string, SkinReading>>(
    () => new Map(),
  );

  // Before paint, not after: the swatches are drawn from what this reads, so
  // an effect that ran afterwards would paint one frame of cards with no
  // colours in them every time the page is opened.
  useLayoutEffect(() => {
    const host = root ?? document.body;
    const next = new Map<string, SkinReading>();

    for (const skin of skinIds) {
      const probe = document.createElement('span');
      probe.setAttribute('data-theme', skin);
      probe.style.display = 'none';

      // The theme sheet re-declares `color-scheme: light dark` on every theme
      // root, so a probe that let that stand would resolve `light-dark()`
      // against the reader's operating system rather than against the mode
      // this site is in. `system` is the one case where the sheet is right.
      if (mode !== 'system') {
        probe.style.colorScheme = mode;
      }

      host.append(probe);

      const computed = getComputedStyle(probe);
      const colours = new Map<string, Resolved>();

      for (const property of probedProperties) {
        probe.style.backgroundColor = `var(${property})`;
        const colour = parseColour(computed.backgroundColor);

        if (colour !== null && colour.alpha > 0) {
          colours.set(property, colour);
        }
      }

      const frost = {
        blur: computed.getPropertyValue(frostProperty(skin, 'blur')).trim(),
        keep: computed.getPropertyValue(frostProperty(skin, 'keep')).trim(),
        saturate: computed
          .getPropertyValue(frostProperty(skin, 'saturate'))
          .trim(),
      };

      probe.remove();
      next.set(skin, {colours, frost});
    }

    setReadings(next);
  }, [mode, root]);

  return readings;
}

/**
 * The two grounds a tint is drawn over: the darkest and the lightest opaque
 * pair the pack offers, taken from the first skin that has both.
 *
 * A tinted skin cannot supply them — its own ground is the thing being
 * explained — so the reference is a skin whose ink and canvas are values.
 */
function backdropsFrom(
  readings: ReadonlyMap<string, SkinReading>,
): readonly Resolved[] {
  for (const skin of skinIds) {
    const colours = readings.get(skin)?.colours;
    const ink = colours?.get(inkProperty);
    const ground = colours?.get(groundProperty);

    if (
      ink !== undefined &&
      ground !== undefined &&
      ink.alpha >= 1 &&
      ground.alpha >= 1
    ) {
      return [ink, ground].sort((a, b) => brightness(a) - brightness(b));
    }
  }

  return [];
}

/* ─────────── the page's own small parts ─────────── */

/**
 * A figure at eyebrow size. The mono face, the tabular figures and the one
 * tracking that tightens all come from `Numeral`; only the rank and the scale
 * are set here.
 */
function Mono({
  children,
  tone = 'secondary',
}: {
  readonly children: ReactNode;
  readonly tone?: 'primary' | 'secondary';
}) {
  return (
    <span
      style={{
        color:
          tone === 'primary'
            ? 'var(--kioku-ui-color-text)'
            : 'var(--kioku-ui-color-text-secondary)',
        fontSize: 'var(--kioku-ui-typography-font-size-xs)',
      }}
    >
      <Numeral>{children}</Numeral>
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
      <Divider aria-hidden="true" style={{flex: 1}} />
    </HStack>
  );
}

/** A square of a colour, at the size of the figure beside it. */
function Chip({colour}: {readonly colour: Resolved}) {
  return (
    <span
      aria-hidden="true"
      style={{
        backgroundColor: hexOf(colour),
        blockSize: 'var(--kioku-ui-spacing-md)',
        borderRadius: 'var(--kioku-ui-radius-inner)',
        boxShadow: ring,
        display: 'inline-block',
        inlineSize: 'var(--kioku-ui-spacing-md)',
      }}
    />
  );
}

/**
 * One role of one skin.
 *
 * A role whose value is a value is drawn as one flat chip and printed as the
 * hex a stylesheet would have been written with. A role whose value depends
 * on what is behind it has no such hex, so it is drawn as a relationship: the
 * chip is split, each half is the tint composited over one of the two
 * backdrops, both composites are printed, and the caption is the recipe
 * rather than a colour.
 *
 * Nothing here is copied out of the theme package. The tint, its share and
 * both composites are read back off the stylesheet and multiplied out, so the
 * arithmetic is one a reader can check with a colour picker.
 */
function Swatch({
  backdrops,
  colour,
  ground,
  label,
  mixed,
  onGround,
  valueChip,
}: {
  readonly backdrops: readonly Resolved[];
  readonly colour: Resolved;
  readonly ground: Resolved | undefined;
  readonly label: string;
  readonly mixed: boolean;
  readonly onGround: boolean;
  readonly valueChip: string;
}) {
  const halves =
    colour.alpha < 1 && backdrops.length === 2
      ? backdrops.map((backdrop) => {
          const seat =
            onGround && ground !== undefined
              ? compositeOver(ground, backdrop)
              : backdrop;

          return {backdrop, composite: compositeOver(colour, seat)};
        })
      : [];

  return (
    <span
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--kioku-ui-spacing-xs)',
        minWidth: 0,
      }}
    >
      <Eyebrow>{label}</Eyebrow>
      {halves.length === 0 ? (
        <span
          style={{
            backgroundColor: hexOf(colour),
            blockSize: swatchHeight,
            borderRadius: 'var(--kioku-ui-radius-inner)',
            boxShadow: ring,
            display: 'block',
          }}
        />
      ) : (
        <span
          style={{
            blockSize: swatchHeight,
            borderColor: 'var(--kioku-ui-border-strong)',
            borderRadius: 'var(--kioku-ui-radius-inner)',
            borderStyle: 'var(--kioku-ui-border-style)',
            borderWidth: 'var(--kioku-ui-border-width)',
            boxSizing: 'border-box',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            overflow: 'hidden',
          }}
        >
          {halves.map(({backdrop, composite}, index) => (
            <span
              key={hexOf(backdrop)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                // The parting between the two halves, written as the shorthand
                // because csstype gives the inline-end longhands a closed union
                // that no custom property can satisfy.
                ...(index === 0 ? {borderInlineEnd: halfRule} : {}),
              }}
            >
              {/* The backdrop names itself above the composite it produced. */}
              <span
                style={{
                  backgroundColor: hexOf(backdrop),
                  blockSize: 'var(--kioku-ui-spacing-sm)',
                }}
              />
              <span style={{backgroundColor: hexOf(composite), flex: 1}} />
            </span>
          ))}
        </span>
      )}
      {halves.length === 0 ? (
        <>
          {mixed ? <Eyebrow>{valueChip}</Eyebrow> : null}
          <Mono>{hexOf(colour)}</Mono>
        </>
      ) : (
        <>
          {/*
            Stacked rather than set side by side: two seven-figure values do
            not fit a sixth of a card, and a square of the backdrop in front
            of each says which half of the chip above it produced that value
            without asking the reader to infer it from reading order.
          */}
          {halves.map(({backdrop, composite}) => (
            <span
              key={hexOf(backdrop)}
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: 'var(--kioku-ui-spacing-xs)',
              }}
            >
              <Chip colour={backdrop} />
              <Mono>{hexOf(composite)}</Mono>
            </span>
          ))}
          <Mono tone="primary">{`${hexOf(colour)} ${percentOf(colour)}`}</Mono>
        </>
      )}
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
function SkinSpecimen({
  backdrops,
  labels,
  reading,
  valueChip,
}: {
  readonly backdrops: readonly Resolved[];
  readonly labels: ThemesRoleLabels;
  readonly reading: SkinReading;
  readonly valueChip: string;
}) {
  const ground = reading.colours.get(groundProperty);
  const mixed = [...reading.colours.values()].some(({alpha}) => alpha < 1);

  return (
    <span
      aria-hidden="true"
      style={{
        display: 'grid',
        gap: 'var(--kioku-ui-spacing-sm)',
        gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
      }}
    >
      {swatchRoles.map((role) => {
        const colour = reading.colours.get(role.property);

        return colour === undefined ? null : (
          <Swatch
            backdrops={backdrops}
            colour={colour}
            ground={ground}
            key={role.property}
            label={labels[role.key]}
            mixed={mixed}
            onGround={role.onGround}
            valueChip={valueChip}
          />
        );
      })}
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

/** The groups of the token contract, counted off the contract itself. */
function roleGroupItems(total: string, count: (groups: number) => string) {
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
      detail: <Mono>{count(groups.length)}</Mono>,
      label: total,
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
  const {density, mode, root, setDensity, setMode, setThemeId, theme} =
    useTheme();
  const copy = useCopy(themes);
  const readings = useSkinReadings(mode, root);
  const backdrops = backdropsFrom(readings);

  // The skin that has a role with no hex to print. Everything the glass card
  // says about it is read off that skin rather than named here, so a pack
  // without one simply drops the card.
  const glass = kiokuThemes.find(({id}) => {
    const colours = readings.get(id)?.colours;

    return (
      colours !== undefined &&
      [...colours.values()].some(({alpha}) => alpha < 1)
    );
  });
  const glassReading = glass === undefined ? undefined : readings.get(glass.id);
  const raised = glassReading?.colours.get(raisedProperty);
  const glassFacts: {readonly detail: ReactNode; readonly term: string}[] = [];

  if (glassReading !== undefined && backdrops.length === 2) {
    glassFacts.push({
      detail: (
        <Stack gap="xs">
          <HStack gap="lg" wrap>
            {backdrops.map((backdrop) => (
              <HStack align="center" gap="xs" key={hexOf(backdrop)}>
                <Chip colour={backdrop} />
                <Mono tone="primary">{hexOf(backdrop)}</Mono>
              </HStack>
            ))}
          </HStack>
          <Text size="sm" tone="secondary">
            {copy.glass.backdrops.detail}
          </Text>
        </Stack>
      ),
      term: copy.glass.backdrops.label,
    });
  }

  if (raised !== undefined) {
    glassFacts.push({
      detail: (
        <Text size="sm" tone="secondary">
          {copy.glass.tint.lead}
          <Code>{`max(${percentOf(raised)}, keep)`}</Code>
          {copy.glass.tint.tail}
        </Text>
      ),
      term: copy.glass.tint.label,
    });
  }

  if (glassReading !== undefined && glassReading.frost.blur !== '') {
    glassFacts.push({
      detail: (
        <Text size="sm" tone="secondary">
          {copy.glass.blur.lead}
          <Code>{`blur(${glassReading.frost.blur}) saturate(${glassReading.frost.saturate})`}</Code>
          {copy.glass.blur.tail}
        </Text>
      ),
      term: copy.glass.blur.label,
    });
  }

  if (glass !== undefined && glassReading?.frost.keep !== '') {
    glassFacts.push({
      detail: (
        <Text size="sm" tone="secondary">
          {copy.glass.lever.lead}
          <Code>{frostProperty(glass?.id ?? '', 'keep')}</Code>
          {copy.glass.lever.tail}
        </Text>
      ),
      term: copy.glass.lever.label,
    });
  }

  const releaseTitle = copy.sample.release(releases[0].index);

  return (
    <PageContainer>
      <Stack gap="xl">
        <HStack align="start" gap="2xl" justify="between" wrap>
          <Stack gap="sm" style={{flex: '1 1 auto', minWidth: 0}}>
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <Heading level={1} size="page">
              {copy.title}
            </Heading>
            <Text style={{maxWidth: skinMeasure}} tone="secondary">
              {copy.lead}
            </Text>
          </Stack>

          <Stack gap="md">
            <HStack align="center" gap="md" justify="between">
              <Eyebrow>{copy.appearance.label}</Eyebrow>
              <SegmentedControl
                aria-label={copy.appearance.label}
                onValueChange={(value) => setMode(value as ColorMode)}
                options={[
                  {label: copy.appearance.light, value: 'light'},
                  {label: copy.appearance.dark, value: 'dark'},
                  {label: copy.appearance.system, value: 'system'},
                ]}
                value={mode}
              />
            </HStack>
            <HStack align="center" gap="md" justify="between">
              <Eyebrow>{copy.density.label}</Eyebrow>
              <SegmentedControl
                aria-label={copy.density.label}
                onValueChange={(value) =>
                  setDensity(value === 'standard' ? 'standard' : 'compact')
                }
                options={[
                  {label: copy.density.compact, value: 'compact'},
                  {label: copy.density.standard, value: 'standard'},
                ]}
                value={density}
              />
            </HStack>
            <HStack align="end" gap="md" justify="between">
              <Eyebrow>{copy.spacingLabel}</Eyebrow>
              <SpacingSpecimen />
            </HStack>
          </Stack>
        </HStack>

        <Divider />

        <Stack gap="md">
          <SectionRule
            label={copy.skins.label}
            note={copy.skins.note(kiokuThemes.length, tokenNames.length)}
          />
          <div
            style={{
              display: 'grid',
              gap: 'var(--kioku-ui-spacing-lg)',
              gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${skinMeasure}), 1fr))`,
            }}
          >
            {kiokuThemes.map((entry) => {
              const active = entry.id === theme.id;
              const reading = readings.get(entry.id);
              const note = copy.skins.notes[entry.id];
              const name = skinNames[entry.id];
              const tints =
                reading === undefined
                  ? 0
                  : [...reading.colours.values()].filter(({alpha}) => alpha < 1)
                      .length;

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
                      {note === undefined ? null : <span>{note}</span>}
                      {reading === undefined ? null : (
                        <SkinSpecimen
                          backdrops={backdrops}
                          labels={copy.skins.roles}
                          reading={reading}
                          valueChip={copy.skins.valueChip}
                        />
                      )}
                      {reading === undefined ? null : (
                        <span>
                          {tints === 0 ? (
                            copy.skins.solidFooter(reading.colours.size)
                          ) : (
                            <>
                              {copy.skins.tintFooter.lead(tints)}
                              <Emphasis>
                                {copy.skins.tintFooter.emphasis}
                              </Emphasis>
                              {copy.skins.tintFooter.tail}
                            </>
                          )}
                        </span>
                      )}
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
                        {name === undefined ? null : (
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
                            {name}
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
                          {copy.skins.inUse}
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

          {/*
            The fourth skin's own section. It sits outside the picker because
            everything in a SelectableCard's description is part of the
            radio's accessible name, and three paragraphs of reasoning read
            aloud before the reader hears which skin they are on.
          */}
          {glass === undefined || glassFacts.length === 0 ? null : (
            <Card elevation="low">
              <Stack gap="md">
                <SectionRule
                  label={`${glass.label.toLocaleUpperCase('en')} — ${copy.glass.label}`}
                />
                <MetadataList entries={glassFacts} layout="inline" />
                <Text size="sm" tone="secondary">
                  {copy.glass.rule}
                </Text>
              </Stack>
            </Card>
          )}
        </Stack>

        <Stack gap="md">
          <SectionRule label={copy.groups.label} note={copy.groups.note} />
          <MetricGrid
            items={roleGroupItems(copy.groups.total, copy.groups.count)}
          />
        </Stack>

        <Stack gap="md">
          <SectionRule label={copy.type.label} note={copy.type.note} />
          <Card elevation="low">
            <div
              style={{
                alignItems: 'end',
                display: 'grid',
                gap: 'var(--kioku-ui-spacing-lg)',
                gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${typeCellMeasure}), 1fr))`,
              }}
            >
              {typeScale.map((entry) => (
                <Stack gap="xs" key={entry.size}>
                  <span
                    style={{
                      color: 'var(--kioku-ui-color-text)',
                      fontFamily:
                        'var(--kioku-ui-typography-font-family-heading)',
                      fontSize: `var(--kioku-ui-typography-${entry.size})`,
                      letterSpacing: `var(--kioku-ui-typography-${entry.tracking})`,
                      lineHeight:
                        'var(--kioku-ui-typography-line-height-heading)',
                    }}
                  >
                    {copy.type.roles[entry.key]}
                  </span>
                  <Mono>{entry.size}</Mono>
                  <Mono>{entry.tracking}</Mono>
                </Stack>
              ))}
            </div>
          </Card>
        </Stack>

        <Stack gap="md">
          <SectionRule
            label={copy.sample.label(theme.label.toLocaleUpperCase('en'))}
            note={copy.sample.note}
          />

          <MetricGrid
            items={[
              {label: copy.statuses.open, value: openCount},
              {label: copy.statuses.review, value: reviewCount},
              {label: copy.statuses.published, value: publishedCount},
            ]}
          />

          <div
            style={{
              display: 'grid',
              gap: 'var(--kioku-ui-spacing-lg)',
              gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${sampleMeasure}), 1fr))`,
            }}
          >
            <Card elevation="low">
              <CardHeader>
                <Heading level={3} size="subsection">
                  {copy.sample.releasesHeading}
                </Heading>
              </CardHeader>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell scope="col">
                      {copy.sample.version}
                    </TableHeaderCell>
                    <TableHeaderCell scope="col">
                      {copy.sample.owner}
                    </TableHeaderCell>
                    <TableHeaderCell scope="col">
                      {copy.sample.status}
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {releases.map((entry) => (
                    <TableRow key={entry.index}>
                      <TableCell>{copy.sample.release(entry.index)}</TableCell>
                      <TableCell>{entry.owner}</TableCell>
                      <TableCell>
                        <Badge tone={statusTones[entry.status] ?? 'info'}>
                          {copy.statuses[entry.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card elevation="low">
              <Stack gap="md">
                <Field label={copy.sample.releaseTitle}>
                  {/*
                    Keyed on the value: the field is uncontrolled, so a change
                    of language has to remount it or the reader is left with
                    the previous language's default sitting in the box.
                  */}
                  <TextInput defaultValue={releaseTitle} key={releaseTitle} />
                </Field>
                <Item
                  description={copy.sample.liveNote}
                  trailing={
                    <Switch aria-label={copy.sample.live} defaultPressed />
                  }
                >
                  {copy.sample.live}
                </Item>
                <HStack gap="sm" justify="end">
                  <Button variant="secondary">{copy.sample.cancel}</Button>
                  <Button>{copy.sample.publish}</Button>
                </HStack>
              </Stack>
            </Card>
          </div>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
