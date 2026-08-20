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
  Eyebrow,
  HStack,
  Heading,
  NavItem,
  NavMenu,
  Numeral,
  Stack,
  Text,
  useMediaQuery,
} from '@misoto22/kioku-ui';

import {Emphasis, useCopy} from '../i18n/index.js';
import {templateDetail} from '../i18n/templateDetail.js';
import {templates as templatesCopy} from '../i18n/templates.js';
import {PageContainer} from '../layout/PageContainer.js';
import {componentHref, routeHref, templateHref} from '../router.js';

// The templates as components rather than as text. The CLI's assets are the
// only copy of a template that exists, so a preview built from them cannot
// disagree with the source printed further down the same page — and importing
// them brings them under this app's typecheck as well.
import {BlankPage} from '../../../../packages/cli/assets/templates/pages/blank/BlankPage';
import {ContactFormPage} from '../../../../packages/cli/assets/templates/pages/contact-form/ContactFormPage';
import {DashboardPage} from '../../../../packages/cli/assets/templates/pages/dashboard/DashboardPage';
import {TwoColumnFormPage} from '../../../../packages/cli/assets/templates/pages/form-two-column/TwoColumnFormPage';
import {LoginPage} from '../../../../packages/cli/assets/templates/pages/login/LoginPage';
import {LoginCardPage} from '../../../../packages/cli/assets/templates/pages/login-card/LoginCardPage';
import {LoginSplitPage} from '../../../../packages/cli/assets/templates/pages/login-split/LoginSplitPage';
import {LoginSsoPage} from '../../../../packages/cli/assets/templates/pages/login-sso/LoginSsoPage';
import {MessagingShell} from '../../../../packages/cli/assets/templates/pages/messaging-shell/MessagingShell';
import {PaymentFormPage} from '../../../../packages/cli/assets/templates/pages/payment-form/PaymentFormPage';
import {SettingsPage} from '../../../../packages/cli/assets/templates/pages/settings/SettingsPage';
import {SettingsDialogPage} from '../../../../packages/cli/assets/templates/pages/settings-dialog/SettingsDialogPage';
import {SettingsSidebarPage} from '../../../../packages/cli/assets/templates/pages/settings-sidebar/SettingsSidebarPage';
import {NavShell} from '../../../../packages/cli/assets/templates/pages/shell-nav/NavShell';
import {SideNavShell} from '../../../../packages/cli/assets/templates/pages/shell-side-nav/SideNavShell';
import {TopNavShell} from '../../../../packages/cli/assets/templates/pages/shell-top-nav/TopNavShell';

import {allEntries} from '../data/componentCatalog.js';
import {
  templateCatalog,
  templateCategories,
  type TemplateCategory,
  type TemplateEntry,
} from '../data/templateCatalog.js';
import {sketches, TemplateThumbnail} from './TemplatesPage.js';
import {railOffset, railScroll} from '../layout/sticky.js';

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

// A template is a whole page, so the preview is a window onto one rather than a
// figure sized to the card. The page inside is laid out against a viewport and
// the whole of it is then stood back from, which is the only way a page whose
// body centres itself in the viewport lands where it means to. The factor is a
// ratio rather than a dimension, so it is a named number and every length here
// is derived from it.
const previewScale = 0.5;
const previewViewport = '100vh';
const previewHeight = `calc(${previewScale} * ${previewViewport})`;

const previewFrameStyle: CSSProperties = {
  backgroundColor: 'var(--kioku-ui-color-canvas)',
  blockSize: previewHeight,
  borderColor: 'var(--kioku-ui-border-default)',
  borderRadius: 'var(--kioku-ui-radius-inner)',
  borderStyle: 'var(--kioku-ui-border-style)',
  borderWidth: 'var(--kioku-ui-border-width)',
  // The frame is the whole of the preview: a page is taller and wider than the
  // window it is shown through, and nothing may escape into the doc's layout.
  overflow: 'hidden',
};

const previewPageStyle: CSSProperties = {
  blockSize: previewViewport,
  inlineSize: `calc(100% / ${previewScale})`,
  // A picture answers to nothing. `inert` takes the page out of the tab order
  // and off the accessibility tree; refusing pointer events on top of it keeps
  // a pane inside the picture from taking the wheel off the document.
  pointerEvents: 'none',
  transform: `scale(${previewScale})`,
  transformOrigin: 'top left',
};

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

// The command sits beside the title rather than under the description, which
// is where a reader looking for the one line they came to copy expects to find
// it. It is held to a measure so the title block does not become two halves.
const commandMeasure = `calc(13 * ${measure})`;

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
 * catalogue. A category is a destination in its own right now — the gallery
 * showing that slice — so the other rows lead there rather than guessing at
 * which template in it the reader wanted.
 */
