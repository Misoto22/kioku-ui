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

import {allEntries, componentCatalog} from '../data/componentCatalog.js';
import {templateCatalog} from '../data/templateCatalog.js';

// Counted rather than written down. A landing page whose whole argument is
// that the figures are real cannot afford one of them to go stale, and every
// number here is already held somewhere that knows the answer.
const facts = [
  {
    detail: 'Layout, controls, data, state, chat, and overlays.',
    label: 'components',
    value: String(allEntries.length),
  },
  {
    detail: `${Object.keys(tokenContract).length} groups, validated at runtime.`,
    label: 'semantic tokens',
    value: String(tokenNames.length),
  },
  {
    // Named from the pack rather than typed out: main added a fourth skin
    // while this branch was open, and a hand-written list is one release from
    // being wrong.
    detail: `${kiokuThemes.map(({label}) => label).join(', ')}, in light and dark.`,
    label: 'themes',
    value: String(kiokuThemes.length),
  },
  {
    detail: 'Copied into your repository as source you own.',
    label: 'page templates',
    value: String(templateCatalog.length),
  },
];

// The whole palette, named by the role each value plays. The values themselves
// are never written here — a hex typed into this file would be true of one skin
// and a lie in the other two — so each row carries only the custom property
// that paints it, and the swatch reports back what the browser resolved.
const palette = [
  {role: 'Ink', token: 'colorText', variable: '--kioku-ui-color-text'},
  {role: 'Paper', token: 'colorSurface', variable: '--kioku-ui-color-surface'},
  {
    role: 'Second rank',
    token: 'colorTextSecondary',
    variable: '--kioku-ui-color-text-secondary',
  },
  {role: 'Ground', token: 'colorCanvas', variable: '--kioku-ui-color-canvas'},
  {
    role: 'Third rank',
    token: 'colorTextMuted',
    variable: '--kioku-ui-color-text-muted',
  },
  {
    role: 'Sunken',
    token: 'colorSurfaceMuted',
    variable: '--kioku-ui-color-surface-muted',
  },
  {
    role: 'Hairline',
    token: 'borderDefault',
    variable: '--kioku-ui-border-default',
  },
  {
    role: 'Hover wash',
    token: 'colorOverlayHover',
    variable: '--kioku-ui-color-overlay-hover',
  },
  {
    role: 'Strong edge',
    token: 'borderStrong',
    variable: '--kioku-ui-border-strong',
  },
  {role: 'Indigo', token: 'colorAccent', variable: '--kioku-ui-color-accent'},
];

const install = `pnpm add @misoto22/kioku-ui \\
    @misoto22/kioku-ui-theme-kioku`;

const rowsPerPage = 6;

// Every dimension the token contract has no role for is built from the spacing
// scale rather than written as a length, so the pages grow with the density the
// reader chose. Breakpoints are the exception: a media query cannot read a
// custom property, so those stay literal.
const measure = 'var(--kioku-ui-spacing-2xl)';

