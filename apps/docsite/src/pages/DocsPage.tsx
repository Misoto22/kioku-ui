import {Fragment, useEffect, useState, type ReactNode} from 'react';

import {
  Alert,
  Button,
  Card,
  Code,
  CodeBlock,
  Divider,
  Eyebrow,
  HStack,
  Heading,
  Icon,
  List,
  ListItem,
  MetadataList,
  Numeral,
  Outline,
  Stack,
  Text,
  tokenNames,
  useMediaQuery,
  type IconTone,
} from '@misoto22/kioku-ui';

import {docs, type DocsFact} from '../i18n/docs.js';
import {useCopy} from '../i18n/index.js';
import {PageContainer} from '../layout/PageContainer.js';
import {bannerHeight, railOffset} from '../layout/sticky.js';
import type {Route} from '../router.js';

const install = `pnpm add @misoto22/kioku-ui @misoto22/kioku-ui-theme-kioku`;

const wire = `import '@misoto22/kioku-ui/reset.css';
import '@misoto22/kioku-ui/styles.css';
import '@misoto22/kioku-ui-theme-kioku/theme.css';

import {ThemeProvider} from '@misoto22/kioku-ui';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

export function App({children}) {
  return (
    <ThemeProvider defaultThemeId="washi" themes={kiokuThemes}>
      {children}
    </ThemeProvider>
  );
}`;