function CategoryRail({entry}: {readonly entry: TemplateEntry}) {
  const copy = useCopy(templateDetail);
  const gallery = useCopy(templatesCopy);
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
        insetBlockStart: railOffset,
        maxHeight: `calc(100vh - 5 * ${measure})`,
        ...railScroll,
        position: 'sticky',
      }}
    >
      <Stack gap="xs">
        <HStack align="baseline" justify="between">
          <Eyebrow>{gallery.categories[entry.category]}</Eyebrow>
          <Eyebrow tone="muted">
            <Numeral>{siblings.length}</Numeral>
          </Eyebrow>
        </HStack>
        <NavMenu label={gallery.categories[entry.category]}>
          {siblings.map((sibling) => (
            <NavItem
              current={sibling.id === entry.id}
              href={templateHref(sibling.id)}
              key={sibling.id}
            >
              <span style={{flex: '1 1 auto'}}>{sibling.title}</span>
              {sibling.status === 'ready' ? null : (
                <Eyebrow tone="muted">{copy.planned}</Eyebrow>
              )}
            </NavItem>
          ))}
        </NavMenu>
      </Stack>

      <Divider />

      <Stack gap="xs">
        <Eyebrow>{copy.otherCategories.label}</Eyebrow>
        <NavMenu label={copy.otherCategories.menu}>
          {others.map((category) => {
            const first = templateCatalog.find(
              (candidate) => candidate.category === category,
            );
            const count = templateCatalog.filter(
              (candidate) => candidate.category === category,
            ).length;

            return first === undefined ? null : (
              <NavItem href={routeHref('templates', {category})} key={category}>
                <span style={{flex: '1 1 auto'}}>
                  {gallery.categories[category]}
                </span>
                <Eyebrow tone="muted">
                  <Numeral>{count}</Numeral>
                </Eyebrow>
              </NavItem>
            );
          })}
        </NavMenu>
      </Stack>
    </Stack>
  );
}

/** The shells frame a page rather than being one, so they need a body. */
function ShellBody() {
  return (
    <Stack gap="md">
      <Heading level={1} size="section">
        Release 12
      </Heading>
      <Card>
        <Text>
          Your own page goes here. The shell owns the navigation and the skip
          link; everything inside this card is the main region.
        </Text>
      </Card>
    </Stack>
  );
}

/**
 * Every template that can be shown as itself. A shell is given a body because
 * it is a frame rather than a page, and what it frames is the reader's.
 */
const previews: Readonly<Record<string, () => ReactNode>> = {
  blank: () => <BlankPage />,
  'contact-form': () => <ContactFormPage />,
  dashboard: () => <DashboardPage />,
  'form-two-column': () => <TwoColumnFormPage />,
  login: () => <LoginPage />,
  'login-card': () => <LoginCardPage />,
  'login-split': () => <LoginSplitPage />,
  'login-sso': () => <LoginSsoPage />,
  'messaging-shell': () => <MessagingShell />,
  'payment-form': () => <PaymentFormPage />,
  settings: () => <SettingsPage />,
  'settings-dialog': () => <SettingsDialogPage />,
  'settings-sidebar': () => <SettingsSidebarPage />,
  'shell-nav': () => (
    <NavShell>
      <ShellBody />
    </NavShell>
  ),
  'shell-side-nav': () => (
    <SideNavShell>
      <ShellBody />
    </SideNavShell>
  ),
  'shell-top-nav': () => (
    <TopNavShell>
      <ShellBody />
    </TopNavShell>
  ),
};

/**
 * The template, running. This is the one thing the page could not say in words
 * and the drawing it replaces could only gesture at: what the reader is about
 * to copy, dressed by the theme they are reading it in.
 */
