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
  state?: string,
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
          '::after',
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
        '::after',
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

function expectRenderedMediaRule(
  packageCss: string,
  markup: string,
  mediaQuery: string,
  declaration: string,
) {
  const compactCss = packageCss.replaceAll(/\s+/g, '');
  const mediaPrefix = `@media${mediaQuery.replaceAll(/\s+/g, '')}{`;
  const mediaStart = compactCss.indexOf(mediaPrefix);
  expect(
    mediaStart,
    `Missing media query: ${mediaQuery}`,
  ).toBeGreaterThanOrEqual(0);

  let depth = 1;
  let mediaEnd = mediaStart + mediaPrefix.length;
  for (; mediaEnd < compactCss.length && depth > 0; mediaEnd += 1) {
    if (compactCss[mediaEnd] === '{') depth += 1;
    if (compactCss[mediaEnd] === '}') depth -= 1;
  }
  const mediaBlock = compactCss.slice(mediaStart, mediaEnd);
  const matched = classNames(markup).some((className) =>
    mediaBlock
      .split('}')
      .some(
        (rule) =>
          rule.includes(`.${className}`) &&
          rule.includes(declaration.replaceAll(/\s+/g, '')),
      ),
  );

  expect(matched, `Missing ${mediaQuery} rule: ${declaration}`).toBe(true);
}