const eyebrowStyle: CSSProperties = {
  color: 'var(--kioku-ui-color-text-secondary)',
  fontFamily: 'var(--kioku-ui-typography-font-family-display)',
  fontSize: 'var(--kioku-ui-typography-font-size-xs)',
  fontWeight: 'var(--kioku-ui-typography-font-weight-medium)',
  letterSpacing: 'var(--kioku-ui-typography-letter-spacing-eyebrow)',
  lineHeight: 'var(--kioku-ui-typography-line-height-heading)',
  textTransform: 'uppercase',
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

/** The label of last resort: it names a thing without competing with it. */
function Eyebrow({
  children,
  face = 'display',
}: {
  readonly children: ReactNode;
  readonly face?: 'display' | 'text';
}) {
  return (
    <span style={face === 'display' ? eyebrowStyle : inlineEyebrowStyle}>
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
        ...inlineEyebrowStyle,
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
      {children}
    </span>
  );
}

/**
 * A working screen assembled from the box: SideNav, NavItem, TabList, Table,
 * Badge and Pagination, with nothing drawn for the occasion. A picture of the
 * product is a stronger claim than a headline over a gradient, and it is only
 * a claim at all if every part of it ships.
 */
function LibraryPreview({wide}: {readonly wide: boolean}) {
  const [groupTitle, setGroupTitle] = useState(
    componentCatalog[0]?.title ?? 'Action',
  );
  const [view, setView] = useState('table');
  const [page, setPage] = useState(1);

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
          <SideNavSection title="Groups">
            {componentCatalog.map((candidate) => (
              <NavItem
                current={candidate.title === groupTitle}
                href="#library-preview"
                key={candidate.title}
                onClick={() => selectGroup(candidate.title)}
              >
                <span style={{flex: '1 1 auto'}}>{candidate.title}</span>
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
              {group?.title}
            </Heading>
            <Eyebrow>
              <Figure>{entries.length}</Figure> components
            </Eyebrow>
          </HStack>
          <TabList
            label="Preview layout"
            onSelect={setView}
            selectedId={view}
            tabs={[
              {id: 'table', label: 'Table'},
              {id: 'cards', label: 'Cards'},
            ]}
          />
        </HStack>

        <div style={{padding: 'var(--kioku-ui-spacing-md)'}}>
          {view === 'table' ? (
            <Table density="compact" dividers="rows">
              <TableHead>
                <TableRow>
                  <TableHeaderCell scope="col">Component</TableHeaderCell>
                  <TableHeaderCell scope="col">Description</TableHeaderCell>
                  <TableHeaderCell scope="col" style={{textAlign: 'end'}}>
                    Status
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
                          {entry.status === 'ready' ? 'Ready' : 'Planned'}
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
function SelectionRule() {
  return (
    <Card elevation="low">
      <Stack gap="lg">
        <Stack gap="xs">
          <Eyebrow>Rule four</Eyebrow>
          <Heading family="display" level={2} size="subsection">
            Selection is a mark, never a fill
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
            <Verdict>This</Verdict>
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
            <Verdict rejected>Not this</Verdict>
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
          The fill wins the eye and loses the row: the type inverts, the sheet
          is interrupted, and the two rows that were never in question are
          demoted to background. The mark costs two pixels and takes nothing
          away.
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
function Palette() {
  // Consuming the theme is what subscribes this card to a skin change. The
  // swatches would repaint without it — they are painted by the tokens — but
  // the values beside them are read back after a render, and with no render
  // they would go on describing the skin that left.
  useTheme();

  return (
    <Card elevation="low">
      <Stack gap="lg">
        <Stack gap="xs">
          <Eyebrow>The whole palette</Eyebrow>
          <Heading family="display" level={2} size="subsection">
            Paper and ink, and one blue
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
              key={entry.token}
              role={entry.role}
              variable={entry.variable}
            />
          ))}
        </div>

        <Text size="sm" tone="secondary">
          Ten values, three of them ink at three ranks. Indigo does the focus
          ring, the selection rule, and the link — always a line, never an area.
        </Text>
      </Stack>
    </Card>
  );
}

interface HomePageProps {
  readonly onNavigate: (route: Route) => void;
}

/** The landing page: what this is, and the two things to do next. */
export function HomePage({onNavigate}: HomePageProps) {
  const wide = useMediaQuery('(min-width: 64rem)');

  return (
    <PageContainer>
      <Stack gap="2xl">
        <div
          style={{
            alignItems: 'start',
            display: 'grid',
            gap: 'var(--kioku-ui-spacing-2xl)',
            gridTemplateColumns: wide
              ? `calc(17 * ${measure}) minmax(0, 1fr)`
              : 'minmax(0, 1fr)',
          }}
        >
          <Stack gap="lg">
            <span style={{alignSelf: 'start'}}>
              <Badge tone="info">Currently unreleased</Badge>
            </span>

            <Heading
              family="display"
              level={1}
              size="page"
              style={{maxWidth: '20ch'}}
            >
              A product-neutral React design system
            </Heading>

            <Text style={{maxWidth: '48ch'}} tone="secondary">
              Components, semantic tokens, themes, and build tooling. It ships
              no routes, no APIs, no data, and no business logic — those stay
              yours.
            </Text>

            <CodeBlock wrap code={install} language="bash" />

            <Text size="sm" tone="muted">
              No version has been published to npm yet. Until the first
              Changesets release runs, consume the packages through the
              workspace.
            </Text>

            <HStack gap="sm" wrap>
              <Button onClick={() => onNavigate('docs')}>Get started</Button>
              <Button
                onClick={() => onNavigate('components')}
                variant="secondary"
              >
                Browse components
              </Button>
            </HStack>

            <Text size="sm" tone="muted">
              Built on React <Figure>19</Figure> and{' '}
              <Link href="https://stylexjs.com">StyleX</Link>
            </Text>
          </Stack>

          <Stack gap="sm">
            <LibraryPreview wide={wide} />
            <Text size="sm" tone="muted">
              Everything above is in the box: SideNav · NavItem · TabList ·
              Table · Card · Badge · Pagination · Link. Nothing was drawn for
              this page.
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
          <SelectionRule />
          <Palette />
        </div>

        <Stack gap="md">
          <Divider />
          <MetricGrid items={facts} />
        </Stack>
      </Stack>
    </PageContainer>
  );
}
