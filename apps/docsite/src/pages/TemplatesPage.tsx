import {
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import {
  CodeBlock,
  HStack,
  Heading,
  Stack,
  TabList,
  Text,
} from '@misoto22/kioku-ui';

import {PageContainer} from '../layout/PageContainer.js';
import {templateHref} from '../router.js';

import {
  templateCatalog,
  templateCategories,
  type TemplateCategory,
  type TemplateEntry,
} from '../data/templateCatalog.js';

// A width is the one dimension the token contract has no role for, so both
// grids take their column floor from the spacing scale instead of a literal.
const minimumReadyWidth = 'calc(9 * var(--kioku-ui-spacing-2xl))';
const minimumPlannedWidth = 'calc(10 * var(--kioku-ui-spacing-2xl))';

// ---------------------------------------------------------------------------
// The layout sketch
//
// Each ready template's card shows what its page is shaped like. The catalogue
// carries no thumbnail, and this site ships no binary assets, so the structure
// is named here in the two axes the drawing needs: the regions the page is
// divided into (`chrome`), and what fills the main one (`content`). Every
// dimension below is a relationship over the spacing scale and every colour is
// a role, so the sketches re-dress themselves with the rest of the site.
// ---------------------------------------------------------------------------

/** The region skeleton a template's page is built on. */
type SketchChrome =
  'banner' | 'card' | 'list' | 'modal' | 'none' | 'rail' | 'shell' | 'split';

/** What fills the main region once the skeleton is drawn. */
type SketchContent =
  | 'blank'
  | 'columns'
  | 'copy'
  | 'dialog'
  | 'form'
  | 'notice-form'
  | 'provider-form'
  | 'sso'
  | 'switches'
  | 'tiles'
  | 'transcript';

/** One template's structure, in the two axes the drawing needs. */
export interface TemplateSketch {
  readonly chrome: SketchChrome;
  readonly content: SketchContent;
}

/**
 * Exported so a template's own page can redraw the card the reader clicked.
 * The gallery and the detail page then say the same thing about a template's
 * shape, because they are reading the same sketch.
 */
export const sketches: Readonly<Record<string, TemplateSketch>> = {
  blank: {chrome: 'rail', content: 'blank'},
  'contact-form': {chrome: 'none', content: 'notice-form'},
  dashboard: {chrome: 'rail', content: 'tiles'},
  'form-two-column': {chrome: 'none', content: 'columns'},
  login: {chrome: 'none', content: 'form'},
  'login-card': {chrome: 'card', content: 'form'},
  'login-split': {chrome: 'split', content: 'form'},
  'login-sso': {chrome: 'none', content: 'sso'},
  'messaging-shell': {chrome: 'list', content: 'transcript'},
  'payment-form': {chrome: 'none', content: 'provider-form'},
  settings: {chrome: 'none', content: 'switches'},
  'settings-dialog': {chrome: 'modal', content: 'dialog'},
  'settings-sidebar': {chrome: 'rail', content: 'switches'},
  'shell-nav': {chrome: 'shell', content: 'copy'},
  'shell-side-nav': {chrome: 'rail', content: 'copy'},
  'shell-top-nav': {chrome: 'banner', content: 'copy'},
};

// The sketch is a miniature, so its parts are smaller than any control the
// contract names. Each is written as a relationship, never a literal.
const plateHeight = 'calc(2 * var(--kioku-ui-spacing-2xl))';
const railWidth = 'calc(4 * var(--kioku-ui-spacing-sm))';
const listWidth = 'calc(2 * var(--kioku-ui-spacing-xl))';
const outlineWidth = 'calc(3 * var(--kioku-ui-spacing-sm))';
const bandHeight = 'calc(2 * var(--kioku-ui-spacing-sm))';
const rowHeight = 'calc(3 * var(--kioku-ui-spacing-xs))';
const markHeight = 'calc(2 * var(--kioku-ui-border-width))';
const formWidth = 'calc(4 * var(--kioku-ui-spacing-2xl))';
// A knob is the track height less its inset on both sides, so the pair
// survives a density change together rather than drifting apart.
const trackHeight =
  'calc(var(--kioku-ui-spacing-sm) + 2 * var(--kioku-ui-border-width))';
const trackWidth = 'calc(5 * var(--kioku-ui-spacing-xs))';
const knobSize = 'var(--kioku-ui-spacing-sm)';

const ring =
  'inset 0 0 0 var(--kioku-ui-border-width) var(--kioku-ui-border-default)';
const strongRing =
  'inset 0 0 0 var(--kioku-ui-border-width) var(--kioku-ui-border-strong)';

const stack: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--kioku-ui-spacing-xs)',
};

