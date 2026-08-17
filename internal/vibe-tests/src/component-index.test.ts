import {describe, expect, it} from 'vitest';

import {
  componentCatalogProblems,
  publicComponentNamesFromSource,
  workspaceComponentCatalogProblems,
  workspacePublicComponentNames,
} from './component-index.js';

interface StoryModuleContractFixture {
  readonly componentName?: string;
  readonly file: string;
  readonly storyNames: readonly string[];
  readonly title?: string;
}

type StoryArchitectureProblems = (
  components: readonly string[],
  stories: readonly StoryModuleContractFixture[],
) => string[];

type StoryModuleContractFromSource = (
  sourceText: string,
  file?: string,
) => StoryModuleContractFixture;

type StorySourceProblems = (sourceText: string, file?: string) => string[];

async function architecturePolicy() {
  const module = (await import('./component-index.js')) as unknown as {
    storyArchitectureProblems?: StoryArchitectureProblems;
    storyModuleContractFromSource?: StoryModuleContractFromSource;
    storySourceProblems?: StorySourceProblems;
  };

  return {
    storyArchitectureProblems: module.storyArchitectureProblems ?? (() => []),
    storyModuleContractFromSource:
      module.storyModuleContractFromSource ??
      ((_, file = 'Unknown.stories.tsx') => ({file, storyNames: []})),
    storySourceProblems: module.storySourceProblems ?? (() => []),
  };
}

