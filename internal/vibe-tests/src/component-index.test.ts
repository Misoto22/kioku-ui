import {describe, expect, it} from 'vitest';

import {
  componentCatalogProblems,
  workspaceComponentCatalogProblems,
} from './component-index.js';

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

  it('keeps every public core component discoverable', async () => {
    await expect(workspaceComponentCatalogProblems()).resolves.toEqual([]);
  });
});