const row: CSSProperties = {
  display: 'flex',
  gap: 'var(--kioku-ui-spacing-xs)',
};

const paper: CSSProperties = {
  backgroundColor: 'var(--kioku-ui-color-surface)',
  borderRadius: 'var(--kioku-ui-radius-inner)',
  boxShadow: ring,
  boxSizing: 'border-box',
};

const sunken: CSSProperties = {
  backgroundColor: 'var(--kioku-ui-color-surface-muted)',
  borderRadius: 'var(--kioku-ui-radius-inner)',
  boxShadow: strongRing,
  boxSizing: 'border-box',
};

// The centred bodies are capped rather than fixed, so the same drawing works
// inside half a split as it does in the middle of a plate.
const centredBody: CSSProperties = {
  ...stack,
  inlineSize: '100%',
  maxInlineSize: formWidth,
};

/** One line of writing, at the ink rank the sketch needs it read at. */
function Mark({
  tone = 'edge',
  width,
}: {
  readonly tone?: 'edge' | 'ink' | 'strong';
  readonly width: string;
}) {
  const tones = {
    edge: 'var(--kioku-ui-border-default)',
    ink: 'var(--kioku-ui-color-text)',
    strong: 'var(--kioku-ui-border-strong)',
  } as const;

  return (
    <span
      style={{
        backgroundColor: tones[tone],
        blockSize: markHeight,
        display: 'block',
        flex: '0 0 auto',
        inlineSize: width,
      }}
    />
  );
}

/** A sunken control: the ladder says an input sits below the paper it is on. */
function Well({width}: {readonly width?: string}) {
  return (
    <span
      style={{
        ...sunken,
        blockSize: rowHeight,
        display: 'block',
        ...(width === undefined ? {} : {inlineSize: width}),
      }}
    />
  );
}

/** The emphatic action: ink, never accent, and one to a sketch. */
function Seal({width}: {readonly width: string}) {
  return (
    <span
      style={{
        backgroundColor: 'var(--kioku-ui-color-text)',
        blockSize: rowHeight,
        borderRadius: 'var(--kioku-ui-radius-inner)',
        display: 'block',
        inlineSize: width,
      }}
    />
  );
}

/**
 * A micro-control carries its state in the fill. Below about 20px a bordered
 * track reads as a field that failed to grow.
 */
function SwitchRow({on}: {readonly on: boolean}) {
  return (
    <span
      style={{
        alignItems: 'center',
        display: 'flex',
        gap: 'var(--kioku-ui-spacing-sm)',
        justifyContent: 'space-between',
      }}
    >
      <Mark tone={on ? 'strong' : 'edge'} width="52%" />
      <span
        style={{
          alignItems: 'center',
          backgroundColor: on
            ? 'var(--kioku-ui-color-text)'
            : 'var(--kioku-ui-color-surface-muted)',
          blockSize: trackHeight,
          borderRadius: 'var(--kioku-ui-radius-full)',
          boxShadow: on ? 'none' : strongRing,
          boxSizing: 'border-box',
          display: 'flex',
          flex: '0 0 auto',
          inlineSize: trackWidth,
          justifyContent: on ? 'flex-end' : 'flex-start',
          padding: 'var(--kioku-ui-border-width)',
        }}
      >
        <span
          style={{
            backgroundColor: 'var(--kioku-ui-color-surface)',
            blockSize: knobSize,
            borderRadius: 'var(--kioku-ui-radius-full)',
            boxShadow: on ? 'none' : strongRing,
            display: 'block',
            inlineSize: knobSize,
          }}
        />
      </span>
    </span>
  );
}

