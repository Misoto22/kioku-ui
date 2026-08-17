import {execFile} from 'node:child_process';
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {promisify} from 'node:util';

import {afterAll, beforeAll, describe, expect, it} from 'vitest';

const run = promisify(execFile);
const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const packageName = ['@misoto22', 'kioku-ui'].join('/');
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const temporaryDirectories: string[] = [];

async function runPnpm(arguments_: string[], cwd = packageRoot) {
  try {
    return await run(pnpm, arguments_, {cwd});
  } catch (error) {
    const result = error as Error & {stderr?: string; stdout?: string};
    throw new Error(
      [result.message, result.stdout, result.stderr].filter(Boolean).join('\n'),
      {cause: error},
    );
  }
}

async function createCssIgnoringLoader(fixtureRoot: string) {
  const loader = join(fixtureRoot, 'ignore-css.mjs');
  await writeFile(
    loader,
    `export async function load(url, context, nextLoad) {
  if (url.endsWith('.css')) {
    return {format: 'module', shortCircuit: true, source: 'export {};'};
  }
  return nextLoad(url, context);
}
`,
  );
  return loader;
}

function classNames(markup: string) {
  return (
    markup
      .match(/class="([^"]+)"/)?.[1]
      ?.split(' ')
      .filter(Boolean) ?? []
  );
}

function elementMarkup(markup: string, tagName: string, index = 0) {
  return (
    Array.from(
      markup.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'g')),
      (match) => match[0],
    )[index] ?? ''
  );
}

function semanticVariable(packageCss: string, customProperty: string) {
  const variable = packageCss.match(
    new RegExp(`(--[a-z0-9]+):var\\(${customProperty}\\)`),
  )?.[1];
  expect(variable, `Missing StyleX bridge for ${customProperty}`).toBeDefined();
  return variable as string;
}

function expectRenderedRule(
  packageCss: string,
  markup: string,
  declaration: string,
  state?:
    | ':hover'
    | ':active'
    | ':focus-visible'
    | ':disabled'
    | '::before'
    | '::placeholder',
  excludesDisabled = false,
  requiredSelectorParts: readonly string[] = [],
) {
  const matched = packageCss.split('}').some((rule) => {
    const [selector = ''] = rule.split('{');
    const hasState = state
      ? selector.includes(state)
      : ![
          ':hover',
          ':active',
          ':focus-visible',
          ':disabled',
          '::before',
          '::placeholder',
        ].some((candidate) => selector.includes(candidate));
    return (
      hasState &&
      (!excludesDisabled || selector.includes(':not(:disabled)')) &&
      requiredSelectorParts.every((part) => selector.includes(part)) &&
      rule.includes(declaration) &&
      classNames(markup).some((className) => selector.includes(`.${className}`))
    );
  });

  expect(matched, `Missing ${state ?? 'rest'} rule: ${declaration}`).toBe(true);
}

function expectNoRenderedDeclaration(
  packageCss: string,
  markup: string,
  declaration: string,
) {
  const matched = packageCss.split('}').some((rule) => {
    const [selector = ''] = rule.split('{');
    return (
      ![
        ':hover',
        ':active',
        ':focus-visible',
        ':disabled',
        '::before',
        '::placeholder',
      ].some((candidate) => selector.includes(candidate)) &&
      rule.includes(declaration) &&
      classNames(markup).some((className) => selector.includes(`.${className}`))
    );
  });

  expect(matched, `Unexpected rest declaration: ${declaration}`).toBe(false);
}

function expectNoRenderedRule(
  packageCss: string,
  markup: string,
  declaration: string,
  state: ':hover' | ':active',
) {
  const matched = packageCss.split('}').some((rule) => {
    const [selector = ''] = rule.split('{');
    return (
      selector.includes(state) &&
      rule.includes(declaration) &&
      classNames(markup).some((className) => selector.includes(`.${className}`))
    );
  });

  expect(matched, `Unexpected ${state} rule: ${declaration}`).toBe(false);
}

