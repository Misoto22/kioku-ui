/** The categories a reader filters templates by. */
export const templateCategories = [
  'All',
  'Login',
  'Shell',
  'Table',
  'Form',
  'Settings',
  'Content',
  'AI chat',
  'Gallery',
  'Tools',
] as const;

export type TemplateCategory = (typeof templateCategories)[number];

export interface TemplateEntry {
  readonly category: Exclude<TemplateCategory, 'All'>;
  readonly description: string;
  readonly id: string;
  readonly status: 'planned' | 'ready';
  readonly title: string;
}

/**
 * Mirrors the CLI's template assets. `ready` means `kioku-ui add pages <id>`
 * writes it out today; `planned` means the id is reserved and the page is not
 * written yet — listing it is honest, hiding it would suggest the library is
 * smaller than it intends to be.
 */
export const templateCatalog: readonly TemplateEntry[] = [
  {
    category: 'Content',
    description: 'An empty page inside the application shell.',
    id: 'blank',
    status: 'ready',
    title: 'Blank page',
  },
  {
    category: 'Table',
    description: 'A metric overview with a rail, tiles, and recent activity.',
    id: 'dashboard',
    status: 'ready',
    title: 'Dashboard',
  },
  {
    category: 'Shell',
    description:
      "A console's first screen: a grouped rail, a hanging chapter head, three figures, a feed, and a queue.",
    id: 'console-home',
    status: 'ready',
    title: 'Console home',
  },
  {
    category: 'Table',
    description:
      'Records under their own narrowing: a query showing applied filters, a period switch, and paging.',
    id: 'records-table',
    status: 'ready',
    title: 'Records table',
  },
  {
    category: 'Form',
    description:
      'Two settings blocks that behave differently: one applies as it changes, the other is a form.',
    id: 'appearance-settings',
    status: 'ready',
    title: 'Appearance settings',
  },
  {
    category: 'Login',
    description: 'A plain centred sign-in form with an error summary.',
    id: 'login',
    status: 'ready',
    title: 'Login',
  },
  {
    category: 'Login',
    description: 'A centred sign-in card.',
    id: 'login-card',
    status: 'ready',
    title: 'Login card',
  },
  {
    category: 'Login',
    description: 'A two-column sign-in page with a brand panel.',
    id: 'login-split',
    status: 'ready',
    title: 'Split login',
  },
  {
    category: 'Login',
    description: 'Single sign-on first, with an email fallback.',
    id: 'login-sso',
    status: 'ready',
    title: 'SSO login',
  },
  {
    category: 'Shell',
    description: 'A banner with horizontal navigation, collapsing to a drawer.',
    id: 'shell-top-nav',
    status: 'ready',
    title: 'Top navigation shell',
  },
  {
    category: 'Shell',
    description: 'A persistent rail with grouped destinations.',
    id: 'shell-side-nav',
    status: 'ready',
    title: 'Side navigation shell',
  },
  {
    category: 'Shell',
    description: 'Banner, rail, main region, and an in-page outline.',
    id: 'shell-nav',
    status: 'ready',
    title: 'Full navigation shell',
  },
  {
    category: 'AI chat',
    description: 'A resizable conversation list beside a transcript.',
    id: 'messaging-shell',
    status: 'ready',
    title: 'Messaging shell',
  },
  {
    category: 'Form',
    description: 'An enquiry form that collects every error before reporting.',
    id: 'contact-form',
    status: 'ready',
    title: 'Contact form',
  },
  {
    category: 'Form',
    description: 'A long form split into titled sections across two columns.',
    id: 'form-two-column',
    status: 'ready',
    title: 'Two-column form',
  },
  {
    category: 'Form',
    description:
      'Checkout whose card fields are mounted by the payment provider.',
    id: 'payment-form',
    status: 'ready',
    title: 'Payment form',
  },
  {
    category: 'Settings',
    description: 'Switches that apply at once; destructive actions confirmed.',
    id: 'settings',
    status: 'ready',
    title: 'Settings',
  },
  {
    category: 'Settings',
    description: 'Settings split across sections reached from a rail.',
    id: 'settings-sidebar',
    status: 'ready',
    title: 'Settings with sidebar',
  },
  {
    category: 'Settings',
    description: 'Settings in a modal, staged and applied on save.',
    id: 'settings-dialog',
    status: 'ready',
    title: 'Settings dialog',
  },

  {
    category: 'Table',
    description: 'A sortable table page with filters and pagination.',
    id: 'table',
    status: 'planned',
    title: 'Table',
  },
  {
    category: 'Table',
    description: 'A full table page with header, filters, and bulk actions.',
    id: 'table-page',
    status: 'planned',
    title: 'Table page',
  },
  {
    category: 'Table',
    description: 'Rows collected under collapsible group headers.',
    id: 'table-grouped',
    status: 'planned',
    title: 'Grouped table',
  },
  {
    category: 'Table',
    description: 'A live incident list with severity and assignment.',
    id: 'incident-console',
    status: 'planned',
    title: 'Incident console',
  },
  {
    category: 'Table',
    description: 'Columns of cards moved between states.',
    id: 'kanban-board',
    status: 'planned',
    title: 'Kanban board',
  },
  {
    category: 'Content',
    description: 'A documentation page with an in-page outline.',
    id: 'documentation',
    status: 'planned',
    title: 'Documentation',
  },
  {
    category: 'Content',
    description: 'Documentation tuned for design guidance.',
    id: 'documentation-design',
    status: 'planned',
    title: 'Design documentation',
  },
  {
    category: 'Content',
    description: 'Documentation tuned for API reference.',
    id: 'documentation-technical',
    status: 'planned',
    title: 'Technical documentation',
  },
  {
    category: 'Content',
    description: 'A searchable library of records.',
    id: 'library',
    status: 'planned',
    title: 'Library',
  },
  {
    category: 'Content',
    description: 'A single record with its metadata and actions.',
    id: 'detail-page',
    status: 'planned',
    title: 'Detail page',
  },
  {
    category: 'Content',
    description: 'A dashboard variant weighted to a portfolio.',
    id: 'dashboard-portfolio',
    status: 'planned',
    title: 'Portfolio dashboard',
  },
  {
    category: 'Gallery',
    description: 'A hero image above a gallery grid.',
    id: 'gallery-hero',
    status: 'planned',
    title: 'Gallery with hero',
  },
  {
    category: 'Gallery',
    description: 'An even grid of images.',
    id: 'classic-gallery',
    status: 'planned',
    title: 'Classic gallery',
  },
  {
    category: 'Gallery',
    description: 'A gallery mixing portrait and landscape tiles.',
    id: 'mixed-gallery',
    status: 'planned',
    title: 'Mixed gallery',
  },
  {
    category: 'Gallery',
    description: 'A gallery beside a persistent detail rail.',
    id: 'side-gallery',
    status: 'planned',
    title: 'Side gallery',
  },
  {
    category: 'Gallery',
    description: 'A product grid with filters.',
    id: 'product-gallery',
    status: 'planned',
    title: 'Product gallery',
  },
  {
    category: 'Gallery',
    description: 'One product with media, options, and purchase.',
    id: 'product-detail',
    status: 'planned',
    title: 'Product detail',
  },
  {
    category: 'Content',
    description: 'A centred hero for a marketing page.',
    id: 'centered-hero',
    status: 'planned',
    title: 'Centred hero',
  },
  {
    category: 'Tools',
    description: 'A document editor with a formatting toolbar.',
    id: 'editor',
    status: 'planned',
    title: 'Editor',
  },
  {
    category: 'Tools',
    description: 'A three-pane development environment.',
    id: 'ide',
    status: 'planned',
    title: 'IDE',
  },
  {
    category: 'Tools',
    description: 'A tree of files beside a preview pane.',
    id: 'file-explorer',
    status: 'planned',
    title: 'File explorer',
  },
  {
    category: 'AI chat',
    description: 'A full-height assistant conversation.',
    id: 'ai-chat',
    status: 'planned',
    title: 'AI chat',
  },
  {
    category: 'AI chat',
    description: 'A landing page introducing an assistant.',
    id: 'ai-chat-landing',
    status: 'planned',
    title: 'AI chat landing',
  },
  {
    category: 'Content',
    description: 'Every theme shown against the same content.',
    id: 'theme-showcase',
    status: 'planned',
    title: 'Theme showcase',
  },
];
