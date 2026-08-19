import {useState} from 'react';
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

import {PageContainer} from '../layout/PageContainer.js';
import {componentHref, componentSlug, routeHref} from '../router.js';

import {componentCatalog} from '../data/componentCatalog.js';
import {specimens} from '../data/specimens.js';

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

/**
 * The plate every component gets. The theme tabs re-skin only what is inside
 * it, so a reader can check one component against all three without losing
 * the theme they chose for the site; colour mode and density come from the
 * site, because those are the reader's settings rather than the plate's.
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
  const {density, mode} = useTheme();
  const [themeId, setThemeId] = useState('washi');
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
        <Eyebrow>Specimen</Eyebrow>
        <TabList
          label="Specimen theme"
          onSelect={setThemeId}
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
        key={themeId}
        themes={kiokuThemes}
      >
        <div
          style={{
            backgroundColor: 'var(--kioku-ui-color-canvas)',
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
                    Open story
                  </Button>
                )
              }
              detail={`No specimen is registered for ${name} yet. Its story draws every state it has, audited with axe across all three themes in both colour modes.`}
              size="compact"
              title="No specimen registered"
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
                Back to the library
              </Button>
            }
            detail="Nothing in the catalog answers to that name. It may have been renamed, or the link may have been typed by hand."
            title="No such component"
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
              insetBlockStart: 'var(--kioku-ui-spacing-2xl)',
              maxHeight: `calc(100vh - 5 * ${measure})`,
              overflowY: 'auto',
              position: 'sticky',
            }}
          >
            <Stack gap="xs">
              <HStack align="baseline" justify="between">
                <Eyebrow>{group.title}</Eyebrow>
                <Figure>{group.entries.length}</Figure>
              </HStack>
              <NavMenu label={`${group.title} components`}>
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
              <Eyebrow>Other groups</Eyebrow>
              {/*
                A group has no page of its own, so each row leads to the first
                component in it — and that component's rail is the group. The
                destination is the group either way.
              */}
              <NavMenu label="Other component groups">
                {others.map((candidate) => {
                  const first = candidate.entries[0];
                  return first === undefined ? null : (
                    <NavItem
                      href={componentHref(first.name)}
                      key={candidate.title}
                    >
                      <span style={{flex: '1 1 auto'}}>{candidate.title}</span>
                      <Figure>{candidate.entries.length}</Figure>
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
              {href: routeHref('components'), label: 'Components'},
              {
                href: routeHref('components', {group: group.title}),
                label: group.title,
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
                  {entry.status === 'ready' ? 'Ready' : 'Planned'}
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
                  View source
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
                    Open story
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
                <Eyebrow>Props</Eyebrow>
                {doc === undefined ? null : (
                  <Figure>
                    {doc.props.length} own · {doc.inheritedProps.length}{' '}
                    inherited {doc.inheritedProps.length === 1 ? 'set' : 'sets'}
                  </Figure>
                )}
              </HStack>

              {doc === undefined ? (
                <Text size="sm" tone="muted">
                  {entry.name} ships no documentation sidecar to this site, so
                  its props are not listed here. The type is the contract:
                  import it and read {entry.name}Props.
                </Text>
              ) : (
                <Stack gap="md">
                  <Table density="compact" dividers="rows">
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell scope="col">Prop</TableHeaderCell>
                        <TableHeaderCell scope="col">Required</TableHeaderCell>
                        <TableHeaderCell scope="col">
                          Description
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
                              <Badge tone="info">Required</Badge>
                            ) : (
                              <Text size="sm" tone="muted">
                                Optional
                              </Text>
                            )}
                          </TableCell>
                          <TableCell>{prop.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <HStack align="start" gap="lg" wrap>
                    <Eyebrow>Inherited</Eyebrow>
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
                      . The package owns its own styling, so a caller cannot
                      reach in and override it.
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
                <Eyebrow>Example</Eyebrow>
                {doc === undefined ? (
                  <Text size="sm" tone="muted">
                    No documented example.
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
                      The shortest thing that works. Every prop is optional
                      unless the table above says otherwise.
                    </Text>
                  </>
                )}
              </Stack>
            </Card>

            <Card elevation="low">
              <Stack gap="sm">
                <HStack align="baseline" gap="lg" justify="between">
                  <Eyebrow>Stories</Eyebrow>
                  <Figure>:6006</Figure>
                </HStack>
                {doc === undefined ? (
                  <Text size="sm" tone="muted">
                    No story is registered for {entry.name}.
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
                        Open
                      </Button>
                    </HStack>
                    <Text size="sm" tone="muted">
                      Audited with axe across all three themes, in both colour
                      modes.
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
