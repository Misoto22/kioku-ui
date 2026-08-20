import {useEffect, useMemo, useRef, useState} from 'react';
import type {CSSProperties, ReactNode} from 'react';

import {
  Badge,
  Button,
  Card,
  CodeBlock,
  Divider,
  HStack,
  Heading,
  Icon,
  Link,
  MetricGrid,
  NavItem,
  Pagination,
  SideNav,
  SideNavSection,
  Stack,
  TabList,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  tokenContract,
  tokenNames,
  useMediaQuery,
  useTheme,
} from '@misoto22/kioku-ui';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

import {PageContainer} from '../layout/PageContainer.js';
import {componentHref, type Route} from '../router.js';

import {Emphasis, useCopy, useLocale} from '../i18n/index.js';
import {components} from '../i18n/components.js';
import {home, type HomeCopy, type PaletteRole} from '../i18n/home.js';
import {allEntries, componentCatalog} from '../data/componentCatalog.js';
import {templateCatalog} from '../data/templateCatalog.js';

// The whole palette, named by the role each value plays. The values themselves
// are never written here — a hex typed into this file would be true of one skin
// and a lie in the other two — so each row carries only the custom property
// that paints it, and the swatch reports back what the browser resolved. The
// role's name is not written here either: it is two glyphs in Chinese and two
// words in English, which is why the card is a different width in each.
const palette: readonly {role: PaletteRole; variable: string}[] = [
  {role: 'ink', variable: '--kioku-ui-color-text'},
  {role: 'paper', variable: '--kioku-ui-color-surface'},
  {role: 'secondary', variable: '--kioku-ui-color-text-secondary'},
  {role: 'ground', variable: '--kioku-ui-color-canvas'},
  {role: 'muted', variable: '--kioku-ui-color-text-muted'},
  {role: 'sunken', variable: '--kioku-ui-color-surface-muted'},
  {role: 'hairline', variable: '--kioku-ui-border-default'},
  {role: 'hover', variable: '--kioku-ui-color-overlay-hover'},
  {role: 'strong', variable: '--kioku-ui-border-strong'},
  {role: 'accent', variable: '--kioku-ui-color-accent'},
];

const install = `pnpm add @misoto22/kioku-ui \\
    @misoto22/kioku-ui-theme-kioku`;

// Identifiers, so they do not localise: the names are what a reader types into
// an import, and a translated component name would be a lie about the package.
const assembledFrom =
  'SideNav · NavItem · TabList · Table · Card · Badge · Pagination · Link';

const rowsPerPage = 6;

// Every dimension the token contract has no role for is built from the spacing
// scale rather than written as a length, so the pages grow with the density the
// reader chose. Breakpoints are the exception: a media query cannot read a
// custom property, so those stay literal.
const measure = 'var(--kioku-ui-spacing-2xl)';

/**
 * The argument column, which is not the same width in the two languages.
 *
 * The same claim takes nine hanzi where it takes forty-one Latin characters,
 * so Chinese hands the difference to the screen beside it. This is a length
 * over the spacing scale and never a `ch` measure: `ch` is the advance of the
 * Latin zero, which has nothing to do with the CJK em, so a column set in `ch`
 * is wrong for Chinese by whatever the two happen to differ by that day.
 */
const heroColumn: Readonly<Record<'en' | 'zh', string>> = {
  en: `calc(17 * ${measure})`,
  zh: `calc(15 * ${measure} + var(--kioku-ui-spacing-md))`,
};

const eyebrowStyle: CSSProperties = {
  color: 'var(--kioku-ui-color-text-secondary)',
  fontFamily: 'var(--kioku-ui-typography-font-family-display)',
  fontSize: 'var(--kioku-ui-typography-font-size-xs)',
  fontWeight: 'var(--kioku-ui-typography-font-weight-medium)',
  letterSpacing: 'var(--kioku-ui-typography-letter-spacing-eyebrow)',
  lineHeight: 'var(--kioku-ui-typography-line-height-heading)',
};

