import {useRef, useState, type ComponentType, type CSSProperties} from 'react';
import type {ReactNode} from 'react';

import {
  Alert,
  AlertDialog,
  AppShell,
  AspectRatio,
  AsyncState,
  Avatar,
  AvatarGroup,
  Badge,
  Banner,
  Blockquote,
  BottomSheet,
  BottomSheetSwitcher,
  Box,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  CardFooter,
  CardHeader,
  Carousel,
  Center,
  ChatComposer,
  ChatLayout,
  ChatMessage,
  ChatMessageList,
  ChatMessageMetadata,
  ChatSystemMessage,
  ChatToolCalls,
  CheckboxInput,
  CheckboxList,
  Citation,
  ClickableCard,
  Code,
  CodeBlock,
  Collapsible,
  CommandPalette,
  ComplexSelector,
  ContextMenu,
  DateInput,
  DatePicker,
  DateRangeInput,
  DateTimeInput,
  Dialog,
  Divider,
  DropdownMenu,
  DropdownMenuItem,
  EmptyState,
  Eyebrow,
  Field,
  FieldStatus,
  FileInput,
  FormLayout,
  Grid,
  HStack,
  Heading,
  HoverCard,
  Icon,
  IconButton,
  Indicator,
  InputGroup,
  InternationalizationProvider,
  Item,
  Kbd,
  Layer,
  Layout,
  Lightbox,
  Link,
  LinkProvider,
  List,
  ListItem,
  Markdown,
  MetadataList,
  MetricGrid,
  MobileNav,
  MoreMenu,
  MultiSelector,
  NavIcon,
  NavItem,
  NavMenu,
  NumberInput,
  Numeral,
  Outline,
  OverflowList,
  Overlay,
  Pagination,
  Popover,
  PowerSearch,
  ProgressBar,
  RadioList,
  ResizeHandle,
  Resizable,
  Section,
  SegmentedControl,
  SelectableCard,
  Selector,
  SideNav,
  SideNavSection,
  Skeleton,
  Slider,
  Spinner,
  Stack,
  StatusDot,
  Switch,
  TabList,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  TextArea,
  TextInput,
  ThemeProvider,
  Thumbnail,
  TimeInput,
  Timestamp,
  Toast,
  ToastProvider,
  Toggle,
  ToggleButton,
  ToggleButtonGroup,
  Token,
  Tokenizer,
  Toolbar,
  Tooltip,
  TopNav,
  TopNavMegaMenu,
  TopNavMegaMenuFeaturedCard,
  TopNavMenu,
  TreeList,
  Typeahead,
  TypeaheadItem,
  VStack,
  VisuallyHidden,
  useTheme,
  useToast,
  type BottomSheetSwitcherView,
  type ChatToolCall,
  type Command,
  type DateRange,
  type SearchFilter,
  type TreeNode,
  type TypeaheadOption,
} from '@misoto22/kioku-ui';
import {kiokuThemes} from '@misoto22/kioku-ui-theme-kioku';

import {componentSlug} from '../router.js';

/**
 * The specimen registry: one entry per component in the catalogue, keyed by
 * the slug its page answers to.
 *
 * A specimen is the component doing its actual job at the size it is meant to
 * be seen, lifted from the component's own story so the site and Storybook
 * say the same thing about it. Where a component has variants, sizes or
 * states worth reading side by side, the specimen is a small labelled set;
 * where it is one thing, it is the one thing.
 *
 * Nothing here names a colour or a length. Every dimension the token contract
 * has no role for is a named `calc()` over the spacing scale, so a specimen
 * re-dresses with the theme the reader picks in the plate's tab strip and
 * grows with the density they chose.
 */

// ---------------------------------------------------------------------------
// Dimensions
//
// A width and a frame height are the two dimensions the contract has no role
// for. Both are written as relationships over the spacing scale rather than as
// lengths, so a specimen survives a density change instead of staying the size
// it was typed at.
// ---------------------------------------------------------------------------

const fieldWidth = 'calc(7 * var(--kioku-ui-spacing-2xl))';
const narrowWidth = 'calc(5 * var(--kioku-ui-spacing-2xl))';
const proseWidth = 'calc(11 * var(--kioku-ui-spacing-2xl))';
const slideWidth = 'calc(5 * var(--kioku-ui-spacing-2xl))';
const stageHeight = 'calc(7 * var(--kioku-ui-spacing-2xl))';
const pageHeight = 'calc(9 * var(--kioku-ui-spacing-2xl))';
const splitHeight = 'calc(5 * var(--kioku-ui-spacing-2xl))';

// A whole-page component cannot be shown at its own size inside a card. It is
// drawn at a ratio of it instead, and the frame inside is sized as that
// ratio's reciprocal so the drawing still fills the frame rather than sitting
// in the corner of it.
const pageScale = 0.7;
const pageExtent = `${String(100 / pageScale)}%`;

const figureStyle: CSSProperties = {
  color: 'var(--kioku-ui-color-text-muted)',
  fontFamily: 'var(--kioku-ui-typography-font-family-mono)',
  fontSize: 'var(--kioku-ui-typography-font-size-xs)',
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: 'var(--kioku-ui-typography-letter-spacing-mono)',
};

const frameStyle: CSSProperties = {
  backgroundColor: 'var(--kioku-ui-color-canvas)',
  borderRadius: 'var(--kioku-ui-radius-container)',
  boxShadow: 'var(--kioku-ui-elevation-low)',
  // A frame is a stage, not a specimen: it takes the plate's full measure even
  // when the stack around it is aligned to the start.
  inlineSize: '100%',
  overflow: 'hidden',
};

// ---------------------------------------------------------------------------
// The shapes a specimen is built from
// ---------------------------------------------------------------------------

/** One captioned specimen: the thing itself, and the name it answers to. */
function Piece({
  caption,
  children,
  mono = false,
  width,
}: {
  readonly caption: string;
  readonly children: ReactNode;
  readonly mono?: boolean;
  readonly width?: string;
}) {
  return (
    <Stack
      align="start"
      gap="sm"
      style={width === undefined ? undefined : {inlineSize: width}}
    >
      {children}
      {mono ? (
        <span style={figureStyle}>{caption}</span>
      ) : (
        <Eyebrow>{caption}</Eyebrow>
      )}
    </Stack>
  );
}

/** One labelled row of specimens inside the plate. */
function Row({
  children,
  label,
  note,
}: {
  readonly children: ReactNode;
  readonly label: string;
  readonly note: string;
}) {
  return (
    <Stack gap="sm">
      <Eyebrow>{label}</Eyebrow>
      <HStack align="start" gap="xl" wrap>
        {children}
      </HStack>
      <Text size="sm" tone="muted">
        {note}
      </Text>
    </Stack>
  );
}

/** A specimen that is one thing: the thing, and a line about what it does. */
function Single({
  children,
  note,
}: {
  readonly children: ReactNode;
  readonly note?: string;
}) {
  return (
    <Stack align="start" gap="md">
      {children}
      {note === undefined ? null : (
        <Text size="sm" tone="muted">
          {note}
        </Text>
      )}
    </Stack>
  );
}

/** A control that would otherwise stretch, held to the width a form gives it. */
function Column({
  children,
  width = fieldWidth,
}: {
  readonly children: ReactNode;
  readonly width?: string;
}) {
  return (
    <div style={{inlineSize: '100%', maxInlineSize: width}}>{children}</div>
  );
}

/** A bounded box for a component that fills whatever it is given. */
function Frame({
  children,
  height = stageHeight,
}: {
  readonly children: ReactNode;
  readonly height?: string;
}) {
  return <div style={{...frameStyle, blockSize: height}}>{children}</div>;
}

/**
 * A bounded stage for a surface that would otherwise leave the card.
 *
 * Two things put it back. The transform makes the stage the containing block
 * for `position: fixed`, so a scrim resolves against the stage rather than
 * against the viewport; the nested provider moves the portal target inside
 * the stage, because `Layer` renders into the theme root and the theme root
 * is otherwise the whole plate. The provider is bound to the theme, mode and
 * density the plate is already showing, so the stage re-dresses with the tab
 * strip like everything else.
 */
function Stage({
  children,
  height = stageHeight,
}: {
  readonly children: ReactNode;
  readonly height?: string;
}) {
  const {density, mode, theme} = useTheme();

  return (
    <div
      style={{
        ...frameStyle,
        alignItems: 'center',
        blockSize: height,
        display: 'flex',
        justifyContent: 'center',
        padding: 'var(--kioku-ui-spacing-lg)',
        position: 'relative',
        transform: 'translate(0)',
      }}
    >
      <ThemeProvider
        defaultDensity={density}
        defaultMode={mode}
        defaultThemeId={theme.id}
        themes={kiokuThemes}
      >
        {children}
      </ThemeProvider>
    </div>
  );
}

/**
 * Room for a surface that renders out of flow.
 *
 * An anchored surface measures itself against the viewport, so it cannot be
 * given a containing block the way a modal one can — a transform would move
 * it away from the anchor it is supposed to sit beside. The specimen keeps a
 * matching amount of the plate free under the trigger instead, and the
 * surface lands in it rather than over the line that explains it.
 */
function Reserve({
  children,
  height = stageHeight,
}: {
  readonly children: ReactNode;
  readonly height?: string;
}) {
  return <div style={{blockSize: height, inlineSize: '100%'}}>{children}</div>;
}

