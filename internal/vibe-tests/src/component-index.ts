import {storyNameFromExport, toId} from '@storybook/csf';
import {readdir, readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

import {
  componentDocs,
  validateComponentDoc,
  type ComponentDoc,
} from '../../../packages/core/src/docs/index.js';

interface ComponentCatalog {
  readonly docs?: readonly Partial<ComponentDoc>[];
  readonly storyIds?: readonly string[];
}

export interface StoryModuleContract {
  readonly componentName?: string;
  readonly file: string;
  readonly storyNames: readonly string[];
  readonly title?: string;
}

const structuralComponents = new Set([
  'CardFooter',
  'CardHeader',
  'TableBody',
  'TableCaption',
  'TableCell',
  'TableHead',
  'TableHeaderCell',
  'TableRow',
]);

const requiredStories: Readonly<Record<string, readonly string[]>> = {
  Alert: ['Default', 'Tones', 'Composition'],
  AsyncState: ['Default', 'States', 'Composition'],
  Badge: ['Default', 'Tones', 'Composition'],
  Button: [
    'Default',
    'Variants',
    'Sizes',
    'States',
    'Disabled',
    'Loading',
    'Composition',
  ],
  Card: ['Default', 'Elevations', 'CardHeader', 'CardFooter', 'Composition'],
  Center: ['Default', 'Composition'],
  Divider: ['Default', 'Composition'],
  EmptyState: ['Default', 'Sizes', 'States', 'Composition'],
  Field: ['Default', 'States', 'Disabled', 'Composition'],
  Grid: ['Default', 'Variants', 'Composition'],
  Heading: ['Default', 'Sizes', 'Families', 'Composition'],
  IconButton: [
    'Default',
    'Variants',
    'Sizes',
    'States',
    'Disabled',
    'Loading',
    'Composition',
  ],
  Link: ['Default', 'States', 'Composition'],
  LinkProvider: ['Default', 'States', 'Composition'],
  MetricGrid: ['Default', 'States', 'Composition'],
  Section: ['Default', 'Variants', 'Composition'],
  SegmentedControl: ['Default', 'States', 'Disabled', 'Composition'],
  Skeleton: ['Default', 'States', 'Composition'],
  Spinner: ['Default', 'States', 'Composition'],
  Stack: ['Default', 'Variants', 'Composition'],
  StatusDot: ['Default', 'Tones', 'Composition'],
  Table: [
    'Default',
    'Densities',
    'Dividers',
    'States',
    'TableCaption',
    'TableHead',
    'TableBody',
    'TableRow',
    'TableHeaderCell',
    'TableCell',
    'Composition',
  ],
  Text: ['Default', 'Tones', 'Sizes', 'Composition'],
  TextArea: ['Default', 'States', 'Disabled', 'Composition'],
  TextInput: ['Default', 'States', 'Disabled', 'Composition'],
  ThemeProvider: ['Default', 'States', 'Composition'],
  Toggle: ['Default', 'States', 'Disabled', 'Composition'],
  VisuallyHidden: ['Default', 'Composition'],
};

export async function componentCatalogProblems(
  componentNames: readonly string[],
  {docs = [], storyIds = []}: ComponentCatalog = {},
) {
  const problems: string[] = [];
  const storyIdSet = new Set(storyIds);

  for (const name of [...new Set(componentNames)].sort()) {
    const matchingDocs = docs.filter((doc) => doc.name === name);
    const doc = matchingDocs[0];

    if (!doc || !doc.storyId || !storyIdSet.has(doc.storyId)) {
      problems.push(`${name} is missing a Storybook story`);
    }

    if (!doc) {
      problems.push(`${name} is missing component documentation metadata`);
    } else {
      const invalidFields = validateComponentDoc(doc);
      if (invalidFields.length > 0) {
        problems.push(
          `${name} has invalid component documentation metadata: ${invalidFields.join(', ')}`,
        );
      }
      if (matchingDocs.length > 1) {
        problems.push(`${name} has duplicate component documentation metadata`);
      }
    }
  }

  return problems;
}

function unwrapExpression(expression: ts.Expression): ts.Expression {
  if (
    ts.isAsExpression(expression) ||
    ts.isParenthesizedExpression(expression) ||
    ts.isSatisfiesExpression(expression)
  ) {
    return unwrapExpression(expression.expression);
  }
  return expression;
}

function variableInitializers(sourceFile: ts.SourceFile) {
  const initializers = new Map<string, ts.Expression>();

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        initializers.set(declaration.name.text, declaration.initializer);
      }
    }
  }

  return initializers;
}

