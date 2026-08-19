/// <reference types="vite/client" />
import type {CSSProperties, ReactNode} from 'react';

import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Code,
  CodeBlock,
  Divider,
  EmptyState,
  HStack,
  Heading,
  NavItem,
  NavMenu,
  Stack,
  Text,
  useMediaQuery,
} from '@misoto22/kioku-ui';

import {PageContainer} from '../layout/PageContainer.js';
import {componentHref, routeHref, templateHref} from '../router.js';

import {allEntries} from '../data/componentCatalog.js';
import {
  templateCatalog,
  templateCategories,
  type TemplateCategory,
  type TemplateEntry,
} from '../data/templateCatalog.js';
import {sketches, TemplateThumbnail} from './TemplatesPage.js';

// Every dimension the token contract has no role for is built from the spacing
// scale rather than written as a length, so the pages grow with the density the
// reader chose. Breakpoints are the exception: a media query cannot read a
// custom property, so those stay literal.
const measure = 'var(--kioku-ui-spacing-2xl)';

// The source well is capped rather than left to run: the longest template is
// five hundred lines, and a page that scrolls that far before its next heading
// has stopped being a page about the template.
const sourceHeight = `calc(14 * ${measure})`;

// The sketch is drawn to a fixed height, so it needs a width to keep its
// proportion against. This is the gallery's own column floor: the drawing then
// reads at the same shape on both pages rather than stretching to a letterbox.
const sketchWidth = `calc(9 * ${measure})`;

/**
 * Every template's source, read at build time. The CLI's assets are the only
 * copy of a template that exists — the alternative to reading them here is a
 * second copy in this app, which would be wrong the first time a template is
 * edited. Vite inlines the text, so nothing is fetched at runtime.
 */
const sourceFiles = import.meta.glob<string>(
  [
    '../../../../packages/cli/assets/templates/pages/*/*.tsx',
    '../../../../packages/cli/assets/templates/blocks/components/*/*.tsx',
  ],
  {eager: true, import: 'default', query: '?raw'},
);

/** The two kinds of source the CLI copies, spelled as `add` spells them. */
type TemplateKind = 'blocks' | 'pages';

interface TemplateSource {
  /** The file as it lands in the reader's repository. */
  readonly file: string;
  readonly kind: TemplateKind;
  readonly source: string;
}

const assetPath =
  /\/templates\/(?<root>blocks\/components|pages)\/(?<id>[^/]+)\/(?<file>[^/]+)$/u;

function readSources(): ReadonlyMap<string, TemplateSource> {
  const found = new Map<string, TemplateSource>();

  for (const [path, source] of Object.entries(sourceFiles)) {
    const groups = assetPath.exec(path)?.groups;
    if (groups === undefined) {
      continue;
    }

    const {file = '', id = '', root = ''} = groups;
    found.set(id, {file, kind: root === 'pages' ? 'pages' : 'blocks', source});
  }

  return found;
}

const sources = readSources();

// A named import list, which is the only form the templates use. Reading the
// imports rather than recording them by hand is the whole point: a template
// that picks up a component cannot then disagree with the page describing it.
const namedImport =
  /import\s+(?:type\s+)?\{(?<names>[^}]*)\}\s+from\s+'@misoto22\/kioku-ui'/gu;

/** The names one template imports from the library, in reading order. */
function composedFrom(source: string): readonly string[] {
  const names = new Set<string>();

  for (const match of source.matchAll(namedImport)) {
    for (const part of (match.groups?.names ?? '').split(',')) {
      // `type Foo` and `Foo as Bar` both name the same export; the alias is
      // this template's private business and not the library's.
      const name = part
        .trim()
        .replace(/^type\s+/u, '')
        .split(/\s+as\s+/u)[0];
      if (name !== undefined && name !== '') {
        names.add(name);
      }
    }
  }

  return [...names].sort((left, right) => left.localeCompare(right));
}

const indexed = new Set(allEntries.map((entry) => entry.name));

const eyebrowStyle: CSSProperties = {
  color: 'var(--kioku-ui-color-text-secondary)',
  fontFamily: 'var(--kioku-ui-typography-font-family-display)',
  fontSize: 'var(--kioku-ui-typography-font-size-xs)',
  fontWeight: 'var(--kioku-ui-typography-font-weight-medium)',
  letterSpacing: 'var(--kioku-ui-typography-letter-spacing-eyebrow)',
  lineHeight: 'var(--kioku-ui-typography-line-height-heading)',
  textTransform: 'uppercase',
};

const figureStyle: CSSProperties = {
  color: 'var(--kioku-ui-color-text-muted)',
  fontFamily: 'var(--kioku-ui-typography-font-family-mono)',
  fontSize: 'var(--kioku-ui-typography-font-size-xs)',
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: 'var(--kioku-ui-typography-letter-spacing-mono)',
};

