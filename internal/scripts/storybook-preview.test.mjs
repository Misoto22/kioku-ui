import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import ts from 'typescript';

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const previewPath = resolve(
  repositoryRoot,
  'apps/storybook/.storybook/preview.ts',
);

function unwrap(expression) {
  if (
    ts.isAsExpression(expression) ||
    ts.isParenthesizedExpression(expression) ||
    ts.isSatisfiesExpression(expression)
  ) {
    return unwrap(expression.expression);
  }
  return expression;
}

function property(object, name) {
  return object.properties.find(
    (candidate) =>
      ts.isPropertyAssignment(candidate) &&
      ((ts.isIdentifier(candidate.name) && candidate.name.text === name) ||
        (ts.isStringLiteral(candidate.name) && candidate.name.text === name)),
  );
}

async function previewSource() {
  const source = ts.createSourceFile(
    previewPath,
    await readFile(previewPath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const declaration = source.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations])
    .find(
      (candidate) =>
        ts.isIdentifier(candidate.name) && candidate.name.text === 'preview',
    );
  const initializer =
    declaration?.initializer && unwrap(declaration.initializer);
  assert.ok(initializer && ts.isObjectLiteralExpression(initializer));
  return initializer;
}

test('Storybook preview defaults component stories to padded layout', async () => {
  const preview = await previewSource();
  const parameters = property(preview, 'parameters');
  const parametersValue = parameters && unwrap(parameters.initializer);
  assert.ok(parametersValue && ts.isObjectLiteralExpression(parametersValue));
  const layout = property(parametersValue, 'layout');
  const layoutValue = layout && unwrap(layout.initializer);

  assert.ok(layoutValue && ts.isStringLiteral(layoutValue));
  assert.equal(layoutValue.text, 'padded');
});

test('Storybook preview keeps theme ownership without the former 24px wrapper', async () => {
  const preview = await previewSource();
  let themeProviderCall = false;
  let numericTwentyFourPadding = false;

  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'createElement' &&
      node.arguments[0] &&
      ts.isIdentifier(node.arguments[0]) &&
      node.arguments[0].text === 'ThemeProvider'
    ) {
      themeProviderCall = true;
    }
    if (
      ts.isPropertyAssignment(node) &&
      ((ts.isIdentifier(node.name) && node.name.text === 'padding') ||
        (ts.isStringLiteral(node.name) && node.name.text === 'padding')) &&
      ts.isNumericLiteral(node.initializer) &&
      node.initializer.text === '24'
    ) {
      numericTwentyFourPadding = true;
    }
    ts.forEachChild(node, visit);
  }

  visit(preview);
  assert.equal(themeProviderCall, true);
  assert.equal(numericTwentyFourPadding, false);
});