function storyTitle(sourceFile: ts.SourceFile) {
  const initializers = variableInitializers(sourceFile);
  const defaultExport = sourceFile.statements.find(
    (statement): statement is ts.ExportAssignment =>
      ts.isExportAssignment(statement) && !statement.isExportEquals,
  );
  if (!defaultExport) return undefined;

  let expression = unwrapExpression(defaultExport.expression);
  if (ts.isIdentifier(expression)) {
    const initializer = initializers.get(expression.text);
    if (!initializer) return undefined;
    expression = unwrapExpression(initializer);
  }
  if (!ts.isObjectLiteralExpression(expression)) return undefined;

  const title = expression.properties.find(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) &&
      ((ts.isIdentifier(property.name) && property.name.text === 'title') ||
        (ts.isStringLiteral(property.name) && property.name.text === 'title')),
  );
  const value = title && unwrapExpression(title.initializer);
  return value && ts.isStringLiteral(value) ? value.text : undefined;
}

function storyIdPrefix(sourceFile: ts.SourceFile) {
  const initializers = variableInitializers(sourceFile);
  const defaultExport = sourceFile.statements.find(
    (statement): statement is ts.ExportAssignment =>
      ts.isExportAssignment(statement) && !statement.isExportEquals,
  );
  if (!defaultExport) return undefined;

  let expression = unwrapExpression(defaultExport.expression);
  if (ts.isIdentifier(expression)) {
    const initializer = initializers.get(expression.text);
    if (!initializer) return undefined;
    expression = unwrapExpression(initializer);
  }
  if (!ts.isObjectLiteralExpression(expression)) return undefined;

  const id = expression.properties.find(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) &&
      ((ts.isIdentifier(property.name) && property.name.text === 'id') ||
        (ts.isStringLiteral(property.name) && property.name.text === 'id')),
  );
  const value = id && unwrapExpression(id.initializer);
  return value && ts.isStringLiteral(value) ? value.text : undefined;
}

function namedImportAliases(sourceFile: ts.SourceFile) {
  const aliases = new Map<string, string>();

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !statement.importClause ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== '@misoto22/kioku-ui' ||
      !statement.importClause.namedBindings ||
      !ts.isNamedImports(statement.importClause.namedBindings)
    ) {
      continue;
    }

    for (const element of statement.importClause.namedBindings.elements) {
      aliases.set(
        element.name.text,
        element.propertyName?.text ?? element.name.text,
      );
    }
  }

  return aliases;
}

function storyComponentName(sourceFile: ts.SourceFile) {
  const aliases = namedImportAliases(sourceFile);
  const initializers = variableInitializers(sourceFile);
  const defaultExport = sourceFile.statements.find(
    (statement): statement is ts.ExportAssignment =>
      ts.isExportAssignment(statement) && !statement.isExportEquals,
  );
  if (!defaultExport) return undefined;

  let expression = unwrapExpression(defaultExport.expression);
  if (ts.isIdentifier(expression)) {
    const initializer = initializers.get(expression.text);
    if (!initializer) return undefined;
    expression = unwrapExpression(initializer);
  }
  if (!ts.isObjectLiteralExpression(expression)) return undefined;

  const component = expression.properties.find(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) &&
      ((ts.isIdentifier(property.name) && property.name.text === 'component') ||
        (ts.isStringLiteral(property.name) &&
          property.name.text === 'component')),
  );
  const value = component && unwrapExpression(component.initializer);
  return value && ts.isIdentifier(value) ? aliases.get(value.text) : undefined;
}

function exportedStoryNames(sourceFile: ts.SourceFile) {
  const names: string[] = [];

  for (const statement of sourceFile.statements) {
    if (
      ts.isVariableStatement(statement) &&
      statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      )
    ) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name))
          names.push(declaration.name.text);
      }
    }
  }

  return names;
}

