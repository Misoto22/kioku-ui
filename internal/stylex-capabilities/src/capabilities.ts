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

export function stylexSourceProblems(source: string, file = 'source.ts') {
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const problems = new Set<string>();

  type BindingValue =
    | {kind: 'method'; method: string; reported: boolean}
    | {importName: string; kind: 'namespace'}
    | {kind: 'other'};
  interface Binding {
    value: BindingValue;
  }
  interface Scope {
    bindings: Map<string, Binding>;
    kind: 'block' | 'catch' | 'function' | 'loop' | 'source' | 'switch';
    parent?: Scope;
  }

  const rootScope: Scope = {bindings: new Map(), kind: 'source'};
  const otherValue = {kind: 'other'} as const satisfies BindingValue;

  const resolveBinding = (scope: Scope, name: string): Binding | undefined => {
    let current: Scope | undefined = scope;
    while (current) {
      const binding = current.bindings.get(name);
      if (binding) return binding;
      current = current.parent;
    }
  };

  const declareBinding = (
    scope: Scope,
    name: string,
    value: BindingValue = otherValue,
  ) => {
    const existing = scope.bindings.get(name);
    if (existing) return existing;
    const binding = {value};
    scope.bindings.set(name, binding);
    return binding;
  };

  const childScope = (kind: Scope['kind'], parent: Scope): Scope => ({
    bindings: new Map(),
    kind,
    parent,
  });

  const cloneScopeChain = (scope: Scope): Scope => ({
    bindings: new Map(
      [...scope.bindings].map(([name, binding]) => [
        name,
        {value: binding.value},
      ]),
    ),
    kind: scope.kind,
    parent: scope.parent ? cloneScopeChain(scope.parent) : undefined,
  });

  const bindOther = (scope: Scope, name: ts.BindingName) => {
    if (ts.isIdentifier(name)) {
      declareBinding(scope, name.text);
      return;
    }
    for (const element of name.elements) {
      if (!ts.isOmittedExpression(element)) bindOther(scope, element.name);
    }
  };

  const nearestFunctionScope = (scope: Scope) => {
    let current = scope;
    while (current.kind !== 'function' && current.kind !== 'source') {
      current = current.parent ?? current;
    }
    return current;
  };

  const variableScope = (node: ts.VariableDeclaration, scope: Scope) => {
    const declarationList = node.parent;
    return ts.isVariableDeclarationList(declarationList) &&
      (declarationList.flags & ts.NodeFlags.BlockScoped) === 0
      ? nearestFunctionScope(scope)
      : scope;
  };

  const predeclareStatements = (
    statements: readonly ts.Statement[],
    scope: Scope,
  ) => {
    for (const statement of statements) {
      if (
        (ts.isFunctionDeclaration(statement) ||
          ts.isClassDeclaration(statement)) &&
        statement.name
      ) {
        declareBinding(scope, statement.name.text);
      } else if (ts.isVariableStatement(statement)) {
        const targetScope =
          (statement.declarationList.flags & ts.NodeFlags.BlockScoped) === 0
            ? nearestFunctionScope(scope)
            : scope;
        for (const declaration of statement.declarationList.declarations) {
          bindOther(targetScope, declaration.name);
        }
      }
    }
  };

  const predeclareVarBindings = (node: ts.Node, scope: Scope) => {
    const visitVar = (child: ts.Node) => {
      if (child !== node && ts.isFunctionLike(child)) return;
      if (
        ts.isVariableDeclarationList(child) &&
        (child.flags & ts.NodeFlags.BlockScoped) === 0
      ) {
        for (const declaration of child.declarations) {
          bindOther(scope, declaration.name);
        }
      }
      ts.forEachChild(child, visitVar);
    };
    visitVar(node);
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
        declareBinding(rootScope, importClause.name.text);
      }
      if (
        importClause.namedBindings &&
        ts.isNamespaceImport(importClause.namedBindings)
      ) {
        const importName = importClause.namedBindings.name.text;
        declareBinding(rootScope, importName, {
          importName,
          kind: 'namespace',
        });
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
            declareBinding(rootScope, element.name.text);
          }
        }
      }
    }
  }

  const unsupportedMethod = (method: string) => {
    const capability = methodCapabilities.get(method);
    return !capability || !isSupportedStylexCapability(capability);
  };

  const expressionIdentifierName = (expression: ts.Expression) => {
    const normalized = normalizeExpression(expression);
    return ts.isIdentifier(normalized) ? normalized.text : undefined;
  };

  const methodValue = (method: string, reported = false): BindingValue => ({
    kind: 'method',
    method,
    reported,
  });

  type MemberExpression =
    ts.ElementAccessExpression | ts.PropertyAccessExpression;

  const isMemberExpression = (
    expression: ts.Expression,
  ): expression is MemberExpression =>
    ts.isPropertyAccessExpression(expression) ||
    ts.isElementAccessExpression(expression);

  const memberName = (expression: MemberExpression) =>
    ts.isPropertyAccessExpression(expression)
      ? expression.name.text
      : expressionPropertyName(expression.argumentExpression);

  function evaluateMemberExpression(
    expression: MemberExpression,
    scope: Scope,
  ) {
    const receiver = evaluateExpression(expression.expression, scope);
    if (ts.isElementAccessExpression(expression)) {
      evaluateExpression(expression.argumentExpression, scope);
    }
    return {method: memberName(expression), receiver};
  }

  const assignIdentifier = (
    name: string,
    value: BindingValue,
    scope: Scope,
  ) => {
    const binding = resolveBinding(scope, name);
    if (binding) binding.value = value;
  };

  function assignObjectPattern(
    pattern: ts.ObjectLiteralExpression,
    value: BindingValue,
    scope: Scope,
  ) {
    for (const property of pattern.properties) {
      if (ts.isPropertyAssignment(property)) {
        const importedName = propertyName(property.name);
        const target = property.initializer;
        const targetName = expressionIdentifierName(target);
        if (value.kind === 'namespace' && importedName) {
          const alias =
            targetName && targetName !== importedName
              ? ` as ${targetName}`
              : '';
          report(property, `destructured stylex.${importedName}${alias}`);
          assignTarget(target, methodValue(importedName, true), scope);
        } else {
          assignTarget(target, otherValue, scope);
        }
      } else if (ts.isShorthandPropertyAssignment(property)) {
        const importedName = property.name.text;
        if (value.kind === 'namespace') {
          report(property, `destructured stylex.${importedName}`);
          assignIdentifier(
            importedName,
            methodValue(importedName, true),
            scope,
          );
        } else {
          assignIdentifier(importedName, otherValue, scope);
        }
      } else if (ts.isSpreadAssignment(property)) {
        assignTarget(property.expression, otherValue, scope);
      }
    }
  }

  function assignTarget(
    target: ts.Expression,
    value: BindingValue,
    scope: Scope,
  ) {
    const normalized = normalizeExpression(target);
    if (ts.isIdentifier(normalized)) {
      assignIdentifier(normalized.text, value, scope);
    } else if (ts.isObjectLiteralExpression(normalized)) {
      assignObjectPattern(normalized, value, scope);
    } else if (ts.isArrayLiteralExpression(normalized)) {
      for (const element of normalized.elements) {
        if (ts.isOmittedExpression(element)) continue;
        assignTarget(
          ts.isSpreadElement(element) ? element.expression : element,
          otherValue,
          scope,
        );
      }
    } else if (
      ts.isBinaryExpression(normalized) &&
      normalized.operatorToken.kind === ts.SyntaxKind.EqualsToken
    ) {
      assignTarget(normalized.left, value, scope);
    }
  }

  function initializeBindingName(
    name: ts.BindingName,
    value: BindingValue,
    scope: Scope,
  ) {
    if (ts.isIdentifier(name)) {
      declareBinding(scope, name.text).value = value;
      return;
    }

    if (ts.isObjectBindingPattern(name) && value.kind === 'namespace') {
      for (const element of name.elements) {
        if (!ts.isIdentifier(element.name) || element.dotDotDotToken) {
          initializeBindingName(element.name, otherValue, scope);
          continue;
        }
        const importedName = element.propertyName
          ? propertyName(element.propertyName)
          : element.name.text;
        if (!importedName) {
          initializeBindingName(element.name, otherValue, scope);
          continue;
        }
        const alias =
          element.name.text === importedName ? '' : ` as ${element.name.text}`;
        report(element, `destructured stylex.${importedName}${alias}`);
        initializeBindingName(
          element.name,
          methodValue(importedName, true),
          scope,
        );
      }
      return;
    }

    for (const element of name.elements) {
      if (!ts.isOmittedExpression(element)) {
        initializeBindingName(element.name, otherValue, scope);
      }
    }
  }

  function evaluateExpression(
    expression: ts.Expression,
    scope: Scope,
  ): BindingValue {
    const normalized = normalizeExpression(expression);
    if (normalized !== expression) {
      return evaluateExpression(normalized, scope);
    }

    if (ts.isIdentifier(normalized)) {
      return resolveBinding(scope, normalized.text)?.value ?? otherValue;
    }

    if (isMemberExpression(normalized)) {
      const {method, receiver} = evaluateMemberExpression(normalized, scope);
      return receiver.kind === 'namespace' && method
        ? methodValue(method)
        : otherValue;
    }

    if (
      ts.isBinaryExpression(normalized) &&
      normalized.operatorToken.kind === ts.SyntaxKind.EqualsToken
    ) {
      const value = evaluateExpression(normalized.right, scope);
      assignTarget(normalized.left, value, scope);
      return value;
    }

    if (ts.isCallExpression(normalized)) {
      const callee = normalizeExpression(normalized.expression);
      if (isMemberExpression(callee)) {
        const {method, receiver} = evaluateMemberExpression(callee, scope);
        if (
          method &&
          receiver.kind === 'namespace' &&
          unsupportedMethod(method)
        ) {
          const localName = expressionIdentifierName(callee.expression);
          const alias =
            localName && localName !== receiver.importName
              ? ` via ${localName}`
              : '';
          report(normalized, `stylex.${method}${alias}`);
        }
      } else {
        const callable = evaluateExpression(callee, scope);
        if (
          callable.kind === 'method' &&
          !callable.reported &&
          unsupportedMethod(callable.method)
        ) {
          const localName = expressionIdentifierName(callee);
          const alias = localName ? ` via ${localName}` : '';
          report(normalized, `stylex.${callable.method}${alias}`);
        }
      }
      for (const argument of normalized.arguments) {
        evaluateExpression(argument, scope);
      }
      return otherValue;
    }

    if (
      ts.isArrowFunction(normalized) ||
      ts.isFunctionExpression(normalized) ||
      ts.isClassExpression(normalized)
    ) {
      visit(normalized, scope);
      return otherValue;
    }

    ts.forEachChild(normalized, (child) => {
      if (ts.isExpression(child)) {
        evaluateExpression(child, scope);
      } else {
        visit(child, scope);
      }
    });
    return otherValue;
  }

  const predeclareVariableList = (
    declarationList: ts.VariableDeclarationList,
    scope: Scope,
  ) => {
    const targetScope =
      (declarationList.flags & ts.NodeFlags.BlockScoped) === 0
        ? nearestFunctionScope(scope)
        : scope;
    for (const declaration of declarationList.declarations) {
      bindOther(targetScope, declaration.name);
    }
  };

  const visitLoopInitializer = (
    initializer: ts.ForInitializer | undefined,
    scope: Scope,
  ) => {
    if (!initializer) return;
    if (ts.isVariableDeclarationList(initializer)) {
      predeclareVariableList(initializer, scope);
      for (const declaration of initializer.declarations) {
        visit(declaration, scope);
      }
    } else {
      evaluateExpression(initializer, scope);
    }
  };

  function visit(node: ts.Node, scope: Scope): void {
    if (ts.isSourceFile(node)) {
      predeclareStatements(node.statements, scope);
      predeclareVarBindings(node, scope);
      for (const statement of node.statements) visit(statement, scope);
      return;
    }

    if (ts.isImportDeclaration(node)) return;

    if (ts.isSwitchStatement(node)) {
      evaluateExpression(node.expression, scope);
      const switchScope = childScope('switch', scope);
      const statements = node.caseBlock.clauses.flatMap((clause) => [
        ...clause.statements,
      ]);
      predeclareStatements(statements, switchScope);
      for (const clause of node.caseBlock.clauses) {
        if (ts.isCaseClause(clause)) {
          evaluateExpression(clause.expression, switchScope);
        }
        for (const statement of clause.statements) {
          visit(statement, switchScope);
        }
      }
      return;
    }

    if (ts.isForStatement(node)) {
      const loopScope = childScope('loop', scope);
      visitLoopInitializer(node.initializer, loopScope);
      if (node.condition) evaluateExpression(node.condition, loopScope);
      visit(node.statement, loopScope);
      if (node.incrementor) evaluateExpression(node.incrementor, loopScope);
      return;
    }

    if (ts.isForInStatement(node) || ts.isForOfStatement(node)) {
      const loopScope = childScope('loop', scope);
      if (ts.isVariableDeclarationList(node.initializer)) {
        predeclareVariableList(node.initializer, loopScope);
      }
      evaluateExpression(node.expression, loopScope);
      if (ts.isVariableDeclarationList(node.initializer)) {
        visitLoopInitializer(node.initializer, loopScope);
      } else {
        assignTarget(node.initializer, otherValue, loopScope);
      }
      visit(node.statement, loopScope);
      return;
    }

    if (ts.isBlock(node)) {
      const blockScope = childScope('block', scope);
      predeclareStatements(node.statements, blockScope);
      for (const statement of node.statements) visit(statement, blockScope);
      return;
    }

    if (ts.isCatchClause(node)) {
      const catchScope = childScope('catch', scope);
      if (node.variableDeclaration) {
        bindOther(catchScope, node.variableDeclaration.name);
      }
      visit(node.block, catchScope);
      return;
    }

    if (ts.isFunctionLike(node)) {
      const functionScope = childScope('function', cloneScopeChain(scope));
      if (
        (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) &&
        node.name
      ) {
        declareBinding(functionScope, node.name.text);
      }
      for (const parameter of node.parameters) {
        bindOther(functionScope, parameter.name);
      }
      for (const parameter of node.parameters) {
        if (parameter.initializer) {
          const initializer = evaluateExpression(
            parameter.initializer,
            functionScope,
          );
          initializeBindingName(parameter.name, initializer, functionScope);
        }
      }
      if ('body' in node && node.body) {
        predeclareVarBindings(node.body, functionScope);
      }
      if ('body' in node && node.body) visit(node.body, functionScope);
      return;
    }

    if (ts.isVariableDeclaration(node)) {
      const initializer = node.initializer
        ? evaluateExpression(node.initializer, scope)
        : undefined;
      const targetScope = variableScope(node, scope);
      initializeBindingName(node.name, initializer ?? otherValue, targetScope);
      return;
    }

    if (ts.isExpression(node)) {
      evaluateExpression(node, scope);
      return;
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
  }

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