describe('published package build', () => {
  beforeAll(async () => {
    await runPnpm(['build']);
  });

  afterAll(async () => {
    await Promise.all(
      temporaryDirectories.map((directory) =>
        rm(directory, {force: true, recursive: true}),
      ),
    );
  });

  it('compiles a StyleX recipe through the stable public authoring module', async () => {
    const fixtureRoot = await mkdtemp(
      join(packageRoot, '.test-public-authoring-'),
    );
    temporaryDirectories.push(fixtureRoot);

    const input = join(fixtureRoot, 'input');
    const output = join(fixtureRoot, 'output');
    await mkdir(input);
    await writeFile(
      join(input, 'consumer.stylex.ts'),
      `import * as stylex from '@stylexjs/stylex';
import {semanticTokens} from '${packageName}/authoring.stylex';

export const consumerStyles = stylex.create({
  root: {color: semanticTokens.colorText},
});
`,
    );

    await runPnpm([
      'exec',
      'stylex',
      '-i',
      input,
      '-o',
      output,
      '-b',
      'stylex.css',
      '--babelPresets',
      '@babel/preset-typescript',
    ]);

    const css = await readFile(join(output, 'stylex.css'), 'utf8');
    const referencedVariable = css.match(/color:var\((--[^)]+)\)/)?.[1];
    expect(referencedVariable).toBeDefined();

    const packageCss = await readFile(
      join(packageRoot, 'dist/styles/stylex.css'),
      'utf8',
    );
    expect(packageCss).toContain(
      `${referencedVariable}:var(--kioku-ui-color-text)`,
    );
  });

  it('emits every final semantic bridge without legacy radius or density properties', async () => {
    const packageCss = await readFile(
      join(packageRoot, 'dist/styles/stylex.css'),
      'utf8',
    );

    for (const customProperty of [
      '--kioku-ui-color-surface-raised',
      '--kioku-ui-color-surface-muted',
      '--kioku-ui-color-text-secondary',
      '--kioku-ui-color-text-muted',
      '--kioku-ui-color-text-on-accent',
      '--kioku-ui-color-accent',
      '--kioku-ui-color-accent-hover',
      '--kioku-ui-color-accent-active',
      '--kioku-ui-color-overlay-hover',
      '--kioku-ui-color-overlay-active',
      '--kioku-ui-color-disabled-surface',
      '--kioku-ui-color-disabled-text',
      '--kioku-ui-border-interactive',
      '--kioku-ui-border-disabled',
      '--kioku-ui-typography-font-family-display',
      '--kioku-ui-typography-font-size-xs',
      '--kioku-ui-typography-font-size2xl',
      '--kioku-ui-radius-inner',
      '--kioku-ui-radius-element',
      '--kioku-ui-radius-container',
      '--kioku-ui-radius-page',
      '--kioku-ui-radius-full',
      '--kioku-ui-size-control-sm',
      '--kioku-ui-size-control-md',
      '--kioku-ui-size-control-lg',
      '--kioku-ui-size-hit-target',
    ]) {
      expect(packageCss).toContain(`var(${customProperty})`);
    }

    for (const legacyProperty of [
      '--kioku-ui-radius-sm',
      '--kioku-ui-radius-md',
      '--kioku-ui-radius-lg',
      '--kioku-ui-radius-round',
      '--kioku-ui-density-control-block',
      '--kioku-ui-density-control-inline',
      '--kioku-ui-density-item-gap',
    ]) {
      expect(packageCss).not.toContain(legacyProperty);
    }
  });

  it('ships action sizes, variants, states, and badge tones in compiled CSS', async () => {
    const fixtureRoot = await mkdtemp(join(packageRoot, '.test-actions-'));
    temporaryDirectories.push(fixtureRoot);
    const loader = await createCssIgnoringLoader(fixtureRoot);
    const runtime = join(fixtureRoot, 'consumer.mjs');

    await writeFile(
      runtime,
      `import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Badge, Button, IconButton} from '${packageName}';

const render = (component, props, children) =>
  renderToStaticMarkup(createElement(component, props, children));

process.stdout.write(JSON.stringify({
  buttonDefault: render(Button, {}, 'Default'),
  buttonSm: render(Button, {size: 'sm'}, 'Small'),
  buttonMd: render(Button, {size: 'md'}, 'Medium'),
  buttonLg: render(Button, {size: 'lg'}, 'Large'),
  buttonPrimary: render(Button, {variant: 'primary'}, 'Primary'),
  buttonSecondary: render(Button, {variant: 'secondary'}, 'Secondary'),
  buttonGhost: render(Button, {variant: 'ghost'}, 'Ghost'),
  buttonDestructive: render(Button, {variant: 'destructive'}, 'Delete'),
  buttonLoading: render(Button, {loading: true}, 'Saving'),
  iconDefault: render(IconButton, {'aria-label': 'Default icon'}, 'D'),
  iconSm: render(IconButton, {'aria-label': 'Small icon', size: 'sm'}, 'S'),
  iconMd: render(IconButton, {'aria-label': 'Medium icon', size: 'md'}, 'M'),
  iconLg: render(IconButton, {'aria-label': 'Large icon', size: 'lg'}, 'L'),
  iconDestructive: render(
    IconButton,
    {'aria-label': 'Delete icon', variant: 'destructive'},
    'D',
  ),
  badgeNeutral: render(Badge, {}, 'Neutral'),
  badgeInfo: render(Badge, {tone: 'info'}, 'Info'),
  badgeSuccess: render(Badge, {tone: 'success'}, 'Success'),
  badgeWarning: render(Badge, {tone: 'warning'}, 'Warning'),
  badgeDanger: render(Badge, {tone: 'danger'}, 'Danger'),
}));
`,
    );

    const {stdout} = await run(
      process.execPath,
      ['--experimental-loader', pathToFileURL(loader).href, runtime],
      {cwd: fixtureRoot},
    );
    const markup = JSON.parse(stdout) as Record<string, string>;
    const packageCss = await readFile(
      join(packageRoot, 'dist/styles/stylex.css'),
      'utf8',
    );
    const variable = (customProperty: string) =>
      semanticVariable(packageCss, customProperty);

    for (const [name, customProperty] of [
      ['buttonDefault', '--kioku-ui-size-control-md'],
      ['buttonSm', '--kioku-ui-size-control-sm'],
      ['buttonMd', '--kioku-ui-size-control-md'],
      ['buttonLg', '--kioku-ui-size-control-lg'],
      ['iconDefault', '--kioku-ui-size-control-md'],
      ['iconSm', '--kioku-ui-size-control-sm'],
      ['iconMd', '--kioku-ui-size-control-md'],
      ['iconLg', '--kioku-ui-size-control-lg'],
    ] as const) {
      expectRenderedRule(
        packageCss,
        markup[name],
        `height:var(${variable(customProperty)})`,
      );
    }
    for (const [name, customProperty] of [
      ['iconDefault', '--kioku-ui-size-control-md'],
      ['iconSm', '--kioku-ui-size-control-sm'],
      ['iconMd', '--kioku-ui-size-control-md'],
      ['iconLg', '--kioku-ui-size-control-lg'],
    ] as const) {
      expectRenderedRule(
        packageCss,
        markup[name],
        `width:var(${variable(customProperty)})`,
      );
    }

    expectRenderedRule(
      packageCss,
      markup.buttonPrimary,
      `background-color:var(${variable('--kioku-ui-color-accent')})`,
    );
    expectRenderedRule(
      packageCss,
      markup.buttonPrimary,
      `color:var(${variable('--kioku-ui-color-text-on-accent')})`,
    );
    expectRenderedRule(
      packageCss,
      markup.buttonPrimary,
      `background-color:var(${variable('--kioku-ui-color-accent-hover')})`,
      ':hover',
      true,
    );
    expectRenderedRule(
      packageCss,
      markup.buttonPrimary,
      `background-color:var(${variable('--kioku-ui-color-accent-active')})`,
      ':active',
      true,
    );
    expectRenderedRule(
      packageCss,
      markup.buttonSecondary,
      `background-color:var(${variable('--kioku-ui-color-surface')})`,
    );
    expectRenderedRule(
      packageCss,
      markup.buttonSecondary,
      `border-color:var(${variable('--kioku-ui-border-strong')})`,
    );
    expectRenderedRule(
      packageCss,
      markup.buttonSecondary,
      `background-color:var(${variable('--kioku-ui-color-overlay-hover')})`,
      ':hover',
      true,
    );
    expectRenderedRule(
      packageCss,
      markup.buttonSecondary,
      `background-color:var(${variable('--kioku-ui-color-overlay-active')})`,
      ':active',
      true,
    );
    expectRenderedRule(
      packageCss,
      markup.buttonGhost,
      'background-color:transparent',
    );
    expectRenderedRule(
      packageCss,
      markup.buttonGhost,
      `background-color:var(${variable('--kioku-ui-color-overlay-hover')})`,
      ':hover',
      true,
    );
    expectRenderedRule(
      packageCss,
      markup.buttonGhost,
      `background-color:var(${variable('--kioku-ui-color-overlay-active')})`,
      ':active',
      true,
    );
    for (const name of ['buttonDestructive', 'iconDestructive'] as const) {
      expectRenderedRule(
        packageCss,
        markup[name],
        `background-color:var(${variable('--kioku-ui-status-danger-surface')})`,
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `color:var(${variable('--kioku-ui-status-danger-text')})`,
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `background-image:linear-gradient(var(${variable('--kioku-ui-color-overlay-hover')}),var(${variable('--kioku-ui-color-overlay-hover')}))`,
        ':hover',
        true,
      );
      expectNoRenderedRule(
        packageCss,
        markup[name],
        'background-color:',
        ':hover',
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `background-image:linear-gradient(var(${variable('--kioku-ui-color-overlay-active')}),var(${variable('--kioku-ui-color-overlay-active')}))`,
        ':active',
        true,
      );
      expectNoRenderedRule(
        packageCss,
        markup[name],
        'background-color:',
        ':active',
      );
    }
    expectRenderedRule(
      packageCss,
      markup.buttonPrimary,
      `outline-color:var(${variable('--kioku-ui-color-focus')})`,
      ':focus-visible',
    );
    expectRenderedRule(
      packageCss,
      markup.buttonPrimary,
      `outline-offset:var(${variable('--kioku-ui-focus-offset')})`,
      ':focus-visible',
    );
    expectRenderedRule(
      packageCss,
      markup.buttonPrimary,
      `outline-width:var(${variable('--kioku-ui-focus-width')})`,
      ':focus-visible',
    );
    expectRenderedRule(
      packageCss,
      markup.buttonPrimary,
      `background-color:var(${variable('--kioku-ui-color-disabled-surface')})`,
      ':disabled',
    );
    expectRenderedRule(
      packageCss,
      markup.buttonPrimary,
      `border-color:var(${variable('--kioku-ui-border-disabled')})`,
      ':disabled',
    );
    expectRenderedRule(
      packageCss,
      markup.buttonPrimary,
      `color:var(${variable('--kioku-ui-color-disabled-text')})`,
      ':disabled',
    );
    expectRenderedRule(packageCss, markup.buttonLoading, 'cursor:progress');
    expectRenderedRule(
      packageCss,
      markup.iconMd,
      `height:var(${variable('--kioku-ui-size-hit-target')})`,
      '::before',
    );
    expectRenderedRule(
      packageCss,
      markup.iconMd,
      `width:var(${variable('--kioku-ui-size-hit-target')})`,
      '::before',
    );

    for (const [name, surface, text] of [
      [
        'badgeNeutral',
        '--kioku-ui-color-surface-muted',
        '--kioku-ui-color-text-secondary',
      ],
      [
        'badgeInfo',
        '--kioku-ui-status-info-surface',
        '--kioku-ui-status-info-text',
      ],
      [
        'badgeSuccess',
        '--kioku-ui-status-success-surface',
        '--kioku-ui-status-success-text',
      ],
      [
        'badgeWarning',
        '--kioku-ui-status-warning-surface',
        '--kioku-ui-status-warning-text',
      ],
      [
        'badgeDanger',
        '--kioku-ui-status-danger-surface',
        '--kioku-ui-status-danger-text',
      ],
    ] as const) {
      expectRenderedRule(
        packageCss,
        markup[name],
        `background-color:var(${variable(surface)})`,
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `color:var(${variable(text)})`,
      );
    }
  });

  it('ships normalized field and selection recipes in compiled CSS', async () => {
    const fixtureRoot = await mkdtemp(
      join(packageRoot, '.test-form-controls-'),
    );
    temporaryDirectories.push(fixtureRoot);
    const loader = await createCssIgnoringLoader(fixtureRoot);
    const runtime = join(fixtureRoot, 'consumer.mjs');

    await writeFile(
      runtime,
      `import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Field, SegmentedControl, TextArea, TextInput, Toggle} from '${packageName}';

const render = (component, props, children) =>
  renderToStaticMarkup(createElement(component, props, children));

const segmentOptions = [
  {label: 'Overview', value: 'overview'},
  {label: 'Activity', value: 'activity'},
];

process.stdout.write(JSON.stringify({
  field: render(
    Field,
    {
      description: 'Used for account notices.',
      label: 'Email',
      necessity: 'required',
      status: 'Enter a valid address.',
      statusTone: 'danger',
    },
    createElement(TextInput),
  ),
  input: render(TextInput, {'aria-label': 'Name'}),
  inputDisabled: render(TextInput, {'aria-label': 'Name', disabled: true}),
  inputInvalid: render(TextInput, {'aria-invalid': true, 'aria-label': 'Name'}),
  inputReadOnly: render(TextInput, {'aria-label': 'Name', readOnly: true}),
  textArea: render(TextArea, {'aria-label': 'Notes'}),
  textAreaDisabled: render(TextArea, {'aria-label': 'Notes', disabled: true}),
  textAreaInvalid: render(TextArea, {'aria-invalid': true, 'aria-label': 'Notes'}),
  textAreaReadOnly: render(TextArea, {'aria-label': 'Notes', readOnly: true}),
  toggleOff: render(Toggle, {'aria-label': 'Notifications'}),
  toggleOn: render(Toggle, {'aria-label': 'Notifications', pressed: true}),
  toggleDisabled: render(Toggle, {'aria-label': 'Notifications', disabled: true}),
  segmented: render(SegmentedControl, {
    'aria-label': 'View',
    options: segmentOptions,
    value: 'overview',
  }),
}));
`,
    );

    const {stdout} = await run(
      process.execPath,
      ['--experimental-loader', pathToFileURL(loader).href, runtime],
      {cwd: fixtureRoot},
    );
    const markup = JSON.parse(stdout) as Record<string, string>;
    const packageCss = await readFile(
      join(packageRoot, 'dist/styles/stylex.css'),
      'utf8',
    );
    const variable = (customProperty: string) =>
      semanticVariable(packageCss, customProperty);

    const fieldLabel = elementMarkup(markup.field, 'label');
    const fieldAnnotation = elementMarkup(markup.field, 'span', 1);
    const fieldDescription = elementMarkup(markup.field, 'p');
    const fieldStatus = elementMarkup(markup.field, 'p', 1);
    expectRenderedRule(
      packageCss,
      fieldLabel,
      `color:var(${variable('--kioku-ui-color-text')})`,
    );
    expectRenderedRule(
      packageCss,
      fieldAnnotation,
      `color:var(${variable('--kioku-ui-color-text-muted')})`,
    );
    expectRenderedRule(
      packageCss,
      fieldDescription,
      `color:var(${variable('--kioku-ui-color-text-secondary')})`,
    );
    expectRenderedRule(
      packageCss,
      fieldStatus,
      `color:var(${variable('--kioku-ui-status-danger-text')})`,
    );

    for (const name of ['input', 'textArea'] as const) {
      expectRenderedRule(
        packageCss,
        markup[name],
        `background-color:var(${variable('--kioku-ui-color-surface')})`,
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `border-color:var(${variable('--kioku-ui-border-default')})`,
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `border-radius:var(${variable('--kioku-ui-radius-element')})`,
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `color:var(${variable('--kioku-ui-color-text-muted')})`,
        '::placeholder',
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `border-color:var(${variable('--kioku-ui-border-interactive')})`,
        ':focus-visible',
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `outline-color:var(${variable('--kioku-ui-color-focus')})`,
        ':focus-visible',
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `outline-offset:var(${variable('--kioku-ui-focus-offset')})`,
        ':focus-visible',
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `outline-width:var(${variable('--kioku-ui-focus-width')})`,
        ':focus-visible',
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `border-color:var(${variable('--kioku-ui-border-interactive')})`,
        ':hover',
        true,
        [':not(:read-only)', ':not(:focus-visible)'],
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `border-color:var(${variable('--kioku-ui-color-accent-active')})`,
        ':active',
        true,
        [':not(:read-only)', ':not(:focus-visible)'],
      );
    }

    expectRenderedRule(
      packageCss,
      markup.input,
      `height:var(${variable('--kioku-ui-size-control-md')})`,
    );
    expectRenderedRule(packageCss, markup.input, 'box-sizing:border-box');
    expectRenderedRule(packageCss, markup.textArea, 'min-height:96px');

    for (const name of ['inputDisabled', 'textAreaDisabled'] as const) {
      expectRenderedRule(
        packageCss,
        markup[name],
        `background-color:var(${variable('--kioku-ui-color-disabled-surface')})`,
        ':disabled',
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `border-color:var(${variable('--kioku-ui-border-disabled')})`,
        ':disabled',
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `color:var(${variable('--kioku-ui-color-disabled-text')})`,
        ':disabled',
      );
    }

    for (const name of ['inputReadOnly', 'textAreaReadOnly'] as const) {
      expectRenderedRule(
        packageCss,
        markup[name],
        `background-color:var(${variable('--kioku-ui-color-surface-muted')})`,
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `color:var(${variable('--kioku-ui-color-text')})`,
      );
    }

    for (const name of ['inputInvalid', 'textAreaInvalid'] as const) {
      expectRenderedRule(
        packageCss,
        markup[name],
        `border-color:var(${variable('--kioku-ui-status-danger-text')})`,
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `outline-color:var(${variable('--kioku-ui-color-focus')})`,
        ':focus-visible',
      );
      for (const state of [':hover', ':active'] as const) {
        expectRenderedRule(
          packageCss,
          markup[name],
          `border-color:var(${variable('--kioku-ui-status-danger-text')})`,
          state,
          true,
          [':not(:read-only)', ':not(:focus-visible)'],
        );
      }
    }

    const toggleTrackOff = elementMarkup(markup.toggleOff, 'span');
    const toggleThumbOff = elementMarkup(markup.toggleOff, 'span', 1);
    const toggleTrackOn = elementMarkup(markup.toggleOn, 'span');
    expectRenderedRule(
      packageCss,
      markup.toggleOff,
      `min-height:var(${variable('--kioku-ui-size-hit-target')})`,
    );
    expectRenderedRule(
      packageCss,
      markup.toggleOff,
      `min-width:var(${variable('--kioku-ui-size-hit-target')})`,
    );
    expectRenderedRule(
      packageCss,
      toggleTrackOff,
      `background-color:var(${variable('--kioku-ui-color-surface-muted')})`,
    );
    expectRenderedRule(
      packageCss,
      toggleTrackOff,
      `width:var(${variable('--kioku-ui-size-control-lg')})`,
    );
    expectRenderedRule(
      packageCss,
      toggleThumbOff,
      `background-color:var(${variable('--kioku-ui-color-surface-raised')})`,
    );
    expectRenderedRule(
      packageCss,
      toggleTrackOn,
      `background-color:var(${variable('--kioku-ui-color-accent')})`,
    );
    expectRenderedRule(packageCss, toggleTrackOn, 'justify-content:flex-end');
    expectRenderedRule(
      packageCss,
      markup.toggleOff,
      `outline-color:var(${variable('--kioku-ui-color-focus')})`,
      ':focus-visible',
    );
    expectRenderedRule(
      packageCss,
      markup.toggleOff,
      `background-image:linear-gradient(var(${variable('--kioku-ui-color-overlay-hover')}),var(${variable('--kioku-ui-color-overlay-hover')}))`,
      ':hover',
      true,
    );
    expectRenderedRule(
      packageCss,
      markup.toggleOn,
      `background-image:linear-gradient(var(${variable('--kioku-ui-color-overlay-active')}),var(${variable('--kioku-ui-color-overlay-active')}))`,
      ':active',
      true,
    );
    expectNoRenderedRule(
      packageCss,
      markup.toggleOff,
      'background-color:',
      ':hover',
    );
    expectNoRenderedRule(
      packageCss,
      markup.toggleOn,
      'background-color:',
      ':active',
    );
    expectRenderedRule(
      packageCss,
      markup.toggleDisabled,
      `color:var(${variable('--kioku-ui-color-disabled-text')})`,
      ':disabled',
    );

    const segmentedRoot = elementMarkup(markup.segmented, 'div');
    const selectedSegment = elementMarkup(markup.segmented, 'button');
    const unselectedSegment = elementMarkup(markup.segmented, 'button', 1);
    expectRenderedRule(
      packageCss,
      segmentedRoot,
      `background-color:var(${variable('--kioku-ui-color-surface-muted')})`,
    );
    expectRenderedRule(
      packageCss,
      segmentedRoot,
      `border-radius:var(${variable('--kioku-ui-radius-element')})`,
    );
    expectRenderedRule(
      packageCss,
      selectedSegment,
      `background-color:var(${variable('--kioku-ui-color-surface-raised')})`,
    );
    expectRenderedRule(
      packageCss,
      selectedSegment,
      `box-shadow:var(${variable('--kioku-ui-elevation-low')})`,
    );
    expectRenderedRule(
      packageCss,
      unselectedSegment,
      `background-color:var(${variable('--kioku-ui-color-overlay-hover')})`,
      ':hover',
      true,
    );
    expectRenderedRule(
      packageCss,
      unselectedSegment,
      `background-color:var(${variable('--kioku-ui-color-overlay-active')})`,
      ':active',
      true,
    );
    expectNoRenderedDeclaration(packageCss, selectedSegment, 'border-color:');
    expectNoRenderedDeclaration(packageCss, unselectedSegment, 'border-color:');
  });

  it('ships typography hierarchy and one Card boundary in compiled CSS', async () => {
    const fixtureRoot = await mkdtemp(join(packageRoot, '.test-foundations-'));
    temporaryDirectories.push(fixtureRoot);
    const loader = await createCssIgnoringLoader(fixtureRoot);
    const runtime = join(fixtureRoot, 'consumer.mjs');

    await writeFile(
      runtime,
      `import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Card, CardFooter, CardHeader, Heading, Text} from '${packageName}';

const render = (component, props, children) =>
  renderToStaticMarkup(createElement(component, props, children));

process.stdout.write(JSON.stringify({
  textPrimary: render(Text, {}, 'Primary'),
  textSecondary: render(Text, {tone: 'secondary'}, 'Secondary'),
  textMuted: render(Text, {tone: 'muted'}, 'Muted'),
  headingInterface: render(Heading, {level: 2}, 'Interface'),
  headingDisplay: render(Heading, {family: 'display', level: 1}, 'Display'),
  headingPage: render(Heading, {level: 1, size: 'page'}, 'Page'),
  headingSection: render(Heading, {level: 2, size: 'section'}, 'Section'),
  headingSubsection: render(Heading, {level: 3, size: 'subsection'}, 'Subsection'),
  cardDefault: render(Card, {}, 'Default'),
  cardNone: render(Card, {elevation: 'none'}, 'None'),
  cardLow: render(Card, {elevation: 'low'}, 'Low'),
  cardMedium: render(Card, {elevation: 'medium'}, 'Medium'),
  cardComposition: render(Card, {}, [
    createElement(CardHeader, {key: 'header'}, 'Header'),
    createElement(Text, {key: 'body'}, 'Body'),
    createElement(CardFooter, {key: 'footer'}, 'Footer'),
  ]),
}));
`,
    );

    const {stdout} = await run(
      process.execPath,
      ['--experimental-loader', pathToFileURL(loader).href, runtime],
      {cwd: fixtureRoot},
    );
    const markup = JSON.parse(stdout) as Record<string, string>;
    const packageCss = await readFile(
      join(packageRoot, 'dist/styles/stylex.css'),
      'utf8',
    );
    const variable = (customProperty: string) =>
      semanticVariable(packageCss, customProperty);
    const cardHeader = elementMarkup(markup.cardComposition, 'header');
    const cardFooter = elementMarkup(markup.cardComposition, 'footer');

    for (const [name, customProperty] of [
      ['textPrimary', '--kioku-ui-color-text'],
      ['textSecondary', '--kioku-ui-color-text-secondary'],
      ['textMuted', '--kioku-ui-color-text-muted'],
    ] as const) {
      expectRenderedRule(
        packageCss,
        markup[name],
        `color:var(${variable(customProperty)})`,
      );
    }

    expectRenderedRule(
      packageCss,
      markup.headingInterface,
      `font-family:var(${variable('--kioku-ui-typography-font-family-heading')})`,
    );
    expectNoRenderedDeclaration(
      packageCss,
      markup.headingInterface,
      `font-family:var(${variable('--kioku-ui-typography-font-family-display')})`,
    );
    expectRenderedRule(
      packageCss,
      markup.headingDisplay,
      `font-family:var(${variable('--kioku-ui-typography-font-family-display')})`,
    );
    for (const [name, customProperty] of [
      ['headingPage', '--kioku-ui-typography-font-size2xl'],
      ['headingSection', '--kioku-ui-typography-font-size-xl'],
      ['headingSubsection', '--kioku-ui-typography-font-size-lg'],
    ] as const) {
      expectRenderedRule(
        packageCss,
        markup[name],
        `font-size:var(${variable(customProperty)})`,
      );
    }

    for (const name of ['cardDefault', 'cardNone'] as const) {
      expectRenderedRule(
        packageCss,
        markup[name],
        `border-color:var(${variable('--kioku-ui-border-default')})`,
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `border-width:var(${variable('--kioku-ui-border-width')})`,
      );
      expectRenderedRule(packageCss, markup[name], 'box-shadow:none');
    }
    for (const [name, customProperty] of [
      ['cardLow', '--kioku-ui-elevation-low'],
      ['cardMedium', '--kioku-ui-elevation-medium'],
    ] as const) {
      expectRenderedRule(packageCss, markup[name], 'border-style:none');
      expectRenderedRule(
        packageCss,
        markup[name],
        `box-shadow:var(${variable(customProperty)})`,
      );
      expectNoRenderedDeclaration(packageCss, markup[name], 'border-color:');
      expectNoRenderedDeclaration(packageCss, markup[name], 'border-width:');
    }
    for (const name of [
      'cardDefault',
      'cardNone',
      'cardLow',
      'cardMedium',
    ] as const) {
      expectRenderedRule(
        packageCss,
        markup[name],
        `padding:var(${variable('--kioku-ui-spacing-xl')})`,
      );
    }

    for (const name of ['cardHeader', 'cardFooter'] as const) {
      expectRenderedRule(
        packageCss,
        name === 'cardHeader' ? cardHeader : cardFooter,
        `margin-inline:calc(-1 * var(${variable('--kioku-ui-spacing-xl')}))`,
      );
      expectRenderedRule(
        packageCss,
        name === 'cardHeader' ? cardHeader : cardFooter,
        `padding-block:var(${variable('--kioku-ui-spacing-lg')})`,
      );
      expectRenderedRule(
        packageCss,
        name === 'cardHeader' ? cardHeader : cardFooter,
        `padding-inline:var(${variable('--kioku-ui-spacing-xl')})`,
      );
    }
    expectRenderedRule(
      packageCss,
      cardHeader,
      `border-bottom-color:var(${variable('--kioku-ui-border-default')})`,
    );
    expectRenderedRule(
      packageCss,
      cardHeader,
      `border-bottom-style:var(${variable('--kioku-ui-border-style')})`,
    );
    expectRenderedRule(
      packageCss,
      cardHeader,
      `border-bottom-width:var(${variable('--kioku-ui-border-width')})`,
    );
    expectRenderedRule(
      packageCss,
      cardHeader,
      `margin-top:calc(-1 * var(${variable('--kioku-ui-spacing-xl')}))`,
    );
    expectRenderedRule(
      packageCss,
      cardHeader,
      `margin-bottom:var(${variable('--kioku-ui-spacing-xl')})`,
    );
    expectRenderedRule(
      packageCss,
      cardFooter,
      `border-top-color:var(${variable('--kioku-ui-border-default')})`,
    );
    expectRenderedRule(
      packageCss,
      cardFooter,
      `border-top-style:var(${variable('--kioku-ui-border-style')})`,
    );
    expectRenderedRule(
      packageCss,
      cardFooter,
      `border-top-width:var(${variable('--kioku-ui-border-width')})`,
    );
    expectRenderedRule(
      packageCss,
      cardFooter,
      `margin-top:var(${variable('--kioku-ui-spacing-xl')})`,
    );
    expectRenderedRule(
      packageCss,
      cardFooter,
      `margin-bottom:calc(-1 * var(${variable('--kioku-ui-spacing-xl')}))`,
    );
    expectNoRenderedDeclaration(packageCss, cardHeader, 'border-top');
    expectNoRenderedDeclaration(packageCss, cardFooter, 'border-bottom');
  });

  it('publishes typed tokens through the compiled authoring subpath', async () => {
    const fixtureRoot = await mkdtemp(
      join(packageRoot, '.test-authoring-types-'),
    );
    temporaryDirectories.push(fixtureRoot);
    const consumer = join(fixtureRoot, 'consumer.ts');

    await writeFile(
      consumer,
      `import {semanticTokens} from '${packageName}/authoring';

const textColor: string = semanticTokens.colorText;
void textColor;
`,
    );

    await runPnpm([
      'exec',
      'tsc',
      '--ignoreConfig',
      '--noEmit',
      '--strict',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      '--target',
      'ES2024',
      consumer,
    ]);
  });

  it('loads tokens through the compiled authoring subpath', async () => {
    const fixtureRoot = await mkdtemp(
      join(packageRoot, '.test-authoring-runtime-'),
    );
    temporaryDirectories.push(fixtureRoot);
    const loader = await createCssIgnoringLoader(fixtureRoot);
    const consumer = join(fixtureRoot, 'consumer.mjs');

    await writeFile(
      consumer,
      `import {semanticTokens} from '${packageName}/authoring';

if (!/^var\\(--[^)]+\\)$/.test(semanticTokens.colorText)) {
  throw new Error('The compiled authoring module did not expose the color-text variable.');
}
`,
    );

    await run(
      process.execPath,
      ['--experimental-loader', pathToFileURL(loader).href, consumer],
      {cwd: fixtureRoot},
    );
  });

  it('publishes declarations that resolve from the package root', async () => {
    await access(join(packageRoot, 'dist/index.d.ts'));

    const fixtureRoot = await mkdtemp(join(packageRoot, '.test-types-'));
    temporaryDirectories.push(fixtureRoot);
    const source = join(fixtureRoot, 'consumer.ts');
    await writeFile(
      source,
      `import type {
  AsyncStateProps,
  AsyncStateValue,
  BadgeTone,
  ButtonVariant,
  CardElevation,
  ControlSize,
  FieldNecessity,
  HeadingFamily,
  TextTone,
  ThemeDefinition,
  TokenContract,
} from '${packageName}';

declare const contract: TokenContract;
declare const theme: ThemeDefinition;
declare const state: AsyncStateValue<number>;

const controlSizes: readonly ControlSize[] = ['sm', 'md', 'lg'];
const buttonVariants: readonly ButtonVariant[] = [
  'primary',
  'secondary',
  'ghost',
  'destructive',
];
const badgeTones: readonly BadgeTone[] = [
  'neutral',
  'info',
  'success',
  'warning',
  'danger',
];
const fieldNecessities: readonly FieldNecessity[] = ['required', 'optional'];
const textTones: readonly TextTone[] = ['primary', 'secondary', 'muted'];
const headingFamilies: readonly HeadingFamily[] = ['interface', 'display'];
const cardElevations: readonly CardElevation[] = ['none', 'low', 'medium'];

const themeId: string = theme.id;
const canvasValue: string = theme.tokens[contract.color.canvas];
const asyncProps: AsyncStateProps<number> = {
  state,
  children: (count) => count + 1,
};
void [
  themeId,
  canvasValue,
  asyncProps,
  controlSizes,
  buttonVariants,
  badgeTones,
  fieldNecessities,
  textTones,
  headingFamilies,
  cardElevations,
];
`,
    );

    await runPnpm([
      'exec',
      'tsc',
      '--ignoreConfig',
      '--noEmit',
      '--strict',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      '--target',
      'ES2024',
      source,
    ]);
  });

  it('emits syntax-valid JavaScript for representative public runtime components', async () => {
    await run(process.execPath, [
      '--check',
      join(packageRoot, 'dist/components/Button.js'),
    ]);
    await run(process.execPath, [
      '--check',
      join(packageRoot, 'dist/components/AsyncState.js'),
    ]);
  });

  it('loads and renders components through the public package name', async () => {
    const fixtureRoot = await mkdtemp(join(packageRoot, '.test-runtime-'));
    temporaryDirectories.push(fixtureRoot);
    const loader = await createCssIgnoringLoader(fixtureRoot);
    const runtime = join(fixtureRoot, 'consumer.mjs');

    await writeFile(
      runtime,
      `import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {AsyncState, Button} from '${packageName}';

const button = renderToStaticMarkup(createElement(Button, {variant: 'secondary'}, 'Save'));
const ready = renderToStaticMarkup(
  createElement(
    AsyncState,
    {state: {kind: 'ready', data: 3}},
    (count) => createElement('span', null, count + ' items'),
  ),
);

if (!button.includes('<button') || !button.includes('Save') || !ready.includes('3 items')) {
  throw new Error('The public component runtime did not render expected markup.');
}
`,
    );

    await run(
      process.execPath,
      ['--experimental-loader', pathToFileURL(loader).href, runtime],
      {cwd: fixtureRoot},
    );
  });

  it('publishes typed component metadata from the public docs catalog', async () => {
    const fixtureRoot = await mkdtemp(join(packageRoot, '.test-docs-'));
    temporaryDirectories.push(fixtureRoot);
    const source = join(fixtureRoot, 'consumer.ts');
    await writeFile(
      source,
      `import {
  alertDoc,
  asyncStateDoc,
  badgeDoc,
  buttonDoc,
  cardDoc,
  cardFooterDoc,
  cardHeaderDoc,
  centerDoc,
  componentDocs,
  dividerDoc,
  emptyStateDoc,
  fieldDoc,
  gridDoc,
  headingDoc,
  iconButtonDoc,
  linkDoc,
  linkProviderDoc,
  metricGridDoc,
  sectionDoc,
  segmentedControlDoc,
  skeletonDoc,
  spinnerDoc,
  stackDoc,
  statusDotDoc,
  tableDoc,
  tableCaptionDoc,
  tableHeadDoc,
  tableBodyDoc,
  tableRowDoc,
  tableHeaderCellDoc,
  tableCellDoc,
  textAreaDoc,
  textDoc,
  textInputDoc,
  themeProviderDoc,
  toggleDoc,
  validateComponentDoc,
  visuallyHiddenDoc,
  type ComponentDoc,
} from '${packageName}/docs';

const docs: readonly ComponentDoc[] = componentDocs;
const individualDocs: readonly ComponentDoc[] = [
  textDoc,
  headingDoc,
  stackDoc,
  gridDoc,
  sectionDoc,
  cardDoc,
  cardHeaderDoc,
  cardFooterDoc,
  dividerDoc,
  centerDoc,
  visuallyHiddenDoc,
  buttonDoc,
  iconButtonDoc,
  badgeDoc,
  statusDotDoc,
  fieldDoc,
  textInputDoc,
  textAreaDoc,
  toggleDoc,
  segmentedControlDoc,
  emptyStateDoc,
  asyncStateDoc,
  spinnerDoc,
  skeletonDoc,
  alertDoc,
  tableDoc,
  tableCaptionDoc,
  tableHeadDoc,
  tableBodyDoc,
  tableRowDoc,
  tableHeaderCellDoc,
  tableCellDoc,
  metricGridDoc,
  linkDoc,
  linkProviderDoc,
  themeProviderDoc,
];
const textName: string = textDoc.name;
const missing = validateComponentDoc(textDoc);
// @ts-expect-error ComponentDoc requires an inherited native-props contract.
const incompleteDoc: ComponentDoc = {
  name: 'Incomplete',
  description: 'Missing its inherited contract.',
  props: [{name: 'value', description: 'Supplies a value.'}],
  example: '<Incomplete value="example" />',
  storyId: 'test--incomplete',
};
void [docs, individualDocs, textName, missing, incompleteDoc];
`,
    );

    await runPnpm([
      'exec',
      'tsc',
      '--ignoreConfig',
      '--noEmit',
      '--strict',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      '--target',
      'ES2024',
      source,
    ]);

    const loader = await createCssIgnoringLoader(fixtureRoot);
    const runtime = join(fixtureRoot, 'consumer.mjs');
    await writeFile(
      runtime,
      `import {componentDocs, textDoc, validateComponentDoc} from '${packageName}/docs';

const expectedNames = [
  'Text', 'Heading', 'Stack', 'Grid', 'Section', 'Card', 'CardHeader',
  'CardFooter', 'Divider', 'Center', 'VisuallyHidden',
  'Button', 'IconButton', 'Badge', 'StatusDot', 'Field', 'TextInput',
  'TextArea', 'Toggle', 'SegmentedControl', 'EmptyState', 'AsyncState',
  'Spinner', 'Skeleton', 'Alert', 'Table', 'TableCaption', 'TableHead',
  'TableBody', 'TableRow', 'TableHeaderCell', 'TableCell', 'MetricGrid',
  'Link', 'LinkProvider', 'ThemeProvider',
];

if (componentDocs.map(({name}) => name).join(',') !== expectedNames.join(',')) {
  throw new Error('The public docs catalog has unexpected records.');
}
if (!componentDocs.includes(textDoc) || componentDocs.some((doc) => validateComponentDoc(doc).length > 0)) {
  throw new Error('The public docs API did not expose valid records.');
}
`,
    );

    await run(
      process.execPath,
      ['--experimental-loader', pathToFileURL(loader).href, runtime],
      {cwd: packageRoot},
    );
  });
});