function storySourceFile(sourceText: string, file: string) {
  return ts.createSourceFile(
    file,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}

export function storyModuleContractFromSource(
  sourceText: string,
  file = 'Unknown.stories.tsx',
): StoryModuleContract {
  const sourceFile = storySourceFile(sourceText, file);
  const componentName = storyComponentName(sourceFile);
  const title = storyTitle(sourceFile);

  return {
    ...(componentName ? {componentName} : {}),
    file,
    storyNames: exportedStoryNames(sourceFile),
    ...(title ? {title} : {}),
  };
}

export function storyArchitectureProblems(
  components: readonly string[],
  stories: readonly StoryModuleContract[],
): string[] {
  const problems: string[] = [];
  const componentSet = new Set(components);
  const owners = new Map<string, StoryModuleContract[]>();

  for (const story of stories) {
    if (!story.componentName) continue;
    const matchingOwners = owners.get(story.componentName) ?? [];
    matchingOwners.push(story);
    owners.set(story.componentName, matchingOwners);
  }

  for (const component of [...componentSet].sort()) {
    if (structuralComponents.has(component)) continue;
    const matchingOwners = owners.get(component) ?? [];

    if (matchingOwners.length === 0) {
      problems.push(`${component} is missing a Storybook metadata owner`);
      continue;
    }
    if (matchingOwners.length > 1) {
      problems.push(
        `${component} has duplicate Storybook metadata owners: ${matchingOwners
          .map(({file}) => file)
          .sort()
          .join(', ')}`,
      );
    }

    if (matchingOwners.length === 1) {
      const [owner] = matchingOwners;
      const expectedTitle = `Core/${component}`;
      if (owner?.title !== expectedTitle) {
        problems.push(`${component} metadata title must be ${expectedTitle}`);
      }

      const required = requiredStories[component];
      if (required) {
        const missing = required.filter(
          (storyName) => !owner?.storyNames.includes(storyName),
        );
        if (missing.length > 0) {
          problems.push(
            `${component} is missing required stories: ${missing.join(', ')}`,
          );
        }
      }
    }
  }

  for (const story of stories) {
    if (!story.componentName || !componentSet.has(story.componentName)) {
      continue;
    }
    const matchingOwners = owners.get(story.componentName) ?? [];
    const expectedTitle = `Core/${story.componentName}`;
    if (matchingOwners.length > 1 && story.title !== expectedTitle) {
      problems.push(
        `${story.file} metadata title must be ${expectedTitle} for component ${story.componentName}`,
      );
    }
  }

  return problems;
}

function localDeclarations(sourceFile: ts.SourceFile) {
  const declarations = new Map<string, ts.Node>();

  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      declarations.set(statement.name.text, statement);
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.initializer) {
          declarations.set(declaration.name.text, declaration.initializer);
        }
      }
    }
  }

  return declarations;
}

function exportedStoryInitializers(sourceFile: ts.SourceFile) {
  const stories = new Map<string, ts.Expression>();

  for (const statement of sourceFile.statements) {
    if (
      !ts.isVariableStatement(statement) ||
      !statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      )
    ) {
      continue;
    }
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        stories.set(declaration.name.text, declaration.initializer);
      }
    }
  }

  return stories;
}

function jsxName(node: ts.JsxElement | ts.JsxSelfClosingElement) {
  const tagName = ts.isJsxElement(node)
    ? node.openingElement.tagName
    : node.tagName;
  return ts.isIdentifier(tagName) ? tagName.text : undefined;
}