/** Three ranks of ink standing in for a page of running copy. */
function CopyLines() {
  return (
    <>
      <Mark tone="strong" width="58%" />
      <Mark width="92%" />
      <Mark width="84%" />
    </>
  );
}

function SketchBody({content}: {readonly content: SketchContent}) {
  switch (content) {
    case 'blank': {
      return <div style={{...paper, flex: 1}} />;
    }

    case 'copy': {
      return (
        <div
          style={{
            ...paper,
            ...stack,
            flex: 1,
            padding: 'var(--kioku-ui-spacing-xs)',
          }}
        >
          <CopyLines />
        </div>
      );
    }

    case 'tiles': {
      return (
        <div style={{...stack, flex: 1}}>
          <div style={{...row, blockSize: 'var(--kioku-ui-spacing-xl)'}}>
            <span style={{...paper, flex: 1}} />
            <span style={{...paper, flex: 1}} />
            <span style={{...paper, flex: 1}} />
          </div>
          <div
            style={{
              ...paper,
              ...stack,
              flex: 1,
              padding: 'var(--kioku-ui-spacing-xs)',
            }}
          >
            <CopyLines />
          </div>
        </div>
      );
    }

    case 'form': {
      return (
        <div style={centredBody}>
          <Mark tone="strong" width="30%" />
          <Well />
          <Well />
          <Seal width="42%" />
        </div>
      );
    }

    case 'sso': {
      return (
        <div style={centredBody}>
          <Seal width="100%" />
          <span
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: 'var(--kioku-ui-spacing-xs)',
            }}
          >
            <Mark width="100%" />
            <Mark tone="strong" width="var(--kioku-ui-spacing-sm)" />
            <Mark width="100%" />
          </span>
          <Well />
          <Well />
        </div>
      );
    }

    case 'notice-form': {
      return (
        <div style={centredBody}>
          <span
            style={{
              alignItems: 'center',
              backgroundColor: 'var(--kioku-ui-status-danger-surface)',
              blockSize: rowHeight,
              borderRadius: 'var(--kioku-ui-radius-inner)',
              // The summary is claimed by a bar at its leading edge, in the
              // text half of the danger pair the surface already uses.
              boxShadow: `inset ${markHeight} 0 0 0 var(--kioku-ui-status-danger-text)`,
              boxSizing: 'border-box',
              display: 'flex',
              paddingInline: 'var(--kioku-ui-spacing-sm)',
            }}
          >
            <span
              style={{
                backgroundColor: 'var(--kioku-ui-status-danger-text)',
                blockSize: markHeight,
                inlineSize: '38%',
              }}
            />
          </span>
          <Well />
          <Well />
          <span style={{display: 'flex', justifyContent: 'flex-end'}}>
            <Seal width="42%" />
          </span>
        </div>
      );
    }

    case 'provider-form': {
      return (
        <div style={centredBody}>
          <Well />
          <span
            style={{
              alignItems: 'center',
              blockSize: 'var(--kioku-ui-spacing-lg)',
              borderColor: 'var(--kioku-ui-border-strong)',
              borderRadius: 'var(--kioku-ui-radius-inner)',
              // Dashed, because the region is held for a frame this library
              // does not own: the payment provider mounts its own fields.
              borderStyle: 'dashed',
              borderWidth: 'var(--kioku-ui-border-width)',
              boxSizing: 'border-box',
              display: 'flex',
              gap: 'var(--kioku-ui-spacing-xs)',
              paddingInline: 'var(--kioku-ui-spacing-xs)',
            }}
          >
            <Mark tone="strong" width="52%" />
            <Mark width="24%" />
          </span>
          <span style={{display: 'flex', justifyContent: 'flex-end'}}>
            <Seal width="46%" />
          </span>
        </div>
      );
    }

    case 'columns': {
      return (
        <div style={{...row, flex: 1}}>
          <div
            style={{
              ...paper,
              ...stack,
              flex: 1,
              padding: 'var(--kioku-ui-spacing-xs)',
            }}
          >
            <Mark tone="strong" width="46%" />
            <Well />
            <Well />
          </div>
          <div
            style={{
              ...paper,
              ...stack,
              flex: 1,
              padding: 'var(--kioku-ui-spacing-xs)',
            }}
          >
            <Mark tone="strong" width="38%" />
            <Well />
            <span style={{display: 'flex', justifyContent: 'flex-end'}}>
              <Seal width="62%" />
            </span>
          </div>
        </div>
      );
    }

    case 'switches': {
      return (
        <div
          style={{
            ...paper,
            ...stack,
            ...centredBody,
            padding: 'var(--kioku-ui-spacing-xs)',
          }}
        >
          <SwitchRow on />
          <span
            style={{
              backgroundColor: 'var(--kioku-ui-border-default)',
              blockSize: 'var(--kioku-ui-border-width)',
              display: 'block',
            }}
          />
          <SwitchRow on={false} />
        </div>
      );
    }

    case 'transcript': {
      return (
        <div
          style={{
            ...paper,
            ...stack,
            flex: 1,
            padding: 'var(--kioku-ui-spacing-xs)',
          }}
        >
          <span style={{...sunken, blockSize: rowHeight, inlineSize: '62%'}} />
          <span
            style={{
              ...sunken,
              alignSelf: 'flex-end',
              blockSize: rowHeight,
              inlineSize: '50%',
            }}
          />
          <Well width="100%" />
        </div>
      );
    }

    case 'dialog': {
      return (
        <div
          style={{
            ...paper,
            ...stack,
            ...centredBody,
            boxShadow: strongRing,
            padding: 'var(--kioku-ui-spacing-xs)',
          }}
        >
          <Mark tone="ink" width="34%" />
          <Well />
          <span
            style={{
              display: 'flex',
              gap: 'var(--kioku-ui-spacing-xs)',
              justifyContent: 'flex-end',
            }}
          >
            <Well width="26%" />
            <Seal width="30%" />
          </span>
        </div>
      );
    }
  }
}

