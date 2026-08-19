import {useEffect, useState, type ReactNode} from 'react';

import {
  Alert,
  Button,
  Card,
  CodeBlock,
  Divider,
  Eyebrow,
  HStack,
  Heading,
  List,
  ListItem,
  Numeral,
  Outline,
  Stack,
  Text,
  useMediaQuery,
} from '@misoto22/kioku-ui';

import {PageContainer} from '../layout/PageContainer.js';
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

// The banner is one control tall plus its own padding and its hairline. The
// rail has to come to rest below it rather than under it, and a heading jumped
// to from the rail has to stop in the same place — so both are the one
// measurement, written as a relationship rather than as the 41px it happens to
// be in the kioku pack today.
const bannerHeight = `calc(
  var(--kioku-ui-size-control-md) + 2 * var(--kioku-ui-spacing-sm) +
    var(--kioku-ui-border-width)
)`;
const railOffset = `calc(${bannerHeight} + var(--kioku-ui-spacing-xl))`;

// The steps keep the measure the rest of the site sets prose to, so a
// paragraph here breaks where a paragraph anywhere else does. The rail holds
// four short lines and their marks, and asks for nothing beyond them.
const stepMeasure = 'calc(24 * var(--kioku-ui-spacing-2xl))';
const railMeasure = 'calc(8 * var(--kioku-ui-spacing-2xl))';

/** One step's identity, shared by the section, the rail, and the anchor. */
interface StepMeta {
  readonly href: string;
  readonly index: string;
  readonly title: string;
}

const installStep: StepMeta = {href: '#install', index: '01', title: 'Install'};
const providerStep: StepMeta = {
  href: '#provider',
  index: '02',
  title: 'Wrap the application',
};
const fontsStep: StepMeta = {
  href: '#fonts',
  index: '03',
  title: 'Load the fonts',
};
const pageStep: StepMeta = {href: '#page', index: '04', title: 'Build a page'};

const steps: readonly StepMeta[] = [
  installStep,
  providerStep,
  fontsStep,
  pageStep,
];

const outlineEntries = steps.map(({href, index, title}) => ({
  href,
  label: (
    <span
      style={{
        alignItems: 'baseline',
        display: 'inline-flex',
        gap: 'var(--kioku-ui-spacing-sm)',
      }}
    >
      <Numeral>{index}</Numeral>
      {/*
        The space is real rather than only the flex gap: an accessible name is
        computed from text, and "01Install" is what a reader hears when the
        only thing parting the figure from the title is a gutter.
      */}
      {` ${title}`}
    </span>
  ),
}));

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

/**
 * One step: the figure and the title, then what the step is for, then the
 * thing to type. The reason is set in the first rank of ink rather than as a
 * caption under the heading, because it is the part that has to land before
 * the block underneath it means anything.
 */
function Step({
  children,
  href,
  index,
  summary,
  title,
}: StepMeta & {
  readonly children: ReactNode;
  readonly summary: string;
}) {
  const anchor = href.slice(1);
  const headingId = `${anchor}-title`;

  return (
    <section
      aria-labelledby={headingId}
      id={anchor}
      style={{scrollMarginBlockStart: railOffset}}
    >
      <Stack gap="lg">
        <Stack gap="sm">
          <HStack align="baseline" gap="md">
            {/*
              The figure takes its size and its ink from here rather than from
              `Numeral`, which sets the face and the tabular figures and
              nothing else on purpose: the four of them line up down the page
              a rank behind the titles they count.
            */}
            <span
              style={{
                color: 'var(--kioku-ui-color-text-muted)',
                fontSize: 'var(--kioku-ui-typography-font-size-lg)',
              }}
            >
              <Numeral>{index}</Numeral>
            </span>
            <Heading id={headingId} level={2} size="section">
              {title}
            </Heading>
          </HStack>
          <Text>{summary}</Text>
        </Stack>
        {children}
      </Stack>
    </section>
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

interface DocsPageProps {
  readonly onNavigate: (route: Route) => void;
}

/** Getting started: the four steps between an empty app and a themed one. */
export function DocsPage({onNavigate}: DocsPageProps) {
  // Wide enough for the rail to stand beside the steps without taking width
  // the code blocks need. Below it the same list runs across the top, where it
  // is an index rather than a place-marker.
  const wide = useMediaQuery('(min-width: 64rem)');
  const currentHref = useCurrentStep();

  const outline = (
    <Stack gap="sm">
      <Eyebrow>FOUR STEPS</Eyebrow>
      <Outline
        currentHref={currentHref}
        entries={outlineEntries}
        label="Four steps"
      />
    </Stack>
  );

  return (
    <PageContainer>
      <div
        style={{
          alignItems: 'flex-start',
          display: 'flex',
          gap: 'var(--kioku-ui-spacing-2xl)',
          justifyContent: 'center',
        }}
      >
        <Stack
          gap="xl"
          style={{flex: '1 1 auto', maxWidth: stepMeasure, minWidth: 0}}
        >
          <Stack gap="sm">
            <Eyebrow>GETTING STARTED</Eyebrow>
            <Heading level={1} size="page">
              Get started
            </Heading>
            <Text tone="secondary">
              Four steps. The library supplies components, tokens, and themes;
              your application keeps its routes, data, and language.
            </Text>
          </Stack>

          <Alert tone="info">
            No version is published to npm yet. Until the first release, consume
            the packages through the workspace.
          </Alert>

          {wide ? null : outline}

          <Step
            {...installStep}
            summary="Two packages: the components, and one theme pack. The pack is what gives every token a value, so a build with the components alone renders unpainted."
          >
            <Block caption="TERMINAL">
              <CodeBlock wrap code={install} language="bash" />
            </Block>
          </Step>

          <Step
            {...providerStep}
            summary="The provider writes the chosen theme's tokens onto one element, and every component below it reads them from there. The host supplies the theme list and the default id; the library owns no storage and hard-codes no theme."
          >
            <Block caption="APPLICATION ROOT">
              <CodeBlock wrap code={wire} language="tsx" />
            </Block>
          </Step>

          <Step
            {...fontsStep}
            summary="The themes name font families but ship no font files — that is a host's decision. These three are the families the kioku pack names; without them everything falls back to the system UI font."
          >
            <Block caption="DOCUMENT HEAD">
              <CodeBlock wrap code={fonts} language="html" />
            </Block>
          </Step>

          <Step
            {...pageStep}
            summary="Start from a template rather than an empty file. The CLI copies the source into your repository, where you own it and can change it without waiting on a release."
          >
            <HStack gap="sm" wrap>
              <Button onClick={() => onNavigate('templates')}>
                Browse templates
              </Button>
              <Button
                onClick={() => onNavigate('components')}
                variant="secondary"
              >
                Browse components
              </Button>
            </HStack>
          </Step>

          <Divider />

          <Card elevation="low">
            <Stack gap="sm">
              <Heading level={2} size="subsection">
                What this library will not do
              </Heading>
              <List>
                <ListItem>Route, fetch, or persist anything.</ListItem>
                <ListItem>
                  Name a product, a domain concept, or a page.
                </ListItem>
                <ListItem>Ship font files, or decide your copy.</ListItem>
                <ListItem>
                  Hard-code a theme, or store which one you chose.
                </ListItem>
              </List>
            </Stack>
          </Card>
        </Stack>

        {wide ? (
          <div
            style={{
              alignSelf: 'flex-start',
              flex: '0 0 auto',
              inlineSize: railMeasure,
              insetBlockStart: railOffset,
              position: 'sticky',
            }}
          >
            {outline}
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}
