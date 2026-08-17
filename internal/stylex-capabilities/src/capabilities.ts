import {readdir, readFile} from 'node:fs/promises';
import {extname, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

import ts from 'typescript';

export const stylexCapabilityPolicy = Object.freeze({
  'style-declarations': 'stylex.create with statically analyzable declarations',
  'style-props': 'stylex.props composition at render time',
  'design-tokens': 'stylex.defineVars token contracts',
  keyframes: 'stylex.keyframes static animation definitions',
  'focus-visible-selector': 'the :focus-visible pseudo-class selector',
});

export type SupportedStylexCapability = keyof typeof stylexCapabilityPolicy;

const stylexModule = '@stylexjs/stylex';
const methodCapabilities = new Map<string, SupportedStylexCapability>([
  ['create', 'style-declarations'],
  ['defineVars', 'design-tokens'],
  ['keyframes', 'keyframes'],
  ['props', 'style-props'],
]);

export function isSupportedStylexCapability(
  capability: string,
): capability is SupportedStylexCapability {
  return Object.hasOwn(stylexCapabilityPolicy, capability);
}

function normalizeExpression(expression: ts.Expression): ts.Expression {
  let current = expression;
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isNonNullExpression(current) ||
    ts.isSatisfiesExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function outerExpression(expression: ts.Expression): ts.Expression {
  let current = expression;
  while (current.parent && ts.isExpression(current.parent)) {
    const parent = current.parent;
    if (
      (ts.isParenthesizedExpression(parent) ||
        ts.isAsExpression(parent) ||
        ts.isTypeAssertionExpression(parent) ||
        ts.isNonNullExpression(parent) ||
        ts.isSatisfiesExpression(parent)) &&
      parent.expression === current
    ) {
      current = parent;
      continue;
    }
    break;
  }
  return current;
}

function expressionPropertyName(expression: ts.Expression) {
  const normalized = normalizeExpression(expression);
  if (ts.isStringLiteralLike(normalized) || ts.isNumericLiteral(normalized)) {
    return normalized.text;
  }
}

function propertyName(node: ts.PropertyName) {
  if (
    ts.isIdentifier(node) ||
    ts.isStringLiteral(node) ||
    ts.isNumericLiteral(node)
  ) {
    return node.text;
  }
  if (ts.isComputedPropertyName(node)) {
    return expressionPropertyName(node.expression);
  }
}

function moduleReferenceName(node: ts.Node | undefined) {
  if (node && ts.isStringLiteralLike(node)) return node.text;
  if (
    node &&
    ts.isLiteralTypeNode(node) &&
    ts.isStringLiteralLike(node.literal)
  ) {
    return node.literal.text;
  }
}

type MemberExpression =
  ts.ElementAccessExpression | ts.PropertyAccessExpression;

function isMemberExpression(node: ts.Node): node is MemberExpression {
  return (
    ts.isElementAccessExpression(node) || ts.isPropertyAccessExpression(node)
  );
}

function memberName(node: MemberExpression) {
  return ts.isPropertyAccessExpression(node)
    ? node.name.text
    : expressionPropertyName(node.argumentExpression);
}

function isBindingPattern(node: ts.Node): node is ts.BindingPattern {
  return ts.isArrayBindingPattern(node) || ts.isObjectBindingPattern(node);
}

function expressionContext(expression: ts.Expression): string {
  const current = outerExpression(expression);
  const parent = current.parent;

  if (ts.isVariableDeclaration(parent) && parent.initializer === current) {
    return isBindingPattern(parent.name)
      ? 'destructuring source'
      : 'variable initializer';
  }
  if (ts.isParameter(parent) && parent.initializer === current) {
    return 'default parameter';
  }
  if (ts.isPropertyDeclaration(parent) && parent.initializer === current) {
    return 'class field';
  }
  if (ts.isReturnStatement(parent)) return 'return';
  if (ts.isYieldExpression(parent)) return 'yield';
  if (ts.isArrowFunction(parent) && parent.body === current) {
    return 'function return';
  }
  if (ts.isBinaryExpression(parent) && parent.right === current) {
    return isMemberExpression(parent.left) || ts.isIdentifier(parent.left)
      ? 'assignment'
      : 'destructuring source';
  }
  if (ts.isSpreadAssignment(parent)) return 'object spread';
  if (ts.isSpreadElement(parent)) {
    return ts.isArrayLiteralExpression(parent.parent)
      ? 'array spread'
      : 'spread argument';
  }
  if (ts.isArrayLiteralExpression(parent)) return 'array aggregate';
  if (
    (ts.isPropertyAssignment(parent) && parent.initializer === current) ||
    ts.isShorthandPropertyAssignment(parent)
  ) {
    return 'object aggregate';
  }
  if (
    (ts.isCallExpression(parent) || ts.isNewExpression(parent)) &&
    parent.arguments?.some((argument) => argument === current)
  ) {
    return ts.isCallExpression(parent)
      ? 'call argument'
      : 'constructor argument';
  }
  if (ts.isExportAssignment(parent)) return 'export';
  if (ts.isExportSpecifier(parent)) return 'export';
  return 'expression';
}

function checkerForSource(sourceFile: ts.SourceFile) {
  const fileName = sourceFile.fileName;
  const options = {
    jsx: ts.JsxEmit.Preserve,
    noLib: true,
    noResolve: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.Latest,
  } satisfies ts.CompilerOptions;
  const host: ts.CompilerHost = {
    fileExists: (candidate) => candidate === fileName,
    getCanonicalFileName: (candidate) => candidate,
    getCurrentDirectory: () => '/',
    getDefaultLibFileName: () => '/lib.d.ts',
    getDirectories: () => [],
    getNewLine: () => '\n',
    getSourceFile: (candidate) =>
      candidate === fileName ? sourceFile : undefined,
    readFile: (candidate) =>
      candidate === fileName ? sourceFile.text : undefined,
    useCaseSensitiveFileNames: () => true,
    writeFile: () => undefined,
  };
  return ts
    .createProgram({host, options, rootNames: [fileName]})
    .getTypeChecker();
}

export function stylexSourceProblems(source: string, file = 'source.ts') {
  const sourceFileName = file.startsWith('/') ? file : `/${file}`;
  const sourceFile = ts.createSourceFile(
    sourceFileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const checker = checkerForSource(sourceFile);
  const importedNamespaceSymbols = new Set<ts.Symbol>();
  const importNames = new Map<ts.Symbol, string>();
  const problemKeys = new Set<string>();
  const problems: {message: string; position: number}[] = [];

  const report = (node: ts.Node, capability: string) => {
    const position = node.getStart(sourceFile);
    const key = `${position}:${capability}`;
    if (problemKeys.has(key)) return;
    problemKeys.add(key);
    const line = sourceFile.getLineAndCharacterOfPosition(position).line + 1;
    problems.push({
      message: `${file}:${line} uses unsupported StyleX capability: ${capability}`,
      position,
    });
  };

  const collectStylexModuleForms = (node: ts.Node) => {
    if (
      ts.isImportDeclaration(node) &&
      moduleReferenceName(node.moduleSpecifier) === stylexModule
    ) {
      const importClause = node.importClause;
      if (!importClause) {
        report(node, 'side-effect StyleX import');
      } else {
        if (importClause.name) {
          report(importClause.name, `default import ${importClause.name.text}`);
        }
        const bindings = importClause.namedBindings;
        if (bindings && ts.isNamespaceImport(bindings)) {
          if (importClause.isTypeOnly) {
            report(
              bindings,
              `type-only namespace import ${bindings.name.text}`,
            );
          } else {
            const symbol = checker.getSymbolAtLocation(bindings.name);
            if (symbol) {
              importedNamespaceSymbols.add(symbol);
              importNames.set(symbol, bindings.name.text);
            }
          }
        } else if (bindings) {
          if (bindings.elements.length === 0) {
            report(bindings, 'empty named StyleX import');
          } else {
            for (const element of bindings.elements) {
              const importedName =
                element.propertyName?.text ?? element.name.text;
              const rename =
                importedName === element.name.text
                  ? ''
                  : ` as ${element.name.text}`;
              const type =
                importClause.isTypeOnly || element.isTypeOnly ? 'type ' : '';
              report(element, `${type}named import ${importedName}${rename}`);
            }
          }
        }
      }
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      moduleReferenceName(node.moduleReference.expression) === stylexModule
    ) {
      report(node, `import-equals StyleX import ${node.name.text}`);
    } else if (
      ts.isExportDeclaration(node) &&
      moduleReferenceName(node.moduleSpecifier) === stylexModule
    ) {
      const clause = node.exportClause;
      const type = node.isTypeOnly ? 'type ' : '';
      if (!clause) {
        report(node, `${type}star StyleX re-export`);
      } else if (ts.isNamespaceExport(clause)) {
        report(clause, `${type}namespace StyleX re-export ${clause.name.text}`);
      } else if (clause.elements.length === 0) {
        report(clause, `${type}empty named StyleX re-export`);
      } else {
        for (const element of clause.elements) {
          const importedName = element.propertyName?.text ?? element.name.text;
          const rename =
            importedName === element.name.text
              ? ''
              : ` as ${element.name.text}`;
          const elementType =
            node.isTypeOnly || element.isTypeOnly ? 'type ' : '';
          const elementKind = elementType ? '' : 'named ';
          report(
            element,
            `${elementType}${elementKind}StyleX re-export ${importedName}${rename}`,
          );
        }
      }
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      moduleReferenceName(node.arguments[0]) === stylexModule
    ) {
      report(node, 'dynamic StyleX import');
    } else if (
      ts.isImportTypeNode(node) &&
      moduleReferenceName(node.argument) === stylexModule
    ) {
      report(node, 'StyleX import type');
    }
    ts.forEachChild(node, collectStylexModuleForms);
  };

  const inspectStyleDeclarations = (node: ts.Node) => {
    if (
      (ts.isPropertyAssignment(node) ||
        ts.isMethodDeclaration(node) ||
        ts.isGetAccessorDeclaration(node) ||
        ts.isSetAccessorDeclaration(node)) &&
      node.name
    ) {
      const name = propertyName(node.name);
      if (name?.startsWith(':global(')) {
        report(node, 'arbitrary-global-selector');
      } else if (name?.startsWith('@')) {
        report(node, 'at-rule');
      } else if (name?.startsWith(':') && name !== ':focus-visible') {
        report(node, `selector ${name}`);
      }
    }
    ts.forEachChild(node, inspectStyleDeclarations);
  };

  const directCall = (expression: ts.Expression) => {
    const current = outerExpression(expression);
    return ts.isCallExpression(current.parent) &&
      current.parent.expression === current
      ? current.parent
      : undefined;
  };

  const analyzeImportedNamespaceUse = (
    identifier: ts.Identifier,
    importName: string,
  ) => {
    const receiver = outerExpression(identifier);
    const parent = receiver.parent;
    if (!isMemberExpression(parent) || parent.expression !== receiver) {
      report(
        identifier,
        `StyleX namespace escape via ${importName} (${expressionContext(identifier)})`,
      );
      return;
    }

    const method = memberName(parent);
    if (!method) {
      report(parent, `dynamic StyleX property via ${importName}`);
      return;
    }
    if (!methodCapabilities.has(method)) {
      report(parent, `stylex.${method}`);
      return;
    }

    const member = outerExpression(parent);
    const memberParent = member.parent;
    const call = directCall(parent);
    const optionalMember = parent.questionDotToken !== undefined;
    if (call && !optionalMember && call.questionDotToken === undefined) {
      if (method === 'create') {
        for (const argument of call.arguments) {
          inspectStyleDeclarations(argument);
        }
      }
      return;
    }

    if (
      isMemberExpression(memberParent) &&
      memberParent.expression === member &&
      memberName(memberParent) === 'call'
    ) {
      const invoked = directCall(memberParent);
      if (invoked) {
        report(
          invoked,
          `indirect StyleX capability invocation: ${importName}.${method}.call`,
        );
        return;
      }
    }
    if (
      ts.isNewExpression(memberParent) &&
      memberParent.expression === member
    ) {
      report(
        memberParent,
        `indirect StyleX capability invocation: new ${importName}.${method}`,
      );
      return;
    }
    if (
      ts.isTaggedTemplateExpression(memberParent) &&
      memberParent.tag === member
    ) {
      report(
        memberParent,
        `indirect StyleX capability invocation: tagged ${importName}.${method}`,
      );
      return;
    }
    if (call || optionalMember) {
      report(
        call ?? parent,
        `indirect StyleX capability invocation: optional ${importName}.${method}`,
      );
      return;
    }

    report(
      parent,
      `indirect StyleX capability use: ${importName}.${method} (${expressionContext(parent)})`,
    );
  };

  collectStylexModuleForms(sourceFile);

  const referencedSymbol = (identifier: ts.Identifier) => {
    const parent = identifier.parent;
    if (
      ts.isShorthandPropertyAssignment(parent) &&
      parent.name === identifier
    ) {
      return checker.getShorthandAssignmentValueSymbol(parent);
    }
    if (ts.isExportSpecifier(parent)) {
      const localName = parent.propertyName ?? parent.name;
      return localName === identifier
        ? checker.getExportSpecifierLocalTargetSymbol(parent)
        : undefined;
    }
    return checker.getSymbolAtLocation(identifier);
  };

  const visit = (node: ts.Node) => {
    if (ts.isIdentifier(node) && !ts.isNamespaceImport(node.parent)) {
      const symbol = referencedSymbol(node);
      if (symbol && importedNamespaceSymbols.has(symbol)) {
        analyzeImportedNamespaceUse(node, importNames.get(symbol) ?? node.text);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  return problems
    .sort(
      (left, right) =>
        left.position - right.position ||
        left.message.localeCompare(right.message),
    )
    .map(({message}) => message);
}

async function authoredSourceFiles(directory: string): Promise<string[]> {
  const files: string[] = [];

  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await authoredSourceFiles(path)));
    } else if (['.ts', '.tsx'].includes(extname(path))) {
      files.push(path);
    }
  }

  return files;
}

export async function workspaceStylexCapabilityProblems() {
  const workspaceRoot = fileURLToPath(new URL('../../../', import.meta.url));
  const sourceRoot = join(workspaceRoot, 'packages/core/src');
  const problems: string[] = [];

  for (const path of await authoredSourceFiles(sourceRoot)) {
    const source = await readFile(path, 'utf8');
    problems.push(
      ...stylexSourceProblems(source, relative(workspaceRoot, path)),
    );
  }

  return problems.sort();
}
