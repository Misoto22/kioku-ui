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