/**
 * A short column of destinations. A rail marks the row the reader is on with
 * ink alone — no bar, no added weight — so the miniature does the same.
 */
function Rail({width}: {readonly width: string}) {
  return (
    <div
      style={{
        ...paper,
        ...stack,
        flex: '0 0 auto',
        inlineSize: width,
        padding: 'var(--kioku-ui-spacing-xs)',
      }}
    >
      <Mark tone="ink" width="76%" />
      <Mark tone="strong" width="92%" />
      <Mark tone="strong" width="84%" />
    </div>
  );
}

/** A banner: the brand, then the destinations, the current one in ink. */
function Band() {
  return (
    <div
      style={{
        ...paper,
        alignItems: 'center',
        blockSize: bandHeight,
        display: 'flex',
        flex: '0 0 auto',
        gap: 'var(--kioku-ui-spacing-sm)',
        paddingInline: 'var(--kioku-ui-spacing-xs)',
      }}
    >
      <span
        style={{
          backgroundColor: 'var(--kioku-ui-color-text)',
          blockSize: markHeight,
          borderRadius: 'var(--kioku-ui-radius-full)',
          display: 'block',
          inlineSize: markHeight,
        }}
      />
      <Mark tone="ink" width="14%" />
      <Mark tone="strong" width="14%" />
      <Mark tone="strong" width="14%" />
    </div>
  );
}

/** The in-page outline: marks with no plate, because it sits on the canvas. */
function OutlineColumn() {
  return (
    <div
      style={{
        ...stack,
        flex: '0 0 auto',
        inlineSize: outlineWidth,
        paddingBlock: 'var(--kioku-ui-spacing-xs)',
      }}
    >
      <Mark tone="strong" width="88%" />
      <Mark width="64%" />
      <Mark width="76%" />
    </div>
  );
}