const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
/>`;

// Identifiers rather than copy: the three template kinds are directory names
// in the CLI, and the command is typed exactly as it is printed.
const templateKinds = 'blocks · pages · themes';
const addCommand = 'kioku-ui add pages <id>';
const wrapProp = 'wrap';

// What the reader is left holding, counted off the blocks above rather than
// asserted: two package names in `install`, three stylesheet imports and one
// provider in `wire`, three families in `fonts`. The last is counted off the
// contract itself, so it can never fall out of step with the theme package.
const packageCount = 2;
const importCount = 3;
const providerCount = 1;
const familyCount = 3;
const roleCount = tokenNames.length;

// The lede and the notice split the head of the page the way the steps split
// their own row. The rail holds four short lines and their marks, and asks for
// nothing beyond them.
const leadMeasure = 'calc(24 * var(--kioku-ui-spacing-2xl))';
const noticeMeasure = 'calc(11 * var(--kioku-ui-spacing-2xl))';
const railMeasure = 'calc(7 * var(--kioku-ui-spacing-2xl))';

// The argument and the code are a ratio rather than two widths: the reasoning
// wants a paragraph measure, the block wants enough room that the one long
// line is the only one that has to wrap.
const stepColumns = 'auto minmax(0, 3fr) minmax(0, 4fr)';
const stackedColumns = 'auto minmax(0, 1fr)';

/** One step's identity, shared by the section, the rail, and the anchor. */
interface StepMeta {
  readonly href: string;
  readonly index: string;
}

const installStep: StepMeta = {href: '#install', index: '01'};
const providerStep: StepMeta = {href: '#provider', index: '02'};
const fontsStep: StepMeta = {href: '#fonts', index: '03'};
const pageStep: StepMeta = {href: '#page', index: '04'};

const steps: readonly StepMeta[] = [
  installStep,
  providerStep,
  fontsStep,
  pageStep,
];

// A step counts as the one being read once its head has crossed the upper
// third of the viewport. Marking it the moment its first pixel appears keeps
// the rail permanently one step ahead of the reader.
const readingLine = 3;

/**
 * Which step the reader is at. The rail is only worth drawing if it answers
 * that while the page moves, so this follows the scroll rather than the last
 * anchor that happened to be clicked.
 */
function useCurrentStep(): string {
  const [current, setCurrent] = useState(installStep.href);

  useEffect(() => {
    function sync() {
      const line = window.innerHeight / readingLine;
      let reached = installStep.href;

      for (const step of steps) {
        const section = document.getElementById(step.href.slice(1));
        if (section && section.getBoundingClientRect().top <= line) {
          reached = step.href;
        }
      }

      setCurrent(reached);
    }

    sync();
    window.addEventListener('scroll', sync, {passive: true});
    window.addEventListener('resize', sync);

    return () => {
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  return current;
}

// Three marks, for the three things a line beside a step can be: what breaks
// without the step, a fact about it worth knowing before typing, and the
// evidence that it landed.
const glyphs = {
  skip: ['M8 2.4a5.6 5.6 0 1 0 0 11.2 5.6 5.6 0 0 0 0-11.2', 'M4 12 12 4'],
  note: ['M3 4.4h10', 'M3 8h10', 'M3 11.6h6'],
  worked: ['M3.4 8.4 6.4 11.4 12.6 4.8'],
} as const;

type GlyphName = keyof typeof glyphs;

/**
 * A stroked mark at the size of the line it stands beside.
 *
 * `fill` is declared on the path rather than on the `svg`: `Icon` paints
 * `fill: currentColor` from a class, and a class beats a presentation
 * attribute on the same element — but not one on the child, which is a
 * declaration of its own rather than an inherited value.
 */
function Glyph({
  name,
  tone,
}: {
  readonly name: GlyphName;
  readonly tone: IconTone;
}) {
  return (
    <Icon size="lg" tone={tone} viewBox="0 0 16 16">
      {glyphs[name].map((d) => (
        <path
          d={d}
          fill="none"
          key={d}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.4}
        />
      ))}
    </Icon>
  );
}

/** A mark, the thing it is about, and the one line that says it. */
function Fact({
  detail,
  glyph,
  label,
  tone,
}: {
  readonly detail: string;
  readonly glyph: GlyphName;
  readonly label: string;
  readonly tone: IconTone;
}) {
  return (
    <HStack align="start" gap="sm">
      <Glyph name={glyph} tone={tone} />
      <Stack gap="xs" style={{minWidth: 0}}>
        <Eyebrow tone="muted">{label}</Eyebrow>
        <Text size="sm">{detail}</Text>
      </Stack>
    </HStack>
  );
}

/** Where a block goes, named before the block rather than left to be guessed. */
function Block({
  caption,
  children,
}: {
  readonly caption: string;
  readonly children: ReactNode;
}) {
  return (
    <Stack gap="sm">
      <Eyebrow>{caption}</Eyebrow>
      {children}
    </Stack>
  );
}

/** One step's argument, with the `if you skip it` already resolved. */
interface StepCopy {
  readonly note?: DocsFact;
  readonly skip?: string;
  readonly summary: string;
  readonly title: string;
  readonly worked: string;
}

/**
 * One step: the figure, then why the step exists and what happens either way,
 * then the thing to type. The reasoning is set beside the block rather than
 * above it, because it is the part that has to land before the block
 * underneath it means anything — and a reader who already knows the argument
 * can take the right-hand column on its own.
 */
function Step({
  children,
  copy,
  href,
  index,
  labels,
  wide,
}: StepMeta & {
  readonly children: ReactNode;
  readonly copy: StepCopy;
  readonly labels: {readonly skip: string; readonly worked: string};
  readonly wide: boolean;
}) {
  const anchor = href.slice(1);
  const headingId = `${anchor}-title`;

  return (
    <section
      aria-labelledby={headingId}
      id={anchor}
      style={{scrollMarginBlockStart: railOffset}}
    >
      <div
        style={{
          alignItems: 'start',
          columnGap: 'var(--kioku-ui-spacing-xl)',
          display: 'grid',
          gridTemplateColumns: wide ? stepColumns : stackedColumns,
          rowGap: 'var(--kioku-ui-spacing-lg)',
        }}
      >
        {/*
          The figure takes its size and its ink from here rather than from
          `Numeral`, which sets the face and the tabular figures and nothing
          else on purpose: the four of them line up down the page a rank
          behind the titles they count.
        */}
        <span
          style={{
            color: 'var(--kioku-ui-color-text-muted)',
            fontSize: 'var(--kioku-ui-typography-font-size-lg)',
            gridColumn: 1,
            gridRow: 1,
            lineHeight: 'var(--kioku-ui-typography-line-height-heading)',
          }}
        >
          <Numeral>{index}</Numeral>
        </span>
        <Stack gap="md" style={{gridColumn: 2, gridRow: 1, minWidth: 0}}>
          <Heading id={headingId} level={2} size="subsection">
            {copy.title}
          </Heading>
          <Text tone="secondary">{copy.summary}</Text>
          {copy.skip === undefined ? null : (
            <Fact
              detail={copy.skip}
              glyph="skip"
              label={labels.skip}
              tone="muted"
            />
          )}
          {copy.note === undefined ? null : (
            <Fact
              detail={copy.note.detail}
              glyph="note"
              label={copy.note.label}
              tone="muted"
            />
          )}
          <Fact
            detail={copy.worked}
            glyph="worked"
            label={labels.worked}
            tone="accent"
          />
        </Stack>
        <div
          style={{
            gridColumn: wide ? 3 : 2,
            gridRow: wide ? 1 : 2,
            minWidth: 0,
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

/** A figure at the end of its row, so a column of them lines up on the right. */
function Tally({children}: {readonly children: ReactNode}) {
  return (
    <span style={{display: 'block', textAlign: 'end'}}>
      <Numeral>{children}</Numeral>
    </span>
  );
}

interface DocsPageProps {
  readonly onNavigate: (route: Route) => void;
}

/** Getting started: the four steps between an empty app and a themed one. */
export function DocsPage({onNavigate}: DocsPageProps) {
  const copy = useCopy(docs);

  // Wide enough for the rail to stand beside the steps and for the argument to
  // stand beside the block. Below it both fold: the rail runs across the top
  // as an index, and each step's code drops under its own reasoning.
  const wide = useMediaQuery('(min-width: 64rem)');
  const currentHref = useCurrentStep();

  const outlineEntries = [
    {meta: installStep, title: copy.steps.install.title},
    {meta: providerStep, title: copy.steps.provider.title},
    {meta: fontsStep, title: copy.steps.fonts.title},
    {meta: pageStep, title: copy.steps.page.title},
  ].map(({meta, title}) => ({
    href: meta.href,
    label: (
      <span
        style={{
          alignItems: 'baseline',
          display: 'inline-flex',
          gap: 'var(--kioku-ui-spacing-sm)',
        }}
      >
        <Numeral>{meta.index}</Numeral>
        {/*
          The space is real rather than only the flex gap: an accessible name
          is computed from text, and "01Install" is what a reader hears when
          the only thing parting the figure from the title is a gutter.
        */}
        {` ${title}`}
      </span>
    ),
  }));

  const outline = (
    <Stack gap="sm">
      <Eyebrow>{copy.rail.stepsLabel}</Eyebrow>
      <Outline
        currentHref={currentHref}
        entries={outlineEntries}
        label={copy.rail.stepsLabel}
      />
    </Stack>
  );

  // Three steps name their block before it; the fourth's block is a card that
  // carries its own heading, so it is placed without a caption above it.
  const stepList: readonly {
    readonly block: ReactNode;
    readonly caption?: string;
    readonly copy: StepCopy;
    readonly meta: StepMeta;
  }[] = [
    {
      block: <CodeBlock code={install} language="bash" wrap />,
      caption: copy.steps.install.caption,
      copy: {...copy.steps.install, skip: copy.steps.install.skip(roleCount)},
      meta: installStep,
    },
    {
      block: <CodeBlock code={wire} language="tsx" wrap />,
      caption: copy.steps.provider.caption,
      copy: copy.steps.provider,
      meta: providerStep,
    },
    {
      block: (
        <Stack gap="sm">
          <CodeBlock code={fonts} language="html" wrap />
          <HStack align="start" gap="sm">
            <Glyph name="note" tone="muted" />
            <Text size="sm" tone="secondary">
              {copy.wrapNote.lead}
              <Code>{wrapProp}</Code>
              {copy.wrapNote.tail}
            </Text>
          </HStack>
        </Stack>
      ),
      caption: copy.steps.fonts.caption,
      copy: copy.steps.fonts,
      meta: fontsStep,
    },
    {
      block: (
        <Card elevation="low">
          <Stack gap="md">
            <HStack align="center" gap="md">
              <Eyebrow>{copy.steps.page.caption}</Eyebrow>
              <Code>{templateKinds}</Code>
              <Divider aria-hidden="true" style={{flex: 1}} />
            </HStack>
            <HStack gap="sm" wrap>
              <Button onClick={() => onNavigate('templates')}>
                {copy.exit.templates}
              </Button>
              <Button
                onClick={() => onNavigate('components')}
                variant="secondary"
              >
                {copy.exit.components}
              </Button>
            </HStack>
            <Text size="sm" tone="secondary">
              {copy.exit.terminal.lead}
              <Code>{addCommand}</Code>
              {copy.exit.terminal.tail}
            </Text>
          </Stack>
        </Card>
      ),
      copy: copy.steps.page,
      meta: pageStep,
    },
  ];

  return (
    <PageContainer>
      <div
        style={{
          alignItems: 'flex-start',
          display: 'flex',
          gap: 'var(--kioku-ui-spacing-2xl)',
        }}
      >
        <Stack gap="xl" style={{flex: '1 1 auto', minWidth: 0}}>
          <HStack align="start" gap="2xl" justify="between" wrap>
            <Stack
              gap="sm"
              style={{flex: '1 1 auto', maxWidth: leadMeasure, minWidth: 0}}
            >
              <Eyebrow>{copy.eyebrow}</Eyebrow>
              <Heading level={1} size="page">
                {copy.title}
              </Heading>
              <Text tone="secondary">{copy.lead}</Text>
            </Stack>
            {/*
              The one caveat, beside the promise rather than across the page.
              Its label sits outside the alert: everything inside inherits the
              status ink, and an eyebrow in there would swap that for the
              generic secondary rank on a coloured surface.
            */}
            <Stack
              gap="sm"
              style={{flex: '0 1 auto', maxWidth: noticeMeasure, minWidth: 0}}
            >
              <Eyebrow>{copy.notice.label}</Eyebrow>
              <Alert tone="info">{copy.notice.detail}</Alert>
            </Stack>
          </HStack>

          {wide ? null : outline}

          {stepList.map(({block, caption, copy: stepCopy, meta}) => (
            <Fragment key={meta.href}>
              <Divider />
              <Step
                {...meta}
                copy={stepCopy}
                labels={copy.factLabels}
                wide={wide}
              >
                {caption === undefined ? (
                  block
                ) : (
                  <Block caption={caption}>{block}</Block>
                )}
              </Step>
            </Fragment>
          ))}
        </Stack>

        {wide ? (
          <Stack
            gap="xl"
            style={{
              alignSelf: 'flex-start',
              flex: `0 0 ${railMeasure}`,
              insetBlockStart: railOffset,
              position: 'sticky',
            }}
          >
            {outline}

            <Divider />

            <Stack gap="sm">
              <Eyebrow>{copy.rail.labour.label}</Eyebrow>
              <Text size="sm" tone="secondary">
                {copy.rail.labour.detail}
              </Text>
            </Stack>

            <Divider />

            <Stack gap="sm">
              <Eyebrow>{copy.rail.done.label}</Eyebrow>
              <MetadataList
                entries={[
                  {
                    detail: <Tally>{packageCount}</Tally>,
                    term: copy.rail.done.packages,
                  },
                  {
                    detail: <Tally>{importCount}</Tally>,
                    term: copy.rail.done.imports,
                  },
                  {
                    detail: <Tally>{providerCount}</Tally>,
                    term: copy.rail.done.providers,
                  },
                  {
                    detail: <Tally>{familyCount}</Tally>,
                    term: copy.rail.done.fonts,
                  },
                  {
                    detail: <Tally>{roleCount}</Tally>,
                    term: copy.rail.done.roles,
                  },
                ]}
                layout="inline"
              />
            </Stack>

            <Divider />

            <Stack gap="sm">
              <Eyebrow>{copy.rail.never.label}</Eyebrow>
              <List gap="sm" variant="plain">
                {copy.rail.never.items.map((item) => (
                  <ListItem key={item}>
                    <HStack align="start" gap="sm">
                      <span
                        aria-hidden="true"
                        style={{color: 'var(--kioku-ui-color-text-muted)'}}
                      >
                        —
                      </span>
                      <Text size="sm" tone="secondary">
                        {item}
                      </Text>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </Stack>
          </Stack>
        ) : null}
      </div>
    </PageContainer>
  );
}