/** The label of last resort: it names a thing without competing with it. */
function Eyebrow({children}: {readonly children: ReactNode}) {
  return <span style={eyebrowStyle}>{children}</span>;
}

/** A count or a ratio, set in the mono face so columns line up. */
function Figure({children}: {readonly children: ReactNode}) {
  return <span style={figureStyle}>{children}</span>;
}

/** The categories that hold at least one template, in the gallery's order. */
function categoriesInUse(): readonly Exclude<TemplateCategory, 'All'>[] {
  return templateCategories.filter(
    (candidate): candidate is Exclude<TemplateCategory, 'All'> =>
      candidate !== 'All' &&
      templateCatalog.some((entry) => entry.category === candidate),
  );
}

/**
 * The rail: this template's own category first, then the rest of the
 * catalogue. A category has no page of its own, so each row leads to the first
 * template in it — and that template's rail is the category. The destination
 * is the category either way.
 */
function CategoryRail({entry}: {readonly entry: TemplateEntry}) {
  const siblings = templateCatalog.filter(
    (candidate) => candidate.category === entry.category,
  );
  const others = categoriesInUse().filter(
    (candidate) => candidate !== entry.category,
  );

  return (
    <Stack
      gap="lg"
      style={{
        alignSelf: 'start',
        insetBlockStart: 'var(--kioku-ui-spacing-2xl)',
        maxHeight: `calc(100vh - 5 * ${measure})`,
        overflowY: 'auto',
        position: 'sticky',
      }}
    >
      <Stack gap="xs">
        <HStack align="baseline" justify="between">
          <Eyebrow>{entry.category}</Eyebrow>
          <Figure>{siblings.length}</Figure>
        </HStack>
        <NavMenu label={`${entry.category} templates`}>
          {siblings.map((sibling) => (
            <NavItem
              current={sibling.id === entry.id}
              href={templateHref(sibling.id)}
              key={sibling.id}
            >
              <span style={{flex: '1 1 auto'}}>{sibling.title}</span>
              {sibling.status === 'ready' ? null : <Figure>planned</Figure>}
            </NavItem>
          ))}
        </NavMenu>
      </Stack>

      <Divider />

      <Stack gap="xs">
        <Eyebrow>Other categories</Eyebrow>
        <NavMenu label="Other template categories">
          {others.map((category) => {
            const first = templateCatalog.find(
              (candidate) => candidate.category === category,
            );
            const count = templateCatalog.filter(
              (candidate) => candidate.category === category,
            ).length;

            return first === undefined ? null : (
              <NavItem href={templateHref(first.id)} key={category}>
                <span style={{flex: '1 1 auto'}}>{category}</span>
                <Figure>{count}</Figure>
              </NavItem>
            );
          })}
        </NavMenu>
      </Stack>
    </Stack>
  );
}

/**
 * What the template is built out of. This is the page's real argument: a
 * template is a composition of components the reader can already read about,
 * not a black box that happens to render.
 */