/**
 * Draws one template's structure. It is decoration for a title that already
 * says the same thing in words, so the plate is hidden from assistive
 * technology rather than described to it twice.
 */
export function TemplateThumbnail({sketch}: {readonly sketch: TemplateSketch}) {
  const {chrome, content} = sketch;
  const centred =
    chrome === 'card' ||
    chrome === 'modal' ||
    chrome === 'none' ||
    chrome === 'split';

  let inner: ReactNode = <SketchBody content={content} />;

  if (chrome === 'card') {
    inner = (
      <div
        style={{
          ...paper,
          ...centredBody,
          boxShadow: strongRing,
          padding: 'var(--kioku-ui-spacing-xs)',
        }}
      >
        <SketchBody content={content} />
      </div>
    );
  } else if (chrome === 'split') {
    inner = (
      <div style={{...row, blockSize: '100%', inlineSize: '100%'}}>
        <span
          style={{
            alignItems: 'center',
            backgroundColor: 'var(--kioku-ui-border-default)',
            borderRadius: 'var(--kioku-ui-radius-inner)',
            display: 'flex',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              backgroundColor: 'var(--kioku-ui-color-text)',
              blockSize: 'var(--kioku-ui-spacing-md)',
              borderRadius: 'var(--kioku-ui-radius-inner)',
              display: 'block',
              inlineSize: 'var(--kioku-ui-spacing-md)',
            }}
          />
        </span>
        <div
          style={{
            ...paper,
            alignItems: 'center',
            display: 'flex',
            flex: 1,
            padding: 'var(--kioku-ui-spacing-xs)',
          }}
        >
          <SketchBody content={content} />
        </div>
      </div>
    );
  } else if (chrome === 'rail' || chrome === 'list') {
    inner = (
      <div style={{...row, blockSize: '100%', inlineSize: '100%'}}>
        <Rail width={chrome === 'list' ? listWidth : railWidth} />
        <SketchBody content={content} />
      </div>
    );
  } else if (chrome === 'banner') {
    inner = (
      <div style={{...stack, blockSize: '100%', inlineSize: '100%'}}>
        <Band />
        <SketchBody content={content} />
      </div>
    );
  } else if (chrome === 'shell') {
    inner = (
      <div style={{...stack, blockSize: '100%', inlineSize: '100%'}}>
        <Band />
        <div style={{...row, flex: 1}}>
          <Rail width={railWidth} />
          <SketchBody content={content} />
          <OutlineColumn />
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{
        ...sunken,
        alignItems: centred ? 'center' : 'stretch',
        // The modal's ground is dimmed, which is the whole point of a modal:
        // the page behind it is still there and is no longer reachable.
        ...(chrome === 'modal'
          ? {backgroundColor: 'var(--kioku-ui-border-default)'}
          : {}),
        blockSize: plateHeight,
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: 'var(--kioku-ui-spacing-xs)',
      }}
    >
      {inner}
    </div>
  );
}

// ---------------------------------------------------------------------------

/** A figure is set in the mono face and tabular, so a row of them lines up. */
function Figure({children}: {readonly children: ReactNode}) {
  return (
    <span
      style={{
        color: 'var(--kioku-ui-color-text)',
        fontFamily: 'var(--kioku-ui-typography-font-family-mono)',
        fontSize: 'var(--kioku-ui-typography-font-size-sm)',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: 'var(--kioku-ui-typography-letter-spacing-mono)',
      }}
    >
      {children}
    </span>
  );
}

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

/** The hairline that keeps two figures from reading as one number. */
function Slash() {
  return (
    <span aria-hidden="true" style={{color: 'var(--kioku-ui-border-strong)'}}>
      /
    </span>
  );
}

