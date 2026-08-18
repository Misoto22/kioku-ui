/**
 * The component library, grouped the way a reader looks for things rather
 * than the way the source is laid out. The group names and their order mirror
 * the reference system this library is aligned with, so anyone moving between
 * the two finds the same component in the same place.
 *
 * `status` records what a consumer can rely on:
 *  - `ready`      the component exists and is exported
 *  - `planned`    named here because the reference system has it, not built yet
 */
export interface CatalogEntry {
  readonly description: string;
  readonly name: string;
  readonly status: 'planned' | 'ready';
}

export interface CatalogGroup {
  readonly entries: readonly CatalogEntry[];
  readonly title: string;
}

export const componentCatalog: readonly CatalogGroup[] = [
  {
    title: 'Action',
    entries: [
      {
        description: 'Triggers an action through native button semantics.',
        name: 'Button',
        status: 'ready',
      },
      {
        description: 'Groups related actions so they read as one control.',
        name: 'ButtonGroup',
        status: 'ready',
      },
      {
        description: 'Presents a keyboard-navigable list of actions.',
        name: 'DropdownMenu',
        status: 'ready',
      },
      {
        description: 'Renders one action inside a DropdownMenu.',
        name: 'DropdownMenuItem',
        status: 'ready',
      },
      {
        description: 'A square action carrying only a glyph.',
        name: 'IconButton',
        status: 'ready',
      },
      {
        description: 'Links into the host application’s routing.',
        name: 'Link',
        status: 'ready',
      },
      {
        description: 'Collects secondary actions behind one trigger.',
        name: 'MoreMenu',
        status: 'ready',
      },
      {
        description: 'Opens a menu at the pointer on a secondary click.',
        name: 'ContextMenu',
        status: 'ready',
      },
      {
        description: 'Chooses one option from a small, visible set.',
        name: 'SegmentedControl',
        status: 'ready',
      },
      {
        description: 'A button that stays pressed.',
        name: 'ToggleButton',
        status: 'ready',
      },
      {
        description: 'A set of toggle buttons acting as one control.',
        name: 'ToggleButtonGroup',
        status: 'ready',
      },
      {
        description: 'Groups related controls into a single tab stop.',
        name: 'Toolbar',
        status: 'ready',
      },
    ],
  },
  {
    title: 'Chat',
    entries: [
      {
        description: 'Composes a message; Enter sends.',
        name: 'ChatComposer',
        status: 'ready',
      },
      {
        description: 'Frames a transcript above a fixed composer.',
        name: 'ChatLayout',
        status: 'ready',
      },
      {
        description: 'Shows one message and names its author.',
        name: 'ChatMessage',
        status: 'ready',
      },
      {
        description: 'Holds the transcript and announces new messages.',
        name: 'ChatMessageList',
        status: 'ready',
      },
      {
        description: 'Timing and model detail attached to a message.',
        name: 'ChatMessageMetadata',
        status: 'ready',
      },
      {
        description: 'A message from the system rather than a participant.',
        name: 'ChatSystemMessage',
        status: 'ready',
      },
      {
        description: 'Lists the tool calls behind a reply.',
        name: 'ChatToolCalls',
        status: 'ready',
      },
    ],
  },
  {
    title: 'Container',
    entries: [
      {
        description: 'A bounded surface for related content.',
        name: 'Card',
        status: 'ready',
      },
      {
        description: 'Places a title row at the top of a card.',
        name: 'CardHeader',
        status: 'ready',
      },
      {
        description: 'Places actions at the end of a card.',
        name: 'CardFooter',
        status: 'ready',
      },
      {
        description: 'Scrolls a row of slides horizontally.',
        name: 'Carousel',
        status: 'ready',
      },
      {
        description: 'A card surface that is itself one control.',
        name: 'ClickableCard',
        status: 'ready',
      },
      {
        description: 'Folds a section away behind its own heading.',
        name: 'Collapsible',
        status: 'ready',
      },
      {
        description: 'A card surface that records a choice.',
        name: 'SelectableCard',
        status: 'ready',
      },
    ],
  },
  {
    title: 'Content',
    entries: [
      {
        description: 'Shows one person, falling back to initials.',
        name: 'Avatar',
        status: 'ready',
      },
      {
        description: 'Several people as one capped, overlapping row.',
        name: 'AvatarGroup',
        status: 'ready',
      },
      {
        description: 'Sets off quoted text and names its source.',
        name: 'Blockquote',
        status: 'ready',
      },
      {
        description: 'Names the source of a claim.',
        name: 'Citation',
        status: 'ready',
      },
      {
        description: 'Marks an inline fragment as code.',
        name: 'Code',
        status: 'ready',
      },
      {
        description: 'A block of source with a copy control.',
        name: 'CodeBlock',
        status: 'ready',
      },
      {
        description: 'States that there is nothing here, and why.',
        name: 'EmptyState',
        status: 'ready',
      },
      {
        description: 'A titled break in the reading order.',
        name: 'Heading',
        status: 'ready',
      },
      {
        description: 'Sizes and colours caller-supplied SVG paths.',
        name: 'Icon',
        status: 'ready',
      },
      {
        description: 'Renders a keyboard key inside running text.',
        name: 'Kbd',
        status: 'ready',
      },
      {
        description: 'Renders a restricted Markdown subset.',
        name: 'Markdown',
        status: 'ready',
      },
      {
        description: 'Body copy at three sizes and three tones.',
        name: 'Text',
        status: 'ready',
      },
      {
        description: 'A bounded preview that degrades to text.',
        name: 'Thumbnail',
        status: 'ready',
      },
      {
        description: 'A point in time with its machine-readable value.',
        name: 'Timestamp',
        status: 'ready',
      },
      {
        description: 'One discrete value as a removable pill.',
        name: 'Token',
        status: 'ready',
      },
    ],
  },
  {
    title: 'Data input',
    entries: [
      {
        description: 'Selects a date from a month grid.',
        name: 'Calendar',
        status: 'ready',
      },
      {
        description: 'Records one independent choice.',
        name: 'CheckboxInput',
        status: 'ready',
      },
      {
        description: 'Independent choices under one question.',
        name: 'CheckboxList',
        status: 'ready',
      },
      {
        description: 'Chooses one option from grouped lists.',
        name: 'ComplexSelector',
        status: 'ready',
      },
      {
        description: 'Accepts one calendar date as an ISO string.',
        name: 'DateInput',
        status: 'ready',
      },
      {
        description: 'A start and end date that cannot cross.',
        name: 'DateRangeInput',
        status: 'ready',
      },
      {
        description: 'One local date and time as an ISO string.',
        name: 'DateTimeInput',
        status: 'ready',
      },
      {
        description: 'Labels a control and carries its description.',
        name: 'Field',
        status: 'ready',
      },
      {
        description: 'States the validation outcome for one control.',
        name: 'FieldStatus',
        status: 'ready',
      },
      {
        description: 'Chooses files and names the selection in text.',
        name: 'FileInput',
        status: 'ready',
      },
      {
        description: 'Places fixed affixes beside a control.',
        name: 'InputGroup',
        status: 'ready',
      },
      {
        description: 'Chooses several options through a typeahead.',
        name: 'MultiSelector',
        status: 'ready',
      },
      {
        description: 'Accepts a number; empty reads as undefined.',
        name: 'NumberInput',
        status: 'ready',
      },
      {
        description: 'Search with the applied filters shown.',
        name: 'PowerSearch',
        status: 'ready',
      },
      {
        description: 'A set of mutually exclusive choices.',
        name: 'RadioList',
        status: 'ready',
      },
      {
        description: 'Chooses one option from a closed list.',
        name: 'Selector',
        status: 'ready',
      },
      {
        description: 'Chooses a number along a visible range.',
        name: 'Slider',
        status: 'ready',
      },
      {
        description: 'Turns a setting on or off, at once.',
        name: 'Switch',
        status: 'ready',
      },
      {
        description: 'A pressed state inside a toolbar.',
        name: 'Toggle',
        status: 'ready',
      },
      {
        description: 'Multi-line text with a resize affordance.',
        name: 'TextArea',
        status: 'ready',
      },
      {
        description: 'Single-line text entry.',
        name: 'TextInput',
        status: 'ready',
      },
      {
        description: 'Accepts one time of day as an ISO string.',
        name: 'TimeInput',
        status: 'ready',
      },
      {
        description: 'Turns typed text into discrete tokens.',
        name: 'Tokenizer',
        status: 'ready',
      },
      {
        description: 'Filters suggestions as the reader types.',
        name: 'Typeahead',
        status: 'ready',
      },
      {
        description: 'One suggestion inside a typeahead list.',
        name: 'TypeaheadItem',
        status: 'ready',
      },
    ],
  },
  {
    title: 'Feedback & status',
    entries: [
      {
        description: 'A message about the region it sits in.',
        name: 'Alert',
        status: 'ready',
      },
      {
        description: 'Reports loading, empty, error, or content.',
        name: 'AsyncState',
        status: 'ready',
      },
      {description: 'A short status label.', name: 'Badge', status: 'ready'},
      {
        description: 'Announces something about the whole page.',
        name: 'Banner',
        status: 'ready',
      },
      {
        description: 'Attaches a count or dot to a control.',
        name: 'Indicator',
        status: 'ready',
      },
      {
        description: 'Reports how far a task has run.',
        name: 'ProgressBar',
        status: 'ready',
      },
      {
        description: 'Holds the shape of content still loading.',
        name: 'Skeleton',
        status: 'ready',
      },
      {
        description: 'Reports work of unknown length.',
        name: 'Spinner',
        status: 'ready',
      },
      {
        description: 'A coloured dot with an accessible name.',
        name: 'StatusDot',
        status: 'ready',
      },
      {
        description: 'One transient notification.',
        name: 'Toast',
        status: 'ready',
      },
      {
        description: 'Hosts the notification queue and live region.',
        name: 'ToastProvider',
        status: 'ready',
      },
    ],
  },
  {
    title: 'Layout',
    entries: [
      {
        description: 'Wraps Layout with a skip link.',
        name: 'AppShell',
        status: 'ready',
      },
      {
        description: 'Reserves space at a fixed ratio.',
        name: 'AspectRatio',
        status: 'ready',
      },
      {
        description: 'A generic box with token-aware spacing.',
        name: 'Box',
        status: 'ready',
      },
      {
        description: 'Centres its content in the available space.',
        name: 'Center',
        status: 'ready',
      },
      {
        description: 'A rule between sections.',
        name: 'Divider',
        status: 'ready',
      },
      {
        description: 'Arranges fields and their submit actions.',
        name: 'FormLayout',
        status: 'ready',
      },
      {description: 'A responsive column grid.', name: 'Grid', status: 'ready'},
      {
        description: 'Arranges children in an evenly spaced row.',
        name: 'HStack',
        status: 'ready',
      },
      {
        description: 'Positions banner, rails, main, and footer.',
        name: 'Layout',
        status: 'ready',
      },
      {
        description: 'Splits a region into a sized panel and the rest.',
        name: 'Resizable',
        status: 'ready',
      },
      {
        description: 'A titled block within a page.',
        name: 'Section',
        status: 'ready',
      },
      {
        description: 'Arranges children in a column.',
        name: 'Stack',
        status: 'ready',
      },
      {
        description: 'Arranges children in a column, named for symmetry.',
        name: 'VStack',
        status: 'ready',
      },
    ],
  },
  {
    title: 'Navigation',
    entries: [
      {
        description: 'The path leading to the current page.',
        name: 'Breadcrumbs',
        status: 'ready',
      },
      {
        description: 'Navigation behind a trigger on narrow viewports.',
        name: 'MobileNav',
        status: 'ready',
      },
      {
        description: 'A fixed square for a navigation glyph.',
        name: 'NavIcon',
        status: 'ready',
      },
      {
        description: 'Links to one destination, marking the current one.',
        name: 'NavItem',
        status: 'ready',
      },
      {
        description: 'Groups destinations into a named landmark.',
        name: 'NavMenu',
        status: 'ready',
      },
      {
        description: 'The headings of the current page.',
        name: 'Outline',
        status: 'ready',
      },
      {
        description: 'Moves between pages of a bounded result set.',
        name: 'Pagination',
        status: 'ready',
      },
      {
        description: 'Persistent navigation beside the content.',
        name: 'SideNav',
        status: 'ready',
      },
      {
        description: 'Groups destinations under a heading.',
        name: 'SideNavSection',
        status: 'ready',
      },
      {
        description: 'Selects one of several panels.',
        name: 'TabList',
        status: 'ready',
      },
      {
        description: 'Identity, navigation, and actions in the banner.',
        name: 'TopNav',
        status: 'ready',
      },
      {
        description: 'A panelled menu inside the banner.',
        name: 'TopNavMegaMenu',
        status: 'ready',
      },
      {
        description: 'A promoted entry inside a mega menu.',
        name: 'TopNavMegaMenuFeaturedCard',
        status: 'ready',
      },
      {
        description: 'A grouped menu inside the banner.',
        name: 'TopNavMenu',
        status: 'ready',
      },
    ],
  },
  {
    title: 'Overlay',
    entries: [
      {
        description: 'A decision that cannot be dismissed by the scrim.',
        name: 'AlertDialog',
        status: 'ready',
      },
      {
        description: 'A modal panel anchored to the bottom edge.',
        name: 'BottomSheet',
        status: 'ready',
      },
      {
        description: 'Runs a command by searching for it by name.',
        name: 'CommandPalette',
        status: 'ready',
      },
      {
        description: 'Interrupts the page with a modal surface.',
        name: 'Dialog',
        status: 'ready',
      },
      {
        description: 'Previews interactive detail on hover and focus.',
        name: 'HoverCard',
        status: 'ready',
      },
      {
        description: 'Portals a surface out of the stacking context.',
        name: 'Layer',
        status: 'ready',
      },
      {
        description: 'Shows one piece of media at viewport scale.',
        name: 'Lightbox',
        status: 'ready',
      },
      {
        description: 'Scrim, dismissal, focus, and scroll behaviour.',
        name: 'Overlay',
        status: 'ready',
      },
      {
        description: 'Floats content beside an anchor.',
        name: 'Popover',
        status: 'ready',
      },
      {
        description: 'Describes its trigger on hover and on focus.',
        name: 'Tooltip',
        status: 'ready',
      },
    ],
  },
  {
    title: 'Table & list',
    entries: [
      {
        description: 'Groups related items with list markup.',
        name: 'List',
        status: 'ready',
      },
      {
        description: 'One entry inside a List.',
        name: 'ListItem',
        status: 'ready',
      },
      {
        description: 'A leading slot, label, description, and trailing slot.',
        name: 'Item',
        status: 'ready',
      },
      {
        description: 'Labelled facts about one subject.',
        name: 'MetadataList',
        status: 'ready',
      },
      {
        description: 'Summary figures in a responsive grid.',
        name: 'MetricGrid',
        status: 'ready',
      },
      {
        description: 'Leading entries with the rest folded into a menu.',
        name: 'OverflowList',
        status: 'ready',
      },
      {
        description: 'Rows and columns with semantic table markup.',
        name: 'Table',
        status: 'ready',
      },
      {
        description: 'A collapsible hierarchy as one tab stop.',
        name: 'TreeList',
        status: 'ready',
      },
    ],
  },
  {
    title: 'Utility',
    entries: [
      {
        description: 'Supplies the locale, direction, and strings.',
        name: 'InternationalizationProvider',
        status: 'ready',
      },
      {
        description: 'Injects the host application’s router.',
        name: 'LinkProvider',
        status: 'ready',
      },
      {
        description: 'Supplies the theme registry and density.',
        name: 'ThemeProvider',
        status: 'ready',
      },
      {
        description: 'Available to screen readers, not to sighted eyes.',
        name: 'VisuallyHidden',
        status: 'ready',
      },
    ],
  },
];

/** Every entry, flattened — used by the search field and the counts. */
export const allEntries: readonly CatalogEntry[] = componentCatalog.flatMap(
  (group) => group.entries,
);