function Composition({
  source,
  title,
}: {
  readonly source: string;
  readonly title: string;
}) {
  const names = composedFrom(source);
  const linked = names.filter((name) => indexed.has(name));
  const rest = names.filter((name) => !indexed.has(name));

  return (
    <Card elevation="low">
      <Stack gap="md">
        <HStack align="baseline" gap="lg" justify="between">
          <Eyebrow>Composes</Eyebrow>
          <Figure>
            {names.length} {names.length === 1 ? 'import' : 'imports'} from{' '}
            @misoto22/kioku-ui
          </Figure>
        </HStack>

        <Text size="sm" tone="secondary">
          Read off the template's own imports rather than recorded by hand, so
          the list cannot drift from the file below it. Everything here ships in
          the package: the template adds arrangement, not components.
        </Text>

        <NavMenu
          label={`Components ${title} composes`}
          orientation="horizontal"
        >
          {linked.map((name) => (
            <NavItem href={componentHref(name)} key={name}>
              {name}
            </NavItem>
          ))}
        </NavMenu>

        {rest.length === 0 ? null : (
          <Stack gap="xs">
            <Eyebrow>No page of their own</Eyebrow>
            <Text size="sm" tone="muted">
              {rest.map((name, index) => (
                <span key={name}>
                  {index === 0 ? null : ', '}
                  <Code>{name}</Code>
                </span>
              ))}
              . Sub-parts, hooks and types are exported from the same package
              but indexed under the component they belong to.
            </Text>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

/** The file itself, which is what the reader is about to own. */
function Source({source}: {readonly source: TemplateSource}) {
  // Trimmed first: a file ends with a newline, and splitting on it would count
  // the empty string after the last line as a line of its own.
  const lines = source.source.trimEnd().split('\n').length;

  return (
    <Card elevation="low">
      <Stack gap="sm">
        <HStack align="baseline" gap="lg" justify="between">
          <Eyebrow>Source</Eyebrow>
          <Figure>
            {source.file} · {lines} lines
          </Figure>
        </HStack>
        <div style={{maxBlockSize: sourceHeight, overflowY: 'auto'}}>
          <CodeBlock wrap code={source.source} language="tsx" />
        </div>
        <Text size="sm" tone="muted">
          The whole file, as the CLI writes it. There is no build step and no
          hidden half: what you read here is what lands in your repository.
        </Text>
      </Stack>
    </Card>
  );
}

interface TemplateDetailPageProps {
  readonly id: string;
}

/**
 * One template's page, generic over the catalogue: the subject is read from
 * the route, and everything on the page is either what the catalogue records
 * or what the template's own source says about itself.
 */
export function TemplateDetailPage({id}: TemplateDetailPageProps) {
  const wide = useMediaQuery('(min-width: 60rem)');

  const entry = templateCatalog.find((candidate) => candidate.id === id);

  if (entry === undefined) {
    return (
      <PageContainer width="narrow">
        <Card>
          <EmptyState
            action={
              <Button
                onClick={() => {
                  window.location.hash = routeHref('templates').slice(1);
                }}
                variant="secondary"
              >
                Back to the gallery
              </Button>
            }
            detail="Nothing in the catalogue answers to that id. It may have been renamed, or the link may have been typed by hand."
            title="No such template"
          />
        </Card>
      </PageContainer>
    );
  }

  const source = sources.get(entry.id);
  const sketch = sketches[entry.id];

  return (
    <PageContainer>
      <div
        style={{
          alignItems: 'start',
          display: 'grid',
          gap: 'var(--kioku-ui-spacing-2xl)',
          gridTemplateColumns: wide
            ? `calc(8 * ${measure}) minmax(0, 1fr)`
            : 'minmax(0, 1fr)',
        }}
      >
        {wide ? <CategoryRail entry={entry} /> : null}

        <Stack gap="lg">
          <Breadcrumbs
            items={[
              {href: routeHref('templates'), label: 'Templates'},
              {label: entry.category},
              {label: entry.title},
            ]}
          />

          <Stack gap="md">
            <HStack align="baseline" gap="sm" wrap>
              <Heading family="display" level={1} size="page">
                {entry.title}
              </Heading>
              <Badge tone={entry.status === 'ready' ? 'success' : 'warning'}>
                {entry.status === 'ready' ? 'Ready' : 'Planned'}
              </Badge>
              <Code>{entry.id}</Code>
            </HStack>

            <Text tone="secondary">{entry.description}</Text>

            {source === undefined ? null : (
              <Stack gap="xs">
                {/*
                  The command is the thing a reader came for, so it sits where
                  the component page puts its import line — directly under the
                  description, before anything else asks for attention.
                */}
                <Eyebrow>Copy it in</Eyebrow>
                <CodeBlock
                  wrap
                  code={`kioku-ui add ${source.kind} ${entry.id}`}
                  language="bash"
                />
                <Text size="sm" tone="muted">
                  Writes <Code>{source.file}</Code> into the working directory.
                  Pass <Code>--dest</Code> to write it somewhere else, and{' '}
                  <Code>--force</Code> to overwrite a file that is already
                  there.
                </Text>
              </Stack>
            )}
          </Stack>

          {source === undefined ? (
            <Card elevation="low">
              <EmptyState
                action={
                  <Button
                    onClick={() => {
                      window.location.hash = routeHref('templates').slice(1);
                    }}
                    variant="secondary"
                  >
                    Back to the gallery
                  </Button>
                }
                detail={
                  <>
                    The id <Code>{entry.id}</Code> is held so the catalogue and
                    the CLI agree on what this template will be called, but the
                    page has not been written. There is nothing to copy in yet:{' '}
                    <Code>kioku-ui add pages {entry.id}</Code> would find
                    nothing today. The gallery lists everything that is written.
                  </>
                }
                title="Reserved, not written yet"
              />
            </Card>
          ) : (
            <>
              {sketch === undefined ? null : (
                <div
                  style={{
                    backgroundColor: 'var(--kioku-ui-color-surface)',
                    borderRadius: 'var(--kioku-ui-radius-container)',
                    boxShadow: 'var(--kioku-ui-elevation-low)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--kioku-ui-spacing-sm)',
                    padding: 'var(--kioku-ui-spacing-lg)',
                  }}
                >
                  <Eyebrow>Shape</Eyebrow>
                  <div style={{maxInlineSize: sketchWidth}}>
                    <TemplateThumbnail sketch={sketch} />
                  </div>
                  <Text size="sm" tone="muted">
                    The regions the page is divided into, and what fills the
                    main one. The same drawing the gallery card carries.
                  </Text>
                </div>
              )}

              <Composition source={source.source} title={entry.title} />
              <Source source={source} />
            </>
          )}
        </Stack>
      </div>
    </PageContainer>
  );
}