/** An eyebrow, a figure, a note, and a rule that runs out to the margin. */
function SectionRule({
  count,
  label,
  note,
}: {
  readonly count: number;
  readonly label: string;
  readonly note: string;
}) {
  return (
    <HStack align="center" gap="md">
      <Eyebrow>{label}</Eyebrow>
      <Figure>{count}</Figure>
      <Text size="sm" tone="muted">
        {note}
      </Text>
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

// Hover is a wash laid *over* the surface, never a swap of it. The overlay
// token is a few per cent of ink; assigning it to `backgroundColor` throws the
// card's own fill away and lets the canvas show through, so the plate loses its
// ground at exactly the moment it is being pointed at.
const wash =
  'linear-gradient(var(--kioku-ui-color-overlay-hover), var(--kioku-ui-color-overlay-hover))';

/**
 * A whole surface that is one link. The wash is driven from React rather than
 * from `:hover`, because an inline style has no selectors — the same reason
 * this system drives state from React inside the library too. Focus takes the
 * wash as well, so a reader arriving by keyboard is shown the same thing a
 * reader arriving by pointer is.
 */
function LinkSurface({
  children,
  hovered: hoveredStyle,
  href,
  style,
}: {
  readonly children: ReactNode;
  readonly hovered?: CSSProperties;
  readonly href: string;
  readonly style: CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      onBlur={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        color: 'var(--kioku-ui-color-text)',
        display: 'block',
        textDecorationLine: 'none',
        transitionDuration: 'var(--kioku-ui-motion-duration-fast)',
        transitionProperty: 'background-image, border-color',
        transitionTimingFunction: 'var(--kioku-ui-motion-easing-standard)',
        ...style,
        ...(hovered ? {backgroundImage: wash, ...hoveredStyle} : {}),
      }}
    >
      {children}
    </a>
  );
}

function ReadyCard({entry}: {readonly entry: TemplateEntry}) {
  const sketch = sketches[entry.id];

  return (
    <LinkSurface
      href={templateHref(entry.id)}
      style={{
        // A card's own chrome, drawn here rather than borrowed from `Card`,
        // because the whole surface is the target and an anchor cannot be
        // wrapped around a plate without the plate covering its own wash.
        backgroundColor: 'var(--kioku-ui-color-surface)',
        borderRadius: 'var(--kioku-ui-radius-container)',
        boxShadow: 'var(--kioku-ui-elevation-low)',
        padding: 'var(--kioku-ui-spacing-lg)',
      }}
    >
      <Stack gap="sm">
        {sketch === undefined ? null : <TemplateThumbnail sketch={sketch} />}
        <HStack align="baseline" gap="sm" justify="between">
          <Heading level={3} size="subsection">
            {entry.title}
          </Heading>
          <span
            style={{
              color: 'var(--kioku-ui-color-text-muted)',
              fontFamily: 'var(--kioku-ui-typography-font-family-mono)',
              fontSize: 'var(--kioku-ui-typography-font-size-xs)',
              letterSpacing: 'var(--kioku-ui-typography-letter-spacing-mono)',
            }}
          >
            {entry.id}
          </span>
        </HStack>
        <Text size="sm" tone="secondary">
          {entry.description}
        </Text>
      </Stack>
    </LinkSurface>
  );
}

function PlannedRow({entry}: {readonly entry: TemplateEntry}) {
  return (
    <LinkSurface
      hovered={{borderColor: 'var(--kioku-ui-border-interactive)'}}
      href={templateHref(entry.id)}
      style={{
        alignItems: 'center',
        // Held space rather than a card: the outline says the id is reserved
        // and the page is not written yet. It still leads somewhere, because
        // the reservation is itself what a reader came here to check.
        borderColor: 'var(--kioku-ui-border-strong)',
        borderRadius: 'var(--kioku-ui-radius-element)',
        borderStyle: 'dashed',
        borderWidth: 'var(--kioku-ui-border-width)',
        display: 'flex',
        gap: 'var(--kioku-ui-spacing-sm)',
        justifyContent: 'space-between',
        minBlockSize: 'var(--kioku-ui-size-control-md)',
        paddingInline: 'var(--kioku-ui-spacing-sm)',
      }}
    >
      <Text size="sm" tone="secondary">
        {entry.title}
      </Text>
      <Eyebrow>{entry.category.toLocaleUpperCase('en')}</Eyebrow>
    </LinkSurface>
  );
}

/**
 * The template gallery. Categories are a tab strip rather than a row of
 * buttons: they choose which slice of one list is on show, and the current one
 * is marked with an underline in ink rather than a filled chip.
 */
export function TemplatesPage() {
  const [category, setCategory] = useState<TemplateCategory>('All');
  const resultsId = useId();

  const shown = useMemo(
    () =>
      category === 'All'
        ? templateCatalog
        : templateCatalog.filter((entry) => entry.category === category),
    [category],
  );

  const ready = shown.filter((entry) => entry.status === 'ready');
  const planned = shown.filter((entry) => entry.status === 'planned');

  return (
    <PageContainer>
      <Stack gap="xl">
        <HStack align="end" gap="2xl" justify="between" wrap>
          <Stack gap="sm">
            <Eyebrow>TEMPLATE GALLERY</Eyebrow>
            <Heading level={1} size="page">
              Templates
            </Heading>
            <Text style={{maxWidth: '68ch'}} tone="secondary">
              Whole pages, copied into your repository as source you own.
              Nothing here is a black box you import.
            </Text>
          </Stack>

          <Stack gap="sm">
            <Eyebrow>COPY ONE IN</Eyebrow>
            <CodeBlock
              wrap
              code="kioku-ui add pages dashboard"
              language="bash"
            />
          </Stack>
        </HStack>

        <HStack align="end" gap="lg" justify="between" wrap>
          <TabList
            label="Template category"
            onSelect={(id) => setCategory(id as TemplateCategory)}
            selectedId={category}
            style={{flex: 1}}
            tabs={templateCategories.map((entry) => ({
              controls: resultsId,
              id: entry,
              label: entry,
            }))}
          />
          <HStack
            align="baseline"
            aria-live="polite"
            gap="xs"
            style={{
              color: 'var(--kioku-ui-color-text-secondary)',
              fontFamily: 'var(--kioku-ui-typography-font-family-body)',
              fontSize: 'var(--kioku-ui-typography-font-size-sm)',
              letterSpacing: 'var(--kioku-ui-typography-letter-spacing-label)',
              paddingBlockEnd: 'var(--kioku-ui-spacing-md)',
            }}
          >
            <Figure>{ready.length}</Figure>
            <span>ready</span>
            <Slash />
            <Figure>{planned.length}</Figure>
            <span>planned</span>
            <Slash />
            <Figure>{shown.length}</Figure>
            <span>in the catalogue</span>
          </HStack>
        </HStack>

        <Stack gap="xl" id={resultsId}>
          <Stack gap="md">
            <SectionRule
              count={ready.length}
              label="READY"
              note="written into your repository today"
            />
            <div
              style={{
                display: 'grid',
                gap: 'var(--kioku-ui-spacing-lg)',
                gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${minimumReadyWidth}), 1fr))`,
              }}
            >
              {ready.map((entry) => (
                <ReadyCard entry={entry} key={entry.id} />
              ))}
            </div>
          </Stack>

          {planned.length === 0 ? null : (
            <Stack gap="md">
              <SectionRule
                count={planned.length}
                label="PLANNED"
                note="ids reserved, page not written yet — listed because hiding them would understate the catalogue"
              />
              <div
                style={{
                  display: 'grid',
                  gap: 'var(--kioku-ui-spacing-sm) var(--kioku-ui-spacing-md)',
                  gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${minimumPlannedWidth}), 1fr))`,
                }}
              >
                {planned.map((entry) => (
                  <PlannedRow entry={entry} key={entry.id} />
                ))}
              </div>
            </Stack>
          )}
        </Stack>
      </Stack>
    </PageContainer>
  );
}