// An eyebrow that heads a card gets the display face. One that shares its line
// with the thing it names does not: the mincho opens about a third wider at
// 11px, and a role name set in it would take the whole row before the value
// beside it could be read. The artboard makes the same split.
const inlineEyebrowStyle: CSSProperties = {
  ...eyebrowStyle,
  fontFamily: 'var(--kioku-ui-typography-font-family-heading)',
};

const figureStyle: CSSProperties = {
  fontFamily: 'var(--kioku-ui-typography-font-family-mono)',
  fontSize: 'var(--kioku-ui-typography-font-size-xs)',
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: 'var(--kioku-ui-typography-letter-spacing-mono)',
};

/**
 * The label of last resort: it names a thing without competing with it.
 *
 * `text-transform: uppercase` is applied only where the copy is Latin. There is
 * no upper case in Chinese, so the property is inert on hanzi — but it would
 * still shout at any Latin word inside a Chinese eyebrow, which is exactly the
 * kind of half-applied rule that makes a page look translated.
 */
function Eyebrow({
  children,
  face = 'display',
}: {
  readonly children: ReactNode;
  readonly face?: 'display' | 'text';
}) {
  const {locale} = useLocale();

  return (
    <span
      style={{
        ...(face === 'display' ? eyebrowStyle : inlineEyebrowStyle),
        ...(locale === 'en' ? {textTransform: 'uppercase'} : {}),
      }}
    >
      {children}
    </span>
  );
}

/** A count, a ratio, a version — set in the mono face so columns line up. */
function Figure({
  children,
  muted = false,
}: {
  readonly children: ReactNode;
  readonly muted?: boolean;
}) {
  return (
    <span
      style={{
        ...figureStyle,
        color: muted
          ? 'var(--kioku-ui-color-text-muted)'
          : 'var(--kioku-ui-color-text-secondary)',
      }}
    >
      {children}
    </span>
  );
}

/**
 * The label over a specimen, carrying the mark that says which of the two it
 * is. Without the marks the pair reads as two neutral examples rather than an
 * argument and its counter-example.
 *
 * Both are drawn on the same sixteen-unit grid as every other glyph on this
 * site, as a stroke rather than a glyph from a font: a dingbat would arrive in
 * whatever weight the reader's emoji face happens to have. The tick takes the
 * colour of the line it sits in; the cross drops to the muted rank, because
 * the rejected panel is the half that should not raise its voice.
 */
function Verdict({
  children,
  rejected = false,
}: {
  readonly children: ReactNode;
  readonly rejected?: boolean;
}) {
  return (
    <span
      style={{
        alignItems: 'center',
        display: 'inline-flex',
        gap: 'var(--kioku-ui-spacing-xs)',
      }}
    >
      <Icon size="sm" tone={rejected ? 'muted' : 'inherit'} viewBox="0 0 16 16">
        {rejected ? (
          <>
            <path
              d="M4.4 4.4 11.6 11.6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
            <path
              d="M11.6 4.4 4.4 11.6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
          </>
        ) : (
          <path
            d="M3.2 8.4 6.4 11.6 12.8 5.2"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        )}
      </Icon>
      <Eyebrow face="text">{children}</Eyebrow>
    </span>
  );
}

/**
 * A working screen assembled from the box: SideNav, NavItem, TabList, Table,
 * Badge and Pagination, with nothing drawn for the occasion. A picture of the
 * product is a stronger claim than a headline over a gradient, and it is only
 * a claim at all if every part of it ships.
 *
 * The rail is sized by its contents rather than set to a width, so it holds
 * whatever the group names measure — 136px of hanzi or 168px of English —
 * without this page knowing which language it is drawing.
 */
