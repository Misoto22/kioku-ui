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
  ThemeDefinition,
  TokenContract,
} from '${packageName}';

declare const contract: TokenContract;
declare const theme: ThemeDefinition;
declare const state: AsyncStateValue<number>;

const themeId: string = theme.id;
const canvasValue: string = theme.tokens[contract.color.canvas];
const asyncProps: AsyncStateProps<number> = {
  state,
  children: (count) => count + 1,
};
void [themeId, canvasValue, asyncProps];
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
