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
    const title = storyTitle(source);
    if (!title) continue;
    for (const name of exportedStoryNames(source)) {
      ids.push(toId(title, storyNameFromExport(name)));
    }
  }

  return ids;
}

async function publicComponentNames(componentIndex: string) {
  const source = ts.createSourceFile(
    componentIndex,
    await readFile(componentIndex, 'utf8'),
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
      if (!element.isTypeOnly) names.push(element.name.text);
    }
  }

  return names;
}

export async function workspaceComponentCatalogProblems() {
  const workspaceRoot = fileURLToPath(new URL('../../../', import.meta.url));
  return componentCatalogProblems(
    await publicComponentNames(
      join(workspaceRoot, 'packages/core/src/components/index.ts'),
    ),
    {
      docs: componentDocs,
      storyIds: await workspaceStoryIds(
        join(workspaceRoot, 'apps/storybook/stories'),
      ),
    },
  );
}