function LibraryPreview({
  copy,
  wide,
}: {
  readonly copy: HomeCopy;
  readonly wide: boolean;
}) {
  const [groupTitle, setGroupTitle] = useState(
    componentCatalog[0]?.title ?? 'Action',
  );
  const [view, setView] = useState('table');
  const [page, setPage] = useState(1);

  // The group names come from the components index's catalogue rather than
  // from this page's own, because they are the same eleven names and one map
  // is the only way they stay the same. A title the map has no entry for falls
  // back to itself, so a group added to the library shows an untranslated word
  // rather than a hole.
  const {groups} = useCopy(components);
  const groupName = (title: string) => groups[title] ?? title;

  const group = useMemo(
    () =>
      componentCatalog.find((candidate) => candidate.title === groupTitle) ??
      componentCatalog[0],
    [groupTitle],
  );

  const entries = group?.entries ?? [];
  const pageCount = Math.max(1, Math.ceil(entries.length / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const visible = entries.slice(start, start + rowsPerPage);

  function selectGroup(title: string) {
    setGroupTitle(title);
    setPage(1);
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--kioku-ui-color-surface)',
        borderRadius: 'var(--kioku-ui-radius-container)',
        boxShadow: 'var(--kioku-ui-elevation-low)',
        display: 'grid',
        // The rail is a fixed measure, so below the breakpoint it would leave
        // the pane a sliver. The pane is the part worth keeping.
        gridTemplateColumns: wide ? 'auto minmax(0, 1fr)' : 'minmax(0, 1fr)',
        overflow: 'hidden',
      }}
    >
      {wide ? (
        <SideNav>
          <SideNavSection title={copy.preview.groups}>
            {componentCatalog.map((candidate) => (
              <NavItem
                current={candidate.title === groupTitle}
                href="#library-preview"
                key={candidate.title}
                onClick={() => selectGroup(candidate.title)}
              >
                <span style={{flex: '1 1 auto'}}>
                  {groupName(candidate.title)}
                </span>
                <Figure muted={candidate.title !== groupTitle}>
                  {candidate.entries.length}
                </Figure>
              </NavItem>
            ))}
          </SideNavSection>
        </SideNav>
      ) : null}

      {/*
        The pane rules its regions with hairlines rather than gaps, so it is a
        plain column: `Stack`'s smallest gap would open the header away from
        the rule that is meant to close it.
      */}
      <div
        id="library-preview"
        style={{display: 'flex', flexDirection: 'column', minWidth: 0}}
      >
        <HStack
          justify="between"
          style={{
            borderBlockEnd:
              'var(--kioku-ui-border-width) var(--kioku-ui-border-style) var(--kioku-ui-border-default)',
            gap: 'var(--kioku-ui-spacing-lg)',
            paddingBlock: 'var(--kioku-ui-spacing-sm)',
            paddingInline: 'var(--kioku-ui-spacing-lg)',
          }}
        >
          <HStack align="baseline" gap="sm">
            <Heading level={2} size="subsection">
              {group === undefined ? null : groupName(group.title)}
            </Heading>
            <Eyebrow>
              {copy.preview.count.lead}
              <Figure>{entries.length}</Figure>
              {copy.preview.count.tail}
            </Eyebrow>
          </HStack>
          <TabList
            label={copy.preview.layout.label}
            onSelect={setView}
            selectedId={view}
            tabs={[
              {id: 'table', label: copy.preview.layout.table},
              {id: 'cards', label: copy.preview.layout.cards},
            ]}
          />
        </HStack>

        <div style={{padding: 'var(--kioku-ui-spacing-md)'}}>
          {view === 'table' ? (
            <Table density="compact" dividers="rows">
              <TableHead>
                <TableRow>
                  <TableHeaderCell scope="col">
                    {copy.preview.columns.component}
                  </TableHeaderCell>
                  <TableHeaderCell scope="col">
                    {copy.preview.columns.description}
                  </TableHeaderCell>
                  <TableHeaderCell scope="col" style={{textAlign: 'end'}}>
                    {copy.preview.columns.status}
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.map((entry) => (
                  <TableRow key={entry.name}>
                    <TableCell>
                      <Link href={componentHref(entry.name)}>{entry.name}</Link>
                    </TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>
                      <HStack justify="end">
                        <Badge
                          tone={
                            entry.status === 'ready' ? 'success' : 'warning'
                          }
                        >
                          {entry.status === 'ready'
                            ? copy.preview.status.ready
                            : copy.preview.status.planned}
                        </Badge>
                      </HStack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: 'var(--kioku-ui-spacing-md)',
                gridTemplateColumns: `repeat(auto-fill, minmax(calc(7 * ${measure}), 1fr))`,
              }}
            >
              {visible.map((entry) => (
                <Card elevation="none" key={entry.name}>
                  <Stack gap="xs">
                    <Link href={componentHref(entry.name)}>{entry.name}</Link>
                    <Text size="sm" tone="secondary">
                      {entry.description}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </div>
          )}
        </div>

        <HStack
          justify="between"
          style={{
            borderBlockStart:
              'var(--kioku-ui-border-width) var(--kioku-ui-border-style) var(--kioku-ui-border-default)',
            gap: 'var(--kioku-ui-spacing-lg)',
            paddingBlock: 'var(--kioku-ui-spacing-sm)',
            paddingInline: 'var(--kioku-ui-spacing-lg)',
          }}
        >
          <Figure muted>
            {visible.length} / {entries.length}
          </Figure>
          <Pagination onChange={setPage} page={page} pageCount={pageCount} />
        </HStack>
      </div>
    </div>
  );
}

/**
 * Rule four, shown rather than asserted. The rejected specimen is the one
 * place in this site where the accent fills anything, and it is filling it to
 * be argued against.
 */
function SelectionRule({copy}: {readonly copy: HomeCopy}) {
  return (
    <Card elevation="low">
      <Stack gap="lg">
        <Stack gap="xs">
          <Eyebrow>{copy.selection.eyebrow}</Eyebrow>
          <Heading family="display" level={2} size="subsection">
            {copy.selection.heading}
          </Heading>
        </Stack>

        <div
          style={{
            display: 'grid',
            gap: 'var(--kioku-ui-spacing-xl)',
            gridTemplateColumns: `repeat(auto-fit, minmax(calc(7 * ${measure}), 1fr))`,
          }}
        >
          <Stack gap="sm">
            <Verdict>{copy.selection.verdict.yes}</Verdict>
            <div
              style={{
                backgroundColor: 'var(--kioku-ui-color-surface)',
                border:
                  'var(--kioku-ui-border-width) var(--kioku-ui-border-style) var(--kioku-ui-border-default)',
                borderRadius: 'var(--kioku-ui-radius-inner)',
                overflow: 'hidden',
              }}
            >
              <Table density="compact" dividers="rows">
                <TableBody>
                  <TableRow>
                    <TableCell>Sumi</TableCell>
                  </TableRow>
                  <TableRow selected>
                    <TableCell>Washi</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Muji</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Stack>

          <Stack gap="sm">
            <Verdict rejected>{copy.selection.verdict.no}</Verdict>
            <div
              style={{
                backgroundColor: 'var(--kioku-ui-color-surface)',
                border:
                  'var(--kioku-ui-border-width) var(--kioku-ui-border-style) var(--kioku-ui-border-default)',
                borderRadius: 'var(--kioku-ui-radius-inner)',
                overflow: 'hidden',
              }}
            >
              <Table density="compact" dividers="rows">
                <TableBody>
                  <TableRow>
                    <TableCell>Sumi</TableCell>
                  </TableRow>
                  {/*
                    Drawn by hand because the library ships no component that
                    fills a chosen row — that is the point of the rule. It is
                    still built from tokens, so the counter-example survives a
                    theme change along with everything it is arguing against.
                  */}
                  <TableRow
                    style={{
                      backgroundColor: 'var(--kioku-ui-color-accent)',
                      color: 'var(--kioku-ui-color-text-on-accent)',
                    }}
                  >
                    <TableCell>Washi</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Muji</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Stack>
        </div>

        <Text size="sm" tone="secondary">
          {copy.selection.body}
        </Text>
      </Stack>
    </Card>
  );
}

/**
 * A painted colour as the hex a stylesheet would have been written with.
 * Anything the browser could not resolve returns nothing rather than a
 * misleading `#000000`, and a translucent value keeps its alpha byte: the
 * hover wash stated as an opaque hex would be a colour the system never uses.
 */
function toHex(color: string): string {
  const channels = color.match(/\d+(\.\d+)?/g);

  if (channels === null || channels.length < 3 || channels[3] === '0') {
    return '';
  }

  const alpha = channels[3] === undefined ? 1 : Number(channels[3]);
  const bytes = [...channels.slice(0, 3).map(Number), alpha * 255];

  return bytes
    .slice(0, alpha === 1 ? 3 : 4)
    .reduce(
      (hex, byte) => hex + Math.round(byte).toString(16).padStart(2, '0'),
      '#',
    );
}

/**
 * One role of the palette: the swatch is painted by the token, and the value
 * printed beside it is read back off the painted pixel rather than copied out
 * of the theme. Nothing here restates the stylesheet, so the column is true of
 * whichever skin and appearance is live rather than of the one this page
 * happened to be written under.
 *
 * The chip is paper with the token laid over it, because one of the ten is a
 * wash rather than a ground — a layer at four percent, which has to be seen
 * over something to be seen at all. The probe is that layer, so what it
 * reports is the token and not the paper underneath it.
 */
function Swatch({
  role,
  variable,
}: {
  readonly role: string;
  readonly variable: string;
}) {
  const probe = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState('');

  // Read after every render rather than from a dependency list. The skin and
  // the density arrive through the theme context, but the appearance is a
  // `color-scheme` on an ancestor and changes nothing this component can name
  // as a dependency. Setting the string it already holds is a bail-out, so
  // this settles in one pass.
  useEffect(() => {
    if (probe.current !== null) {
      setValue(toHex(getComputedStyle(probe.current).backgroundColor));
    }
  });

  return (
    <HStack align="center" gap="sm">
      <span
        aria-hidden="true"
        style={{
          backgroundColor: 'var(--kioku-ui-color-surface)',
          blockSize: 'var(--kioku-ui-spacing-lg)',
          border:
            'var(--kioku-ui-border-width) var(--kioku-ui-border-style) var(--kioku-ui-border-strong)',
          borderRadius: 'var(--kioku-ui-radius-inner)',
          flex: '0 0 auto',
          inlineSize: 'var(--kioku-ui-spacing-lg)',
          overflow: 'hidden',
        }}
      >
        <span
          ref={probe}
          style={{
            backgroundColor: `var(${variable})`,
            blockSize: '100%',
            display: 'block',
            inlineSize: '100%',
          }}
        />
      </span>
      <span style={{flex: '1 1 auto'}}>
        <Eyebrow face="text">{role}</Eyebrow>
      </span>
      <Figure muted>{value}</Figure>
    </HStack>
  );
}

/** Ten values, three of them ink at three ranks. */
function Palette({copy}: {readonly copy: HomeCopy}) {
  // Consuming the theme is what subscribes this card to a skin change. The
  // swatches would repaint without it — they are painted by the tokens — but
  // the values beside them are read back after a render, and with no render
  // they would go on describing the skin that left.
  useTheme();

  return (
    <Card elevation="low">
      <Stack gap="lg">
        <Stack gap="xs">
          <Eyebrow>{copy.palette.eyebrow}</Eyebrow>
          <Heading family="display" level={2} size="subsection">
            {copy.palette.heading}
          </Heading>
        </Stack>

        {/*
          Two columns, as the palette is meant to be read: ten values are a
          block to take in at once, and a single column of ten turns them into
          a list to work down.
        */}
        <div
          style={{
            columnGap: 'var(--kioku-ui-spacing-lg)',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            rowGap: 'var(--kioku-ui-spacing-sm)',
          }}
        >
          {palette.map((entry) => (
            <Swatch
              key={entry.role}
              role={copy.palette.roles[entry.role]}
              variable={entry.variable}
            />
          ))}
        </div>

        <Text size="sm" tone="secondary">
          {copy.palette.body}
        </Text>
      </Stack>
    </Card>
  );
}

/**
 * The band the English page does not have.
 *
 * Chinese says the same things in fewer glyphs, which leaves this page roughly
 * a band's worth of room the English one has already spent — so it spends it
 * on the question a Chinese-reading engineer asks next. The headline says the
 * library will not touch their business logic; this says who is checking. The
 * four rejections are the ones the boundary gate actually fails on.
 *
 * It renders only where the catalogue carries it, which is the whole reason
 * the two languages are held as two catalogues rather than one and a
 * translation of it.
 */
function Boundaries({
  copy,
  wide,
}: {
  readonly copy: NonNullable<HomeCopy['boundaries']>;
  readonly wide: boolean;
}) {
  return (
    <Card elevation="low">
      <div
        style={{
          alignItems: 'start',
          display: 'grid',
          gap: 'var(--kioku-ui-spacing-2xl)',
          gridTemplateColumns: wide
            ? `calc(11 * ${measure}) minmax(0, 1fr)`
            : 'minmax(0, 1fr)',
        }}
      >
        <Stack gap="xs">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <Heading family="display" level={2} size="subsection">
            {copy.heading}
          </Heading>
          <span style={{alignSelf: 'start'}}>
            <Badge tone="neutral">
              <span
                style={{
                  fontFamily: 'var(--kioku-ui-typography-font-family-mono)',
                  letterSpacing:
                    'var(--kioku-ui-typography-letter-spacing-mono)',
                }}
              >
                {copy.command}
              </span>
            </Badge>
          </span>
        </Stack>

        <Stack gap="sm">
          <Text size="sm" tone="secondary">
            {copy.lead}
          </Text>
          <div
            style={{
              display: 'grid',
              gap: 'var(--kioku-ui-spacing-md)',
              gridTemplateColumns: `repeat(auto-fit, minmax(calc(6 * ${measure}), 1fr))`,
            }}
          >
            {copy.rejections.map((rejection) => (
              <HStack align="center" gap="sm" key={rejection}>
                <Icon size="sm" tone="muted" viewBox="0 0 16 16">
                  <path
                    d="M4.4 4.4 11.6 11.6M11.6 4.4 4.4 11.6"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.5"
                  />
                </Icon>
                <Text size="sm" tone="muted">
                  {rejection}
                </Text>
              </HStack>
            ))}
          </div>
        </Stack>
      </div>
    </Card>
  );
}

/**
 * What is in the box, counted rather than written down. A landing page whose
 * whole argument is that the figures are real cannot afford one of them to go
 * stale, and every number here is already held somewhere that knows the answer.
 *
 * The two languages arrange the tile differently, and the arrangement is the
 * language's rather than a preference. English stacks figure over label over
 * detail, because "semantic tokens" is two words that will not share a line
 * with a 27px numeral. Chinese sets the label on the figure's own baseline,
 * because 个语义令牌 is a measure word and its noun — "79 个语义令牌" is one
 * phrase, and breaking it across two lines breaks the phrase.
 */
function Facts({copy}: {readonly copy: HomeCopy}) {
  const {locale} = useLocale();

  const facts = [
    {
      detail: copy.facts.components.detail,
      label: copy.facts.components.label,
      value: String(allEntries.length),
    },
    {
      detail: copy.facts.tokens.detail(Object.keys(tokenContract).length),
      label: copy.facts.tokens.label,
      value: String(tokenNames.length),
    },
    {
      // Named from the pack rather than typed out: main added a fourth skin
      // while this branch was open, and a hand-written list is one release
      // from being wrong.
      detail: copy.facts.themes.detail(kiokuThemes.map(({label}) => label)),
      label: copy.facts.themes.label,
      value: String(kiokuThemes.length),
    },
    {
      detail: copy.facts.templates.detail,
      label: copy.facts.templates.label,
      value: String(templateCatalog.length),
    },
  ];

  if (locale === 'en') {
    return <MetricGrid items={facts} />;
  }

  return (
    <dl
      style={{
        display: 'grid',
        gap: 'var(--kioku-ui-spacing-xl)',
        gridTemplateColumns: `repeat(auto-fit, minmax(calc(8 * ${measure}), 1fr))`,
        margin: 0,
      }}
    >
      {facts.map((fact) => (
        <Card elevation="low" key={fact.label}>
          <Stack gap="xs">
            <HStack align="baseline" gap="sm">
              <dd
                style={{
                  color: 'var(--kioku-ui-color-text)',
                  fontFamily: 'var(--kioku-ui-typography-font-family-mono)',
                  fontSize: 'var(--kioku-ui-typography-font-size-xl)',
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 'var(--kioku-ui-typography-font-weight-strong)',
                  letterSpacing:
                    'var(--kioku-ui-typography-letter-spacing-mono)',
                  lineHeight: 'var(--kioku-ui-typography-line-height-heading)',
                  margin: 0,
                }}
              >
                {fact.value}
              </dd>
              <dt
                style={{
                  color: 'var(--kioku-ui-color-text)',
                  fontFamily: 'var(--kioku-ui-typography-font-family-body)',
                  fontSize: 'var(--kioku-ui-typography-font-size-md)',
                  letterSpacing:
                    'var(--kioku-ui-typography-letter-spacing-body)',
                }}
              >
                {fact.label}
              </dt>
            </HStack>
            <dd style={{margin: 0}}>
              <Text size="sm" tone="muted">
                {fact.detail}
              </Text>
            </dd>
          </Stack>
        </Card>
      ))}
    </dl>
  );
}

interface HomePageProps {
  readonly onNavigate: (route: Route) => void;
}

/** The landing page: what this is, and the two things to do next. */
export function HomePage({onNavigate}: HomePageProps) {
  const wide = useMediaQuery('(min-width: 64rem)');
  const {locale} = useLocale();
  const copy = useCopy(home);

  return (
    <PageContainer>
      <Stack gap="2xl">
        <div
          style={{
            alignItems: 'start',
            display: 'grid',
            gap: 'var(--kioku-ui-spacing-2xl)',
            gridTemplateColumns: wide
              ? `${heroColumn[locale]} minmax(0, 1fr)`
              : 'minmax(0, 1fr)',
          }}
        >
          <Stack gap="lg">
            <span style={{alignSelf: 'start'}}>
              <Badge tone="info">{copy.badge}</Badge>
            </span>

            <Heading family="display" level={1} size="page">
              {copy.headline}
            </Heading>

            {/*
              The one place on this page where the two languages use different
              devices for the same job. English slants the word; Chinese sets
              着重号 under each glyph, because there is no italic in the
              Chinese writing system to slant it with. The closing punctuation
              stays outside the mark in both.
            */}
            <Text tone="secondary">
              {copy.lead.before}
              <Emphasis>{copy.lead.emphasis}</Emphasis>
              {copy.lead.after}
            </Text>

            <CodeBlock wrap code={install} language="bash" />

            <Text size="sm" tone="muted">
              {copy.unreleased}
            </Text>

            <HStack gap="sm" wrap>
              <Button onClick={() => onNavigate('docs')}>
                {copy.actions.start}
              </Button>
              <Button
                onClick={() => onNavigate('components')}
                variant="secondary"
              >
                {copy.actions.browse}
              </Button>
            </HStack>

            <Text size="sm" tone="muted">
              {copy.builtOn.lead}
              <Figure>{copy.builtOn.version}</Figure>
              {copy.builtOn.mid}
              <Link href="https://stylexjs.com">{copy.builtOn.link}</Link>
              {copy.builtOn.tail}
            </Text>
          </Stack>

          <Stack gap="sm">
            <LibraryPreview copy={copy} wide={wide} />
            <Text size="sm" tone="muted">
              {copy.preview.note.lead}
              {assembledFrom}
              {copy.preview.note.tail}
            </Text>
          </Stack>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 'var(--kioku-ui-spacing-2xl)',
            gridTemplateColumns: wide
              ? 'minmax(0, 2fr) minmax(0, 1fr)'
              : 'minmax(0, 1fr)',
          }}
        >
          <SelectionRule copy={copy} />
          <Palette copy={copy} />
        </div>

        {copy.boundaries === undefined ? null : (
          <Boundaries copy={copy.boundaries} wide={wide} />
        )}

        <Stack gap="md">
          <Divider />
          <Facts copy={copy} />
        </Stack>
      </Stack>
    </PageContainer>
  );
}
