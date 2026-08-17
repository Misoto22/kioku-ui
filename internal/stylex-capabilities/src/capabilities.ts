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

function propertyName(node: ts.PropertyName) {
  if (
    ts.isIdentifier(node) ||
    ts.isStringLiteral(node) ||
    ts.isNumericLiteral(node)
  ) {
    return node.text;
  }
}

export function stylexSourceProblems(source: string, file = 'source.ts') {
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const problems = new Set<string>();

  type Binding =
    | {kind: 'method'; method: string; reported: boolean}
    | {importName: string; kind: 'namespace'}
    | {kind: 'other'};
  interface Scope {
    bindings: Map<string, Binding>;
    parent?: Scope;
  }

  const rootScope: Scope = {bindings: new Map()};
  const otherBinding = {kind: 'other'} as const satisfies Binding;

  const resolveBinding = (scope: Scope, name: string) => {
    let current: Scope | undefined = scope;
    while (current) {
      const binding = current.bindings.get(name);
      if (binding) return binding;
      current = current.parent;
    }
  };

  const bindOther = (scope: Scope, name: ts.BindingName) => {
    if (ts.isIdentifier(name)) {
      scope.bindings.set(name.text, otherBinding);
      return;
    }
    for (const element of name.elements) {
      if (!ts.isOmittedExpression(element)) bindOther(scope, element.name);
    }
  };

  const report = (node: ts.Node, capability: string) => {
    const line =
      sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    problems.add(
      `${file}:${line} uses unsupported StyleX capability: ${capability}`,
    );
  };

  for (const statement of sourceFile.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text === '@stylexjs/stylex'
    ) {
      const importClause = statement.importClause;
      if (!importClause || importClause.isTypeOnly) continue;

      if (importClause.name) {
        report(importClause.name, `default import ${importClause.name.text}`);
        rootScope.bindings.set(importClause.name.text, otherBinding);
      }
      if (
        importClause.namedBindings &&
        ts.isNamespaceImport(importClause.namedBindings)
      ) {
        const importName = importClause.namedBindings.name.text;
        rootScope.bindings.set(importName, {importName, kind: 'namespace'});
      } else if (
        importClause.namedBindings &&
        ts.isNamedImports(importClause.namedBindings)
      ) {
        for (const element of importClause.namedBindings.elements) {
          if (!element.isTypeOnly) {
            report(
              element,
              `named import ${(element.propertyName ?? element.name).text}`,
            );
            rootScope.bindings.set(element.name.text, otherBinding);
          }
        }
      }
    }
  }

  const unsupportedMethod = (method: string) => {
    const capability = methodCapabilities.get(method);
    return !capability || !isSupportedStylexCapability(capability);
  };

  const expressionBinding = (expression: ts.Expression, scope: Scope) => {
    if (ts.isIdentifier(expression)) {
      return resolveBinding(scope, expression.text);
    }
    if (
      ts.isPropertyAccessExpression(expression) &&
      ts.isIdentifier(expression.expression)
    ) {
      const namespace = resolveBinding(scope, expression.expression.text);
      if (namespace?.kind === 'namespace') {
        return {
          kind: 'method',
          method: expression.name.text,
          reported: false,
        } as const satisfies Binding;
      }
    }
  };

  const visit = (node: ts.Node, scope: Scope) => {
    if (ts.isSourceFile(node)) {
      for (const statement of node.statements) visit(statement, scope);
      return;
    }

    if (ts.isImportDeclaration(node)) return;

    if (ts.isBlock(node)) {
      const blockScope: Scope = {bindings: new Map(), parent: scope};
      for (const statement of node.statements) visit(statement, blockScope);
      return;
    }

    if (ts.isFunctionLike(node)) {
      const functionScope: Scope = {bindings: new Map(), parent: scope};
      for (const parameter of node.parameters) {
        bindOther(functionScope, parameter.name);
      }
      if ('body' in node && node.body) visit(node.body, functionScope);
      return;
    }

    if (ts.isVariableDeclaration(node)) {
      if (node.initializer) visit(node.initializer, scope);
      const initializer = node.initializer
        ? expressionBinding(node.initializer, scope)
        : undefined;

      if (ts.isIdentifier(node.name)) {
        scope.bindings.set(node.name.text, initializer ?? otherBinding);
      } else if (
        ts.isObjectBindingPattern(node.name) &&
        initializer?.kind === 'namespace'
      ) {
        for (const element of node.name.elements) {
          if (!ts.isIdentifier(element.name) || element.dotDotDotToken) {
            bindOther(scope, element.name);
            continue;
          }
          const importedName = element.propertyName
            ? propertyName(element.propertyName)
            : element.name.text;
          if (!importedName) {
            scope.bindings.set(element.name.text, otherBinding);
            continue;
          }
          const alias =
            element.name.text === importedName
              ? ''
              : ` as ${element.name.text}`;
          report(element, `destructured stylex.${importedName}${alias}`);
          scope.bindings.set(element.name.text, {
            kind: 'method',
            method: importedName,
            reported: true,
          });
        }
      } else {
        bindOther(scope, node.name);
      }
      return;
    }

    if (ts.isCallExpression(node)) {
      if (
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression)
      ) {
        const localName = node.expression.expression.text;
        const namespace = resolveBinding(scope, localName);
        const method = node.expression.name.text;
        if (namespace?.kind === 'namespace' && unsupportedMethod(method)) {
          const alias =
            localName === namespace.importName ? '' : ` via ${localName}`;
          report(node, `stylex.${method}${alias}`);
        }
      } else if (ts.isIdentifier(node.expression)) {
        const method = resolveBinding(scope, node.expression.text);
        if (
          method?.kind === 'method' &&
          !method.reported &&
          unsupportedMethod(method.method)
        ) {
          report(node, `stylex.${method.method} via ${node.expression.text}`);
        }
      }
    }

    if (ts.isPropertyAssignment(node)) {
      const name = propertyName(node.name);
      if (name?.startsWith(':global(')) {
        report(node, 'arbitrary-global-selector');
      } else if (name?.startsWith('@')) {
        report(node, 'at-rule');
      } else if (name?.startsWith(':') && name !== ':focus-visible') {
        report(node, `selector ${name}`);
      }
    }

    ts.forEachChild(node, (child) => visit(child, scope));
  };

  visit(sourceFile, rootScope);
  return [...problems].sort();
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