function reachableJsxElements(
  root: ts.Node,
  declarations: ReadonlyMap<string, ts.Node>,
) {
  const elements: (ts.JsxElement | ts.JsxSelfClosingElement)[] = [];
  const visitedDeclarations = new Set<ts.Node>();

  function visit(node: ts.Node) {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      elements.push(node);
      const name = jsxName(node);
      const declaration = name ? declarations.get(name) : undefined;
      if (declaration && !visitedDeclarations.has(declaration)) {
        visitedDeclarations.add(declaration);
        visit(declaration);
      }
    }
    if (ts.isIdentifier(node)) {
      const declaration = declarations.get(node.text);
      if (declaration && !visitedDeclarations.has(declaration)) {
        visitedDeclarations.add(declaration);
        visit(declaration);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(root);
  return elements;
}

function canonicalJsxName(
  node: ts.JsxElement | ts.JsxSelfClosingElement,
  aliases: ReadonlyMap<string, string>,
) {
  const name = jsxName(node);
  return name ? (aliases.get(name) ?? name) : undefined;
}

function jsxDescendants(
  root: ts.JsxElement | ts.JsxSelfClosingElement,
  aliases: ReadonlyMap<string, string>,
) {
  const names: string[] = [];

  function visit(node: ts.Node) {
    if (
      node !== root &&
      (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node))
    ) {
      const name = canonicalJsxName(node, aliases);
      if (name) names.push(name);
    }
    ts.forEachChild(node, visit);
  }

  visit(root);
  return names;
}

function hasCompleteComposition(
  elements: readonly (ts.JsxElement | ts.JsxSelfClosingElement)[],
  aliases: ReadonlyMap<string, string>,
  family: 'Card' | 'Table',
  target: string,
) {
  const completeNames =
    family === 'Card'
      ? ['CardHeader', 'CardFooter']
      : [
          'TableCaption',
          'TableHead',
          'TableBody',
          'TableRow',
          'TableHeaderCell',
          'TableCell',
        ];

  return elements.some((element) => {
    if (canonicalJsxName(element, aliases) !== family) return false;
    const descendants = jsxDescendants(element, aliases);
    return (
      descendants.includes(target) &&
      completeNames.every((name) => descendants.includes(name))
    );
  });
}

const placeholderCopy = ['First item', 'Alpha', 'Example values'] as const;
const cardStructuralStories = ['CardHeader', 'CardFooter'] as const;
const tableStructuralStories = [
  'TableCaption',
  'TableHead',
  'TableBody',
  'TableRow',
  'TableHeaderCell',
  'TableCell',
] as const;

export function storySourceProblems(
  sourceText: string,
  file = 'Unknown.stories.tsx',
) {
  const sourceFile = storySourceFile(sourceText, file);
  const aliases = namedImportAliases(sourceFile);
  const declarations = localDeclarations(sourceFile);
  const stories = exportedStoryInitializers(sourceFile);
  const problems: string[] = [];
  const foundPlaceholders = new Set<string>();

  function inspectCopy(node: ts.Node) {
    const value =
      ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
        ? node.text
        : ts.isJsxText(node)
          ? node.getText(sourceFile)
          : undefined;
    if (value) {
      for (const placeholder of placeholderCopy) {
        if (value.includes(placeholder)) foundPlaceholders.add(placeholder);
      }
    }
    ts.forEachChild(node, inspectCopy);
  }

  inspectCopy(sourceFile);
  if (foundPlaceholders.size > 0) {
    problems.push(
      `${file} contains placeholder copy: ${[...foundPlaceholders].sort().join(', ')}`,
    );
  }

  for (const [storyName, initializer] of stories) {
    const cardTarget = cardStructuralStories.find(
      (name) => storyName === name || storyName === `${name}Story`,
    );
    const tableTarget = tableStructuralStories.find(
      (name) => storyName === name || storyName === `${name}Story`,
    );
    const family = cardTarget ? 'Card' : tableTarget ? 'Table' : undefined;
    const target = cardTarget ?? tableTarget;
    if (!family || !target) continue;

    const elements = reachableJsxElements(initializer, declarations);
    if (!hasCompleteComposition(elements, aliases, family, target)) {
      problems.push(
        `${file} story ${storyName} must render ${target} within a complete ${family} composition`,
      );
    }
  }

  return problems;
}

async function workspaceStoryIds(storyDirectory: string) {
  const ids: string[] = [];

  for (const file of (await readdir(storyDirectory)).sort()) {
    if (!file.endsWith('.stories.tsx')) continue;
    const source = ts.createSourceFile(
      file,
      await readFile(join(storyDirectory, file), 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const idPrefix = storyIdPrefix(source) ?? storyTitle(source);
    if (!idPrefix) continue;
    for (const name of exportedStoryNames(source)) {
      ids.push(toId(idPrefix, storyNameFromExport(name)));
    }
  }

  return ids;
}

async function workspaceStoryContracts(storyDirectory: string) {
  const contracts: StoryModuleContract[] = [];
  const problems: string[] = [];

  for (const file of (await readdir(storyDirectory)).sort()) {
    if (!file.endsWith('.stories.tsx')) continue;
    const sourceText = await readFile(join(storyDirectory, file), 'utf8');
    contracts.push(storyModuleContractFromSource(sourceText, file));
    problems.push(...storySourceProblems(sourceText, file));
  }

  return {contracts, problems};
}

export function publicComponentNamesFromSource(
  sourceText: string,
  file = 'index.ts',
) {
  const source = ts.createSourceFile(
    file,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const names: string[] = [];

  for (const statement of source.statements) {
    if (
      !ts.isExportDeclaration(statement) ||
      statement.isTypeOnly ||
      !statement.exportClause ||
      !ts.isNamedExports(statement.exportClause)
    ) {
      continue;
    }
    for (const element of statement.exportClause.elements) {
      if (!element.isTypeOnly && /^[A-Z]/.test(element.name.text)) {
        names.push(element.name.text);
      }
    }
  }

  return names;
}

export async function workspacePublicComponentNames() {
  const workspaceRoot = fileURLToPath(new URL('../../../', import.meta.url));
  const publicIndex = join(workspaceRoot, 'packages/core/src/index.ts');
  return publicComponentNamesFromSource(
    await readFile(publicIndex, 'utf8'),
    publicIndex,
  );
}

export async function workspaceComponentCatalogProblems() {
  const workspaceRoot = fileURLToPath(new URL('../../../', import.meta.url));
  const componentNames = await workspacePublicComponentNames();
  const storyDirectory = join(workspaceRoot, 'apps/storybook/stories');
  const stories = await workspaceStoryContracts(storyDirectory);
  return [
    ...(await componentCatalogProblems(componentNames, {
      docs: componentDocs,
      storyIds: await workspaceStoryIds(storyDirectory),
    })),
    ...storyArchitectureProblems(componentNames, stories.contracts),
    ...stories.problems,
  ];
}