describe('published package build', {timeout: 120_000}, () => {
  // A full StyleX + tsc build of the package, well past the default hook budget.
  beforeAll(async () => {
    await runPnpm(['build']);
  }, 180_000);

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

    // The seal: ink ground, paper letters, and pointer states that run down
    // the ranks of ink rather than into the accent. The accent is reserved for
    // thin marks — focus ring, selection bar, link hover — so a filled accent
    // button is the one thing this contract must keep out.
    expectRenderedRule(
      packageCss,
      markup.buttonPrimary,
      `background-color:var(${variable('--kioku-ui-color-text')})`,
    );
    expectRenderedRule(
      packageCss,
      markup.buttonPrimary,
      `color:var(${variable('--kioku-ui-color-text-on-accent')})`,
    );
    expectNoRenderedDeclaration(
      packageCss,
      markup.buttonPrimary,
      `background-color:var(${variable('--kioku-ui-color-accent')})`,
    );
    expectRenderedRule(
      packageCss,
      markup.buttonPrimary,
      `background-color:var(${variable('--kioku-ui-color-text-secondary')})`,
      ':hover',
      true,
      [':not(:active)'],
    );
    expectRenderedRule(
      packageCss,
      markup.buttonPrimary,
      `background-color:var(${variable('--kioku-ui-color-text-muted')})`,
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
      [':not(:active)'],
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
      [':not(:active)'],
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
        [':not(:active)'],
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
      `color:var(${variable('--kioku-ui-color-text-secondary')})`,
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
        `background-color:var(${variable('--kioku-ui-color-surface-muted')})`,
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `border-color:var(${variable('--kioku-ui-border-strong')})`,
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
    // Four lines of body copy plus the control's own block padding, so the
    // field still opens on four lines when density or type size moves under
    // it. It was a literal 96px, which is the one thing the scale forbids.
    expectRenderedRule(
      packageCss,
      markup.textArea,
      `min-height:calc(4 * var(${variable('--kioku-ui-typography-font-size-md')}) * var(${variable('--kioku-ui-typography-line-height-body')}) + 2 * var(${variable('--kioku-ui-spacing-xs')}))`,
    );

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
        `background-color:var(${variable('--kioku-ui-color-surface')})`,
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
    const toggleThumbOn = elementMarkup(markup.toggleOn, 'span', 1);
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
    /*
     * The track is a solid block, not a tiny outlined box: below about 20px a
     * border reads as a field that failed to grow, so the off state is carried
     * by a mid-grey fill and the track declares no border at all. Its knob and
     * travel are relationships over the same two tokens rather than measured
     * values, so `calc(` is the assertion — the arithmetic is the contract.
     */
    expectRenderedRule(
      packageCss,
      toggleTrackOff,
      `background-color:var(${variable('--kioku-ui-border-strong')})`,
    );
    expectNoRenderedDeclaration(packageCss, toggleTrackOff, 'border-color:');
    expectRenderedRule(
      packageCss,
      toggleTrackOff,
      `width:var(${variable('--kioku-ui-size-control-md')})`,
    );
    expectRenderedRule(
      packageCss,
      toggleTrackOff,
      `height:var(${variable('--kioku-ui-spacing-lg')})`,
    );
    expectRenderedRule(packageCss, toggleThumbOff, 'height:calc(');
    expectRenderedRule(packageCss, toggleThumbOff, 'inset-inline-start:0');
    expectRenderedRule(
      packageCss,
      toggleThumbOff,
      `background-color:var(${variable('--kioku-ui-color-surface')})`,
    );
    expectRenderedRule(
      packageCss,
      toggleTrackOn,
      `background-color:var(${variable('--kioku-ui-color-text')})`,
    );
    expectRenderedRule(packageCss, toggleThumbOn, 'inset-inline-start:calc(');
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
    // The block that floated back to the surface, which is the one documented
    // exception to the no-fill rule.
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
        `padding:var(${variable('--kioku-ui-spacing-lg')})`,
      );
    }

    for (const name of ['cardHeader', 'cardFooter'] as const) {
      expectRenderedRule(
        packageCss,
        name === 'cardHeader' ? cardHeader : cardFooter,
        `margin-inline:calc(-1 * var(${variable('--kioku-ui-spacing-lg')}))`,
      );
      expectRenderedRule(
        packageCss,
        name === 'cardHeader' ? cardHeader : cardFooter,
        `padding-block:var(${variable('--kioku-ui-spacing-md')})`,
      );
      expectRenderedRule(
        packageCss,
        name === 'cardHeader' ? cardHeader : cardFooter,
        `padding-inline:var(${variable('--kioku-ui-spacing-lg')})`,
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
      `margin-top:calc(-1 * var(${variable('--kioku-ui-spacing-lg')}))`,
    );
    expectRenderedRule(
      packageCss,
      cardHeader,
      `margin-bottom:var(${variable('--kioku-ui-spacing-lg')})`,
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
      `margin-top:var(${variable('--kioku-ui-spacing-lg')})`,
    );
    expectRenderedRule(
      packageCss,
      cardFooter,
      `margin-bottom:calc(-1 * var(${variable('--kioku-ui-spacing-lg')}))`,
    );
    expectNoRenderedDeclaration(packageCss, cardHeader, 'border-top');
    expectNoRenderedDeclaration(packageCss, cardFooter, 'border-bottom');
  });

  it('ships feedback, motion, Table, and MetricGrid visual contracts in compiled CSS', async () => {
    const fixtureRoot = await mkdtemp(join(packageRoot, '.test-data-display-'));
    temporaryDirectories.push(fixtureRoot);
    const loader = await createCssIgnoringLoader(fixtureRoot);
    const runtime = join(fixtureRoot, 'consumer.mjs');

    await writeFile(
      runtime,
      `import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {
  Alert,
  Card,
  EmptyState,
  MetricGrid,
  Skeleton,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '${packageName}';

const render = (component, props, children) =>
  renderToStaticMarkup(createElement(component, props, children));
const table = (props) => render(Table, props, [
  createElement(TableHead, {key: 'head'},
    createElement(TableRow, null, [
      createElement(TableHeaderCell, {key: 'h1'}, 'Status'),
      createElement(TableHeaderCell, {key: 'h2'}, 'Owner'),
    ]),
  ),
  createElement(TableBody, {key: 'body'}, [
    createElement(TableRow, {key: 'r1'}, [
      createElement(TableCell, {key: 'c1'}, 'Queued'),
      createElement(TableCell, {key: 'c2'}, 'Team'),
    ]),
    createElement(TableRow, {key: 'r2'}, [
      createElement(TableCell, {key: 'c3'}, 'Completed'),
      createElement(TableCell, {key: 'c4'}, 'System'),
    ]),
  ]),
]);

process.stdout.write(JSON.stringify({
  alertInfo: render(Alert, {tone: 'info'}, ['Update', 'Queued']),
  alertDanger: render(Alert, {tone: 'danger'}, ['Problem', 'Retry']),
  emptyDefault: render(EmptyState, {
    detail: 'No saved records match the current view.',
    title: 'No matching records',
    visual: createElement('span', {'aria-hidden': true}, '◇'),
  }),
  emptyCompact: render(EmptyState, {
    detail: 'No saved records match the current view.',
    size: 'compact',
    title: 'No matching records',
    visual: createElement('span', {'aria-hidden': true}, '◇'),
  }),
  spinner: render(Spinner, {label: 'Loading records'}),
  skeleton: render(Skeleton, {label: 'Loading summary'}),
  tableDefault: table({}),
  tableColumns: table({dividers: 'columns'}),
  tableCompactGrid: table({density: 'compact', dividers: 'grid'}),
  tableSpaciousNone: table({density: 'spacious', dividers: 'none'}),
  cardTable: render(Card, {}, createElement(Table, {},
    createElement(TableBody, null,
      createElement(TableRow, null,
        createElement(TableCell, null, 'Card row'),
      ),
    ),
  )),
  metricGrid: render(MetricGrid, {items: [{
    detail: 'Updated recently',
    label: 'Open requests',
    value: '24',
  }]}),
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

    for (const [name, tone, surface, text] of [
      [
        'alertInfo',
        'info',
        '--kioku-ui-status-info-surface',
        '--kioku-ui-status-info-text',
      ],
      [
        'alertDanger',
        'danger',
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
        `border-color:var(${variable(text)})`,
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `color:var(${variable(text)})`,
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `gap:var(${variable('--kioku-ui-spacing-md')})`,
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `border-radius:var(${variable('--kioku-ui-radius-element')})`,
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `border-width:var(${variable('--kioku-ui-border-width')})`,
      );
      expectRenderedRule(
        packageCss,
        markup[name],
        `padding:var(${variable('--kioku-ui-spacing-md')})`,
      );
      expect(markup[name]).toContain(`data-alert-icon="${tone}"`);
      const alertIcon = elementMarkup(markup[name], 'span');
      expect(alertIcon).toContain('aria-hidden="true"');
      expectRenderedRule(
        packageCss,
        alertIcon,
        `height:var(${variable('--kioku-ui-spacing-lg')})`,
      );
      expectRenderedRule(
        packageCss,
        alertIcon,
        `width:var(${variable('--kioku-ui-spacing-lg')})`,
      );
      expectRenderedRule(packageCss, alertIcon, 'flex-shrink:0');
    }

    const emptyDefault = elementMarkup(markup.emptyDefault, 'div', 1);
    const emptyCompact = elementMarkup(markup.emptyCompact, 'div', 1);
    const emptyDefaultDetail = elementMarkup(markup.emptyDefault, 'p', 1);
    const emptyDefaultTitle = elementMarkup(markup.emptyDefault, 'p');
    // The empty state is a plate, not floating copy, and its foot is tighter
    // than its head so the actions close the block instead of hanging in it.
    expectRenderedRule(
      packageCss,
      emptyDefault,
      `background-color:var(${variable('--kioku-ui-color-surface')})`,
    );
    expectRenderedRule(
      packageCss,
      emptyDefault,
      `box-shadow:var(${variable('--kioku-ui-elevation-medium')})`,
    );
    expectRenderedRule(
      packageCss,
      emptyDefault,
      `padding-top:var(${variable('--kioku-ui-spacing-2xl')})`,
    );
    expectRenderedRule(
      packageCss,
      emptyDefault,
      `padding-bottom:var(${variable('--kioku-ui-spacing-xl')})`,
    );
    expectRenderedRule(
      packageCss,
      emptyDefault,
      `gap:var(${variable('--kioku-ui-spacing-sm')})`,
    );
    expectRenderedRule(
      packageCss,
      emptyCompact,
      `padding-top:var(${variable('--kioku-ui-spacing-lg')})`,
    );
    expectRenderedRule(
      packageCss,
      emptyCompact,
      `padding-bottom:var(${variable('--kioku-ui-spacing-lg')})`,
    );
    expectRenderedRule(
      packageCss,
      emptyCompact,
      `padding-inline:var(${variable('--kioku-ui-spacing-lg')})`,
    );
    expectRenderedRule(
      packageCss,
      emptyCompact,
      `gap:var(${variable('--kioku-ui-spacing-sm')})`,
    );
    expectRenderedRule(packageCss, emptyDefaultDetail, 'max-width:calc(');
    expectRenderedRule(packageCss, emptyDefaultTitle, 'max-width:calc(');

    const spinnerVisual = elementMarkup(markup.spinner, 'span', 1);
    // The resting ring is a hairline, not a filled track: the arc that moves
    // is the only part carrying ink, so the ring has to sit at the border rank
    // or the spinner reads as a donut with a bite out of it.
    expectRenderedRule(
      packageCss,
      spinnerVisual,
      `border-color:var(${variable('--kioku-ui-border-default')})`,
    );
    expectRenderedRule(
      packageCss,
      spinnerVisual,
      `border-top-color:var(${variable('--kioku-ui-color-text')})`,
    );
    expectRenderedMediaRule(
      packageCss,
      spinnerVisual,
      '(prefers-reduced-motion: reduce)',
      'animation-name:none',
    );

    expectRenderedRule(
      packageCss,
      markup.skeleton,
      `background-color:var(${variable('--kioku-ui-color-surface-muted')})`,
    );
    expectRenderedRule(
      packageCss,
      markup.skeleton,
      `border-radius:var(${variable('--kioku-ui-radius-element')})`,
    );
    // The placeholder is still in every mode, so there is no cycle to guard:
    // a page of bars that breathes makes the wait the loudest thing on it.
    expectNoRenderedDeclaration(packageCss, markup.skeleton, 'animation-name:');
    expectRenderedRule(
      packageCss,
      markup.skeleton,
      `min-height:var(${variable('--kioku-ui-spacing-md')})`,
    );

    const defaultCell = elementMarkup(markup.tableDefault, 'td');
    const compactCell = elementMarkup(markup.tableCompactGrid, 'td');
    const spaciousCell = elementMarkup(markup.tableSpaciousNone, 'td');
    const compactHeaderCell = elementMarkup(markup.tableCompactGrid, 'th');
    const defaultHeaderCell = elementMarkup(markup.tableDefault, 'th');
    for (const [cell, spacing] of [
      [defaultCell, '--kioku-ui-spacing-md'],
      [compactCell, '--kioku-ui-spacing-sm'],
      [spaciousCell, '--kioku-ui-spacing-lg'],
    ] as const) {
      expectRenderedRule(
        packageCss,
        cell,
        `padding-block:var(${variable(spacing)})`,
      );
    }
    // The header carries a line of 11px eyebrow rather than a line of data, so
    // it sits one spacing step tighter than the rows it names at every density
    // — matching the body would give the strip more air than the entries.
    for (const [cell, spacing] of [
      [defaultHeaderCell, '--kioku-ui-spacing-sm'],
      [compactHeaderCell, '--kioku-ui-spacing-xs'],
    ] as const) {
      expectRenderedRule(
        packageCss,
        cell,
        `padding-block:var(${variable(spacing)})`,
      );
    }

    const defaultRow = elementMarkup(markup.tableDefault, 'tr', 1);
    const columnsRow = elementMarkup(markup.tableColumns, 'tr', 1);
    const columnsCell = elementMarkup(markup.tableColumns, 'td');
    const gridRow = elementMarkup(markup.tableCompactGrid, 'tr', 1);
    const gridCell = elementMarkup(markup.tableCompactGrid, 'td');
    expectRenderedRule(
      packageCss,
      defaultRow,
      `border-bottom-color:var(${variable('--kioku-ui-border-default')})`,
      ':not(:last-child)',
    );
    expectRenderedRule(
      packageCss,
      gridRow,
      `border-bottom-color:var(${variable('--kioku-ui-border-default')})`,
      ':not(:last-child)',
    );
    expectRenderedRule(
      packageCss,
      gridCell,
      `border-inline-end-color:var(${variable('--kioku-ui-border-default')})`,
      ':not(:last-child)',
    );
    expectRenderedRule(
      packageCss,
      columnsCell,
      `border-inline-end-color:var(${variable('--kioku-ui-border-default')})`,
      ':not(:last-child)',
    );
    expectNoRenderedDeclaration(packageCss, columnsRow, 'border-bottom');
    expectRenderedRule(
      packageCss,
      compactHeaderCell,
      `border-bottom-color:var(${variable('--kioku-ui-border-strong')})`,
    );
    expectRenderedRule(
      packageCss,
      compactHeaderCell,
      `border-inline-end-color:var(${variable('--kioku-ui-border-default')})`,
      ':not(:last-child)',
    );
    expectNoRenderedDeclaration(packageCss, spaciousCell, 'border-inline-end');
    expectNoRenderedDeclaration(
      packageCss,
      elementMarkup(markup.tableSpaciousNone, 'tr', 1),
      'border-bottom',
    );

    const headerCell = elementMarkup(markup.tableDefault, 'th');
    // A ledger header separates itself by ink rank and by the rule beneath it,
    // never by a fill behind it.
    expectNoRenderedDeclaration(packageCss, headerCell, 'background-color:');
    expectRenderedRule(
      packageCss,
      headerCell,
      `color:var(${variable('--kioku-ui-color-text-secondary')})`,
    );
    expectRenderedRule(
      packageCss,
      defaultRow,
      `background-color:var(${variable('--kioku-ui-color-overlay-hover')})`,
      ':hover',
      false,
      [':not(:active)'],
    );
    expectRenderedRule(
      packageCss,
      defaultRow,
      `background-color:var(${variable('--kioku-ui-color-overlay-active')})`,
      ':active',
    );
    expectRenderedRule(
      packageCss,
      defaultRow,
      `background-color:var(${variable('--kioku-ui-color-overlay-hover')})`,
      ':focus-within',
      false,
      [':not(:active)'],
    );
    const cardTable = elementMarkup(markup.cardTable, 'table');
    expectNoRenderedDeclaration(packageCss, cardTable, 'border-color:');
    expectNoRenderedDeclaration(packageCss, cardTable, 'border-width:');

    const metricRoot = elementMarkup(markup.metricGrid, 'dl');
    const metricItem = elementMarkup(markup.metricGrid, 'div');
    const metricLabel = elementMarkup(markup.metricGrid, 'dt');
    const metricValue = elementMarkup(markup.metricGrid, 'dd');
    const metricDetail = elementMarkup(markup.metricGrid, 'dd', 1);
    expectRenderedRule(
      packageCss,
      metricRoot,
      'grid-template-columns:repeat(auto-fit,minmax(min(100%,calc(',
    );
    expectRenderedRule(
      packageCss,
      metricItem,
      `padding:var(${variable('--kioku-ui-spacing-lg')})`,
    );
    expectRenderedRule(
      packageCss,
      metricRoot,
      `background-color:var(${variable('--kioku-ui-border-default')})`,
    );
    expectRenderedRule(
      packageCss,
      metricRoot,
      `gap:var(${variable('--kioku-ui-border-width')})`,
    );
    expectNoRenderedDeclaration(packageCss, metricItem, 'border-color:');
    expectNoRenderedDeclaration(packageCss, metricItem, 'border-width:');
    expectRenderedRule(
      packageCss,
      metricLabel,
      `color:var(${variable('--kioku-ui-color-text-secondary')})`,
    );
    // A metric's headline figure takes the display face, not the mono one:
    // nothing beneath it has to line up, and 27px of monospace reads as
    // output rather than as a figure of record.
    expectRenderedRule(
      packageCss,
      metricValue,
      `font-family:var(${variable('--kioku-ui-typography-font-family-display')})`,
    );
    expectRenderedRule(
      packageCss,
      metricValue,
      'font-variant-numeric:tabular-nums',
    );
    expectRenderedRule(
      packageCss,
      metricValue,
      `color:var(${variable('--kioku-ui-color-text')})`,
    );
    // And no added weight: the display face states a figure by its size.
    expectNoRenderedDeclaration(
      packageCss,
      metricValue,
      `font-weight:var(${variable('--kioku-ui-typography-font-weight-strong')})`,
    );
    expectRenderedRule(
      packageCss,
      metricDetail,
      `color:var(${variable('--kioku-ui-color-text-muted')})`,
    );
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
  AlertProps,
  AsyncStateProps,
  AsyncStateValue,
  BadgeTone,
  ButtonVariant,
  CardElevation,
  ControlSize,
  EmptyStateSize,
  FieldNecessity,
  HeadingFamily,
  TableDensity,
  TableDividers,
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
const emptyStateSizes: readonly EmptyStateSize[] = ['compact', 'default'];
const tableDensities: readonly TableDensity[] = [
  'compact',
  'default',
  'spacious',
];
const tableDividers: readonly TableDividers[] = [
  'rows',
  'columns',
  'grid',
  'none',
];

const themeId: string = theme.id;
const canvasValue: string = theme.tokens[contract.color.canvas];
const asyncProps: AsyncStateProps<number> = {
  state,
  children: (count) => count + 1,
};
const alertProps: AlertProps = {
  children: 'Review required',
  icon: '!',
  tone: 'warning',
};
void [
  alertProps,
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
  emptyStateSizes,
  tableDensities,
  tableDividers,
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
      join(packageRoot, 'dist/Button/Button.js'),
    ]);
    await run(process.execPath, [
      '--check',
      join(packageRoot, 'dist/AsyncState/AsyncState.js'),
    ]);
  });

  it('loads and renders the complete visual-system surface through the public package name', async () => {
    const fixtureRoot = await mkdtemp(join(packageRoot, '.test-runtime-'));
    temporaryDirectories.push(fixtureRoot);
    const loader = await createCssIgnoringLoader(fixtureRoot);
    const runtime = join(fixtureRoot, 'consumer.mjs');

    await writeFile(
      runtime,
      `import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {
  Alert,
  AsyncState,
  Button,
  Card,
  EmptyState,
  Heading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
} from '${packageName}';

const render = (component, props, children) =>
  renderToStaticMarkup(createElement(component, props, children));

const button = render(
  Button,
  {loading: true, size: 'lg', variant: 'destructive'},
  'Delete release',
);
const alert = renderToStaticMarkup(createElement(Alert, {tone: 'success'}, 'Saved'));
const customAlert = renderToStaticMarkup(
  createElement(
    Alert,
    {icon: createElement('span', null, 'Custom mark')},
    'Needs review',
  ),
);
const ready = renderToStaticMarkup(
  createElement(
    AsyncState,
    {state: {kind: 'ready', data: 3}},
    (count) => createElement('span', null, count + ' items'),
  ),
);
const text = render(Text, {tone: 'secondary'}, 'Supporting copy');
const heading = render(
  Heading,
  {family: 'display', level: 2},
  'Release review',
);
const card = render(Card, {elevation: 'medium'}, 'Release details');
const emptyState = render(EmptyState, {
  detail: 'Create a release candidate to continue.',
  size: 'compact',
  title: 'No release candidates',
  visual: createElement('span', {'aria-hidden': true}, '◇'),
});
const table = render(Table, {density: 'compact', dividers: 'grid'}, [
  createElement(
    TableHead,
    {key: 'head'},
    createElement(
      TableRow,
      null,
      createElement(TableHeaderCell, null, 'Status'),
    ),
  ),
  createElement(
    TableBody,
    {key: 'body'},
    createElement(
      TableRow,
      null,
      createElement(TableCell, null, 'Ready'),
    ),
  ),
]);

process.stdout.write(JSON.stringify({
  alert,
  button,
  card,
  customAlert,
  emptyState,
  heading,
  ready,
  table,
  text,
}));
`,
    );

    const {stdout} = await run(
      process.execPath,
      ['--experimental-loader', pathToFileURL(loader).href, runtime],
      {cwd: fixtureRoot},
    );
    const markup = JSON.parse(stdout) as Record<string, string>;
    expect(markup.button).toContain('<button');
    expect(markup.button).toContain('Delete release');
    expect(markup.button).toContain('aria-busy="true"');
    expect(markup.button).toContain('disabled=""');
    expect(markup.alert).toContain('data-alert-icon="success"');
    expect(markup.customAlert).toContain('data-alert-icon="custom"');
    expect(markup.ready).toContain('3 items');
    expect(markup.text).toContain('Supporting copy');
    expect(markup.heading).toMatch(/^<h2\b/);
    expect(markup.card).toMatch(/^<article\b/);
    expect(markup.emptyState).toContain('No release candidates');
    expect(markup.emptyState.indexOf('◇')).toBeLessThan(
      markup.emptyState.indexOf('No release candidates'),
    );
    expect(markup.table).toMatch(/^<table\b/);
    expect(markup.table).toContain('<th');
    expect(markup.table).toContain('<td');

    const packageCss = await readFile(
      join(packageRoot, 'dist/styles/stylex.css'),
      'utf8',
    );
    const variable = (customProperty: string) =>
      semanticVariable(packageCss, customProperty);

    expectRenderedRule(
      packageCss,
      markup.button,
      `height:var(${variable('--kioku-ui-size-control-lg')})`,
    );
    expectRenderedRule(
      packageCss,
      markup.button,
      `background-color:var(${variable('--kioku-ui-status-danger-surface')})`,
    );
    expectRenderedRule(packageCss, markup.button, 'cursor:progress');
    expectRenderedRule(
      packageCss,
      markup.text,
      `color:var(${variable('--kioku-ui-color-text-secondary')})`,
    );
    expectRenderedRule(
      packageCss,
      markup.heading,
      `font-family:var(${variable('--kioku-ui-typography-font-family-display')})`,
    );
    expectRenderedRule(
      packageCss,
      markup.card,
      `box-shadow:var(${variable('--kioku-ui-elevation-medium')})`,
    );
    const emptyState = elementMarkup(markup.emptyState, 'div', 1);
    expectRenderedRule(
      packageCss,
      emptyState,
      `padding-inline:var(${variable('--kioku-ui-spacing-lg')})`,
    );
    const tableRow = elementMarkup(markup.table, 'tr', 1);
    const tableCell = elementMarkup(markup.table, 'td');
    expectRenderedRule(
      packageCss,
      tableCell,
      `padding-block:var(${variable('--kioku-ui-spacing-sm')})`,
    );
    expectRenderedRule(
      packageCss,
      tableRow,
      `border-bottom-color:var(${variable('--kioku-ui-border-default')})`,
      ':not(:last-child)',
    );
    expectRenderedRule(
      packageCss,
      tableCell,
      `border-inline-end-color:var(${variable('--kioku-ui-border-default')})`,
      ':not(:last-child)',
    );
  });

  it('publishes typed component metadata from the public docs catalog', async () => {
    const fixtureRoot = await mkdtemp(join(packageRoot, '.test-docs-'));
    temporaryDirectories.push(fixtureRoot);
    const source = join(fixtureRoot, 'consumer.ts');
    await writeFile(
      source,
      `import {
  alertDialogDoc,
  alertDoc,
  appShellDoc,
  aspectRatioDoc,
  asyncStateDoc,
  avatarDoc,
  avatarGroupDoc,
  badgeDoc,
  bannerDoc,
  blockquoteDoc,
  bottomSheetDoc,
  boxDoc,
  breadcrumbsDoc,
  buttonDoc,
  buttonGroupDoc,
  calendarDoc,
  cardDoc,
  cardFooterDoc,
  cardHeaderDoc,
  carouselDoc,
  centerDoc,
  chatComposerDoc,
  chatLayoutDoc,
  chatMessageDoc,
  chatMessageListDoc,
  chatMessageMetadataDoc,
  chatSystemMessageDoc,
  chatToolCallsDoc,
  checkboxInputDoc,
  checkboxListDoc,
  citationDoc,
  clickableCardDoc,
  codeBlockDoc,
  codeDoc,
  collapsibleDoc,
  commandPaletteDoc,
  complexSelectorDoc,
  contextMenuDoc,
  dateInputDoc,
  dateRangeInputDoc,
  dateTimeInputDoc,
  dialogDoc,
  dividerDoc,
  dropdownMenuDoc,
  dropdownMenuItemDoc,
  emptyStateDoc,
  fieldDoc,
  fieldStatusDoc,
  fileInputDoc,
  formLayoutDoc,
  gridDoc,
  hStackDoc,
  headingDoc,
  hoverCardDoc,
  iconButtonDoc,
  iconDoc,
  indicatorDoc,
  inputGroupDoc,
  internationalizationProviderDoc,
  itemDoc,
  kbdDoc,
  layerDoc,
  layoutDoc,
  lightboxDoc,
  linkDoc,
  linkProviderDoc,
  listDoc,
  listItemDoc,
  markdownDoc,
  metadataListDoc,
  metricGridDoc,
  mobileNavDoc,
  moreMenuDoc,
  multiSelectorDoc,
  navIconDoc,
  navItemDoc,
  navMenuDoc,
  numberInputDoc,
  outlineDoc,
  overflowListDoc,
  overlayDoc,
  paginationDoc,
  popoverDoc,
  powerSearchDoc,
  progressBarDoc,
  radioListDoc,
  resizableDoc,
  sectionDoc,
  segmentedControlDoc,
  selectableCardDoc,
  selectorDoc,
  sideNavDoc,
  sideNavSectionDoc,
  skeletonDoc,
  sliderDoc,
  spinnerDoc,
  stackDoc,
  statusDotDoc,
  switchDoc,
  tabListDoc,
  tableBodyDoc,
  tableCaptionDoc,
  tableCellDoc,
  tableDoc,
  tableHeadDoc,
  tableHeaderCellDoc,
  tableRowDoc,
  textAreaDoc,
  textDoc,
  textInputDoc,
  themeProviderDoc,
  thumbnailDoc,
  timeInputDoc,
  timestampDoc,
  toastDoc,
  toastProviderDoc,
  toggleButtonDoc,
  toggleButtonGroupDoc,
  toggleDoc,
  tokenDoc,
  tokenizerDoc,
  toolbarDoc,
  tooltipDoc,
  topNavDoc,
  topNavMegaMenuDoc,
  topNavMegaMenuFeaturedCardDoc,
  topNavMenuDoc,
  treeListDoc,
  typeaheadDoc,
  typeaheadItemDoc,
  vStackDoc,
  visuallyHiddenDoc,
  componentDocs,
  validateComponentDoc,
  type ComponentDoc,
} from '${packageName}/docs';

const docs: readonly ComponentDoc[] = componentDocs;
const individualDocs: readonly ComponentDoc[] = [
  textDoc,
  headingDoc,
  codeDoc,
  kbdDoc,
  iconDoc,
  stackDoc,
  gridDoc,
  sectionDoc,
  cardDoc,
  cardHeaderDoc,
  cardFooterDoc,
  dividerDoc,
  centerDoc,
  listDoc,
  listItemDoc,
  itemDoc,
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
  checkboxInputDoc,
  checkboxListDoc,
  radioListDoc,
  switchDoc,
  selectorDoc,
  complexSelectorDoc,
  typeaheadDoc,
  typeaheadItemDoc,
  multiSelectorDoc,
  numberInputDoc,
  fileInputDoc,
  sliderDoc,
  dateInputDoc,
  timeInputDoc,
  dateTimeInputDoc,
  dateRangeInputDoc,
  calendarDoc,
  fieldStatusDoc,
  inputGroupDoc,
  formLayoutDoc,
  emptyStateDoc,
  asyncStateDoc,
  spinnerDoc,
  skeletonDoc,
  alertDoc,
  avatarDoc,
  avatarGroupDoc,
  thumbnailDoc,
  aspectRatioDoc,
  boxDoc,
  bannerDoc,
  blockquoteDoc,
  citationDoc,
  codeBlockDoc,
  markdownDoc,
  metadataListDoc,
  timestampDoc,
  tokenDoc,
  tokenizerDoc,
  progressBarDoc,
  indicatorDoc,
  carouselDoc,
  lightboxDoc,
  layerDoc,
  overlayDoc,
  popoverDoc,
  tooltipDoc,
  dialogDoc,
  alertDialogDoc,
  bottomSheetDoc,
  hoverCardDoc,
  dropdownMenuDoc,
  dropdownMenuItemDoc,
  contextMenuDoc,
  moreMenuDoc,
  toastDoc,
  toastProviderDoc,
  tableDoc,
  tableCaptionDoc,
  tableHeadDoc,
  tableBodyDoc,
  tableRowDoc,
  tableHeaderCellDoc,
  tableCellDoc,
  metricGridDoc,
  hStackDoc,
  vStackDoc,
  buttonGroupDoc,
  toggleButtonDoc,
  toggleButtonGroupDoc,
  clickableCardDoc,
  selectableCardDoc,
  collapsibleDoc,
  resizableDoc,
  overflowListDoc,
  treeListDoc,
  commandPaletteDoc,
  powerSearchDoc,
  chatLayoutDoc,
  chatMessageListDoc,
  chatMessageDoc,
  chatMessageMetadataDoc,
  chatSystemMessageDoc,
  chatToolCallsDoc,
  chatComposerDoc,
  tabListDoc,
  breadcrumbsDoc,
  paginationDoc,
  navIconDoc,
  navItemDoc,
  navMenuDoc,
  topNavDoc,
  topNavMenuDoc,
  topNavMegaMenuDoc,
  topNavMegaMenuFeaturedCardDoc,
  sideNavDoc,
  sideNavSectionDoc,
  mobileNavDoc,
  toolbarDoc,
  outlineDoc,
  layoutDoc,
  appShellDoc,
  linkDoc,
  linkProviderDoc,
  internationalizationProviderDoc,
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
  'Text', 'Heading', 'Code', 'Kbd',
  'Eyebrow', 'Numeral', 'Icon', 'Stack',
  'Grid', 'Section', 'Card', 'CardHeader',
  'CardFooter', 'Divider', 'Center', 'List',
  'ListItem', 'Item', 'VisuallyHidden', 'Button',
  'IconButton', 'Badge', 'StatusDot', 'Field',
  'TextInput', 'TextArea', 'Toggle', 'SegmentedControl',
  'CheckboxInput', 'CheckboxList', 'RadioList', 'Switch',
  'Selector', 'ComplexSelector', 'Typeahead', 'TypeaheadItem',
  'MultiSelector', 'NumberInput', 'FileInput', 'Slider',
  'DateInput', 'DatePicker', 'TimeInput', 'DateTimeInput',
  'DateRangeInput',
  'Calendar', 'FieldStatus', 'InputGroup', 'FormLayout',
  'EmptyState', 'AsyncState', 'Spinner', 'Skeleton',
  'Alert', 'Avatar', 'AvatarGroup', 'Thumbnail',
  'AspectRatio', 'Box', 'Banner', 'Blockquote',
  'Citation', 'CodeBlock', 'Markdown', 'MetadataList',
  'Timestamp', 'Token', 'Tokenizer', 'ProgressBar',
  'Indicator', 'Carousel', 'Lightbox', 'Layer',
  'Overlay', 'Popover', 'Tooltip', 'Dialog',
  'AlertDialog', 'BottomSheet', 'BottomSheetSwitcher', 'HoverCard',
  'DropdownMenu', 'DropdownMenuItem', 'ContextMenu', 'MoreMenu',
  'Toast', 'ToastProvider', 'Table', 'TableCaption',
  'TableHead', 'TableBody', 'TableRow', 'TableHeaderCell',
  'TableCell', 'MetricGrid', 'HStack', 'VStack',
  'ButtonGroup', 'ToggleButton', 'ToggleButtonGroup', 'ClickableCard',
  'SelectableCard', 'Collapsible', 'Resizable', 'ResizeHandle',
  'OverflowList', 'TreeList', 'CommandPalette', 'PowerSearch',
  'ChatLayout', 'ChatMessageList', 'ChatMessage', 'ChatMessageMetadata',
  'ChatSystemMessage', 'ChatToolCalls', 'ChatComposer', 'TabList',
  'Breadcrumbs', 'Pagination', 'NavIcon', 'NavItem',
  'NavMenu', 'TopNav', 'TopNavMenu', 'TopNavMegaMenu',
  'TopNavMegaMenuFeaturedCard', 'SideNav', 'SideNavSection', 'MobileNav',
  'Toolbar', 'Outline', 'Layout', 'AppShell',
  'Link', 'LinkProvider', 'InternationalizationProvider', 'ThemeProvider',
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