function Preview({render}: {readonly render: () => ReactNode}) {
  const copy = useCopy(templateDetail);

  return (
    <Card elevation="low">
      <Stack gap="sm">
        <HStack align="baseline" gap="lg" justify="between">
          <Eyebrow>{copy.preview.label}</Eyebrow>
          <Eyebrow tone="muted">
            <Numeral>{Math.round(previewScale * 100)}</Numeral>
            {copy.preview.scale}
          </Eyebrow>
        </HStack>
        <div style={previewFrameStyle}>
          <div inert style={previewPageStyle}>
            {render()}
          </div>
        </div>
        <Text size="sm" tone="muted">
          {copy.preview.note}
        </Text>
      </Stack>
    </Card>
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
  const copy = useCopy(templateDetail);
  const names = composedFrom(source);
  const linked = names.filter((name) => indexed.has(name));
  const rest = names.filter((name) => !indexed.has(name));

  return (
    <Card elevation="low">
      <Stack gap="md">
        <HStack align="baseline" gap="lg" justify="between">
          <Eyebrow>{copy.composes.label}</Eyebrow>
          <Eyebrow tone="muted">
            {copy.composes.figure.lead}
            <Numeral>{names.length}</Numeral>
            {copy.composes.figure.tail(names.length)}
          </Eyebrow>
        </HStack>

        {/*
          The card's argument, and the one run of stress emphasis on the page.
          `Emphasis` slants it in English and marks it with 着重号 in Chinese,
          which has no italic to slant.
        */}
        <Text size="sm" tone="secondary">
          {copy.composes.argument.lead}
          <Emphasis>{copy.composes.argument.emphasis}</Emphasis>
          {copy.composes.argument.tail}
        </Text>

        {/*
          Every import that has a page of its own is a link to it. Density is
          the honest picture — a page that showed six of thirty-eight would be
          describing a smaller template than the one the reader is copying.
        */}
        <NavMenu label={copy.composes.menu(title)} orientation="horizontal">
          {linked.map((name) => (
            <NavItem href={componentHref(name)} key={name}>
              {name}
            </NavItem>
          ))}
        </NavMenu>

        {/*
          And the rest, named rather than quietly dropped: they are real
          exports the template really imports, and a list that silently held
          only the linkable ones would not add up to the count above it.
        */}
        {rest.length === 0 ? null : (
          <Stack gap="xs">
            <Eyebrow>{copy.composes.unlisted.label}</Eyebrow>
            <Text size="sm" tone="muted">
              {rest.map((name, index) => (
                <span key={name}>
                  {index === 0 ? null : ', '}
                  <Code>{name}</Code>
                </span>
              ))}
              . {copy.composes.unlisted.tail}
            </Text>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

/** The file itself, which is what the reader is about to own. */
function Source({source}: {readonly source: TemplateSource}) {
  const copy = useCopy(templateDetail);
  // Trimmed first: a file ends with a newline, and splitting on it would count
  // the empty string after the last line as a line of its own.
  const lines = source.source.trimEnd().split('\n').length;

  return (
    <Card elevation="low">
      <Stack gap="sm">
        <HStack align="baseline" gap="lg" justify="between">
          <Eyebrow>{copy.source.label}</Eyebrow>
          <Eyebrow tone="muted">
            <Numeral>{source.file}</Numeral>
            {copy.source.between}
            <Numeral>{lines}</Numeral>
            {copy.source.lines(lines)}
          </Eyebrow>
        </HStack>
        <div style={{maxBlockSize: sourceHeight, overflowY: 'auto'}}>
          <CodeBlock wrap code={source.source} language="tsx" />
        </div>
        <Text size="sm" tone="muted">
          {copy.source.note}
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
  const copy = useCopy(templateDetail);
  const gallery = useCopy(templatesCopy);

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
                {copy.notFound.action}
              </Button>
            }
            detail={copy.notFound.detail}
            title={copy.notFound.title}
          />
        </Card>
      </PageContainer>
    );
  }

  const source = sources.get(entry.id);
  const sketch = sketches[entry.id];
  const render = previews[entry.id];

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
              {href: routeHref('templates'), label: gallery.title},
              {
                href: routeHref('templates', {category: entry.category}),
                label: gallery.categories[entry.category],
              },
              {label: entry.title},
            ]}
          />

          {/*
            The title and the command stand side by side rather than in one
            column: the command is the one line a reader came to copy, and a
            description above it is something to read past first.
          */}
          <HStack align="start" gap="2xl" justify="between" wrap>
            <Stack gap="md" style={{flex: `1 1 calc(15 * ${measure})`}}>
              <HStack align="baseline" gap="sm" wrap>
                <Heading family="display" level={1} size="page">
                  {entry.title}
                </Heading>
                <Badge tone={entry.status === 'ready' ? 'success' : 'warning'}>
                  {entry.status === 'ready'
                    ? copy.status.ready
                    : copy.status.planned}
                </Badge>
                <Code>{entry.id}</Code>
              </HStack>

              <Text tone="secondary">{entry.description}</Text>
            </Stack>

            {source === undefined ? null : (
              <Stack gap="xs" style={{flex: `0 1 ${commandMeasure}`}}>
                <Eyebrow>{copy.copyItIn.label}</Eyebrow>
                <CodeBlock
                  wrap
                  code={`kioku-ui add ${source.kind} ${entry.id}`}
                  language="bash"
                />
                <Text size="sm" tone="muted">
                  {copy.copyItIn.lead}
                  <Code>{source.file}</Code>
                  {copy.copyItIn.middle}
                  <Code>{copy.copyItIn.dest}</Code>
                  {copy.copyItIn.between}
                  <Code>{copy.copyItIn.force}</Code>
                  {copy.copyItIn.tail}
                </Text>
              </Stack>
            )}
          </HStack>

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
                    {copy.reserved.action}
                  </Button>
                }
                detail={
                  <>
                    {copy.reserved.lead}
                    <Code>{entry.id}</Code>
                    {copy.reserved.middle}
                    <Code>kioku-ui add pages {entry.id}</Code>
                    {copy.reserved.tail}
                  </>
                }
                title={copy.reserved.title}
              />
            </Card>
          ) : (
            <>
              {/*
                A written template renders. The drawing is what is left for one
                that cannot — every template in the catalogue can today, so this
                branch is a fallback rather than a second way of saying it.
              */}
              {render === undefined ? (
                sketch === undefined ? null : (
                  <Card elevation="low">
                    <Stack gap="sm">
                      <Eyebrow>{copy.shape.label}</Eyebrow>
                      <div style={{maxInlineSize: sketchWidth}}>
                        <TemplateThumbnail sketch={sketch} />
                      </div>
                      <Text size="sm" tone="muted">
                        {copy.shape.note}
                      </Text>
                    </Stack>
                  </Card>
                )
              ) : (
                <Preview render={render} />
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
