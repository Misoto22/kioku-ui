import {useState} from 'react';

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
  TabList,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  ThemeProvider,
  useMediaQuery,
  useTheme,
} from '@misoto22/kioku-ui';
import {componentDocs} from '@misoto22/kioku-ui/docs';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

import {componentDetail} from '../i18n/componentDetail.js';
import {components as componentsCopy} from '../i18n/components.js';
import {useCopy} from '../i18n/index.js';
import {PageContainer} from '../layout/PageContainer.js';
import {componentHref, componentSlug, routeHref} from '../router.js';

import {componentCatalog} from '../data/componentCatalog.js';
import {specimens} from '../data/specimens.js';
import {railOffset, railScroll} from '../layout/sticky.js';

const storybookOrigin = 'http://localhost:6006';

// The catalog records what a component is, not where it lives, so the source
// link lands on the package rather than on a path this page would be guessing.
const sourceUrl =
  'https://github.com/Misoto22/kioku-ui/tree/main/packages/core/src';

// Every dimension the token contract has no role for is built from the spacing
// scale rather than written as a length, so the pages grow with the density the
// reader chose. Breakpoints are the exception: a media query cannot read a
// custom property, so those stay literal.
const measure = 'var(--kioku-ui-spacing-2xl)';

/**
 * The plate every component gets. The theme tabs re-skin only what is inside
 * it, so a reader can check one component against every skin the pack ships
 * without losing the theme they chose for the site; colour mode and density
 * come from the site, because those are the reader's settings rather than the
 * plate's.
 */