/** A whole-page component, drawn small enough to be read inside a card. */
function PageFrame({
  children,
  height = pageHeight,
}: {
  readonly children: ReactNode;
  readonly height?: string;
}) {
  return (
    <div style={{...frameStyle, blockSize: height}}>
      <div
        style={{
          blockSize: pageExtent,
          inlineSize: pageExtent,
          transform: `scale(${String(pageScale)})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** A stand-in for media, so a specimen fetches nothing to show a shape. */
function Placeholder({label}: {readonly label: string}) {
  return (
    <div
      style={{
        alignItems: 'center',
        backgroundColor: 'var(--kioku-ui-color-surface-muted)',
        blockSize: '100%',
        display: 'flex',
        inlineSize: '100%',
        justifyContent: 'center',
      }}
    >
      <Text size="sm" tone="muted">
        {label}
      </Text>
    </div>
  );
}

// An inline SVG keeps a specimen self-contained instead of fetching an asset.
// The colours are written bare and encoded once: pre-escaping the hash would
// survive encodeURIComponent as `%2523`, which is not a colour, and the image
// would paint the browser's fallback black.
const cover =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#b8c4c0"/><circle cx="32" cy="26" r="12" fill="#f4efe6"/></svg>',
  );

function CheckPath() {
  return (
    <path
      d="M20 6 9 17l-5-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
  );
}

function HomeGlyph() {
  return (
    <Icon>
      <path
        d="m4 11 8-7 8 7v9H4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </Icon>
  );
}

function InboxButton() {
  return (
    <IconButton aria-label="Inbox" variant="secondary">
      <Icon>
        <path
          d="M4 6h16v12H4Zm0 0 8 6 8-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </Icon>
    </IconButton>
  );
}

function Glyph({d}: {readonly d: string}) {
  return (
    <Icon>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </Icon>
  );
}

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

/**
 * Hover and focus are pointer and keyboard states, so they are described here
 * rather than painted — a hand-painted hover is a claim about the component
 * rather than a reading of it.
 */
function ButtonSpecimen() {
  return (
    <Stack gap="lg">
      <Row
        label="Variant"
        note="One seal per scope. Everything beside the primary is secondary or ghost, and destructive is reserved for the action that cannot be undone."
      >
        <Piece caption="Primary">
          <Button>Save changes</Button>
        </Piece>
        <Piece caption="Secondary">
          <Button variant="secondary">Cancel</Button>
        </Piece>
        <Piece caption="Ghost">
          <Button variant="ghost">Discard draft</Button>
        </Piece>
        <Piece caption="Destructive">
          <Button variant="destructive">Delete entry</Button>
        </Piece>
      </Row>

      <Divider />

      <Row
        label="Size"
        note="Each size names a fixed control height from the size scale. Only lg comes up to body size; the smaller two reach the hit target through a pseudo-element rather than by growing."
      >
        {/*
          Secondary, all three: the seal is one per scope and the variant row
          above already spent it. A row of three ink buttons would claim three.
        */}
        <Piece caption="sm" mono>
          <Button size="sm" variant="secondary">
            Save
          </Button>
        </Piece>
        <Piece caption="md" mono>
          <Button size="md" variant="secondary">
            Save
          </Button>
        </Piece>
        <Piece caption="lg" mono>
          <Button size="lg" variant="secondary">
            Save
          </Button>
        </Piece>
      </Row>

      <Divider />

      <Row
        label="State"
        note="Hover is a wash and focus is a thin accent ring held off the edge; both belong to the pointer and the keyboard, so they are named here rather than drawn. Loading sets aria-busy and disables activation."
      >
        <Piece caption="Rest">
          <Button variant="secondary">Save</Button>
        </Piece>
        <Piece caption="Disabled">
          <Button disabled variant="secondary">
            Save
          </Button>
        </Piece>
        <Piece caption="Loading">
          <Button loading variant="secondary">
            Saving
          </Button>
        </Piece>
      </Row>
    </Stack>
  );
}

const alignments = ['Left', 'Centre', 'Right'] as const;

function AlignmentGroup({
  orientation,
}: {
  readonly orientation?: 'horizontal' | 'vertical';
}) {
  const [chosen, setChosen] = useState<string>('Left');

  return (
    <ButtonGroup label="Alignment" {...(orientation ? {orientation} : {})}>
      {alignments.map((alignment) => (
        <ToggleButton
          key={alignment}
          onPressedChange={() => {
            setChosen(alignment);
          }}
          pressed={chosen === alignment}
          size="sm"
        >
          {alignment}
        </ToggleButton>
      ))}
    </ButtonGroup>
  );
}

function ButtonGroupSpecimen() {
  return (
    <Row
      label="Orientation"
      note="The actions here are alternatives to each other; reach for Toolbar when they are separate commands."
    >
      <Piece caption="Horizontal">
        <AlignmentGroup orientation="horizontal" />
      </Piece>
      <Piece caption="Vertical">
        <AlignmentGroup orientation="vertical" />
      </Piece>
    </Row>
  );
}

/**
 * The menu is shown open: its rows run the full width of the plate, which is
 * not something a closed trigger can show. Opening a menu moves focus to its
 * first item, which is what the component does whenever it opens.
 */
function DropdownMenuSpecimen() {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(true);

  return (
    <Single note="The menu is one tab stop. Arrow keys, Home and End move between items; Escape closes it, and the trigger brings it back.">
      <Reserve>
        <span ref={anchorRef} style={{display: 'inline-flex'}}>
          <Button
            onClick={() => {
              setOpen((value) => !value);
            }}
            variant="secondary"
          >
            Release actions
          </Button>
        </span>
      </Reserve>
      <DropdownMenu
        anchorRef={anchorRef}
        label="Release actions"
        onDismiss={() => {
          setOpen(false);
        }}
        open={open}
      >
        <DropdownMenuItem>Publish</DropdownMenuItem>
        <DropdownMenuItem description="Keeps the release out of search">
          Archive
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Delete</DropdownMenuItem>
      </DropdownMenu>
    </Single>
  );
}

/** The row shapes, shown inside the only surface they are valid in. */
function DropdownMenuItemSpecimen() {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(true);

  return (
    <Single note="A row is a solid block inside the plate: no hairline of its own, the pointer marked by a wash and a bookmark rather than by a fill.">
      <Reserve>
        <span ref={anchorRef} style={{display: 'inline-flex'}}>
          <Button
            onClick={() => {
              setOpen((value) => !value);
            }}
            variant="secondary"
          >
            Row shapes
          </Button>
        </span>
      </Reserve>
      <DropdownMenu
        anchorRef={anchorRef}
        label="Row shapes"
        onDismiss={() => {
          setOpen(false);
        }}
        open={open}
      >
        <DropdownMenuItem>Plain</DropdownMenuItem>
        <DropdownMenuItem description="A second line of context">
          With a description
        </DropdownMenuItem>
        <DropdownMenuItem trailing={<Kbd>⌘P</Kbd>}>
          With a hint
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Unavailable</DropdownMenuItem>
      </DropdownMenu>
    </Single>
  );
}

function IconButtonSpecimen() {
  return (
    <Stack gap="lg">
      <Row
        label="Variant"
        note="The glyph carries no name of its own, so every icon-only control names itself with aria-label."
      >
        <Piece caption="Primary">
          <IconButton aria-label="Add view">+</IconButton>
        </Piece>
        <Piece caption="Secondary">
          <IconButton aria-label="Go back" variant="secondary">
            ←
          </IconButton>
        </Piece>
        <Piece caption="Ghost">
          <IconButton aria-label="Close notice" variant="ghost">
            ×
          </IconButton>
        </Piece>
        <Piece caption="Destructive">
          <IconButton aria-label="Remove view" variant="destructive">
            −
          </IconButton>
        </Piece>
      </Row>

      <Divider />

      <Row
        label="Size"
        note="A square control reaches the 44px hit target through a pseudo-element rather than by growing its visual box."
      >
        <Piece caption="sm" mono>
          <IconButton
            aria-label="Small add action"
            size="sm"
            variant="secondary"
          >
            +
          </IconButton>
        </Piece>
        <Piece caption="md" mono>
          <IconButton aria-label="Add action" variant="secondary">
            +
          </IconButton>
        </Piece>
        <Piece caption="lg" mono>
          <IconButton
            aria-label="Large add action"
            size="lg"
            variant="secondary"
          >
            +
          </IconButton>
        </Piece>
        <Piece caption="loading">
          <IconButton aria-label="Saving view" loading variant="secondary" />
        </Piece>
        <Piece caption="disabled">
          <IconButton
            aria-label="Remove unavailable"
            disabled
            variant="secondary"
          >
            −
          </IconButton>
        </Piece>
      </Row>
    </Stack>
  );
}

function LinkSpecimen() {
  return (
    <Card>
      <Stack gap="sm">
        <Text>Workspace shortcuts</Text>
        <Link href="#/components/button">Review recent activity</Link>
        <Link href="https://example.com/help">Help center</Link>
        <Text size="sm" tone="muted">
          A link goes somewhere; a Button does something. The host decides how
          the anchor is rendered through LinkProvider.
        </Text>
      </Stack>
    </Card>
  );
}

/**
 * MoreMenu owns its open state, so the trigger is the resting specimen. The
 * reserved room underneath is where the menu lands when it is pressed.
 */
function MoreMenuSpecimen() {
  return (
    <Single note="MoreMenu owns its open state, so a row with no other reason to hold state does not grow one. Press the trigger to open the menu.">
      <Reserve>
        {/*
          Held to a reading measure rather than run to the plate's full width:
          a trigger against the right edge of the viewport makes the menu flip
          and clamp, which is correct behaviour and a poor specimen of it.
        */}
        <Column width={proseWidth}>
          <Card>
            <Item
              description="Updated moments ago"
              trailing={
                <MoreMenu label="Release actions">
                  <DropdownMenuItem>Publish</DropdownMenuItem>
                  <DropdownMenuItem>Archive</DropdownMenuItem>
                </MoreMenu>
              }
            >
              Release notes
            </Item>
          </Card>
        </Column>
      </Reserve>
    </Single>
  );
}

/** A context menu opens on a secondary click and nothing else. */
function ContextMenuSpecimen() {
  return (
    <Single note="The menu anchors to the click point, so it flips and clamps with the same rules as any other anchored surface.">
      <Reserve>
        <ContextMenu
          label="Release actions"
          menu={
            <>
              <DropdownMenuItem>Open</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
            </>
          }
        >
          <Card>
            <Text>Release 12 — secondary-click for actions</Text>
          </Card>
        </ContextMenu>
      </Reserve>
    </Single>
  );
}

const rangeOptions = [
  {label: 'Week', value: 'week'},
  {label: 'Month', value: 'month'},
  {label: 'Quarter', value: 'quarter'},
];

function SegmentedControlSpecimen() {
  return (
    <Row
      label="State"
      note="The current option is marked, not filled: full-strength ink on the label and an ink rail along its edge — beneath it when the options run across, down its leading edge when they stack. The raised fill this used to carry measured 1.03:1 against the groove in every dark skin."
    >
      <Piece caption="Horizontal">
        <SegmentedControl
          aria-label="Activity range"
          defaultValue="month"
          options={rangeOptions}
        />
      </Piece>
      <Piece caption="Vertical">
        <SegmentedControl
          aria-label="Activity range, vertical"
          defaultValue="month"
          options={rangeOptions}
          orientation="vertical"
        />
      </Piece>
      <Piece caption="Disabled">
        <SegmentedControl
          aria-label="Disabled activity range"
          defaultValue="month"
          disabled
          options={rangeOptions}
        />
      </Piece>
    </Row>
  );
}

function ToggleButtonSpecimen() {
  return (
    <Row
      label="State"
      note="It reports state through aria-pressed: a command that stays on, not a setting that applies on its own."
    >
      <Piece caption="Off">
        <ToggleButton>Bold</ToggleButton>
      </Piece>
      <Piece caption="On">
        <ToggleButton defaultPressed>Bold</ToggleButton>
      </Piece>
      <Piece caption="Disabled off">
        <ToggleButton disabled>Bold</ToggleButton>
      </Piece>
      <Piece caption="Disabled on">
        <ToggleButton defaultPressed disabled>
          Bold
        </ToggleButton>
      </Piece>
    </Row>
  );
}

const alignmentOptions = [
  {label: 'Left', value: 'left'},
  {label: 'Centre', value: 'centre'},
  {label: 'Right', value: 'right'},
];

const formatOptions = [
  {label: 'Bold', value: 'bold'},
  {label: 'Italic', value: 'italic'},
  {label: 'Underline', value: 'underline'},
];

function SingleToggleGroup({
  orientation,
}: {
  readonly orientation?: 'horizontal' | 'vertical';
}) {
  const [value, setValue] = useState('left');

  return (
    <ToggleButtonGroup
      label="Alignment"
      onValueChange={setValue}
      options={alignmentOptions}
      {...(orientation ? {orientation} : {})}
      size="sm"
      value={value}
    />
  );
}

function MultipleToggleGroup() {
  const [value, setValue] = useState<readonly string[]>(['bold']);

  return (
    <ToggleButtonGroup
      label="Formatting"
      onValueChange={setValue}
      options={formatOptions}
      selectionMode="multiple"
      size="sm"
      value={value}
    />
  );
}

function ToggleButtonGroupSpecimen() {
  return (
    <Row
      label="Selection"
      note="A single-select group never empties: pressing the active option again leaves it pressed, so the control never says nothing is chosen."
    >
      <Piece caption="Single">
        <SingleToggleGroup />
      </Piece>
      <Piece caption="Multiple">
        <MultipleToggleGroup />
      </Piece>
      <Piece caption="Vertical">
        <SingleToggleGroup orientation="vertical" />
      </Piece>
    </Row>
  );
}

const toolbarControls = (
  <>
    <IconButton aria-label="Bold" variant="ghost">
      <Glyph d="M7 5h6a3.5 3.5 0 0 1 0 7H7Zm0 7h7a3.5 3.5 0 0 1 0 7H7Z" />
    </IconButton>
    <IconButton aria-label="Italic" variant="ghost">
      <Glyph d="M14 5h-4M14 19h-4M14 5 10 19" />
    </IconButton>
    <IconButton aria-label="Underline" variant="ghost">
      <Glyph d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14" />
    </IconButton>
  </>
);

function ToolbarSpecimen() {
  return (
    <Row
      label="Orientation"
      note="A toolbar of ten buttons costs one Tab press, not ten: arrow keys move between the controls inside it."
    >
      <Piece caption="Horizontal">
        <Toolbar label="Text style">{toolbarControls}</Toolbar>
      </Piece>
      <Piece caption="Vertical">
        <Toolbar label="Text style, vertical" orientation="vertical">
          {toolbarControls}
        </Toolbar>
      </Piece>
    </Row>
  );
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

function ChatComposerSpecimen() {
  return (
    <Stack gap="md">
      <Column width={proseWidth}>
        <ChatComposer
          label="Message"
          onSend={() => {
            /* A specimen has nowhere to send to. */
          }}
          placeholder="Ask about a release"
        />
      </Column>
      <Column width={proseWidth}>
        <ChatComposer
          disabled
          label="Message"
          onSend={() => {
            /* A specimen has nowhere to send to. */
          }}
          placeholder="Waiting for a reply"
        />
      </Column>
      <Text size="sm" tone="muted">
        Enter sends and Shift+Enter starts a new line, which is what a reader
        expects from every other chat field.
      </Text>
    </Stack>
  );
}

const transcript = [
  {author: 'reader' as const, id: '1', text: 'Which releases are still open?'},
  {
    author: 'assistant' as const,
    id: '2',
    text: 'Three are open: 12, 13, and 14.',
  },
];

function ChatLayoutSpecimen() {
  const [messages, setMessages] = useState(transcript);

  return (
    <Single note="The transcript scrolls and the composer stays put, so the field a reader is typing into never leaves the screen.">
      <Frame>
        <div style={{blockSize: '100%'}}>
          <ChatLayout
            composer={
              <ChatComposer
                label="Message"
                onSend={(text) => {
                  setMessages((current) => [
                    ...current,
                    {
                      author: 'reader' as const,
                      id: String(current.length + 1),
                      text,
                    },
                  ]);
                }}
                placeholder="Ask about a release"
              />
            }
          >
            <ChatMessageList label="Conversation">
              {messages.map((message) => (
                <ChatMessage
                  author={message.author}
                  authorName={message.author === 'reader' ? 'You' : 'Kioku'}
                  key={message.id}
                >
                  {message.text}
                </ChatMessage>
              ))}
            </ChatMessageList>
          </ChatLayout>
        </div>
      </Frame>
    </Single>
  );
}

function ChatMessageSpecimen() {
  return (
    <Single note="The author is named in text rather than implied by which side the bubble sits on, because alignment is invisible to a screen reader.">
      <ChatMessageList label="Conversation">
        <ChatMessage author="reader" authorName="You">
          Which releases are still open?
        </ChatMessage>
        <ChatMessage author="assistant" authorName="Kioku">
          Three are open: 12, 13, and 14.
        </ChatMessage>
        <ChatMessage author="assistant" authorName="Kioku" pending>
          waiting
        </ChatMessage>
      </ChatMessageList>
    </Single>
  );
}

function ChatMessageListSpecimen() {
  return (
    <Single note="New messages are announced politely, so a reply arrives without losing the reader's place.">
      <ChatMessageList label="Conversation">
        <ChatSystemMessage>Conversation started</ChatSystemMessage>
        {transcript.map((message) => (
          <ChatMessage
            author={message.author}
            authorName={message.author === 'reader' ? 'You' : 'Kioku'}
            key={message.id}
          >
            {message.text}
          </ChatMessage>
        ))}
      </ChatMessageList>
    </Single>
  );
}

function ChatMessageMetadataSpecimen() {
  return (
    <Single note="Figures are set in the mono face with tabular numerals, so a column of latencies lines up.">
      <ChatMessageList label="Conversation">
        <ChatMessage author="assistant" authorName="Kioku">
          <Stack gap="sm">
            <Text>Published.</Text>
            <ChatMessageMetadata
              entries={[
                {label: 'Model', value: 'kioku-1'},
                {label: 'Latency', value: '1.2s'},
                {label: 'Tokens', value: '482'},
              ]}
            />
          </Stack>
        </ChatMessage>
      </ChatMessageList>
    </Single>
  );
}

function ChatSystemMessageSpecimen() {
  return (
    <Single note="A note from the system rather than from a participant, so it takes no author and no bubble.">
      <ChatMessageList label="Conversation">
        <ChatSystemMessage>Conversation started</ChatSystemMessage>
        <ChatMessage author="reader" authorName="You">
          Publish release 12.
        </ChatMessage>
        <ChatSystemMessage>Model switched to kioku-1</ChatSystemMessage>
      </ChatMessageList>
    </Single>
  );
}

const toolCalls: readonly ChatToolCall[] = [
  {id: '1', name: 'search_releases', status: 'done'},
  {detail: '3 rows', id: '2', name: 'read_table', status: 'done'},
  {id: '3', name: 'summarise', status: 'running'},
];

function ChatToolCallsSpecimen() {
  return (
    <Single note="Listing the calls keeps the work behind a reply inspectable.">
      <ChatMessageList label="Conversation">
        <ChatMessage author="assistant" authorName="Kioku">
          <Stack gap="sm">
            <Text>Three releases are still open.</Text>
            <ChatToolCalls calls={toolCalls} />
          </Stack>
        </ChatMessage>
      </ChatMessageList>
    </Single>
  );
}

// ---------------------------------------------------------------------------
// Container
// ---------------------------------------------------------------------------

function CardExample({
  elevation,
}: {
  readonly elevation?: 'low' | 'medium' | 'none';
}) {
  return (
    <Card {...(elevation === undefined ? {} : {elevation})}>
      <Stack gap="xs">
        <Text>Workspace access</Text>
        <Text size="sm" tone="muted">
          18 active members
        </Text>
      </Stack>
    </Card>
  );
}

function CardSpecimen() {
  return (
    <Row
      label="Elevation"
      note="A card is a surface plus a ring shadow and no border: elevation and border are mutually exclusive, and stacking them draws the line twice."
    >
      <Piece caption="none" mono width={narrowWidth}>
        <CardExample elevation="none" />
      </Piece>
      <Piece caption="low" mono width={narrowWidth}>
        <CardExample elevation="low" />
      </Piece>
      <Piece caption="medium" mono width={narrowWidth}>
        <CardExample elevation="medium" />
      </Piece>
    </Row>
  );
}

function CardHeaderSpecimen() {
  return (
    <Single note="The header bleeds to the card's edge by negating the container's padding token exactly, so its rule runs the full width.">
      <Column width={proseWidth}>
        <Card elevation="low">
          <CardHeader>
            <Stack gap="xs">
              <Heading level={2} size="subsection">
                Workspace access
              </Heading>
              <Text tone="secondary">
                Review membership before publishing changes.
              </Text>
            </Stack>
          </CardHeader>
          <Text>18 active members</Text>
        </Card>
      </Column>
    </Single>
  );
}

function CardFooterSpecimen() {
  return (
    <Single note="The footer is where a card's actions go, separated by a rule that runs the full width rather than by a gap.">
      <Column width={proseWidth}>
        <Card elevation="low">
          <Text>18 active members</Text>
          <CardFooter>
            <Button variant="secondary">Review access</Button>
          </CardFooter>
        </Card>
      </Column>
    </Single>
  );
}

function Slide({label}: {readonly label: string}) {
  return (
    <div style={{inlineSize: slideWidth}}>
      <AspectRatio ratio={4 / 3}>
        <Placeholder label={label} />
      </AspectRatio>
    </div>
  );
}

function CarouselSpecimen() {
  return (
    <Single note="The viewport itself is focusable and scrollable, so the slides stay reachable even if the arrow controls are never used.">
      <Carousel label="Screenshots">
        <Slide label="Dashboard" />
        <Slide label="Settings" />
        <Slide label="Release notes" />
        <Slide label="Audit log" />
      </Carousel>
    </Single>
  );
}

function ClickableCardSpecimen() {
  return (
    <Row
      label="State"
      note="The whole surface is one tab stop, so never nest another control inside it."
    >
      <Piece caption="Rest" width={narrowWidth}>
        <ClickableCard>
          <Stack gap="xs">
            <Text>Release 12</Text>
            <Text size="sm" tone="secondary">
              Twelve changes, ready to review
            </Text>
          </Stack>
        </ClickableCard>
      </Piece>
      <Piece caption="Disabled" width={narrowWidth}>
        <ClickableCard disabled>
          <Stack gap="xs">
            <Text>Release 11</Text>
            <Text size="sm" tone="secondary">
              Archived
            </Text>
          </Stack>
        </ClickableCard>
      </Piece>
    </Row>
  );
}

function CollapsibleSpecimen() {
  return (
    <Row
      label="State"
      note="The panel stays in the DOM when folded, so find-in-page still reaches it."
    >
      <Piece caption="Folded" width={narrowWidth}>
        <Collapsible label="Advanced settings">
          <Text>Hidden until asked for.</Text>
        </Collapsible>
      </Piece>
      <Piece caption="Open" width={narrowWidth}>
        <Collapsible defaultOpen label="Release notes">
          <Text>Twelve changes are ready to review.</Text>
        </Collapsible>
      </Piece>
    </Row>
  );
}

function SelectableCardSpecimen() {
  return (
    <Row
      label="State"
      note="A card that is a radio: the whole surface is the control, and the mark is a rule at its edge rather than a fill."
    >
      <Piece caption="Unselected" width={narrowWidth}>
        <SelectableCard
          description="Twelve seats included"
          label="Standard"
          name="plan-unselected"
          value="standard"
        />
      </Piece>
      <Piece caption="Selected" width={narrowWidth}>
        <SelectableCard
          defaultChecked
          description="Unlimited seats"
          label="Team"
          name="plan-selected"
          value="team"
        />
      </Piece>
      <Piece caption="Disabled" width={narrowWidth}>
        <SelectableCard
          description="Ask an administrator"
          disabled
          label="Enterprise"
          name="plan-disabled"
          value="enterprise"
        />
      </Piece>
    </Row>
  );
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

function AvatarSpecimen() {
  return (
    <Stack gap="lg">
      <Row
        label="Size"
        note="Round is reserved for shapes that are genuinely circular: an avatar, a status dot, a knob."
      >
        <Piece caption="sm" mono>
          <Avatar name="Ada Lovelace" size="sm" />
        </Piece>
        <Piece caption="md" mono>
          <Avatar name="Ada Lovelace" size="md" />
        </Piece>
        <Piece caption="lg" mono>
          <Avatar name="Ada Lovelace" size="lg" />
        </Piece>
      </Row>

      <Divider />

      <Row
        label="Source"
        note="The name stays the accessible label whether the image loads or not, and a failed image falls back to initials rather than to a broken glyph."
      >
        <Piece caption="Initials">
          <Avatar name="Ada Lovelace" />
        </Piece>
        <Piece caption="One word">
          <Avatar name="Ada" />
        </Piece>
        <Piece caption="Image">
          <Avatar name="Ada Lovelace" src={cover} />
        </Piece>
        <Piece caption="Broken image">
          <Avatar name="Ada Lovelace" src="/missing.png" />
        </Piece>
      </Row>
    </Stack>
  );
}

const members = [
  {name: 'Ada Lovelace'},
  {name: 'Alan Turing'},
  {name: 'Grace Hopper'},
  {name: 'Katherine Johnson'},
  {name: 'Margaret Hamilton'},
];

function AvatarGroupSpecimen() {
  return (
    <Row
      label="Overflow"
      note="One label covers the whole group, so a screen reader hears the count rather than five separate images."
    >
      <Piece caption="Everyone fits">
        <AvatarGroup label="Reviewers" members={members.slice(0, 3)} />
      </Piece>
      <Piece caption="Capped at three">
        <AvatarGroup label="Reviewers" max={3} members={members} />
      </Piece>
    </Row>
  );
}

function BlockquoteSpecimen() {
  return (
    <Column width={proseWidth}>
      <Blockquote attribution="Ada Lovelace, 1843">
        The engine weaves algebraic patterns just as the loom weaves flowers.
      </Blockquote>
    </Column>
  );
}

function CitationSpecimen() {
  return (
    <Single note="The marker is decorative; the source name stays in the accessible name.">
      <Column width={proseWidth}>
        <Text>
          Errors follow the problem-details format{' '}
          <Citation href="https://example.com/rfc9457" marker="1">
            RFC 9457
          </Citation>
          , so a client can branch on the type rather than on the prose.
        </Text>
      </Column>
    </Single>
  );
}

function CodeSpecimen() {
  return (
    <Column width={proseWidth}>
      <Text>
        Wrap the application in <Code>ThemeProvider</Code> and import{' '}
        <Code>@misoto22/kioku-ui/styles.css</Code> once at the entry point.
      </Text>
    </Column>
  );
}

const snippet = [
  "import {ThemeProvider} from '@misoto22/kioku-ui';",
  '',
  'export function App({children}) {',
  '  return <ThemeProvider themes={themes}>{children}</ThemeProvider>;',
  '}',
].join('\n');

function CodeBlockSpecimen() {
  return (
    <Single note="The copy control reports its own result, so a reader knows the copy happened.">
      <Column width={proseWidth}>
        <CodeBlock code={snippet} language="tsx" />
      </Column>
    </Single>
  );
}

function EmptyStateSpecimen() {
  return (
    <Row
      label="Size"
      note="The empty state brings its own plate, so it is placed on the canvas rather than inside a Card: nesting one would draw the same edge twice."
    >
      <Piece caption="Compact" width={proseWidth}>
        <EmptyState
          detail="New updates will appear here."
          size="compact"
          title="No recent activity"
        />
      </Piece>
      <Piece caption="Default" width={proseWidth}>
        <EmptyState
          action={<Button variant="secondary">Create group</Button>}
          detail="Create a group to organize upcoming work."
          title="No delivery groups"
          visual={<span aria-hidden="true">◇</span>}
        />
      </Piece>
    </Row>
  );
}

function EyebrowSpecimen() {
  return (
    <Row
      label="Tone"
      note="The label of last resort: smallest size, opened right up, second rank of ink. It names a thing without competing with it."
    >
      <Piece caption="Secondary">
        <Eyebrow>Recent activity</Eyebrow>
      </Piece>
      <Piece caption="Muted">
        <Eyebrow tone="muted">Sorted by updated</Eyebrow>
      </Piece>
      <Piece caption="Danger">
        <Eyebrow tone="danger">Danger zone</Eyebrow>
      </Piece>
    </Row>
  );
}

function HeadingSpecimen() {
  return (
    <Stack gap="lg">
      <Row
        label="Size"
        note="Every size sets the letter-spacing its size calls for: tracking runs inverse to size, so a page title is opened less than an eyebrow and more than body copy."
      >
        <Piece caption="page" mono>
          <Heading level={2} size="page">
            Workspace overview
          </Heading>
        </Piece>
        <Piece caption="section" mono>
          <Heading level={2} size="section">
            Delivery activity
          </Heading>
        </Piece>
        <Piece caption="subsection" mono>
          <Heading level={3} size="subsection">
            Pending review
          </Heading>
        </Piece>
      </Row>

      <Divider />

      <Row
        label="Family"
        note="The display face is for a page title and nothing smaller; everything inside the page is set in the interface face."
      >
        <Piece caption="Interface">
          <Heading level={2} size="section">
            Workspace access
          </Heading>
        </Piece>
        <Piece caption="Display">
          <Heading family="display" level={2} size="page">
            A calmer workspace
          </Heading>
        </Piece>
      </Row>
    </Stack>
  );
}

function IconSpecimen() {
  return (
    <Stack gap="lg">
      <Row
        label="Size"
        note="An icon with no label stays out of the accessibility tree; one with a label is announced in place of its glyph."
      >
        <Piece caption="inherit" mono>
          <Text>
            Inline{' '}
            <Icon label="Completed">
              <CheckPath />
            </Icon>{' '}
            with text
          </Text>
        </Piece>
        <Piece caption="sm" mono>
          <Icon label="Completed" size="sm">
            <CheckPath />
          </Icon>
        </Piece>
        <Piece caption="md" mono>
          <Icon label="Completed" size="md">
            <CheckPath />
          </Icon>
        </Piece>
        <Piece caption="lg" mono>
          <Icon label="Completed" size="lg">
            <CheckPath />
          </Icon>
        </Piece>
      </Row>

      <Divider />

      <Row
        label="Tone"
        note="Three ranks of ink and the accent. Reaching for a fill usually means the ranks were not used."
      >
        <Piece caption="Primary">
          <Icon label="Primary" size="lg">
            <CheckPath />
          </Icon>
        </Piece>
        <Piece caption="Secondary">
          <Icon label="Secondary" size="lg" tone="secondary">
            <CheckPath />
          </Icon>
        </Piece>
        <Piece caption="Muted">
          <Icon label="Muted" size="lg" tone="muted">
            <CheckPath />
          </Icon>
        </Piece>
        <Piece caption="Accent">
          <Icon label="Accent" size="lg" tone="accent">
            <CheckPath />
          </Icon>
        </Piece>
      </Row>
    </Stack>
  );
}

function KbdSpecimen() {
  return (
    <Column width={proseWidth}>
      <Text>
        Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to open the search field, then{' '}
        <Kbd>Esc</Kbd> to dismiss it.
      </Text>
    </Column>
  );
}

const markdownSource = [
  '## Release 12',
  '',
  'Ready to **publish** with *twelve* changes. Run `pnpm release` to ship.',
  '',
  '- Accessibility baseline refreshed',
  '- Tokens renamed for clarity',
  '',
  '> Focus order now matches reading order.',
  '',
  'See the [release runbook](https://example.com/runbook).',
].join('\n');

function MarkdownSpecimen() {
  return (
    <Single note="Raw HTML is never interpreted and only http(s) or root-relative links survive, so untrusted text stays inert.">
      <Column width={proseWidth}>
        <Markdown source={markdownSource} />
      </Column>
    </Single>
  );
}

function NumeralSpecimen() {
  return (
    <Single note="Numeral sets no size and no colour: the figure in a title is title-sized and the figure in a footnote is footnote-sized. Only the mono face and the tabular figures are its own.">
      <Column width={proseWidth}>
        <Card elevation="low">
          <CardHeader>
            <HStack align="baseline" gap="md" justify="between">
              <Eyebrow>Outstanding invoices</Eyebrow>
              <Text size="sm" tone="muted">
                <Numeral>18</Numeral> of <Numeral>24</Numeral>
              </Text>
            </HStack>
          </CardHeader>
          <Stack gap="xs">
            <Heading level={2} size="page">
              <Numeral>1,204.50</Numeral>
            </Heading>
            <Text size="sm" tone="secondary">
              Settled <Numeral>2026-08-18</Numeral>, and every figure above
              lines up on the same stems.
            </Text>
          </Stack>
        </Card>
      </Column>
    </Single>
  );
}

function TextSpecimen() {
  return (
    <Stack gap="lg">
      <Row
        label="Tone"
        note="Three ranks of ink do the work colour would: what is current, what is available, what is context."
      >
        <Piece caption="Primary">
          <Text>Delivery schedule confirmed.</Text>
        </Piece>
        <Piece caption="Secondary">
          <Text tone="secondary">Updated moments ago</Text>
        </Piece>
        <Piece caption="Muted">
          <Text tone="muted">No additional details</Text>
        </Piece>
      </Row>

      <Divider />

      <Row
        label="Size"
        note="Body copy is set solid; the label and eyebrow sizes are the ones that open up."
      >
        <Piece caption="sm" mono>
          <Text size="sm">Small metadata for supporting context.</Text>
        </Piece>
        <Piece caption="md" mono>
          <Text>Default body copy for product interfaces.</Text>
        </Piece>
        <Piece caption="lg" mono>
          <Text size="lg">Large copy for a concise statement.</Text>
        </Piece>
      </Row>
    </Stack>
  );
}

function ThumbnailSpecimen() {
  return (
    <Stack gap="lg">
      <Row
        label="Size"
        note="A fixed square, so a column of rows keeps its rhythm whatever the source image is shaped like."
      >
        <Piece caption="sm" mono>
          <Thumbnail alt="Release cover" size="sm" src={cover} />
        </Piece>
        <Piece caption="md" mono>
          <Thumbnail alt="Release cover" size="md" src={cover} />
        </Piece>
        <Piece caption="lg" mono>
          <Thumbnail alt="Release cover" size="lg" src={cover} />
        </Piece>
      </Row>

      <Divider />

      <Row
        label="State"
        note="A failed image degrades to text rather than to a broken-image glyph."
      >
        <Piece caption="Loaded">
          <Thumbnail alt="Release cover" src={cover} />
        </Piece>
        <Piece caption="Failed">
          <Thumbnail alt="Release cover" src="/missing.png" />
        </Piece>
        <Piece caption="Failed with fallback">
          <Thumbnail
            alt="Release cover"
            fallback="No preview"
            src="/missing.png"
          />
        </Piece>
      </Row>
    </Stack>
  );
}

function TimestampSpecimen() {
  return (
    <Single note="The date a reader sees and the one a parser reads cannot drift apart: both come from the same machine-readable value.">
      <Column width={proseWidth}>
        <Item
          description={<Timestamp value="2026-08-18T09:30:00.000Z" />}
          trailing={
            <Text size="sm" tone="muted">
              v12
            </Text>
          }
        >
          Release notes published
        </Item>
      </Column>
    </Single>
  );
}

function TokenRow() {
  const [tags, setTags] = useState(['release', 'docs', 'a11y']);

  return (
    <HStack gap="xs" wrap>
      {tags.map((tag) => (
        <Token
          key={tag}
          onRemove={() => {
            setTags((current) => current.filter((entry) => entry !== tag));
          }}
          removeLabel={`Remove ${tag}`}
        >
          {tag}
        </Token>
      ))}
    </HStack>
  );
}

function TokenSpecimen() {
  return (
    <Stack gap="lg">
      <Row
        label="Shape"
        note="A token is not a capsule: it takes the element radius like every other control."
      >
        <Piece caption="Plain">
          <Token>release</Token>
        </Piece>
        <Piece caption="Removable">
          <Token
            onRemove={() => {
              /* The removable specimen below owns the state. */
            }}
            removeLabel="Remove release"
          >
            release
          </Token>
        </Piece>
      </Row>

      <Divider />

      <Row
        label="In use"
        note="Each remove control names the value it clears, so a screen reader hears which token is going."
      >
        <TokenRow />
      </Row>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Data input
// ---------------------------------------------------------------------------

function CalendarSpecimen() {
  const [value, setValue] = useState('2026-08-18');

  return (
    <Single note="Arrow keys move by day and week, Home and End reach the ends of the week, Page Up and Page Down move by month, so the whole grid costs one Tab press.">
      <Calendar label="Release date" onValueChange={setValue} value={value} />
    </Single>
  );
}

function CheckboxInputSpecimen() {
  return (
    <Row
      label="State"
      note="A micro-control is a solid block, not a tiny outlined box: below about 20px the state is carried by the fill."
    >
      <Piece caption="Unchecked">
        <CheckboxInput label="Notify subscribers" />
      </Piece>
      <Piece caption="Checked">
        <CheckboxInput defaultChecked label="Notify subscribers" />
      </Piece>
      <Piece caption="Indeterminate">
        <CheckboxInput indeterminate label="Notify subscribers" />
      </Piece>
      <Piece caption="With description">
        <CheckboxInput
          description="Sends one message per release"
          label="Notify subscribers"
        />
      </Piece>
      <Piece caption="Disabled">
        <CheckboxInput defaultChecked disabled label="Notify subscribers" />
      </Piece>
    </Row>
  );
}

const channels = [
  {label: 'Email', value: 'email'},
  {description: 'Posts to the release channel', label: 'Chat', value: 'chat'},
  {disabled: true, label: 'Post', value: 'post'},
];

function CheckboxListSpecimen() {
  const [value, setValue] = useState<readonly string[]>(['email']);

  return (
    <Single note="Any number of options can hold at once; use RadioList when they exclude each other.">
      <Column>
        <CheckboxList
          legend="Notify by"
          onValueChange={setValue}
          options={channels}
          value={value}
        />
      </Column>
    </Single>
  );
}

const teams = [
  {
    label: 'Engineering',
    options: [
      {label: 'Ada Lovelace', value: 'ada'},
      {label: 'Alan Turing', value: 'alan'},
    ],
  },
  {label: 'Design', options: [{label: 'Grace Hopper', value: 'grace'}]},
];

function ComplexSelectorSpecimen() {
  const [value, setValue] = useState('ada');

  return (
    <Single note="One list, grouped by the thing the options belong to, so a long set stays scannable.">
      <Column>
        <Field description="Grouped by team." label="Owner">
          <ComplexSelector
            groups={teams}
            onValueChange={setValue}
            value={value}
          />
        </Field>
      </Column>
    </Single>
  );
}

function DateInputSpecimen() {
  const [value, setValue] = useState('2026-08-18');

  return (
    <Row
      label="State"
      note="The well always belonged to this system; what sat inside it did not. The separators now recede to the muted rank, an empty control reads muted throughout so it is not mistaken for an answered one, and the calendar control is a cell in the well rather than the engine's own glyph — it opens the platform picker, which is what keeps the wheel on a phone and the reader's own date order."
    >
      <Piece caption="With a date" width={fieldWidth}>
        <DateInput
          aria-label="Release date"
          onValueChange={setValue}
          value={value}
        />
      </Piece>
      <Piece caption="Empty" width={fieldWidth}>
        <DateInput aria-label="Release date, empty" />
      </Piece>
      <Piece caption="Disabled" width={fieldWidth}>
        <DateInput
          aria-label="Release date, disabled"
          defaultValue="2026-08-18"
          disabled
        />
      </Piece>
    </Row>
  );
}

function DatePickerSpecimen() {
  const [value, setValue] = useState('2026-08-20');

  return (
    <Row
      label="State"
      note="The month grid here is this system's own, not the engine's. That is worth paying for only when the sheet has to belong to the page — a bound to show, two months to place side by side. For a lone date `DateInput` is still the better trade, because the platform picker brings the phone wheel and the accessibility tree with it."
    >
      <Piece caption="With a date" width={fieldWidth}>
        <DatePicker
          label="Release date"
          onValueChange={setValue}
          value={value}
        />
      </Piece>
      <Piece caption="Empty" width={fieldWidth}>
        <DatePicker label="Release date, empty" />
      </Piece>
      <Piece caption="Bounded" width={fieldWidth}>
        <DatePicker
          defaultValue="2026-08-20"
          label="Release date, bounded"
          max="2026-08-31"
          min="2026-08-10"
        />
      </Piece>
    </Row>
  );
}

function DateRangeInputSpecimen() {
  const [value, setValue] = useState<DateRange>({
    end: '2026-08-31',
    start: '2026-08-01',
  });

  return (
    <Single note="The end control refuses dates before the start, so an impossible range cannot be entered in the first place.">
      <Column width={proseWidth}>
        <DateRangeInput
          legend="Reporting period"
          onValueChange={setValue}
          value={value}
        />
      </Column>
    </Single>
  );
}

function DateTimeInputSpecimen() {
  const [value, setValue] = useState('2026-08-18T09:30');

  return (
    <Single note="Local time in the field, ISO on the wire.">
      <Column>
        <Field description="Local time, exchanged as ISO." label="Publish at">
          <DateTimeInput onValueChange={setValue} value={value} />
        </Field>
      </Column>
    </Single>
  );
}

function FieldSpecimen() {
  return (
    <Row
      label="State"
      note="The label, the description and the status all belong to the control: Field wires them together so the caller never has to name an id."
    >
      <Piece caption="Required" width={fieldWidth}>
        <Field
          description="Used to identify this view in the workspace."
          label="View name"
          necessity="required"
        >
          <TextInput defaultValue="Weekly delivery review" />
        </Field>
      </Piece>
      <Piece caption="Optional with status" width={fieldWidth}>
        <Field
          label="Workspace URL"
          necessity="optional"
          status="This address is available."
          statusTone="success"
        >
          <TextInput defaultValue="operations-hub" />
        </Field>
      </Piece>
      <Piece caption="Invalid" width={fieldWidth}>
        <Field label="Workspace URL" status="Use letters, numbers, or hyphens.">
          <TextInput defaultValue="operations hub" readOnly />
        </Field>
      </Piece>
    </Row>
  );
}

function FieldStatusSpecimen() {
  return (
    <Row
      label="Tone"
      note="A status colour is used only as a matched surface and text pair; a status line never reaches for the accent."
    >
      <Piece caption="Info">
        <FieldStatus tone="info">Saved moments ago.</FieldStatus>
      </Piece>
      <Piece caption="Success">
        <FieldStatus tone="success">This address is available.</FieldStatus>
      </Piece>
      <Piece caption="Warning">
        <FieldStatus tone="warning">This will notify subscribers.</FieldStatus>
      </Piece>
      <Piece caption="Danger">
        <FieldStatus tone="danger">Enter a release number.</FieldStatus>
      </Piece>
    </Row>
  );
}

function FileInputSpecimen() {
  return (
    <Row
      label="State"
      note="The control names the files it holds, so a reader is never left guessing whether the choice registered."
    >
      <Piece caption="One file" width={fieldWidth}>
        <FileInput aria-label="Attachment" />
      </Piece>
      <Piece caption="Several files" width={fieldWidth}>
        <FileInput aria-label="Screenshots" multiple />
      </Piece>
      <Piece caption="Disabled" width={fieldWidth}>
        <FileInput aria-label="Archived uploads" disabled />
      </Piece>
    </Row>
  );
}

function InputGroupSpecimen() {
  return (
    <Row
      label="Affix"
      note="Affixes are decorative; the label carries the meaning, so a screen reader is never read a bare unit."
    >
      <Piece caption="Prefix" width={narrowWidth}>
        <InputGroup prefix="AUD">
          <NumberInput aria-label="Deposit" defaultValue={40} />
        </InputGroup>
      </Piece>
      <Piece caption="Suffix" width={narrowWidth}>
        <InputGroup suffix="/month">
          <NumberInput aria-label="Allowance" defaultValue={12} />
        </InputGroup>
      </Piece>
      <Piece caption="Both" width={narrowWidth}>
        <InputGroup prefix="AUD" suffix="/month">
          <NumberInput aria-label="Price" defaultValue={120} />
        </InputGroup>
      </Piece>
    </Row>
  );
}

const people = [
  {label: 'Ada Lovelace', value: 'ada'},
  {label: 'Alan Turing', value: 'alan'},
  {label: 'Grace Hopper', value: 'grace'},
];

function MultiSelectorSpecimen() {
  const [value, setValue] = useState<readonly string[]>(['ada']);

  return (
    <Single note="Each choice is held as a removable token, so the answer is readable without opening the list again.">
      <Column>
        <Field
          description="Everyone who signs off this release."
          label="Owners"
        >
          <MultiSelector
            label="Owners"
            onValueChange={setValue}
            options={people}
            value={value}
          />
        </Field>
      </Column>
    </Single>
  );
}

function NumberInputSpecimen() {
  const [value, setValue] = useState<number | undefined>(12);

  return (
    <Row
      label="State"
      note="An empty field reads as unanswered rather than as zero, so the two stay distinguishable."
    >
      <Piece caption="With a value" width={narrowWidth}>
        <NumberInput
          aria-label="Count"
          onValueChange={setValue}
          value={value}
        />
      </Piece>
      <Piece caption="Empty" width={narrowWidth}>
        <NumberInput aria-label="Count, empty" />
      </Piece>
      <Piece caption="Disabled" width={narrowWidth}>
        <NumberInput aria-label="Count, disabled" defaultValue={12} disabled />
      </Piece>
    </Row>
  );
}

function PowerSearchSpecimen() {
  const [filters, setFilters] = useState<readonly SearchFilter[]>([
    {id: 'open', label: 'Status: open'},
    {id: 'mine', label: 'Owner: me'},
  ]);
  const [query, setQuery] = useState('');

  return (
    <Stack gap="md">
      <Column width={proseWidth}>
        <PowerSearch
          filters={filters}
          label="Search releases"
          onFiltersChange={setFilters}
          onSearch={setQuery}
          placeholder="Search releases"
        />
      </Column>
      <Text size="sm" tone="muted">
        {query === ''
          ? 'Each narrowing is visible and removable, so a short result set never looks like a bug.'
          : `Searched for: ${query}`}
      </Text>
    </Stack>
  );
}

const scopes = [
  {description: 'Anyone with the link', label: 'Public', value: 'public'},
  {label: 'Unlisted', value: 'unlisted'},
  {disabled: true, label: 'Private', value: 'private'},
];

function RadioListSpecimen() {
  const [value, setValue] = useState('public');

  return (
    <Single note="The legend states the question, so a screen reader announces it before reading the answers.">
      <Column>
        <RadioList
          legend="Visibility"
          onValueChange={setValue}
          options={scopes}
          value={value}
        />
      </Column>
    </Single>
  );
}

const owners = [
  {label: 'Ada Lovelace', value: 'ada'},
  {label: 'Grace Hopper', value: 'grace'},
  {disabled: true, label: 'Alan Turing', value: 'alan'},
];

function SelectorSpecimen() {
  const [value, setValue] = useState('ada');

  return (
    <Row
      label="State"
      note="A native select underneath, so the platform's own picker opens on a phone rather than a list this library would have to reimplement."
    >
      <Piece caption="Chosen" width={fieldWidth}>
        <Selector
          aria-label="Owner"
          onValueChange={setValue}
          options={owners}
          value={value}
        />
      </Piece>
      <Piece caption="With a prompt" width={fieldWidth}>
        <Selector
          aria-label="Owner, unanswered"
          options={owners}
          placeholder="Choose an owner"
        />
      </Piece>
      <Piece caption="Disabled" width={fieldWidth}>
        <Selector aria-label="Owner, disabled" disabled options={owners} />
      </Piece>
    </Row>
  );
}

function LiveSlider({step}: {readonly step?: number}) {
  const [value, setValue] = useState(40);

  return (
    <Slider
      aria-label={step === undefined ? 'Rollout' : 'Rollout, stepped'}
      formatValue={(current) => `${String(current)} percent`}
      onValueChange={setValue}
      {...(step === undefined ? {} : {step})}
      value={value}
    />
  );
}

function SliderSpecimen() {
  return (
    <Row
      label="State"
      note="The readout is the control's own, in tabular figures beside the track. A knob is the track height less its inset on both sides, so the pair survives a density change together."
    >
      <Piece caption="Continuous" width={fieldWidth}>
        <LiveSlider />
      </Piece>
      <Piece caption="Stepped" width={fieldWidth}>
        <LiveSlider step={25} />
      </Piece>
      <Piece caption="Disabled" width={fieldWidth}>
        <Slider aria-label="Rollout, disabled" defaultValue={40} disabled />
      </Piece>
    </Row>
  );
}

function SwitchSpecimen() {
  return (
    <Row
      label="State"
      note="A switch applies as soon as it is flipped. Use CheckboxInput instead when the value is only submitted with a form."
    >
      <Piece caption="Off">
        <Switch>Live updates</Switch>
      </Piece>
      <Piece caption="On">
        <Switch defaultPressed>Live updates</Switch>
      </Piece>
      <Piece caption="Disabled off">
        <Switch disabled>Live updates</Switch>
      </Piece>
      <Piece caption="Disabled on">
        <Switch defaultPressed disabled>
          Live updates
        </Switch>
      </Piece>
    </Row>
  );
}

function ToggleSpecimen() {
  return (
    <Row
      label="State"
      note="A command that stays on, reported through aria-pressed. There is no invented pressed state: :active exists only while the pointer is down."
    >
      <Piece caption="Off">
        <Toggle aria-label="Delivery alerts off">Delivery alerts</Toggle>
      </Piece>
      <Piece caption="On">
        <Toggle aria-label="Delivery alerts on" defaultPressed>
          Delivery alerts
        </Toggle>
      </Piece>
      <Piece caption="Disabled off">
        <Toggle aria-label="Disabled reminder" disabled>
          Reminder
        </Toggle>
      </Piece>
      <Piece caption="Disabled on">
        <Toggle aria-label="Managed security alerts" defaultPressed disabled>
          Security alerts
        </Toggle>
      </Piece>
    </Row>
  );
}

function TextAreaSpecimen() {
  return (
    <Row
      label="State"
      note="Invalid re-declares every state it has to beat, and read-only is styled apart from disabled: one is a value you cannot change, the other a control that is switched off."
    >
      <Piece caption="Rest" width={fieldWidth}>
        <TextArea
          aria-label="Activity note"
          defaultValue="Delivery schedule confirmed."
        />
      </Piece>
      <Piece caption="Read only" width={fieldWidth}>
        <TextArea
          aria-label="Published note"
          defaultValue="Workspace access was reviewed."
          readOnly
        />
      </Piece>
      <Piece caption="Invalid" width={fieldWidth}>
        <TextArea
          aria-invalid="true"
          aria-label="Invalid note"
          defaultValue="A clear summary is required."
          readOnly
        />
      </Piece>
      <Piece caption="Disabled" width={fieldWidth}>
        <TextArea
          aria-label="Archived note"
          defaultValue="Editing is unavailable for archived updates."
          disabled
        />
      </Piece>
    </Row>
  );
}

function TextInputSpecimen() {
  return (
    <Row
      label="State"
      note="The field sinks below the card it sits on, and its edge is a real border rather than a shadow."
    >
      <Piece caption="Rest" width={fieldWidth}>
        <TextInput aria-label="Workspace name" defaultValue="Operations" />
      </Piece>
      <Piece caption="Placeholder" width={fieldWidth}>
        <TextInput aria-label="Saved view name" placeholder="Weekly activity" />
      </Piece>
      <Piece caption="Read only" width={fieldWidth}>
        <TextInput aria-label="Account ID" defaultValue="ACCT-2048" readOnly />
      </Piece>
      <Piece caption="Invalid" width={fieldWidth}>
        <TextInput
          aria-invalid="true"
          aria-label="Workspace URL"
          defaultValue="operations hub"
          readOnly
        />
      </Piece>
      <Piece caption="Disabled" width={fieldWidth}>
        <TextInput
          aria-label="Managed organization"
          defaultValue="Northwind Operations"
          disabled
        />
      </Piece>
    </Row>
  );
}

function TimeInputSpecimen() {
  const [value, setValue] = useState('09:30');

  return (
    <Single note="A time is a figure, so it is set in the mono face and lines up with the dates beside it.">
      <Column>
        <Field description="Exchanged as an ISO string." label="Start time">
          <TimeInput onValueChange={setValue} value={value} />
        </Field>
      </Column>
    </Single>
  );
}

function TokenizerSpecimen() {
  const [tags, setTags] = useState<readonly string[]>(['release', 'docs']);

  return (
    <Single note="Enter or a comma commits a tag; Backspace removes the last one.">
      <Column>
        <Field label="Tags">
          <Tokenizer
            label="Tags"
            onValueChange={setTags}
            placeholder="Add a tag"
            value={tags}
          />
        </Field>
      </Column>
    </Single>
  );
}

const candidates: readonly TypeaheadOption[] = [
  {label: 'Ada Lovelace', value: 'ada'},
  {label: 'Alan Turing', value: 'alan'},
  {label: 'Grace Hopper', value: 'grace'},
];

function TypeaheadSpecimen() {
  const [query, setQuery] = useState('');
  const matches = candidates.filter((person) =>
    person.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Single note="Focus stays in the field while aria-activedescendant names the highlighted option, so typing and choosing never fight for focus. Type a letter to open the list.">
      <Column>
        <Field description="Type to filter the list." label="Owner">
          <Typeahead
            inputValue={query}
            onInputValueChange={setQuery}
            onSelect={(option) => {
              setQuery(option.label);
            }}
            options={matches}
          />
        </Field>
      </Column>
    </Single>
  );
}

// A list of options is a set, and a set sits on a surface with an edge — the
// same plate the component's own popup is painted with.
const listboxStyle: CSSProperties = {
  backgroundColor: 'var(--kioku-ui-color-surface-raised)',
  borderRadius: 'var(--kioku-ui-radius-container)',
  boxShadow: 'var(--kioku-ui-elevation-medium)',
  listStyle: 'none',
  margin: 0,
  paddingBlock: 'var(--kioku-ui-spacing-xs)',
  paddingInline: 0,
};

function TypeaheadItemSpecimen() {
  return (
    <Single note="What a caller rendering its own suggestion list uses. Active is the row aria-activedescendant points at, which is not the row that holds focus.">
      <Column>
        <ul aria-label="Owner suggestions" role="listbox" style={listboxStyle}>
          <TypeaheadItem active description="Engineering">
            Ada Lovelace
          </TypeaheadItem>
          <TypeaheadItem description="Design">Grace Hopper</TypeaheadItem>
          <TypeaheadItem disabled>Alan Turing</TypeaheadItem>
        </ul>
      </Column>
    </Single>
  );
}

// ---------------------------------------------------------------------------
// Feedback & status
// ---------------------------------------------------------------------------

function AlertSpecimen() {
  return (
    <Row
      label="Tone"
      note="A status colour is a matched surface and text pair; danger announces assertively and everything else politely."
    >
      <Piece caption="Info" width={proseWidth}>
        <Alert>Maintenance is scheduled for this evening.</Alert>
      </Piece>
      <Piece caption="Success" width={proseWidth}>
        <Alert tone="success">The delivery view was saved.</Alert>
      </Piece>
      <Piece caption="Warning" width={proseWidth}>
        <Alert tone="warning">Two filters need review before publishing.</Alert>
      </Piece>
      <Piece caption="Danger" width={proseWidth}>
        <Alert tone="danger">Workspace access could not be updated.</Alert>
      </Piece>
    </Row>
  );
}

function AsyncStateSpecimen() {
  return (
    <Row
      label="Kind"
      note="One component for the four things a request can be, so a page never invents a fifth."
    >
      <Piece caption="Loading" width={narrowWidth}>
        <AsyncState state={{kind: 'loading', label: 'Loading saved views'}} />
      </Piece>
      <Piece caption="Empty" width={proseWidth}>
        <AsyncState
          state={{
            detail: 'Save a filtered view to return to it quickly.',
            kind: 'empty',
            title: 'No saved views yet',
          }}
        />
      </Piece>
      <Piece caption="Error" width={proseWidth}>
        <AsyncState
          state={{
            detail: 'Try again after checking your connection.',
            kind: 'error',
            retry: <Button variant="secondary">Retry</Button>,
            title: 'Activity is temporarily unavailable',
          }}
        />
      </Piece>
      <Piece caption="Ready" width={narrowWidth}>
        <AsyncState state={{data: '12 updates', kind: 'ready'}}>
          {(summary) => <Text>{summary} are ready to review.</Text>}
        </AsyncState>
      </Piece>
    </Row>
  );
}

function BadgeSpecimen() {
  return (
    <Row
      label="Tone"
      note="A badge is a state, not a control: eyebrow-sized type opened right up, and never a coloured pill."
    >
      <Piece caption="Neutral">
        <Badge>Draft</Badge>
      </Piece>
      <Piece caption="Info">
        <Badge tone="info">Scheduled</Badge>
      </Piece>
      <Piece caption="Success">
        <Badge tone="success">Delivered</Badge>
      </Piece>
      <Piece caption="Warning">
        <Badge tone="warning">Needs review</Badge>
      </Piece>
      <Piece caption="Danger">
        <Badge tone="danger">Action needed</Badge>
      </Piece>
    </Row>
  );
}

function BannerSpecimen() {
  return (
    <Stack gap="lg">
      <Row
        label="Tone"
        note="A banner speaks for the whole page. Use Alert for a message about one region and Toast for one that passes on its own."
      >
        <Piece caption="Info" width={proseWidth}>
          <Banner>Billing details expire in three days.</Banner>
        </Piece>
        <Piece caption="Warning" width={proseWidth}>
          <Banner tone="warning">Two filters need review.</Banner>
        </Piece>
        <Piece caption="Danger" width={proseWidth}>
          <Banner tone="danger">Workspace access is unavailable.</Banner>
        </Piece>
      </Row>

      <Divider />

      <Row
        label="With an action"
        note="The action sits at the end of the band, at the small size, so it answers the message without out-ranking the page."
      >
        <Piece caption="Actionable" width={proseWidth}>
          <Banner
            actions={
              <Button size="sm" variant="secondary">
                Update billing
              </Button>
            }
            tone="warning"
          >
            Billing details expire in three days.
          </Banner>
        </Piece>
      </Row>
    </Stack>
  );
}

function IndicatorSpecimen() {
  return (
    <Row
      label="Tone"
      note="The label is what a screen reader hears; a bare number beside an icon means nothing on its own."
    >
      <Piece caption="Count">
        <Indicator count={3} label="3 unread messages">
          <InboxButton />
        </Indicator>
      </Piece>
      <Piece caption="Capped">
        <Indicator count={140} label="140 unread messages" max={99}>
          <InboxButton />
        </Indicator>
      </Piece>
      <Piece caption="Dot only">
        <Indicator label="Unread messages">
          <InboxButton />
        </Indicator>
      </Piece>
      <Piece caption="Danger">
        <Indicator count={2} label="2 failed uploads" tone="danger">
          <InboxButton />
        </Indicator>
      </Piece>
    </Row>
  );
}

function ProgressBarSpecimen() {
  return (
    <Row
      label="State"
      note="Omitting the value reports work of unknown length. The track is a capsule because it genuinely is one."
    >
      <Piece caption="Starting" width={fieldWidth}>
        <ProgressBar label="Uploading, starting" value={5} />
      </Piece>
      <Piece caption="Halfway" width={fieldWidth}>
        <ProgressBar label="Uploading, halfway" value={50} />
      </Piece>
      <Piece caption="Complete" width={fieldWidth}>
        <ProgressBar label="Uploading, complete" value={100} />
      </Piece>
      <Piece caption="Unknown length" width={fieldWidth}>
        <ProgressBar label="Uploading, unknown length" />
      </Piece>
    </Row>
  );
}

function SkeletonSpecimen() {
  return (
    <Row
      label="State"
      note="One skeleton in a group carries the label; the rest are decorative, so a screen reader hears the wait once rather than four times."
    >
      <Piece caption="Announced" width={fieldWidth}>
        <Skeleton label="Loading delivery summary" />
      </Piece>
      <Piece caption="Decorative" width={fieldWidth}>
        <Skeleton />
      </Piece>
      <Piece caption="Grouped" width={fieldWidth}>
        <Stack gap="sm">
          <Skeleton label="Loading workspace overview" />
          <Skeleton />
          <Skeleton />
        </Stack>
      </Piece>
    </Row>
  );
}

function SpinnerSpecimen() {
  return (
    <Single note="The keyframe carries a reduced-motion guard, so a reader who asked for stillness gets a static mark rather than a spin.">
      <Card>
        <Stack align="center" gap="md">
          <Spinner label="Publishing workspace changes" />
          <Text tone="secondary">Publishing workspace changes…</Text>
        </Stack>
      </Card>
    </Single>
  );
}

function StatusDotSpecimen() {
  return (
    <Row
      label="Tone"
      note="Round, because a dot genuinely is. It names itself, since colour alone is not a status."
    >
      <Piece caption="Info">
        <StatusDot aria-label="Update scheduled" tone="info" />
      </Piece>
      <Piece caption="Success">
        <StatusDot aria-label="Service available" tone="success" />
      </Piece>
      <Piece caption="Warning">
        <StatusDot aria-label="Service degraded" tone="warning" />
      </Piece>
      <Piece caption="Danger">
        <StatusDot aria-label="Service unavailable" tone="danger" />
      </Piece>
    </Row>
  );
}

function ToastSpecimen() {
  return (
    <Stack gap="lg">
      <Row
        label="Tone"
        note="A floating surface takes elevation and no border. Place these through ToastProvider rather than rendering them by hand."
      >
        <Piece caption="Info" width={proseWidth}>
          <Toast description="Twelve edits kept." title="Draft saved" />
        </Piece>
        <Piece caption="Success" width={proseWidth}>
          <Toast title="Release published" tone="success" />
        </Piece>
        <Piece caption="Warning" width={proseWidth}>
          <Toast title="Two filters need review" tone="warning" />
        </Piece>
        <Piece caption="Danger" width={proseWidth}>
          <Toast title="Upload failed" tone="danger" />
        </Piece>
      </Row>

      <Divider />

      <Row
        label="With an action"
        note="One action, at the end, secondary — a notification that passes on its own must not out-rank the page it passes over."
      >
        <Piece caption="Undoable" width={proseWidth}>
          <Toast
            action={<Button variant="secondary">Undo</Button>}
            description="Twelve edits kept."
            title="Draft saved"
            tone="success"
          />
        </Piece>
      </Row>
    </Stack>
  );
}

function ToastControls() {
  const {show} = useToast();

  return (
    <Stack align="start" gap="sm">
      <Text size="sm" tone="secondary">
        Every notification lands in one polite live region.
      </Text>
      <HStack gap="sm" wrap>
        <Button
          onClick={() => {
            show({
              description: 'Twelve edits kept.',
              title: 'Draft saved',
              tone: 'success',
            });
          }}
          variant="secondary"
        >
          Save draft
        </Button>
        <Button
          onClick={() => {
            show({title: 'Upload failed', tone: 'danger'});
          }}
          variant="secondary"
        >
          Fail an upload
        </Button>
      </HStack>
    </Stack>
  );
}

/**
 * A provider draws nothing of its own, so the specimen shows its effect: the
 * queue and the live region it owns, raised from a control that only asks for
 * a notification. The stage keeps the toasts inside the card.
 */
function ToastProviderSpecimen() {
  return (
    <Single note="Place one provider near the root of a host application and request notifications through useToast. The provider owns the live region, the queue and the dismissal.">
      <Stage>
        <ToastProvider label="Release notifications">
          <ToastControls />
        </ToastProvider>
      </Stage>
    </Single>
  );
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

const shellSidebar = (
  <SideNav>
    <SideNavSection title="Work">
      <NavMenu label="Work">
        <NavItem current href="#/components/app-shell">
          Releases
        </NavItem>
        <NavItem href="#/components/app-shell">Reviews</NavItem>
      </NavMenu>
    </SideNavSection>
  </SideNav>
);

function AppShellSpecimen() {
  return (
    <Single note="Drawn at seven tenths of its own size so a whole page fits in a card. AppShell adds the one thing most applications forget: a skip link that jumps past the banner and the rails into the main region.">
      <PageFrame>
        <AppShell
          footer={
            <Text size="sm" tone="muted">
              Kioku UI — MIT licensed
            </Text>
          }
          header={<TopNav brand="Kioku" />}
          pageHead={
            <Heading level={2} size="section">
              Releases
            </Heading>
          }
          pageIndex="01"
          sidebar={shellSidebar}
        >
          <Card>
            <Text>Twelve releases are ready to review.</Text>
          </Card>
        </AppShell>
      </PageFrame>
    </Single>
  );
}

function AspectRatioSpecimen() {
  return (
    <Row
      label="Ratio"
      note="The box holds its shape before the content loads, so the page does not jump when an image arrives."
    >
      <Piece caption="16 : 9" mono width={slideWidth}>
        <AspectRatio>
          <Placeholder label="16 : 9" />
        </AspectRatio>
      </Piece>
      <Piece caption="1 : 1" mono width={slideWidth}>
        <AspectRatio ratio={1}>
          <Placeholder label="1 : 1" />
        </AspectRatio>
      </Piece>
      <Piece caption="4 : 3" mono width={slideWidth}>
        <AspectRatio ratio={4 / 3}>
          <Placeholder label="4 : 3" />
        </AspectRatio>
      </Piece>
    </Row>
  );
}

function BoxSpecimen() {
  return (
    <Row
      label="Surface"
      note="The surface ladder in one component: canvas is the page, surface rises above it, muted sinks below. Reach for Box only when Card or Section would misdescribe the thing."
    >
      <Piece caption="canvas" mono>
        <Box bordered padding="md" radius="element" surface="canvas">
          <Text size="sm">canvas</Text>
        </Box>
      </Piece>
      <Piece caption="surface" mono>
        <Box bordered padding="md" radius="element" surface="surface">
          <Text size="sm">surface</Text>
        </Box>
      </Piece>
      <Piece caption="raised" mono>
        <Box bordered padding="md" radius="element" surface="raised">
          <Text size="sm">raised</Text>
        </Box>
      </Piece>
      <Piece caption="muted" mono>
        <Box bordered padding="md" radius="element" surface="muted">
          <Text size="sm">muted</Text>
        </Box>
      </Piece>
    </Row>
  );
}

function CenterSpecimen() {
  return (
    <Single note="Centres its child on both axes and nothing else, so a loading state or a sign-in card sits where the reader looks first.">
      <Frame height={splitHeight}>
        <div style={{blockSize: '100%'}}>
          <Center style={{blockSize: '100%'}}>
            <Card elevation="low">
              <Text>Centred workspace summary</Text>
            </Card>
          </Center>
        </div>
      </Frame>
    </Single>
  );
}

function DividerSpecimen() {
  return (
    <Single note="A real hr, one hairline in the border colour. It separates; it never decorates.">
      <Column width={proseWidth}>
        <Card elevation="low">
          <Stack gap="md">
            <Heading level={2} size="subsection">
              Delivery summary
            </Heading>
            <Text tone="secondary">Twelve updates are ready to review.</Text>
            <Divider />
            <Text size="sm" tone="muted">
              Last updated moments ago
            </Text>
          </Stack>
        </Card>
      </Column>
    </Single>
  );
}

function FormLayoutSpecimen() {
  return (
    <Single note="Fields sit a spacing step apart and the actions land in one row at the end, so every form in an application is measured the same way.">
      <FormLayout
        actions={
          <>
            <Button variant="secondary">Cancel</Button>
            <Button variant="secondary">Publish</Button>
          </>
        }
        columns={2}
      >
        <Field label="Title">
          <TextInput defaultValue="Release 12" />
        </Field>
        <Field label="Owner">
          <Selector options={owners} placeholder="Choose an owner" />
        </Field>
        <Field description="Shown to every subscriber." label="Notes">
          <TextArea placeholder="Summarize the update" />
        </Field>
      </FormLayout>
    </Single>
  );
}

function GridCell({title}: {readonly title: string}) {
  return (
    <Card>
      <Text>{title}</Text>
    </Card>
  );
}

function GridSpecimen() {
  return (
    <Stack gap="lg">
      <Row
        label="Columns"
        note="Equal columns from the spacing scale's gaps. A bespoke grid is only worth writing when it does something this one cannot."
      >
        <Piece caption="Two" width={proseWidth}>
          <Grid columns={2}>
            <GridCell title="Scheduled" />
            <GridCell title="Completed" />
          </Grid>
        </Piece>
        <Piece caption="Three, large gap" width={proseWidth}>
          <Grid columns={3} gap="lg">
            <GridCell title="Today" />
            <GridCell title="This week" />
            <GridCell title="Later" />
          </Grid>
        </Piece>
      </Row>
    </Stack>
  );
}

function HStackSpecimen() {
  return (
    <Row
      label="Justify"
      note="Separation comes from the gap, never from an outer margin on a sibling."
    >
      <Piece caption="start" mono width={narrowWidth}>
        <HStack justify="start">
          <Badge>One</Badge>
          <Badge tone="info">Two</Badge>
        </HStack>
      </Piece>
      <Piece caption="center" mono width={narrowWidth}>
        <HStack justify="center">
          <Badge>One</Badge>
          <Badge tone="info">Two</Badge>
        </HStack>
      </Piece>
      <Piece caption="end" mono width={narrowWidth}>
        <HStack justify="end">
          <Badge>One</Badge>
          <Badge tone="info">Two</Badge>
        </HStack>
      </Piece>
      <Piece caption="between" mono width={narrowWidth}>
        <HStack justify="between">
          <Badge>One</Badge>
          <Badge tone="info">Two</Badge>
        </HStack>
      </Piece>
    </Row>
  );
}

function LayoutSpecimen() {
  return (
    <Single note="Drawn at seven tenths of its own size. Layout emits its children as main, so a skip link has a landmark to reach and the page has exactly one main region.">
      <PageFrame>
        <Layout
          aside={
            <Outline
              currentHref="#summary"
              entries={[
                {href: '#summary', label: 'Summary'},
                {href: '#changes', label: 'Changes'},
              ]}
            />
          }
          footer={
            <Text size="sm" tone="muted">
              Kioku UI — MIT licensed
            </Text>
          }
          header={<TopNav brand="Kioku" />}
          pageHead={
            <Heading level={2} size="section">
              Release 12
            </Heading>
          }
          pageIndex="12"
          sidebar={shellSidebar}
        >
          <Card>
            <Text>Twelve changes are ready to review.</Text>
          </Card>
        </Layout>
      </PageFrame>
    </Single>
  );
}

function ResizableSpecimen() {
  return (
    <Single note="The divider is a real separator control, so arrow keys move it — a drag handle alone would be unusable by keyboard.">
      <Frame height={splitHeight}>
        <div style={{blockSize: '100%'}}>
          <Resizable panel={<Card>Files</Card>}>
            <Card>Editor</Card>
          </Resizable>
        </div>
      </Frame>
    </Single>
  );
}

function SplitPanes() {
  const [width, setWidth] = useState(240);

  return (
    <div style={{blockSize: '100%', display: 'flex'}}>
      <div
        style={{
          inlineSize: `${String(width)}px`,
          minInlineSize: 0,
          overflow: 'auto',
        }}
      >
        <Card>Files</Card>
      </div>
      <ResizeHandle
        label="Resize the file rail"
        max={480}
        min={160}
        onValueChange={setWidth}
        value={width}
      />
      <div style={{flexGrow: 1, minInlineSize: 0, overflow: 'auto'}}>
        <Card>Editor</Card>
      </div>
    </div>
  );
}

function ResizeHandleSpecimen() {
  return (
    <Single note="The handle is a separator: arrow keys move it along its own axis and Home and End jump to the bounds. It draws a hairline and widens only its grab area, so the seam stays one pixel wide.">
      <Frame height={splitHeight}>
        <SplitPanes />
      </Frame>
    </Single>
  );
}

function SectionBody({title}: {readonly title: string}) {
  return (
    <Card>
      <Stack gap="xs">
        <Heading level={3} size="subsection">
          {title}
        </Heading>
        <Text tone="secondary">
          Supporting workspace information appears here.
        </Text>
      </Stack>
    </Card>
  );
}

function SectionSpecimen() {
  return (
    <Row
      label="Padding"
      note="A real section element with a name, so the page's outline has a heading for each region rather than a run of anonymous divs."
    >
      <Piece caption="sm" mono width={proseWidth}>
        <Section aria-label="Compact activity" padding="sm">
          <SectionBody title="Compact activity" />
        </Section>
      </Piece>
      <Piece caption="xl" mono width={proseWidth}>
        <Section aria-label="Workspace activity" padding="xl">
          <SectionBody title="Workspace activity" />
        </Section>
      </Piece>
    </Row>
  );
}

function StackItems() {
  return (
    <>
      <Card>
        <Text>Delivery schedule</Text>
      </Card>
      <Card>
        <Text>Workspace access</Text>
      </Card>
    </>
  );
}

function StackSpecimen() {
  return (
    <Row
      label="Gap"
      note="Rhythm comes from the spacing scale, never from a number: fields sit md apart, sections xl."
    >
      <Piece caption="sm" mono width={narrowWidth}>
        <Stack gap="sm">
          <StackItems />
        </Stack>
      </Piece>
      <Piece caption="md" mono width={narrowWidth}>
        <Stack gap="md">
          <StackItems />
        </Stack>
      </Piece>
      <Piece caption="xl" mono width={narrowWidth}>
        <Stack gap="xl">
          <StackItems />
        </Stack>
      </Piece>
    </Row>
  );
}

function VStackSpecimen() {
  return (
    <Single note="The vertical half of the stack pair, named so a reader of the markup does not have to remember which way Stack runs.">
      <Column width={proseWidth}>
        <Card elevation="low">
          <VStack gap="sm">
            <Heading level={2} size="subsection">
              Release 12
            </Heading>
            <Text tone="secondary">Twelve changes are ready to review.</Text>
          </VStack>
        </Card>
      </Column>
    </Single>
  );
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

const trail = [
  {href: '#/', label: 'Home'},
  {href: '#/components/button', label: 'Components'},
  {label: 'Release 12'},
];

function BreadcrumbsSpecimen() {
  return (
    <Single note="The last crumb is the page itself, so it is text rather than a link, and aria-current says so.">
      <Stack gap="sm">
        <Breadcrumbs items={trail} label="Specimen breadcrumb" />
        <Heading level={2} size="section">
          Release 12
        </Heading>
      </Stack>
    </Single>
  );
}

const destinations = (
  <NavMenu label="Specimen destinations">
    <NavItem current href="#/components/mobile-nav">
      Releases
    </NavItem>
    <NavItem href="#/components/mobile-nav">Reviews</NavItem>
    <NavItem href="#/components/mobile-nav">Archive</NavItem>
  </NavMenu>
);

/**
 * MobileNav owns its open state and its drawer is modal, so the trigger is
 * the resting specimen. The stage gives the drawer a containing block, so
 * pressing the trigger opens it inside the card rather than over the page.
 */
function MobileNavSpecimen() {
  return (
    <Single note="Press the trigger to open the drawer inside the frame. It traps focus and freezes the page behind it, so a keyboard reader cannot wander into hidden content; Escape closes it.">
      <Stage>
        <MobileNav label="Open navigation" title="Kioku">
          {destinations}
        </MobileNav>
      </Stage>
    </Single>
  );
}

function NavIconSpecimen() {
  return (
    <Single note="A glyph beside a destination, sized and inked by the row rather than by itself, and hidden from the accessibility tree because the row is already named.">
      <Column width={narrowWidth}>
        <NavMenu label="Specimen primary">
          <NavItem
            current
            href="#/components/nav-icon"
            leading={
              <NavIcon>
                <HomeGlyph />
              </NavIcon>
            }
          >
            Home
          </NavItem>
          <NavItem href="#/components/nav-icon">Releases</NavItem>
        </NavMenu>
      </Column>
    </Single>
  );
}

function NavItemSpecimen() {
  return (
    <Row
      label="State"
      note="In a rail the reader's own row is marked with ink alone — no bar, no added weight. aria-current carries the fact for anyone who cannot see the ink."
    >
      <Piece caption="Available" width={narrowWidth}>
        <NavItem href="#/components/nav-item">Releases</NavItem>
      </Piece>
      <Piece caption="Current" width={narrowWidth}>
        <NavItem current href="#/components/nav-item">
          Releases
        </NavItem>
      </Piece>
    </Row>
  );
}

function NavMenuSpecimen() {
  return (
    <Row
      label="Orientation"
      note="A nav landmark with a name, so a page with several menus is navigable by landmark rather than by guesswork."
    >
      <Piece caption="Vertical" width={narrowWidth}>
        <NavMenu label="Specimen vertical">
          <NavItem current href="#/components/nav-menu">
            Releases
          </NavItem>
          <NavItem href="#/components/nav-menu">Reviews</NavItem>
          <NavItem href="#/components/nav-menu">Archive</NavItem>
        </NavMenu>
      </Piece>
      <Piece caption="Horizontal" width={proseWidth}>
        <NavMenu label="Specimen horizontal" orientation="horizontal">
          <NavItem current href="#/components/nav-menu">
            Releases
          </NavItem>
          <NavItem href="#/components/nav-menu">Reviews</NavItem>
          <NavItem href="#/components/nav-menu">Archive</NavItem>
        </NavMenu>
      </Piece>
    </Row>
  );
}

const outlineEntries = [
  {href: '#tokens', label: 'Tokens'},
  {depth: 2 as const, href: '#colour', label: 'Colour roles'},
  {depth: 2 as const, href: '#spacing', label: 'Spacing scale'},
  {href: '#themes', label: 'Themes'},
  {href: '#density', label: 'Density'},
];

function OutlineSpecimen() {
  return (
    <Single note="The active entry is marked with aria-current, not colour alone, and the second level is indented rather than given a second style.">
      <Column width={narrowWidth}>
        <Outline currentHref="#colour" entries={outlineEntries} />
      </Column>
    </Single>
  );
}

function LivePagination({
  initialPage,
  label,
  pageCount = 9,
}: {
  readonly initialPage: number;
  readonly label: string;
  readonly pageCount?: number;
}) {
  const [page, setPage] = useState(initialPage);

  return (
    <Pagination
      label={label}
      onChange={setPage}
      page={page}
      pageCount={pageCount}
    />
  );
}

function PaginationSpecimen() {
  return (
    <Row
      label="Position"
      note="Page numbers are figures, so they are set in the mono face with tabular numerals and the row does not shuffle as the reader moves through it."
    >
      <Piece caption="First page">
        <LivePagination initialPage={1} label="Results, first page" />
      </Piece>
      <Piece caption="Middle">
        <LivePagination initialPage={5} label="Results, middle" />
      </Piece>
      <Piece caption="Last page">
        <LivePagination initialPage={9} label="Results, last page" />
      </Piece>
      <Piece caption="Many pages">
        <LivePagination
          initialPage={12}
          label="Results, many pages"
          pageCount={40}
        />
      </Piece>
    </Row>
  );
}

function SideNavSpecimen() {
  return (
    <Single note="A rail is a short column of short words: the reader's row is ink alone, and the footer is where an account action goes.">
      <Frame height="auto">
        <SideNav footer={<Button variant="ghost">Sign out</Button>}>
          <SideNavSection title="Work">
            <NavMenu label="Specimen work">
              <NavItem current href="#/components/side-nav">
                Releases
              </NavItem>
              <NavItem href="#/components/side-nav">Reviews</NavItem>
            </NavMenu>
          </SideNavSection>
          <SideNavSection title="Archive">
            <NavMenu label="Specimen archive">
              <NavItem href="#/components/side-nav">Older releases</NavItem>
            </NavMenu>
          </SideNavSection>
        </SideNav>
      </Frame>
    </Single>
  );
}

function SideNavSectionSpecimen() {
  return (
    <Single note="The title is an eyebrow, and the section is what separates one group of destinations from the next without drawing a rule between them.">
      <Frame height="auto">
        <SideNav>
          <SideNavSection title="Work">
            <NavMenu label="Specimen section work">
              <NavItem current href="#/components/side-nav-section">
                Releases
              </NavItem>
              <NavItem href="#/components/side-nav-section">Reviews</NavItem>
            </NavMenu>
          </SideNavSection>
          <SideNavSection title="Archive">
            <NavMenu label="Specimen section archive">
              <NavItem href="#/components/side-nav-section">
                Older releases
              </NavItem>
            </NavMenu>
          </SideNavSection>
        </SideNav>
      </Frame>
    </Single>
  );
}

const viewTabs = [
  {id: 'open', label: 'Open'},
  {id: 'merged', label: 'Merged'},
  {id: 'closed', label: 'Closed'},
];

function LiveTabs({disabled = false}: {readonly disabled?: boolean}) {
  const [selectedId, setSelectedId] = useState('open');

  return (
    <TabList
      label={disabled ? 'Release views, with a disabled tab' : 'Release views'}
      onSelect={setSelectedId}
      selectedId={selectedId}
      tabs={
        disabled
          ? [...viewTabs, {disabled: true, id: 'draft', label: 'Draft'}]
          : viewTabs
      }
    />
  );
}

function TabListSpecimen() {
  return (
    <Row
      label="State"
      note="The strip is one tab stop; arrow keys move between tabs and selection follows focus. The selected tab is marked by an underline, never by a filled pill."
    >
      <Piece caption="Default" width={proseWidth}>
        <LiveTabs />
      </Piece>
      <Piece caption="With a disabled tab" width={proseWidth}>
        <LiveTabs disabled />
      </Piece>
    </Row>
  );
}

function TopNavSpecimen() {
  return (
    <Single note="A banner landmark with a brand at the start and the account actions at the end. On a narrow viewport the destinations move into MobileNav.">
      <Frame height="auto">
        <TopNav
          actions={<Button variant="secondary">Sign in</Button>}
          brand="Kioku"
        >
          <NavMenu label="Specimen top nav" orientation="horizontal">
            <NavItem current href="#/components/top-nav">
              Releases
            </NavItem>
            <NavItem href="#/components/top-nav">Reviews</NavItem>
            <NavItem href="#/components/top-nav">Archive</NavItem>
          </NavMenu>
        </TopNav>
      </Frame>
    </Single>
  );
}

const megaColumns = [
  {
    items: (
      <>
        <NavItem href="#/components">Components</NavItem>
        <NavItem href="#/templates">Templates</NavItem>
        <NavItem href="#/themes">Themes</NavItem>
      </>
    ),
    title: 'Build',
  },
  {
    items: (
      <>
        <NavItem href="#/docs">Getting started</NavItem>
        <NavItem href="#/docs">Release runbook</NavItem>
      </>
    ),
    title: 'Learn',
  },
];

function TopNavMegaMenuSpecimen() {
  return (
    <Single note="A disclosure rather than a menu: the panel holds links to elsewhere, so calling these menu items would promise a command that runs here. Press Product to open the panel.">
      <Frame height="auto">
        <TopNav brand="Kioku">
          <TopNavMegaMenu
            columns={megaColumns}
            featured={
              <TopNavMegaMenuFeaturedCard
                description="Everything that landed in the last release."
                href="#/docs"
                title="What’s new"
              />
            }
            label="Product"
          />
        </TopNav>
      </Frame>
    </Single>
  );
}

function TopNavMegaMenuFeaturedCardSpecimen() {
  return (
    <Single note="The whole card is a single link, so it is one tab stop rather than three, and it takes the card's surface rather than a fill.">
      <Column width={proseWidth}>
        <TopNavMegaMenuFeaturedCard
          description="Everything that landed in the last release."
          href="#/docs"
          title="What’s new"
        />
      </Column>
    </Single>
  );
}

function TopNavMenuSpecimen() {
  return (
    <Single note="One heading in the banner with a short list of destinations under it. Press Product to open the panel.">
      <Frame height="auto">
        <TopNav brand="Kioku">
          <TopNavMenu label="Product">
            <NavItem href="#/components">Components</NavItem>
            <NavItem href="#/templates">Templates</NavItem>
            <NavItem href="#/themes">Themes</NavItem>
          </TopNavMenu>
        </TopNav>
      </Frame>
    </Single>
  );
}

// ---------------------------------------------------------------------------
// Overlay
//
// A modal surface takes three holds on the page it opens over: it traps focus,
// it freezes scrolling, and it paints a scrim over everything. Those are right
// in an application and wrong in a specimen — a docs page that cannot be
// scrolled is worse than a card that is empty. So the modal surfaces are shown
// through their own trigger, inside a stage that gives the portalled surface a
// containing block: pressing the trigger opens the real thing inside the card
// rather than over the page. Everything non-modal is shown open.
// ---------------------------------------------------------------------------

function AlertDialogSpecimen() {
  const [open, setOpen] = useState(false);

  return (
    <Single note="A decision that cannot be deferred: a click on the scrim is ignored, so it cannot be skipped by accident. Escape still closes it.">
      <Stage>
        <Button
          onClick={() => {
            setOpen(true);
          }}
          variant="secondary"
        >
          Discard draft
        </Button>
        <AlertDialog
          description="The draft and its twelve unsaved edits are removed."
          footer={
            <>
              <Button
                onClick={() => {
                  setOpen(false);
                }}
                variant="secondary"
              >
                Keep editing
              </Button>
              <Button
                onClick={() => {
                  setOpen(false);
                }}
                variant="destructive"
              >
                Discard
              </Button>
            </>
          }
          onDismiss={() => {
            setOpen(false);
          }}
          open={open}
          size="sm"
          title="Discard draft?"
        />
      </Stage>
    </Single>
  );
}

function BottomSheetSpecimen() {
  const [open, setOpen] = useState(false);

  return (
    <Single note="The same focus trap and scroll lock as Dialog, placed where a thumb can reach it. Press the trigger to raise the sheet inside the frame.">
      <Stage>
        <Button
          onClick={() => {
            setOpen(true);
          }}
          variant="secondary"
        >
          Open filters
        </Button>
        <BottomSheet
          onDismiss={() => {
            setOpen(false);
          }}
          open={open}
          title="Filters"
        >
          <Stack align="start" gap="md">
            <Text>Narrow the release list by status and owner.</Text>
            <Button
              onClick={() => {
                setOpen(false);
              }}
              variant="secondary"
            >
              Apply
            </Button>
          </Stack>
        </BottomSheet>
      </Stage>
    </Single>
  );
}

function shareViews(
  show: (viewId: string) => void,
): readonly BottomSheetSwitcherView[] {
  return [
    {
      content: (
        <Stack align="start" gap="sm">
          <Text>Anyone with the link can view this release.</Text>
          <Button
            onClick={() => {
              show('link');
            }}
            variant="secondary"
          >
            Copy link
          </Button>
          <Button
            onClick={() => {
              show('people');
            }}
            variant="secondary"
          >
            People with access
          </Button>
        </Stack>
      ),
      id: 'share',
      title: 'Share release',
    },
    {
      content: (
        <Text>
          The link expires in seven days and can be revoked at any time.
        </Text>
      ),
      id: 'link',
      parentId: 'share',
      title: 'Copy link',
    },
    {
      content: <Text>Dana Okoye and two others can edit this release.</Text>,
      id: 'people',
      parentId: 'share',
      title: 'People with access',
    },
  ];
}

function BottomSheetSwitcherSpecimen() {
  const [open, setOpen] = useState(false);
  const [viewId, setViewId] = useState('share');

  return (
    <Single note="One sheet, several named views. A switch swaps the body and the heading in place and moves focus to the new heading; a view that names a parent gets a back control instead of closing to go up.">
      <Stage>
        <Button
          onClick={() => {
            setViewId('share');
            setOpen(true);
          }}
          variant="secondary"
        >
          Share release
        </Button>
        <BottomSheetSwitcher
          onDismiss={() => {
            setOpen(false);
          }}
          onViewChange={setViewId}
          open={open}
          viewId={viewId}
          views={shareViews(setViewId)}
        />
      </Stage>
    </Single>
  );
}

const commands: readonly Command[] = [
  {
    group: 'Release',
    id: 'publish',
    label: 'Publish release',
    shortcut: 'mod+p',
  },
  {group: 'Release', id: 'archive', label: 'Archive release'},
  {group: 'View', id: 'theme', label: 'Switch theme', shortcut: 'mod+k'},
  {group: 'View', id: 'density', label: 'Toggle density'},
];

function CommandPaletteSpecimen() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState('');

  return (
    <Single note="Focus stays in the search field while aria-activedescendant names the highlighted command, so typing and choosing never fight for focus.">
      <Stage height={pageHeight}>
        <Stack align="center" gap="sm">
          <Button
            onClick={() => {
              setOpen(true);
            }}
            variant="secondary"
          >
            Open command palette
          </Button>
          {last === '' ? null : (
            <Text size="sm" tone="secondary">
              Ran: {last}
            </Text>
          )}
        </Stack>
        <CommandPalette
          commands={commands}
          onDismiss={() => {
            setOpen(false);
          }}
          onRun={(command) => {
            setLast(command.label);
            setOpen(false);
          }}
          open={open}
        />
      </Stage>
    </Single>
  );
}

function DialogSpecimen() {
  const [open, setOpen] = useState(false);

  return (
    <Single note="Focus is trapped inside the surface and the page behind stops scrolling until it closes. Press the trigger to open it inside the frame.">
      <Stage>
        <Button
          onClick={() => {
            setOpen(true);
          }}
          variant="secondary"
        >
          Publish release
        </Button>
        <Dialog
          description="This cannot be undone."
          footer={
            <>
              <Button
                onClick={() => {
                  setOpen(false);
                }}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setOpen(false);
                }}
              >
                Publish
              </Button>
            </>
          }
          onDismiss={() => {
            setOpen(false);
          }}
          open={open}
          size="sm"
          title="Publish release"
        >
          <Text>Twelve updates will become visible to every subscriber.</Text>
        </Dialog>
      </Stage>
    </Single>
  );
}

const hoverPreview = (
  <Stack align="start" gap="sm">
    <Text>Ada Lovelace</Text>
    <Text size="sm" tone="secondary">
      Twelve releases published this quarter.
    </Text>
    <Button variant="secondary">Follow</Button>
  </Stack>
);

/** HoverCard has no open prop: it exists while the pointer is on it. */
function HoverCardSpecimen() {
  return (
    <Single note="Point at the name to raise the card. Unlike a tooltip the preview is interactive and stays open while the pointer is inside it, which is why it takes a label of its own.">
      <Reserve>
        <Card>
          <Text>
            Reviewed by{' '}
            <HoverCard
              closeDelay={200}
              content={hoverPreview}
              label="Author detail"
            >
              <Button variant="ghost">Ada Lovelace</Button>
            </HoverCard>
          </Text>
        </Card>
      </Reserve>
    </Single>
  );
}

/**
 * Layer draws nothing of its own, so the specimen shows its effect: a box
 * that clips its children, and a surface that escapes it. The stage moves the
 * portal target inside the card, which is where a reader is looking.
 */
function LayerSpecimen() {
  return (
    <Single note="The default target is the theme root rather than the document body, because a surface portalled past the theme resolves every token to nothing and renders unpainted.">
      <Stage>
        <Stack align="start" gap="sm">
          <div
            style={{
              blockSize: 'var(--kioku-ui-spacing-2xl)',
              inlineSize: proseWidth,
              maxInlineSize: '100%',
              overflow: 'hidden',
            }}
          >
            <Text size="sm" tone="muted">
              This box clips its children, and this second line is cut off by
              it.
            </Text>
          </div>
          <Layer>
            <Card elevation="medium">
              <Text size="sm">
                A layered surface is not clipped by the box.
              </Text>
            </Card>
          </Layer>
        </Stack>
      </Stage>
    </Single>
  );
}

function LightboxSpecimen() {
  const [open, setOpen] = useState(false);

  return (
    <Single note="A modal viewer: the page behind stops scrolling and focus stays on the media until it is dismissed. Press the cover to open it inside the frame.">
      <Stage height={pageHeight}>
        <Stack align="center" gap="sm">
          <Thumbnail alt="Release cover" size="md" src={cover} />
          <Button
            onClick={() => {
              setOpen(true);
            }}
            variant="secondary"
          >
            View cover
          </Button>
        </Stack>
        <Lightbox
          onDismiss={() => {
            setOpen(false);
          }}
          open={open}
          title="Release cover"
        >
          <Thumbnail alt="Release cover" size="lg" src={cover} />
        </Lightbox>
      </Stage>
    </Single>
  );
}

/**
 * Overlay is the one modal primitive whose holds are optional, so it is shown
 * open: the scrim, the surface and the centring are all on the page, and the
 * page it is drawn on keeps scrolling.
 */
function OverlaySpecimen() {
  return (
    <Single note="Overlay carries no role of its own; the surface it wraps names itself. Shown here with the scroll lock and focus trap released, which is what separates a specimen from a real one.">
      <Stage>
        <Overlay
          dismissOnOutsideClick={false}
          lockScroll={false}
          open
          trapFocus={false}
        >
          <Card elevation="medium">
            <Stack align="start" gap="md">
              <Text>Press Escape or click the scrim to dismiss.</Text>
              <Button variant="secondary">Close</Button>
            </Stack>
          </Card>
        </Overlay>
      </Stage>
    </Single>
  );
}

/** A popover is non-modal, so it is shown open beside its anchor. */
function PopoverSpecimen() {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(true);

  return (
    <Single note="Non-modal: the page behind stays scrollable and reachable. The surface flips to the opposite side when the preferred one would leave the viewport, and clamps whatever survives back inside it.">
      <Reserve>
        <span ref={anchorRef} style={{display: 'inline-flex'}}>
          <Button
            onClick={() => {
              setOpen((value) => !value);
            }}
            variant="secondary"
          >
            Release detail
          </Button>
        </span>
      </Reserve>
      <Popover
        alignment="start"
        anchorRef={anchorRef}
        aria-label="Release detail"
        onDismiss={() => {
          setOpen(false);
        }}
        open={open}
        placement="bottom"
      >
        <Stack gap="sm">
          <Text size="sm">Twelve updates are ready to review.</Text>
          <Text size="sm" tone="muted">
            Owned by Ada Lovelace
          </Text>
        </Stack>
      </Popover>
    </Single>
  );
}

/** A tooltip only exists while its trigger is pointed at or focused. */
function TooltipSpecimen() {
  return (
    <Single note="Point at or focus the control to raise the tooltip. It supplements the trigger's name through aria-describedby, so essential information never lives here alone.">
      {/*
        The three sides face into the reserved room rather than up into the
        plate's own header: a tooltip anchored above a control at the top of a
        card is correct behaviour and an unreadable specimen of it.
      */}
      <Reserve>
        <HStack gap="lg" wrap>
          <Tooltip
            content="Publishes to every subscriber"
            delay={0}
            placement="bottom"
          >
            <Button variant="secondary">Publish</Button>
          </Tooltip>
          <Tooltip content="Anchored to the left" delay={0} placement="left">
            <Button variant="secondary">Left</Button>
          </Tooltip>
          <Tooltip content="Anchored to the right" delay={0} placement="right">
            <Button variant="secondary">Right</Button>
          </Tooltip>
        </HStack>
      </Reserve>
    </Single>
  );
}

// ---------------------------------------------------------------------------
// Table & list
// ---------------------------------------------------------------------------

function ListSpecimen() {
  return (
    <Row
      label="Variant"
      note="Three real list elements rather than one div wearing three hats: ordered and unordered keep their markers, plain drops them."
    >
      <Piece caption="Unordered" width={narrowWidth}>
        <List variant="unordered">
          <ListItem>Install the package</ListItem>
          <ListItem>Wrap the app in ThemeProvider</ListItem>
          <ListItem>Import the compiled CSS</ListItem>
        </List>
      </Piece>
      <Piece caption="Ordered" width={narrowWidth}>
        <List variant="ordered">
          <ListItem>Install the package</ListItem>
          <ListItem>Wrap the app in ThemeProvider</ListItem>
          <ListItem>Import the compiled CSS</ListItem>
        </List>
      </Piece>
      <Piece caption="Plain" width={narrowWidth}>
        <List variant="plain">
          <ListItem>Install the package</ListItem>
          <ListItem>Wrap the app in ThemeProvider</ListItem>
          <ListItem>Import the compiled CSS</ListItem>
        </List>
      </Piece>
    </Row>
  );
}

function ListItemSpecimen() {
  return (
    <Single note="One row of a list. It carries the list's gap rather than a margin of its own, and it takes an Item when the row needs more than a line of text.">
      <Column width={proseWidth}>
        <List gap="md" variant="plain">
          <ListItem>
            <Item description="Ready to publish">Release notes</Item>
          </ListItem>
          <ListItem>
            <Item description="Waiting on review">Accessibility baseline</Item>
          </ListItem>
        </List>
      </Column>
    </Single>
  );
}

function ItemSpecimen() {
  return (
    <Single note="Leading, a label with a second line, and trailing: the row shape every list in the system is built from. An interactive row has two ranks of ink, and its second line separates from the first by size.">
      <Column width={proseWidth}>
        <List gap="md" variant="plain">
          <ListItem>
            <Item
              description="Ready to publish"
              leading={<Avatar name="Ada Lovelace" size="sm" />}
              trailing={<Badge tone="success">Done</Badge>}
            >
              Release notes
            </Item>
          </ListItem>
          <ListItem>
            <Item
              description="Waiting on review"
              leading={<Avatar name="Grace Hopper" size="sm" />}
              trailing={<Badge tone="warning">Open</Badge>}
            >
              Accessibility baseline
            </Item>
          </ListItem>
        </List>
      </Column>
    </Single>
  );
}

const metadata = [
  {detail: 'Ada Lovelace', term: 'Owner'},
  {detail: '18 August 2026', term: 'Released'},
  {detail: 'Twelve changes', term: 'Scope'},
];

function MetadataListSpecimen() {
  return (
    <Row
      label="Layout"
      note="A real description list, so the pairing between a term and its detail survives without sight."
    >
      <Piece caption="Stacked" width={narrowWidth}>
        <MetadataList entries={metadata} layout="stacked" />
      </Piece>
      <Piece caption="Inline" width={proseWidth}>
        <MetadataList entries={metadata} layout="inline" />
      </Piece>
    </Row>
  );
}

const metrics = [
  {detail: 'Six added this week', label: 'Ready deliveries', value: '24'},
  {detail: 'Two require an owner', label: 'Pending review', value: '3'},
  {detail: 'All access reviewed', label: 'Workspace members', value: '18'},
];

function MetricGridSpecimen() {
  return (
    <Single note="Figures in the mono face with tabular numerals, so a row of metrics lines up on the same stems whatever the numbers are.">
      <MetricGrid items={metrics} />
    </Single>
  );
}

const overflowEntries = [
  {
    label: 'Publish',
    node: (
      <Button size="sm" variant="secondary">
        Publish
      </Button>
    ),
  },
  {
    label: 'Archive',
    node: (
      <Button size="sm" variant="secondary">
        Archive
      </Button>
    ),
  },
  {
    label: 'Duplicate',
    node: (
      <Button size="sm" variant="secondary">
        Duplicate
      </Button>
    ),
  },
  {
    label: 'Delete',
    node: (
      <Button size="sm" variant="secondary">
        Delete
      </Button>
    ),
  },
];

function OverflowListSpecimen() {
  return (
    <Row
      label="Visible count"
      note="The visible count is supplied by the caller rather than measured, so the row stays predictable and does not thrash on resize. Everything past it moves into a menu."
    >
      <Piece caption="Two visible" width={proseWidth}>
        <OverflowList entries={overflowEntries} visibleCount={2} />
      </Piece>
      <Piece caption="Three visible" width={proseWidth}>
        <OverflowList entries={overflowEntries} visibleCount={3} />
      </Piece>
    </Row>
  );
}

function TableExample({
  density,
  dividers,
}: {
  readonly density?: 'compact' | 'default' | 'spacious';
  readonly dividers?: 'columns' | 'grid' | 'none' | 'rows';
}) {
  return (
    <Card elevation="low">
      <Table
        {...(density === undefined ? {} : {density})}
        {...(dividers === undefined ? {} : {dividers})}
      >
        <TableCaption>Upcoming delivery activity</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeaderCell scope="col">Delivery</TableHeaderCell>
            <TableHeaderCell scope="col">Status</TableHeaderCell>
            <TableHeaderCell numeric scope="col">
              Units
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>North region</TableCell>
            <TableCell>
              <Badge tone="success">Ready</Badge>
            </TableCell>
            <TableCell numeric>1,248</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Central region</TableCell>
            <TableCell>
              <Badge tone="warning">Review</Badge>
            </TableCell>
            <TableCell numeric>96</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>South region</TableCell>
            <TableCell>
              <Badge tone="info">Scheduled</Badge>
            </TableCell>
            <TableCell numeric>7,310</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}

function TableSpecimen() {
  return (
    <Stack gap="lg">
      <Row
        label="Density"
        note="The caption names the table, the header cells declare their scope, and a numeric column is right-aligned in tabular figures."
      >
        <Piece caption="compact" mono width={proseWidth}>
          <TableExample density="compact" />
        </Piece>
        <Piece caption="spacious" mono width={proseWidth}>
          <TableExample density="spacious" />
        </Piece>
      </Row>

      <Divider />

      <Row
        label="Dividers"
        note="Rules are drawn by the divider setting rather than by a border on every cell, so an interior line is never drawn twice."
      >
        <Piece caption="rows" mono width={proseWidth}>
          <TableExample dividers="rows" />
        </Piece>
        <Piece caption="grid" mono width={proseWidth}>
          <TableExample dividers="grid" />
        </Piece>
      </Row>
    </Stack>
  );
}

const treeNodes: readonly TreeNode[] = [
  {
    children: [
      {id: 'core', label: 'core'},
      {id: 'themes', label: 'themes'},
      {id: 'build', label: 'build'},
    ],
    id: 'packages',
    label: 'packages',
  },
  {
    children: [{id: 'storybook', label: 'storybook'}],
    id: 'apps',
    label: 'apps',
  },
  {id: 'readme', label: 'README.md'},
];

function TreeListSpecimen() {
  const [expandedIds, setExpandedIds] = useState<readonly string[]>([
    'apps',
    'packages',
  ]);
  const [selectedId, setSelectedId] = useState('themes');

  return (
    <Single note="The whole tree is one tab stop: up and down move between visible nodes, right opens a branch, left closes it.">
      <Column width={narrowWidth}>
        <TreeList
          expandedIds={expandedIds}
          label="Files"
          nodes={treeNodes}
          onExpandedChange={setExpandedIds}
          onSelect={setSelectedId}
          selectedId={selectedId}
        />
      </Column>
    </Single>
  );
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function LocaleSample({name}: {readonly name: string}) {
  return (
    <Card>
      <Stack align="start" gap="sm">
        <Breadcrumbs
          items={[{href: '#/', label: 'Accueil'}, {label: 'Version 12'}]}
          label={`Breadcrumb, ${name}`}
        />
        <Text>Twelve releases are ready to review.</Text>
        <Button variant="secondary">Publish</Button>
      </Stack>
    </Card>
  );
}

/**
 * A provider draws nothing, so the specimen shows its effect: the same three
 * elements under two locales, one of which runs right to left.
 */
function InternationalizationProviderSpecimen() {
  return (
    <Row
      label="Locale"
      note="A host replaces the whole message set rather than patching keys, so a missing translation is a type error instead of an English word appearing mid-sentence. Direction flows from the provider, so every logical property flips with it."
    >
      <Piece caption="en · ltr" width={narrowWidth}>
        <InternationalizationProvider>
          <LocaleSample name="English" />
        </InternationalizationProvider>
      </Piece>
      <Piece caption="ar · rtl" width={narrowWidth}>
        <InternationalizationProvider direction="rtl" locale="ar">
          <LocaleSample name="Arabic" />
        </InternationalizationProvider>
      </Piece>
    </Row>
  );
}

/**
 * LinkProvider draws nothing either, so the specimen shows what changes
 * because it is there: the host's own renderer receives the click instead of
 * the browser, which is how a router keeps the page from reloading.
 */
function LinkProviderSpecimen() {
  const [handled, setHandled] = useState('');

  return (
    <Stack gap="md">
      <Card>
        <Stack align="start" gap="sm">
          <Text>Host-routed workspace links</Text>
          <LinkProvider
            renderLink={({children, href, ...rest}) => (
              <a
                {...rest}
                data-host-router-link="true"
                href={href}
                onClick={(event) => {
                  event.preventDefault();
                  setHandled(href ?? '');
                }}
              >
                {children}
              </a>
            )}
          >
            <Link href="/deliveries">Upcoming deliveries</Link>
            <Link href="/members">Member access</Link>
          </LinkProvider>
        </Stack>
      </Card>
      <Text size="sm" tone="muted">
        {handled === ''
          ? 'Press a link: the host renderer answers it, so the page never reloads.'
          : `The host router handled ${handled}.`}
      </Text>
    </Stack>
  );
}

/**
 * The provider that dresses everything else. The specimen shows the theme the
 * plate is currently on beside the next one in the registry, so the effect is
 * visible and the left-hand sample still re-dresses with the tab strip.
 */
function ThemeProviderSpecimen() {
  const {density, mode, theme} = useTheme();
  const others = kiokuThemes.filter((candidate) => candidate.id !== theme.id);
  const alternate = others.length > 0 ? others[0] : theme;

  return (
    <Row
      label="Registry"
      note="A host hands the provider a registry and a default, and the provider writes the token contract onto its own element. Everything below it — including a surface that portals out — reads the theme from there."
    >
      <Piece
        caption={`This plate · ${theme.label ?? theme.id}`}
        width={narrowWidth}
      >
        <ThemeProvider
          defaultDensity={density}
          defaultMode={mode}
          defaultThemeId={theme.id}
          themes={kiokuThemes}
        >
          <Card elevation="low">
            <Stack align="start" gap="sm">
              <Text>Release 12</Text>
              <Badge tone="success">Delivered</Badge>
              <Button variant="secondary">Review</Button>
            </Stack>
          </Card>
        </ThemeProvider>
      </Piece>
      <Piece
        caption={`Another entry · ${alternate?.label ?? theme.id}`}
        width={narrowWidth}
      >
        <ThemeProvider
          defaultDensity={density}
          defaultMode={mode}
          defaultThemeId={alternate?.id ?? theme.id}
          themes={kiokuThemes}
        >
          <Card elevation="low">
            <Stack align="start" gap="sm">
              <Text>Release 12</Text>
              <Badge tone="success">Delivered</Badge>
              <Button variant="secondary">Review</Button>
            </Stack>
          </Card>
        </ThemeProvider>
      </Piece>
    </Row>
  );
}

/**
 * There is nothing to see, which is the point. The specimen shows the control
 * as the eye reads it beside the name a screen reader is given.
 */
function VisuallyHiddenSpecimen() {
  return (
    <Row
      label="Accessible name"
      note="Off-screen rather than display: none, so the text stays in the accessibility tree. Anything essential that is hidden this way must be hidden only from sight."
    >
      <Piece caption="What the eye reads">
        <Button variant="secondary">
          <span aria-hidden="true">↗</span>
          <VisuallyHidden>
            Open delivery schedule in a new window
          </VisuallyHidden>
        </Button>
      </Piece>
      <Piece caption="What a screen reader hears" width={narrowWidth}>
        <Text size="sm" tone="secondary">
          “Open delivery schedule in a new window, button”
        </Text>
      </Piece>
    </Row>
  );
}

// ---------------------------------------------------------------------------
// The registry
// ---------------------------------------------------------------------------

const byName: Readonly<Record<string, ComponentType>> = {
  Alert: AlertSpecimen,
  AlertDialog: AlertDialogSpecimen,
  AppShell: AppShellSpecimen,
  AspectRatio: AspectRatioSpecimen,
  AsyncState: AsyncStateSpecimen,
  Avatar: AvatarSpecimen,
  AvatarGroup: AvatarGroupSpecimen,
  Badge: BadgeSpecimen,
  Banner: BannerSpecimen,
  Blockquote: BlockquoteSpecimen,
  BottomSheet: BottomSheetSpecimen,
  BottomSheetSwitcher: BottomSheetSwitcherSpecimen,
  Box: BoxSpecimen,
  Breadcrumbs: BreadcrumbsSpecimen,
  Button: ButtonSpecimen,
  ButtonGroup: ButtonGroupSpecimen,
  Calendar: CalendarSpecimen,
  Card: CardSpecimen,
  CardFooter: CardFooterSpecimen,
  CardHeader: CardHeaderSpecimen,
  Carousel: CarouselSpecimen,
  Center: CenterSpecimen,
  ChatComposer: ChatComposerSpecimen,
  ChatLayout: ChatLayoutSpecimen,
  ChatMessage: ChatMessageSpecimen,
  ChatMessageList: ChatMessageListSpecimen,
  ChatMessageMetadata: ChatMessageMetadataSpecimen,
  ChatSystemMessage: ChatSystemMessageSpecimen,
  ChatToolCalls: ChatToolCallsSpecimen,
  CheckboxInput: CheckboxInputSpecimen,
  CheckboxList: CheckboxListSpecimen,
  Citation: CitationSpecimen,
  ClickableCard: ClickableCardSpecimen,
  Code: CodeSpecimen,
  CodeBlock: CodeBlockSpecimen,
  Collapsible: CollapsibleSpecimen,
  CommandPalette: CommandPaletteSpecimen,
  ComplexSelector: ComplexSelectorSpecimen,
  ContextMenu: ContextMenuSpecimen,
  DateInput: DateInputSpecimen,
  DatePicker: DatePickerSpecimen,
  DateRangeInput: DateRangeInputSpecimen,
  DateTimeInput: DateTimeInputSpecimen,
  Dialog: DialogSpecimen,
  Divider: DividerSpecimen,
  DropdownMenu: DropdownMenuSpecimen,
  DropdownMenuItem: DropdownMenuItemSpecimen,
  EmptyState: EmptyStateSpecimen,
  Eyebrow: EyebrowSpecimen,
  Field: FieldSpecimen,
  FieldStatus: FieldStatusSpecimen,
  FileInput: FileInputSpecimen,
  FormLayout: FormLayoutSpecimen,
  Grid: GridSpecimen,
  HStack: HStackSpecimen,
  Heading: HeadingSpecimen,
  HoverCard: HoverCardSpecimen,
  Icon: IconSpecimen,
  IconButton: IconButtonSpecimen,
  Indicator: IndicatorSpecimen,
  InputGroup: InputGroupSpecimen,
  InternationalizationProvider: InternationalizationProviderSpecimen,
  Item: ItemSpecimen,
  Kbd: KbdSpecimen,
  Layer: LayerSpecimen,
  Layout: LayoutSpecimen,
  Lightbox: LightboxSpecimen,
  Link: LinkSpecimen,
  LinkProvider: LinkProviderSpecimen,
  List: ListSpecimen,
  ListItem: ListItemSpecimen,
  Markdown: MarkdownSpecimen,
  MetadataList: MetadataListSpecimen,
  MetricGrid: MetricGridSpecimen,
  MobileNav: MobileNavSpecimen,
  MoreMenu: MoreMenuSpecimen,
  MultiSelector: MultiSelectorSpecimen,
  NavIcon: NavIconSpecimen,
  NavItem: NavItemSpecimen,
  NavMenu: NavMenuSpecimen,
  NumberInput: NumberInputSpecimen,
  Numeral: NumeralSpecimen,
  Outline: OutlineSpecimen,
  OverflowList: OverflowListSpecimen,
  Overlay: OverlaySpecimen,
  Pagination: PaginationSpecimen,
  Popover: PopoverSpecimen,
  PowerSearch: PowerSearchSpecimen,
  ProgressBar: ProgressBarSpecimen,
  RadioList: RadioListSpecimen,
  ResizeHandle: ResizeHandleSpecimen,
  Resizable: ResizableSpecimen,
  Section: SectionSpecimen,
  SegmentedControl: SegmentedControlSpecimen,
  SelectableCard: SelectableCardSpecimen,
  Selector: SelectorSpecimen,
  SideNav: SideNavSpecimen,
  SideNavSection: SideNavSectionSpecimen,
  Skeleton: SkeletonSpecimen,
  Slider: SliderSpecimen,
  Spinner: SpinnerSpecimen,
  Stack: StackSpecimen,
  StatusDot: StatusDotSpecimen,
  Switch: SwitchSpecimen,
  TabList: TabListSpecimen,
  Table: TableSpecimen,
  Text: TextSpecimen,
  TextArea: TextAreaSpecimen,
  TextInput: TextInputSpecimen,
  ThemeProvider: ThemeProviderSpecimen,
  Thumbnail: ThumbnailSpecimen,
  TimeInput: TimeInputSpecimen,
  Timestamp: TimestampSpecimen,
  Toast: ToastSpecimen,
  ToastProvider: ToastProviderSpecimen,
  Toggle: ToggleSpecimen,
  ToggleButton: ToggleButtonSpecimen,
  ToggleButtonGroup: ToggleButtonGroupSpecimen,
  Token: TokenSpecimen,
  Tokenizer: TokenizerSpecimen,
  Toolbar: ToolbarSpecimen,
  Tooltip: TooltipSpecimen,
  TopNav: TopNavSpecimen,
  TopNavMegaMenu: TopNavMegaMenuSpecimen,
  TopNavMegaMenuFeaturedCard: TopNavMegaMenuFeaturedCardSpecimen,
  TopNavMenu: TopNavMenuSpecimen,
  TreeList: TreeListSpecimen,
  Typeahead: TypeaheadSpecimen,
  TypeaheadItem: TypeaheadItemSpecimen,
  VStack: VStackSpecimen,
  VisuallyHidden: VisuallyHiddenSpecimen,
};

/**
 * The registry the detail page reads: the slug in the URL, mapped to the
 * component that draws that component's specimen. Keyed through the same slug
 * rule the router uses, so a name and its page can never disagree.
 */
export const specimens: Readonly<Record<string, ComponentType>> =
  Object.fromEntries(
    Object.entries(byName).map(([name, render]) => [
      componentSlug(name),
      render,
    ]),
  );