describe('component catalog policy', () => {
  it('fails when a public component has no documentation metadata or story', async () => {
    await expect(componentCatalogProblems(['Button'])).resolves.toEqual([
      'Button is missing a Storybook story',
      'Button is missing component documentation metadata',
    ]);
  });

  it('accepts a public component with valid metadata and its declared story', async () => {
    await expect(
      componentCatalogProblems(['Button'], {
        docs: [
          {
            name: 'Button',
            description: 'Triggers an action.',
            props: [{name: 'variant', description: 'Sets the emphasis.'}],
            inheritedProps: ['ButtonHTMLAttributes<HTMLButtonElement>'],
            example: '<Button>Save</Button>',
            storyId: 'controls--button',
          },
        ],
        storyIds: ['controls--button'],
      }),
    ).resolves.toEqual([]);
  });

  it('rejects malformed metadata even when its story exists', async () => {
    await expect(
      componentCatalogProblems(['Button'], {
        docs: [
          {
            name: 'Button',
            description: '',
            props: [{name: 'variant', description: 'Sets the emphasis.'}],
            inheritedProps: ['ButtonHTMLAttributes<HTMLButtonElement>'],
            example: '<Button>Save</Button>',
            storyId: 'controls--button',
          },
        ],
        storyIds: ['controls--button'],
      }),
    ).resolves.toEqual([
      'Button has invalid component documentation metadata: description',
    ]);
  });

  it('derives a root provider and reports its missing story and metadata', async () => {
    const names = publicComponentNamesFromSource(`
export {Button, type ButtonProps} from './components/index.js';
export {ThemeProvider, useTheme, type ThemeProviderProps} from './theme/index.js';
`);

    await expect(
      componentCatalogProblems(names, {
        docs: [
          {
            name: 'Button',
            description: 'Triggers an action.',
            props: [{name: 'children', description: 'Sets the label.'}],
            inheritedProps: ['ButtonHTMLAttributes<HTMLButtonElement>'],
            example: '<Button>Save</Button>',
            storyId: 'controls--button',
          },
        ],
        storyIds: ['controls--button'],
      }),
    ).resolves.toEqual([
      'ThemeProvider is missing a Storybook story',
      'ThemeProvider is missing component documentation metadata',
    ]);
  });

  it('derives component candidates from the public root barrel', async () => {
    await expect(workspacePublicComponentNames()).resolves.toEqual(
      expect.arrayContaining(['Link', 'LinkProvider', 'ThemeProvider']),
    );
  });

  it('keeps every public core component discoverable', async () => {
    await expect(workspaceComponentCatalogProblems()).resolves.toEqual([]);
  });

  it('resolves metadata component ownership through named import aliases', async () => {
    const {storyModuleContractFromSource} = await architecturePolicy();

    expect(
      storyModuleContractFromSource(
        `
import type {Meta, StoryObj} from '@storybook/react-vite';
import {Badge as BadgeComponent} from '@misoto22/kioku-ui';

const meta = {
  title: 'Core/Badge',
  component: BadgeComponent,
} satisfies Meta<typeof BadgeComponent>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {args: {children: 'Ready'}};
export const Tones: Story = {render: () => <BadgeComponent>Ready</BadgeComponent>};
export const Composition: Story = {render: () => <BadgeComponent>Ready</BadgeComponent>};
`,
        'Badge.stories.tsx',
      ),
    ).toEqual({
      componentName: 'Badge',
      file: 'Badge.stories.tsx',
      storyNames: ['Default', 'Tones', 'Composition'],
      title: 'Core/Badge',
    });
  });

  it('rejects cross-component metadata ownership and duplicate owners', async () => {
    const {storyArchitectureProblems} = await architecturePolicy();

    expect(
      storyArchitectureProblems(
        ['Badge', 'Button'],
        [
          {
            componentName: 'Button',
            file: 'Badge.stories.tsx',
            storyNames: ['Default', 'Tones', 'Composition'],
            title: 'Core/Badge',
          },
          {
            componentName: 'Button',
            file: 'Button.stories.tsx',
            storyNames: [
              'Default',
              'Variants',
              'Sizes',
              'States',
              'Disabled',
              'Loading',
              'Composition',
            ],
            title: 'Core/Button',
          },
        ],
      ),
    ).toEqual([
      'Badge is missing a Storybook metadata owner',
      'Button has duplicate Storybook metadata owners: Badge.stories.tsx, Button.stories.tsx',
      'Badge.stories.tsx metadata title must be Core/Button for component Button',
    ]);
  });

  it('requires the canonical Core title and exact applicable story breadth', async () => {
    const {storyArchitectureProblems} = await architecturePolicy();

    expect(
      storyArchitectureProblems(
        ['Button'],
        [
          {
            componentName: 'Button',
            file: 'Button.stories.tsx',
            storyNames: ['Default'],
            title: 'Controls/Button',
          },
        ],
      ),
    ).toEqual([
      'Button metadata title must be Core/Button',
      'Button is missing required stories: Variants, Sizes, States, Disabled, Loading, Composition',
    ]);
  });

  it('rejects structural Card and Table stories outside valid parent composition', async () => {
    const {storySourceProblems} = await architecturePolicy();

    expect(
      storySourceProblems(
        `
import {Card, CardHeader} from '@misoto22/kioku-ui';
export const CardHeaderStory = {render: () => <CardHeader>Workspace access</CardHeader>};
`,
        'Card.stories.tsx',
      ),
    ).toEqual([
      'Card.stories.tsx story CardHeaderStory must render CardHeader within a complete Card composition',
    ]);

    expect(
      storySourceProblems(
        `
import {Table, TableCell} from '@misoto22/kioku-ui';
export const TableCell: Story = {render: () => <TableCell>Scheduled</TableCell>};
`,
        'Table.stories.tsx',
      ),
    ).toEqual([
      'Table.stories.tsx story TableCell must render TableCell within a complete Table composition',
    ]);
  });

  it('rejects structural name co-occurrence outside the actual render return path', async () => {
    const {storySourceProblems} = await architecturePolicy();

    const problems = storySourceProblems(
      `
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@misoto22/kioku-ui';

function CompleteButUnused() {
  return (
    <Table>
      <TableCaption>Delivery activity</TableCaption>
      <TableHead><TableRow><TableHeaderCell>Region</TableHeaderCell></TableRow></TableHead>
      <TableBody><TableRow><TableCell>North</TableCell></TableRow></TableBody>
    </Table>
  );
}

export const TableCellStory = {
  render: () => <TableCell>Rendered without its table</TableCell>,
  unused: <CompleteButUnused />,
};
`,
      'Table.stories.tsx',
    );

    expect(problems).toContain(
      'Table.stories.tsx story TableCellStory must render TableCell within a complete Table composition',
    );
  });

  it('rejects a structural helper when any return path escapes its parent composition', async () => {
    const {storySourceProblems} = await architecturePolicy();

    const problems = storySourceProblems(
      `
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeaderCell, TableRow} from '@misoto22/kioku-ui';
function MaybeComplete({complete}: {complete: boolean}) {
  if (!complete) return <TableCell>Escaped cell</TableCell>;
  return (
    <Table>
      <TableCaption>Delivery activity</TableCaption>
      <TableHead><TableRow><TableHeaderCell>Region</TableHeaderCell></TableRow></TableHead>
      <TableBody><TableRow><TableCell>North</TableCell></TableRow></TableBody>
    </Table>
  );
}
export const TableCellStory = {render: () => <MaybeComplete complete={false} />};
`,
      'Table.stories.tsx',
    );

    expect(problems).toContain(
      'Table.stories.tsx story TableCellStory must render TableCell within a complete Table composition',
    );
  });

  it('rejects invalid direct Table and Card structural parent chains', async () => {
    const {storySourceProblems} = await architecturePolicy();

    const directTableRow = storySourceProblems(
      `
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeaderCell, TableRow} from '@misoto22/kioku-ui';
export const TableRowStory = {render: () => (
  <Table>
    <TableCaption>Delivery activity</TableCaption>
    <TableHead><TableRow><TableHeaderCell>Region</TableHeaderCell></TableRow></TableHead>
    <TableBody><TableRow><TableCell>North</TableCell></TableRow></TableBody>
    <TableRow><TableCell>Direct child</TableCell></TableRow>
  </Table>
)};
`,
      'Table.stories.tsx',
    );
    expect(directTableRow).toContain(
      'Table.stories.tsx story TableRowStory has invalid structural hierarchy: TableRow must be a direct child of TableHead or TableBody',
    );

    const wrongCells = storySourceProblems(
      `
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeaderCell, TableRow} from '@misoto22/kioku-ui';
export const TableCellStory = {render: () => (
  <Table>
    <TableCaption>Delivery activity</TableCaption>
    <TableHead><TableRow><TableCell>Wrong head cell</TableCell></TableRow></TableHead>
    <TableBody><TableRow><TableHeaderCell>Wrong body cell</TableHeaderCell></TableRow></TableBody>
  </Table>
)};
`,
      'Table.stories.tsx',
    );
    expect(wrongCells).toEqual(
      expect.arrayContaining([
        'Table.stories.tsx story TableCellStory has invalid structural hierarchy: TableCell must belong to a TableRow in TableBody',
        'Table.stories.tsx story TableCellStory has invalid structural hierarchy: TableHeaderCell must belong to a TableRow in TableHead',
      ]),
    );

    const nestedCardParts = storySourceProblems(
      `
import {Card, CardFooter, CardHeader} from '@misoto22/kioku-ui';
export const CardHeaderStory = {render: () => (
  <Card><div><CardHeader>Access</CardHeader></div><CardFooter>Review</CardFooter></Card>
)};
`,
      'Card.stories.tsx',
    );
    expect(nestedCardParts).toContain(
      'Card.stories.tsx story CardHeaderStory has invalid structural hierarchy: CardHeader must be a direct child of Card',
    );
  });

  it('requires a component-owned Default render to apply its Storybook args', async () => {
    const {storySourceProblems} = await architecturePolicy();

    expect(
      storySourceProblems(
        `
import {Button} from '@misoto22/kioku-ui';
const meta = {title: 'Core/Button', component: Button};
export default meta;
export const Default = {render: (args) => <Button>Fixed label</Button>};
`,
        'Button.stories.tsx',
      ),
    ).toContain(
      'Button.stories.tsx story Default render must apply its Storybook args',
    );

    expect(
      storySourceProblems(
        `
import {Button} from '@misoto22/kioku-ui';
const meta = {title: 'Core/Button', component: Button};
export default meta;
export const Default = {render: (args) => <Button {...args} />};
`,
        'Button.stories.tsx',
      ),
    ).not.toContain(
      'Button.stories.tsx story Default render must apply its Storybook args',
    );
  });

  it('requires interactive state stories to drive focus and pointer state', async () => {
    const {storySourceProblems} = await architecturePolicy();

    const problems = storySourceProblems(
      `
import {Button} from '@misoto22/kioku-ui';
const meta = {title: 'Core/Button', component: Button};
export default meta;
export const States = {
  render: () => <Button data-story-state="rest">Rest only</Button>,
};
`,
      'Button.stories.tsx',
    );

    expect(problems).toEqual(
      expect.arrayContaining([
        'Button.stories.tsx story States must expose rest, hover, focus, and active state targets',
        'Button.stories.tsx story States must drive its targets with a play function',
      ]),
    );
  });

  it('requires every Table state row to contain interactive content', async () => {
    const {storySourceProblems} = await architecturePolicy();

    const problems = storySourceProblems(
      `
import {Link, Table, TableBody, TableCaption, TableCell, TableHead, TableHeaderCell, TableRow} from '@misoto22/kioku-ui';
const meta = {title: 'Core/Table', component: Table};
export default meta;
function Fixture() {
  return <Table>
    <TableCaption>Deliveries</TableCaption>
    <TableHead><TableRow><TableHeaderCell>Region</TableHeaderCell></TableRow></TableHead>
    <TableBody>
      <TableRow data-story-state="rest"><TableCell><Link href="/rest">Rest</Link></TableCell></TableRow>
      <TableRow data-story-state="hover"><TableCell>Hover without an action</TableCell></TableRow>
      <TableRow data-story-state="focus"><TableCell><Link href="/focus">Focus</Link></TableCell></TableRow>
      <TableRow data-story-state="active"><TableCell><Link href="/active">Active</Link></TableCell></TableRow>
    </TableBody>
  </Table>;
}
export const Default = {render: (args) => <Fixture {...args} />};
export const States = {
  render: () => <Fixture />,
  play: async ({canvasElement, userEvent}) => {
    canvasElement.querySelector('a').focus();
    await userEvent.pointer({keys: '[MouseLeft>]'});
  },
};
`,
      'Table.stories.tsx',
    );

    expect(problems).toContain(
      'Table.stories.tsx story States must put interactive content in every state row',
    );
  });

  it('rejects scaffold placeholder copy through the TypeScript syntax tree', async () => {
    const {storySourceProblems} = await architecturePolicy();

    expect(
      storySourceProblems(
        `
import {Stack, Text} from '@misoto22/kioku-ui';
export const Default = {
  render: () => <Stack><Text>First item</Text><Text>{'Alpha'}</Text></Stack>,
};
export const Composition = {args: {children: 'Example values'}};
`,
        'Stack.stories.tsx',
      ),
    ).toEqual([
      'Stack.stories.tsx contains placeholder copy: Alpha, Example values, First item',
    ]);
  });
});