function SpecimenPlate({
  name,
  slug,
  storyId,
}: {
  readonly name: string;
  readonly slug: string;
  readonly storyId: string | null;
}) {
  const {density, mode, theme} = useTheme();
  // The plate previews one skin at a time, and it starts on the skin the
  // reader is already inrather than on a skin picked at authoring time: a
  // reader who chose Sumi and opens a component should not be shown Washi.
  const [preview, setPreview] = useState<string | null>(null);
  const themeId = preview ?? theme.id;
  const copy = useCopy(componentDetail);
  const Specimen = specimens[slug];

  return (
    <div
      style={{
        backgroundColor: 'var(--kioku-ui-color-surface)',
        borderRadius: 'var(--kioku-ui-radius-container)',
        boxShadow: 'var(--kioku-ui-elevation-low)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <HStack
        align="center"
        justify="between"
        style={{
          borderBlockEnd:
            'var(--kioku-ui-border-width) var(--kioku-ui-border-style) var(--kioku-ui-border-default)',
          gap: 'var(--kioku-ui-spacing-lg)',
          paddingBlock: 'var(--kioku-ui-spacing-sm)',
          paddingInline: 'var(--kioku-ui-spacing-lg)',
        }}
      >
        <Eyebrow>{copy.specimen.label}</Eyebrow>
        {/*
          Every skin the pack exports, read off the pack itself. The tabs and
          the sentence under the story below therefore cannot disagree about
          how many there are.
        */}
        <TabList
          label={copy.specimen.themeLabel}
          onSelect={setPreview}
          selectedId={themeId}
          tabs={kiokuThemes.map((theme) => ({
            id: theme.id,
            label: theme.label ?? theme.id,
          }))}
        />
      </HStack>

      <ThemeProvider
        defaultDensity={density}
        defaultMode={mode}
        defaultThemeId={themeId}
        key={`${themeId}:${mode}:${density}`}
        themes={kiokuThemes}
      >
        {/*
          The plate is the paper a specimen is laid on, so it takes the paper
          role and the page keeps the page role. Reaching for `canvas` here
          borrowed a value that happens to sit below `surface` in the light
          skins; in every dark skin canvas is the deepest step of all, and the
          plate turned into a black slab on a lighter page. The ring is what
          gives it an edge once it is no longer the darkest thing in view.
        */}
        <div
          style={{
            backgroundColor: 'var(--kioku-ui-color-surface)',
            borderRadius: 'var(--kioku-ui-radius-container)',
            boxShadow: 'var(--kioku-ui-elevation-low)',
            padding: 'var(--kioku-ui-spacing-lg)',
          }}
        >
          {Specimen === undefined ? (
            /*
              Every component in the catalog has an entry in the registry, so
              this is the shape of a component added to the catalog before its
              specimen was written rather than a state a reader should meet.
            */
            <EmptyState
              action={
                storyId === null ? null : (
                  <Button
                    onClick={() => {
                      window.open(
                        `${storybookOrigin}/?path=/story/${storyId}`,
                        '_blank',
                        'noopener',
                      );
                    }}
                    variant="secondary"
                  >
                    {copy.openStory}
                  </Button>
                )
              }
              detail={copy.noSpecimen.detail(name, kiokuThemes.length)}
              size="compact"
              title={copy.noSpecimen.title}
            />
          ) : (
            <Specimen />
          )}
        </div>
      </ThemeProvider>
    </div>
  );
}

interface ComponentDetailPageProps {
  readonly slug: string;
}

/**
 * One component's page, generic over the catalog: the subject is read from
 * the route, and everything on the page is what the catalog and the
 * component's own `.doc.ts` sidecar already know about it.
 */
export function ComponentDetailPage({slug}: ComponentDetailPageProps) {
  const wide = useMediaQuery('(min-width: 60rem)');
  const copy = useCopy(componentDetail);
  const libraryCopy = useCopy(componentsCopy);

  /** A group's own name in the language the page is being read in. */
  function groupName(title: string): string {
    return libraryCopy.groups[title] ?? title;
  }

  const group = componentCatalog.find((candidate) =>
    candidate.entries.some((entry) => componentSlug(entry.name) === slug),
  );
  const entry = group?.entries.find(
    (candidate) => componentSlug(candidate.name) === slug,
  );

  if (group === undefined || entry === undefined) {
    return (
      <PageContainer width="narrow">
        <Card>
          <EmptyState
            action={
              <Button
                onClick={() => {
                  window.location.hash = routeHref('components').slice(1);
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

  const doc = componentDocs.find((candidate) => candidate.name === entry.name);
  const others = componentCatalog.filter(
    (candidate) => candidate.title !== group.title,
  );

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
        {wide ? (
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
                <Eyebrow>{groupName(group.title)}</Eyebrow>
                <Eyebrow tone="muted">
                  <Numeral>{group.entries.length}</Numeral>
                </Eyebrow>
              </HStack>
              <NavMenu label={libraryCopy.groupMenu(groupName(group.title))}>
                {group.entries.map((sibling) => (
                  <NavItem
                    current={sibling.name === entry.name}
                    href={componentHref(sibling.name)}
                    key={sibling.name}
                  >
                    {sibling.name}
                  </NavItem>
                ))}
              </NavMenu>
            </Stack>

            <Divider />

            <Stack gap="xs">
              <Eyebrow>{copy.otherGroups.label}</Eyebrow>
              {/*
                A group has no page of its own, so each row leads to the first
                component in it — and that component's rail is the group. The
                destination is the group either way.
              */}
              <NavMenu label={copy.otherGroups.menu}>
                {others.map((candidate) => {
                  const first = candidate.entries[0];
                  return first === undefined ? null : (
                    <NavItem
                      href={componentHref(first.name)}
                      key={candidate.title}
                    >
                      <span style={{flex: '1 1 auto'}}>
                        {groupName(candidate.title)}
                      </span>
                      <Eyebrow tone="muted">
                        <Numeral>{candidate.entries.length}</Numeral>
                      </Eyebrow>
                    </NavItem>
                  );
                })}
              </NavMenu>
            </Stack>
          </Stack>
        ) : null}

        <Stack gap="lg">
          <Breadcrumbs
            items={[
              {href: routeHref('components'), label: copy.breadcrumbRoot},
              {
                href: routeHref('components', {group: group.title}),
                label: groupName(group.title),
              },
              {label: entry.name},
            ]}
          />

          <Stack gap="md">
            <HStack align="end" gap="lg" justify="between" wrap>
              <HStack align="baseline" gap="sm" wrap>
                <Heading family="display" level={1} size="page">
                  {entry.name}
                </Heading>
                <Badge tone={entry.status === 'ready' ? 'success' : 'warning'}>
                  {entry.status === 'ready'
                    ? copy.status.ready
                    : copy.status.planned}
                </Badge>
                <Code>@misoto22/kioku-ui</Code>
              </HStack>
              {/*
                Two secondary controls and no seal: the emphatic button is one
                per scope, and on this page the subject is the component, not
                a thing to press.
              */}
              <HStack gap="sm" wrap>
                <Button
                  onClick={() => {
                    window.open(sourceUrl, '_blank', 'noopener');
                  }}
                  variant="secondary"
                >
                  {copy.viewSource}
                </Button>
                {doc === undefined ? null : (
                  <Button
                    onClick={() => {
                      window.open(
                        `${storybookOrigin}/?path=/story/${doc.storyId}`,
                        '_blank',
                        'noopener',
                      );
                    }}
                    variant="secondary"
                  >
                    {copy.openStory}
                  </Button>
                )}
              </HStack>
            </HStack>

            <Text tone="secondary">
              {doc?.description ?? entry.description}
            </Text>

            <CodeBlock
              wrap
              code={`import {${entry.name}} from '@misoto22/kioku-ui';`}
              language="tsx"
            />
          </Stack>

          <SpecimenPlate
            name={entry.name}
            slug={slug}
            storyId={doc?.storyId ?? null}
          />

          <Card elevation="low">
            <Stack gap="md">
              <HStack align="baseline" gap="lg" justify="between">
                <Eyebrow>{copy.props.label}</Eyebrow>
                {doc === undefined ? null : (
                  <Eyebrow tone="muted">
                    {copy.props.figure.lead}
                    <Numeral>{doc.props.length}</Numeral>
                    {copy.props.figure.between}
                    <Numeral>{doc.inheritedProps.length}</Numeral>
                    {copy.props.figure.tail(doc.inheritedProps.length)}
                  </Eyebrow>
                )}
              </HStack>

              {doc === undefined ? (
                <Text size="sm" tone="muted">
                  {copy.noSidecar.lead(entry.name)}
                  <Code>{entry.name}Props</Code>
                  {copy.noSidecar.tail}
                </Text>
              ) : (
                <Stack gap="md">
                  <Table density="compact" dividers="rows">
                    <TableHead>
                      {/*
                        Three columns and no more, because a prop's sidecar
                        records exactly three things. The note under the table
                        says where the type and the default went.
                      */}
                      <TableRow>
                        <TableHeaderCell scope="col">
                          {copy.props.name}
                        </TableHeaderCell>
                        <TableHeaderCell scope="col">
                          {copy.props.requiredColumn}
                        </TableHeaderCell>
                        <TableHeaderCell scope="col">
                          {copy.props.description}
                        </TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {doc.props.map((prop) => (
                        <TableRow key={prop.name}>
                          <TableCell>
                            <Code>{prop.name}</Code>
                          </TableCell>
                          <TableCell>
                            {prop.required === true ? (
                              <Badge tone="info">{copy.props.required}</Badge>
                            ) : (
                              <Text size="sm" tone="muted">
                                {copy.props.optional}
                              </Text>
                            )}
                          </TableCell>
                          <TableCell>{prop.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/*
                    Three columns, because the sidecar records three things.
                    A reader who has met a props table elsewhere will look for
                    the type and the default and find neither, so the page says
                    where they went rather than leaving the gap unexplained.
                  */}
                  <HStack align="start" gap="lg" wrap>
                    <Eyebrow>{copy.noTypeColumn.label}</Eyebrow>
                    <Text
                      size="sm"
                      style={{flex: `1 1 calc(11 * ${measure})`}}
                      tone="muted"
                    >
                      {copy.noTypeColumn.lead}
                      <Code>{entry.name}Props</Code>
                      {copy.noTypeColumn.tail}
                    </Text>
                  </HStack>

                  <Divider />

                  <HStack align="start" gap="lg" wrap>
                    <Eyebrow>{copy.inherited.label}</Eyebrow>
                    <Text
                      size="sm"
                      tone="secondary"
                      style={{flex: `1 1 calc(11 * ${measure})`}}
                    >
                      {doc.inheritedProps.map((contract, index) => (
                        <span key={contract}>
                          {index === 0 ? null : ', '}
                          <Code>{contract}</Code>
                        </span>
                      ))}
                      . {copy.inherited.tail}
                    </Text>
                  </HStack>
                </Stack>
              )}
            </Stack>
          </Card>

          <div
            style={{
              display: 'grid',
              gap: 'var(--kioku-ui-spacing-xl)',
              gridTemplateColumns: wide
                ? 'repeat(2, minmax(0, 1fr))'
                : 'minmax(0, 1fr)',
            }}
          >
            <Card elevation="low">
              <Stack gap="sm">
                <Eyebrow>{copy.example.label}</Eyebrow>
                {doc === undefined ? (
                  <Text size="sm" tone="muted">
                    {copy.example.none}
                  </Text>
                ) : (
                  <>
                    {/*
                      A well rather than a block: the import above is the line
                      a reader copies, and giving a second copy control equal
                      standing here would make the page ask twice.
                    */}
                    <Code
                      style={{
                        display: 'block',
                        overflowX: 'auto',
                        padding: 'var(--kioku-ui-spacing-md)',
                      }}
                    >
                      {doc.example}
                    </Code>
                    <Text size="sm" tone="muted">
                      {copy.example.note}
                    </Text>
                  </>
                )}
              </Stack>
            </Card>

            <Card elevation="low">
              <Stack gap="sm">
                <HStack align="baseline" gap="lg" justify="between">
                  <Eyebrow>{copy.stories.label}</Eyebrow>
                  <Eyebrow tone="muted">
                    <Numeral>:6006</Numeral>
                  </Eyebrow>
                </HStack>
                {doc === undefined ? (
                  <Text size="sm" tone="muted">
                    {copy.stories.none(entry.name)}
                  </Text>
                ) : (
                  <>
                    <HStack align="center" gap="md" justify="between" wrap>
                      <Code>{doc.storyId}</Code>
                      <Button
                        onClick={() => {
                          window.open(
                            `${storybookOrigin}/?path=/story/${doc.storyId}`,
                            '_blank',
                            'noopener',
                          );
                        }}
                        variant="secondary"
                      >
                        {copy.stories.open}
                      </Button>
                    </HStack>
                    {/*
                      The skin count is read off the theme pack rather than
                      written into the sentence, which is how it came to say
                      three while the pack shipped four.
                    */}
                    <Text size="sm" tone="muted">
                      {copy.stories.note(kiokuThemes.length)}
                    </Text>
                  </>
                )}
              </Stack>
            </Card>
          </div>
        </Stack>
      </div>
    </PageContainer>
  );
}
