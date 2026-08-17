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
  const reportedNodes = new Set<number>();

  type BindingValue =
    | {kind: 'member'; method: string; reported: boolean; importName: string}
    | {kind: 'maybe-stylex'; reported: boolean}
    | {importName: string; kind: 'namespace'}
    | {kind: 'other'};
  interface BindingId {
    id: number;
    name: string;
  }
  interface Scope {
    bindings: Map<string, BindingId>;
    kind: 'block' | 'catch' | 'function' | 'loop' | 'source' | 'switch';
    parent?: Scope;
  }
  type FlowState = ReadonlyMap<BindingId, BindingValue>;
  interface Evaluation {
    flow: FlowState;
    value: BindingValue;
  }

  const otherValue = {kind: 'other'} as const satisfies BindingValue;
  const rootScope: Scope = {bindings: new Map(), kind: 'source'};
  const childScopes = new WeakMap<ts.Node, Scope>();
  let nextBindingId = 0;

  const methodValue = (
    method: string,
    reported = false,
    importName = '',
  ): BindingValue => ({kind: 'member', method, reported, importName});
  const maybeStylexValue = (reported = false): BindingValue => ({
    kind: 'maybe-stylex',
    reported,
  });
  const stylexValueWasReported = (value: BindingValue) =>
    (value.kind === 'member' || value.kind === 'maybe-stylex') &&
    value.reported;
  const sameBindingValue = (left: BindingValue, right: BindingValue) => {
    if (left.kind !== right.kind) return false;
    if (left.kind === 'other') return true;
    if (left.kind === 'namespace' && right.kind === 'namespace') {
      return left.importName === right.importName;
    }
    if (left.kind === 'member' && right.kind === 'member') {
      return (
        left.method === right.method &&
        left.reported === right.reported &&
        left.importName === right.importName
      );
    }
    return (
      left.kind === 'maybe-stylex' &&
      right.kind === 'maybe-stylex' &&
      left.reported === right.reported
    );
  };
  const joinBindingValues = (
    left: BindingValue,
    right: BindingValue,
  ): BindingValue => {
    if (left.kind === 'other' && right.kind === 'other') return otherValue;
    if (left.kind === 'namespace' && right.kind === 'namespace') {
      return {
        importName: left.importName === right.importName ? left.importName : '',
        kind: 'namespace',
      };
    }
    if (
      left.kind === 'member' &&
      right.kind === 'member' &&
      left.method === right.method
    ) {
      return methodValue(
        left.method,
        left.reported && right.reported,
        left.importName === right.importName ? left.importName : '',
      );
    }
    const stylexValues = [left, right].filter(
      (value) => value.kind !== 'other',
    );
    return maybeStylexValue(stylexValues.every(stylexValueWasReported));
  };
  const setBindingValue = (
    flow: FlowState,
    binding: BindingId,
    value: BindingValue,
  ): FlowState => {
    if (sameBindingValue(flow.get(binding) ?? otherValue, value)) return flow;
    const next = new Map(flow);
    next.set(binding, value);
    return next;
  };
  const joinFlowStates = (...states: FlowState[]): FlowState => {
    if (states.length === 0) return new Map();
    const bindings = new Set(states.flatMap((state) => [...state.keys()]));
    const joined = new Map<BindingId, BindingValue>();
    for (const binding of bindings) {
      let value = states[0]?.get(binding) ?? otherValue;
      for (const state of states.slice(1)) {
        value = joinBindingValues(value, state.get(binding) ?? otherValue);
      }
      joined.set(binding, value);
    }
    return joined;
  };
  const sameFlowState = (left: FlowState, right: FlowState) => {
    const bindings = new Set([...left.keys(), ...right.keys()]);
    return [...bindings].every((binding) =>
      sameBindingValue(
        left.get(binding) ?? otherValue,
        right.get(binding) ?? otherValue,
      ),
    );
  };

  const report = (node: ts.Node, capability: string) => {
    const position = node.getStart();
    if (reportedNodes.has(position)) return;
    reportedNodes.add(position);
    const line = sourceFile.getLineAndCharacterOfPosition(position).line + 1;
    problems.add(
      `${file}:${line} uses unsupported StyleX capability: ${capability}`,
    );
  };

  const childScope = (
    node: ts.Node,
    kind: Scope['kind'],
    parent: Scope,
  ): Scope => {
    const existing = childScopes.get(node);
    if (existing) return existing;
    const scope = {bindings: new Map(), kind, parent} satisfies Scope;
    childScopes.set(node, scope);
    return scope;
  };
  const resolveBinding = (scope: Scope, name: string) => {
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
    flow: FlowState,
    value: BindingValue = otherValue,
  ) => {
    let binding = scope.bindings.get(name);
    if (!binding) {
      binding = {id: nextBindingId++, name};
      scope.bindings.set(name, binding);
    }
    return {
      binding,
      flow: flow.has(binding) ? flow : setBindingValue(flow, binding, value),
    };
  };
  const bindOther = (
    scope: Scope,
    name: ts.BindingName,
    flow: FlowState,
    reset = false,
  ): FlowState => {
    if (ts.isIdentifier(name)) {
      const declaration = declareBinding(scope, name.text, flow);
      return reset
        ? setBindingValue(declaration.flow, declaration.binding, otherValue)
        : declaration.flow;
    }
    let next = flow;
    for (const element of name.elements) {
      if (!ts.isOmittedExpression(element)) {
        next = bindOther(scope, element.name, next, reset);
      }
    }
    return next;
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
    flow: FlowState,
    resetLexical = false,
  ) => {
    let next = flow;
    for (const statement of statements) {
      if (
        (ts.isFunctionDeclaration(statement) ||
          ts.isClassDeclaration(statement)) &&
        statement.name
      ) {
        const declaration = declareBinding(scope, statement.name.text, next);
        next = resetLexical
          ? setBindingValue(declaration.flow, declaration.binding, otherValue)
          : declaration.flow;
      } else if (ts.isVariableStatement(statement)) {
        const blockScoped =
          (statement.declarationList.flags & ts.NodeFlags.BlockScoped) !== 0;
        const targetScope = blockScoped ? scope : nearestFunctionScope(scope);
        for (const declaration of statement.declarationList.declarations) {
          next = bindOther(
            targetScope,
            declaration.name,
            next,
            resetLexical && blockScoped,
          );
        }
      }
    }
    return next;
  };
  const predeclareVarBindings = (
    node: ts.Node,
    scope: Scope,
    flow: FlowState,
  ) => {
    let next = flow;
    const visitVar = (child: ts.Node) => {
      if (child !== node && ts.isFunctionLike(child)) return;
      if (
        ts.isVariableDeclarationList(child) &&
        (child.flags & ts.NodeFlags.BlockScoped) === 0
      ) {
        for (const declaration of child.declarations) {
          next = bindOther(scope, declaration.name, next);
        }
      }
      ts.forEachChild(child, visitVar);
    };
    visitVar(node);
    return next;
  };

  let rootFlow: FlowState = new Map();
  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== '@stylexjs/stylex'
    ) {
      continue;
    }
    const importClause = statement.importClause;
    if (!importClause || importClause.isTypeOnly) continue;
    if (importClause.name) {
      report(importClause.name, `default import ${importClause.name.text}`);
      rootFlow = declareBinding(
        rootScope,
        importClause.name.text,
        rootFlow,
      ).flow;
    }
    if (
      importClause.namedBindings &&
      ts.isNamespaceImport(importClause.namedBindings)
    ) {
      const importName = importClause.namedBindings.name.text;
      const declaration = declareBinding(rootScope, importName, rootFlow, {
        importName,
        kind: 'namespace',
      });
      rootFlow = setBindingValue(declaration.flow, declaration.binding, {
        importName,
        kind: 'namespace',
      });
    } else if (
      importClause.namedBindings &&
      ts.isNamedImports(importClause.namedBindings)
    ) {
      for (const element of importClause.namedBindings.elements) {
        if (element.isTypeOnly) continue;
        report(
          element,
          `named import ${(element.propertyName ?? element.name).text}`,
        );
        rootFlow = declareBinding(rootScope, element.name.text, rootFlow).flow;
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
  const ambiguousFlowCapability = (expression: ts.Expression) => {
    const localName = expressionIdentifierName(expression);
    return `ambiguous StyleX flow${localName ? ` via ${localName}` : ''}`;
  };
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
  const calleeLocalName = (callee: ts.Expression) => {
    const normalized = normalizeExpression(callee);
    return isMemberExpression(normalized)
      ? expressionIdentifierName(normalized.expression)
      : expressionIdentifierName(normalized);
  };
  const logicalAssignmentOperators = new Set<ts.SyntaxKind>([
    ts.SyntaxKind.AmpersandAmpersandEqualsToken,
    ts.SyntaxKind.BarBarEqualsToken,
    ts.SyntaxKind.QuestionQuestionEqualsToken,
  ]);
  const valueReplacingAssignmentOperators = new Set<ts.SyntaxKind>([
    ts.SyntaxKind.PlusEqualsToken,
    ts.SyntaxKind.MinusEqualsToken,
    ts.SyntaxKind.AsteriskEqualsToken,
    ts.SyntaxKind.AsteriskAsteriskEqualsToken,
    ts.SyntaxKind.SlashEqualsToken,
    ts.SyntaxKind.PercentEqualsToken,
    ts.SyntaxKind.LessThanLessThanEqualsToken,
    ts.SyntaxKind.GreaterThanGreaterThanEqualsToken,
    ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
    ts.SyntaxKind.AmpersandEqualsToken,
    ts.SyntaxKind.BarEqualsToken,
    ts.SyntaxKind.CaretEqualsToken,
  ]);

  function evaluatePropertyName(
    name: ts.PropertyName,
    scope: Scope,
    flow: FlowState,
  ) {
    if (!ts.isComputedPropertyName(name)) {
      return {flow, name: propertyName(name)};
    }
    const evaluated = evaluateExpression(name.expression, scope, flow);
    return {flow: evaluated.flow, name: propertyName(name)};
  }

  function destructuredValue(
    node: ts.Node,
    importedName: string | undefined,
    localName: string | undefined,
    sourceValue: BindingValue,
  ): BindingValue {
    if (sourceValue.kind === 'namespace' && importedName) {
      const alias =
        localName && localName !== importedName ? ` as ${localName}` : '';
      report(node, `destructured stylex.${importedName}${alias}`);
      return methodValue(importedName, true, sourceValue.importName);
    }
    if (
      sourceValue.kind === 'namespace' ||
      sourceValue.kind === 'maybe-stylex'
    ) {
      report(node, 'ambiguous StyleX destructuring key');
      return maybeStylexValue();
    }
    return otherValue;
  }

  function assignIdentifier(
    name: string,
    value: BindingValue,
    scope: Scope,
    flow: FlowState,
  ) {
    const binding = resolveBinding(scope, name);
    return binding ? setBindingValue(flow, binding, value) : flow;
  }

  function assignObjectPattern(
    pattern: ts.ObjectLiteralExpression,
    value: BindingValue,
    scope: Scope,
    flow: FlowState,
  ): FlowState {
    let next = flow;
    for (const property of pattern.properties) {
      if (ts.isPropertyAssignment(property)) {
        const evaluatedName = evaluatePropertyName(property.name, scope, next);
        next = evaluatedName.flow;
        const targetName = expressionIdentifierName(property.initializer);
        const assignedValue = destructuredValue(
          property,
          evaluatedName.name,
          targetName,
          value,
        );
        next = assignTarget(property.initializer, assignedValue, scope, next);
      } else if (ts.isShorthandPropertyAssignment(property)) {
        const importedName = property.name.text;
        let assignedValue = destructuredValue(
          property,
          importedName,
          importedName,
          value,
        );
        if (property.objectAssignmentInitializer) {
          const fallback = evaluateExpression(
            property.objectAssignmentInitializer,
            scope,
            next,
          );
          next = joinFlowStates(next, fallback.flow);
          assignedValue = joinBindingValues(assignedValue, fallback.value);
        }
        next = assignIdentifier(importedName, assignedValue, scope, next);
      } else if (ts.isSpreadAssignment(property)) {
        const assignedValue =
          value.kind === 'namespace' || value.kind === 'maybe-stylex'
            ? maybeStylexValue()
            : otherValue;
        if (assignedValue.kind === 'maybe-stylex') {
          report(property, 'ambiguous StyleX destructuring key');
        }
        next = assignTarget(property.expression, assignedValue, scope, next);
      }
    }
    return next;
  }

  function assignTarget(
    target: ts.Expression,
    value: BindingValue,
    scope: Scope,
    flow: FlowState,
  ): FlowState {
    const normalized = normalizeExpression(target);
    if (ts.isIdentifier(normalized)) {
      return assignIdentifier(normalized.text, value, scope, flow);
    }
    if (ts.isObjectLiteralExpression(normalized)) {
      return assignObjectPattern(normalized, value, scope, flow);
    }
    if (ts.isArrayLiteralExpression(normalized)) {
      let next = flow;
      for (const element of normalized.elements) {
        if (ts.isOmittedExpression(element)) continue;
        next = assignTarget(
          ts.isSpreadElement(element) ? element.expression : element,
          value.kind === 'maybe-stylex' ? value : otherValue,
          scope,
          next,
        );
      }
      return next;
    }
    if (
      ts.isBinaryExpression(normalized) &&
      normalized.operatorToken.kind === ts.SyntaxKind.EqualsToken
    ) {
      const fallback = evaluateExpression(normalized.right, scope, flow);
      return assignTarget(
        normalized.left,
        joinBindingValues(value, fallback.value),
        scope,
        joinFlowStates(flow, fallback.flow),
      );
    }
    if (isMemberExpression(normalized)) {
      return evaluateMemberExpression(normalized, scope, flow).flow;
    }
    return flow;
  }

  function initializeBindingName(
    name: ts.BindingName,
    value: BindingValue,
    scope: Scope,
    flow: FlowState,
  ): FlowState {
    if (ts.isIdentifier(name)) {
      const declaration = declareBinding(scope, name.text, flow);
      return setBindingValue(declaration.flow, declaration.binding, value);
    }
    let next = flow;
    for (const element of name.elements) {
      if (ts.isOmittedExpression(element)) continue;
      let importedName: string | undefined;
      if (ts.isObjectBindingPattern(name)) {
        if (element.propertyName) {
          const evaluatedName = evaluatePropertyName(
            element.propertyName,
            scope,
            next,
          );
          next = evaluatedName.flow;
          importedName = evaluatedName.name;
        } else if (ts.isIdentifier(element.name)) {
          importedName = element.name.text;
        }
      }
      const localName = ts.isIdentifier(element.name)
        ? element.name.text
        : undefined;
      let elementValue = element.dotDotDotToken
        ? value.kind === 'namespace' || value.kind === 'maybe-stylex'
          ? maybeStylexValue()
          : otherValue
        : ts.isObjectBindingPattern(name)
          ? destructuredValue(element, importedName, localName, value)
          : value.kind === 'maybe-stylex'
            ? value
            : otherValue;
      if (
        element.dotDotDotToken &&
        (value.kind === 'namespace' || value.kind === 'maybe-stylex')
      ) {
        report(element, 'ambiguous StyleX destructuring key');
      }
      if (element.initializer) {
        const fallback = evaluateExpression(element.initializer, scope, next);
        next = joinFlowStates(next, fallback.flow);
        elementValue = joinBindingValues(elementValue, fallback.value);
      }
      next = initializeBindingName(element.name, elementValue, scope, next);
    }
    return next;
  }

  function evaluateMemberExpression(
    expression: MemberExpression,
    scope: Scope,
    flow: FlowState,
  ): Evaluation {
    const receiver = evaluateExpression(expression.expression, scope, flow);
    let next = receiver.flow;
    if (ts.isElementAccessExpression(expression)) {
      next = evaluateExpression(
        expression.argumentExpression,
        scope,
        next,
      ).flow;
    }
    const method = memberName(expression);
    if (receiver.value.kind === 'namespace' && method) {
      return {
        flow: next,
        value: methodValue(method, false, receiver.value.importName),
      };
    }
    if (
      receiver.value.kind === 'namespace' ||
      receiver.value.kind === 'maybe-stylex'
    ) {
      if (!stylexValueWasReported(receiver.value)) {
        report(expression, ambiguousFlowCapability(expression.expression));
      }
      return {flow: next, value: maybeStylexValue(true)};
    }
    return {flow: next, value: otherValue};
  }

  function evaluateObjectLiteral(
    expression: ts.ObjectLiteralExpression,
    scope: Scope,
    flow: FlowState,
  ): FlowState {
    let next = flow;
    for (const property of expression.properties) {
      if (ts.isPropertyAssignment(property)) {
        const evaluatedName = evaluatePropertyName(property.name, scope, next);
        next = evaluatedName.flow;
        const name = evaluatedName.name;
        if (name?.startsWith(':global(')) {
          report(property, 'arbitrary-global-selector');
        } else if (name?.startsWith('@')) {
          report(property, 'at-rule');
        } else if (name?.startsWith(':') && name !== ':focus-visible') {
          report(property, `selector ${name}`);
        }
        next = evaluateExpression(property.initializer, scope, next).flow;
      } else if (ts.isShorthandPropertyAssignment(property)) {
        next = evaluateExpression(property.name, scope, next).flow;
        if (property.objectAssignmentInitializer) {
          const fallback = evaluateExpression(
            property.objectAssignmentInitializer,
            scope,
            next,
          );
          next = joinFlowStates(next, fallback.flow);
        }
      } else if (ts.isSpreadAssignment(property)) {
        next = evaluateExpression(property.expression, scope, next).flow;
      } else if (ts.isMethodDeclaration(property)) {
        next = visit(property, scope, next);
      }
    }
    return next;
  }

  function evaluateExpression(
    expression: ts.Expression,
    scope: Scope,
    flow: FlowState,
  ): Evaluation {
    const normalized = normalizeExpression(expression);
    if (normalized !== expression) {
      return evaluateExpression(normalized, scope, flow);
    }
    if (ts.isIdentifier(normalized)) {
      const binding = resolveBinding(scope, normalized.text);
      return {
        flow,
        value: binding ? (flow.get(binding) ?? otherValue) : otherValue,
      };
    }
    if (isMemberExpression(normalized)) {
      return evaluateMemberExpression(normalized, scope, flow);
    }
    if (ts.isConditionalExpression(normalized)) {
      const condition = evaluateExpression(normalized.condition, scope, flow);
      const whenTrue = evaluateExpression(
        normalized.whenTrue,
        scope,
        condition.flow,
      );
      const whenFalse = evaluateExpression(
        normalized.whenFalse,
        scope,
        condition.flow,
      );
      return {
        flow: joinFlowStates(whenTrue.flow, whenFalse.flow),
        value: joinBindingValues(whenTrue.value, whenFalse.value),
      };
    }
    if (ts.isBinaryExpression(normalized)) {
      const operator = normalized.operatorToken.kind;
      if (operator === ts.SyntaxKind.EqualsToken) {
        if (isMemberExpression(normalizeExpression(normalized.left))) {
          const target = evaluateExpression(normalized.left, scope, flow);
          const right = evaluateExpression(
            normalized.right,
            scope,
            target.flow,
          );
          return {flow: right.flow, value: right.value};
        }
        const right = evaluateExpression(normalized.right, scope, flow);
        return {
          flow: assignTarget(normalized.left, right.value, scope, right.flow),
          value: right.value,
        };
      }
      if (logicalAssignmentOperators.has(operator)) {
        const left = evaluateExpression(normalized.left, scope, flow);
        const right = evaluateExpression(normalized.right, scope, left.flow);
        const assigned = assignTarget(
          normalized.left,
          right.value,
          scope,
          right.flow,
        );
        return {
          flow: joinFlowStates(left.flow, assigned),
          value: joinBindingValues(left.value, right.value),
        };
      }
      if (valueReplacingAssignmentOperators.has(operator)) {
        const left = evaluateExpression(normalized.left, scope, flow);
        const right = evaluateExpression(normalized.right, scope, left.flow);
        return {
          flow: assignTarget(normalized.left, otherValue, scope, right.flow),
          value: otherValue,
        };
      }
      const left = evaluateExpression(normalized.left, scope, flow);
      if (
        normalized.operatorToken.kind ===
          ts.SyntaxKind.AmpersandAmpersandToken ||
        normalized.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
        normalized.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
      ) {
        const right = evaluateExpression(normalized.right, scope, left.flow);
        return {
          flow: joinFlowStates(left.flow, right.flow),
          value: joinBindingValues(left.value, right.value),
        };
      }
      const right = evaluateExpression(normalized.right, scope, left.flow);
      return {
        flow: right.flow,
        value:
          normalized.operatorToken.kind === ts.SyntaxKind.CommaToken
            ? right.value
            : otherValue,
      };
    }
    if (ts.isCallExpression(normalized)) {
      const callee = evaluateExpression(normalized.expression, scope, flow);
      const localName = calleeLocalName(normalized.expression);
      if (
        callee.value.kind === 'member' &&
        !callee.value.reported &&
        unsupportedMethod(callee.value.method)
      ) {
        const alias =
          localName && localName !== callee.value.importName
            ? ` via ${localName}`
            : '';
        report(normalized, `stylex.${callee.value.method}${alias}`);
      } else if (
        callee.value.kind === 'maybe-stylex' &&
        !callee.value.reported
      ) {
        report(normalized, ambiguousFlowCapability(normalized.expression));
      }
      let next = callee.flow;
      for (const argument of normalized.arguments) {
        next = evaluateExpression(argument, scope, next).flow;
      }
      return {flow: next, value: otherValue};
    }
    if (ts.isObjectLiteralExpression(normalized)) {
      return {
        flow: evaluateObjectLiteral(normalized, scope, flow),
        value: otherValue,
      };
    }
    if (
      ts.isArrowFunction(normalized) ||
      ts.isFunctionExpression(normalized) ||
      ts.isClassExpression(normalized)
    ) {
      visit(normalized, scope, flow);
      return {flow, value: otherValue};
    }
    if (ts.isAwaitExpression(normalized) || ts.isYieldExpression(normalized)) {
      return normalized.expression
        ? evaluateExpression(normalized.expression, scope, flow)
        : {flow, value: otherValue};
    }
    if (
      ts.isPrefixUnaryExpression(normalized) ||
      ts.isPostfixUnaryExpression(normalized)
    ) {
      const operand = evaluateExpression(normalized.operand, scope, flow);
      return {
        flow: assignTarget(normalized.operand, otherValue, scope, operand.flow),
        value: otherValue,
      };
    }
    let next = flow;
    ts.forEachChild(normalized, (child) => {
      next = ts.isExpression(child)
        ? evaluateExpression(child, scope, next).flow
        : visit(child, scope, next);
    });
    return {flow: next, value: otherValue};
  }

  const predeclareVariableList = (
    declarationList: ts.VariableDeclarationList,
    scope: Scope,
    flow: FlowState,
  ) => {
    const targetScope =
      (declarationList.flags & ts.NodeFlags.BlockScoped) === 0
        ? nearestFunctionScope(scope)
        : scope;
    let next = flow;
    for (const declaration of declarationList.declarations) {
      next = bindOther(targetScope, declaration.name, next);
    }
    return next;
  };
  const visitLoopInitializer = (
    initializer: ts.ForInitializer | undefined,
    scope: Scope,
    flow: FlowState,
  ) => {
    if (!initializer) return flow;
    if (ts.isVariableDeclarationList(initializer)) {
      let next = predeclareVariableList(initializer, scope, flow);
      for (const declaration of initializer.declarations) {
        next = visit(declaration, scope, next);
      }
      return next;
    }
    return evaluateExpression(initializer, scope, flow).flow;
  };
  const analyzeZeroOrMore = (
    entry: FlowState,
    transfer: (header: FlowState) => FlowState,
  ) => {
    let header = entry;
    let iterations = 0;
    while (iterations++ <= nextBindingId + 4) {
      const joined = joinFlowStates(entry, transfer(header));
      if (sameFlowState(header, joined)) return joined;
      header = joined;
    }
    return header;
  };

  function visitFunctionLike(
    node: ts.SignatureDeclaration,
    scope: Scope,
    flow: FlowState,
  ) {
    let definitionFlow = flow;
    if (node.name && ts.isComputedPropertyName(node.name)) {
      definitionFlow = evaluateExpression(
        node.name.expression,
        scope,
        definitionFlow,
      ).flow;
    }
    const functionScope = childScope(node, 'function', scope);
    let functionFlow = definitionFlow;
    if (
      (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) &&
      node.name
    ) {
      functionFlow = declareBinding(
        functionScope,
        node.name.text,
        functionFlow,
      ).flow;
    }
    for (const parameter of node.parameters) {
      functionFlow = bindOther(
        functionScope,
        parameter.name,
        functionFlow,
        true,
      );
    }
    for (const parameter of node.parameters) {
      let parameterValue: BindingValue = otherValue;
      if (parameter.initializer) {
        const initializer = evaluateExpression(
          parameter.initializer,
          functionScope,
          functionFlow,
        );
        functionFlow = initializer.flow;
        parameterValue = initializer.value;
      }
      functionFlow = initializeBindingName(
        parameter.name,
        parameterValue,
        functionScope,
        functionFlow,
      );
    }
    if ('body' in node && node.body) {
      functionFlow = predeclareVarBindings(
        node.body,
        functionScope,
        functionFlow,
      );
      visit(node.body, functionScope, functionFlow);
    }
    return definitionFlow;
  }

  function visit(node: ts.Node, scope: Scope, flow: FlowState): FlowState {
    if (ts.isSourceFile(node)) {
      let next = predeclareStatements(node.statements, scope, flow);
      next = predeclareVarBindings(node, scope, next);
      for (const statement of node.statements) {
        next = visit(statement, scope, next);
      }
      return next;
    }
    if (ts.isImportDeclaration(node)) return flow;
    if (ts.isIfStatement(node)) {
      const condition = evaluateExpression(node.expression, scope, flow);
      const whenTrue = visit(node.thenStatement, scope, condition.flow);
      const whenFalse = node.elseStatement
        ? visit(node.elseStatement, scope, condition.flow)
        : condition.flow;
      return joinFlowStates(whenTrue, whenFalse);
    }
    if (ts.isSwitchStatement(node)) {
      const discriminant = evaluateExpression(node.expression, scope, flow);
      const switchScope = childScope(node, 'switch', scope);
      const statements = node.caseBlock.clauses.flatMap((clause) => [
        ...clause.statements,
      ]);
      const entry = predeclareStatements(
        statements,
        switchScope,
        discriminant.flow,
        true,
      );
      const branches: FlowState[] = node.caseBlock.clauses.some(
        ts.isDefaultClause,
      )
        ? []
        : [entry];
      for (const clause of node.caseBlock.clauses) {
        let branch = entry;
        if (ts.isCaseClause(clause)) {
          branch = evaluateExpression(
            clause.expression,
            switchScope,
            branch,
          ).flow;
        }
        for (const statement of clause.statements) {
          branch = visit(statement, switchScope, branch);
        }
        branches.push(branch);
      }
      let sequential = entry;
      for (const clause of node.caseBlock.clauses) {
        if (ts.isCaseClause(clause)) {
          sequential = evaluateExpression(
            clause.expression,
            switchScope,
            sequential,
          ).flow;
        }
        for (const statement of clause.statements) {
          sequential = visit(statement, switchScope, sequential);
        }
        branches.push(sequential);
      }
      return joinFlowStates(...branches);
    }
    if (ts.isForStatement(node)) {
      const loopScope = childScope(node, 'loop', scope);
      let entry = visitLoopInitializer(node.initializer, loopScope, flow);
      if (node.condition) {
        entry = evaluateExpression(node.condition, loopScope, entry).flow;
      }
      return analyzeZeroOrMore(entry, (header) => {
        let backedge = visit(node.statement, loopScope, header);
        if (node.incrementor) {
          backedge = evaluateExpression(
            node.incrementor,
            loopScope,
            backedge,
          ).flow;
        }
        if (node.condition) {
          backedge = evaluateExpression(
            node.condition,
            loopScope,
            backedge,
          ).flow;
        }
        return backedge;
      });
    }
    if (ts.isForInStatement(node) || ts.isForOfStatement(node)) {
      const loopScope = childScope(node, 'loop', scope);
      let entry = flow;
      if (ts.isVariableDeclarationList(node.initializer)) {
        entry = predeclareVariableList(node.initializer, loopScope, entry);
      }
      entry = evaluateExpression(node.expression, loopScope, entry).flow;
      return analyzeZeroOrMore(entry, (header) => {
        let iteration = header;
        if (ts.isVariableDeclarationList(node.initializer)) {
          for (const declaration of node.initializer.declarations) {
            iteration = initializeBindingName(
              declaration.name,
              otherValue,
              variableScope(declaration, loopScope),
              iteration,
            );
          }
        } else {
          iteration = assignTarget(
            node.initializer,
            otherValue,
            loopScope,
            iteration,
          );
        }
        return visit(node.statement, loopScope, iteration);
      });
    }
    if (ts.isWhileStatement(node)) {
      const entry = evaluateExpression(node.expression, scope, flow).flow;
      return analyzeZeroOrMore(entry, (header) => {
        const body = visit(node.statement, scope, header);
        return evaluateExpression(node.expression, scope, body).flow;
      });
    }
    if (ts.isDoStatement(node)) {
      return analyzeZeroOrMore(flow, (header) => {
        const body = visit(node.statement, scope, header);
        return evaluateExpression(node.expression, scope, body).flow;
      });
    }
    if (ts.isTryStatement(node)) {
      const tryFlow = visit(node.tryBlock, scope, flow);
      const catchFlow = node.catchClause
        ? visit(node.catchClause, scope, flow)
        : flow;
      const joined = joinFlowStates(tryFlow, catchFlow);
      return node.finallyBlock
        ? visit(node.finallyBlock, scope, joined)
        : joined;
    }
    if (ts.isBlock(node)) {
      const blockScope = childScope(node, 'block', scope);
      let next = predeclareStatements(node.statements, blockScope, flow, true);
      for (const statement of node.statements) {
        next = visit(statement, blockScope, next);
      }
      return next;
    }
    if (ts.isCatchClause(node)) {
      const catchScope = childScope(node, 'catch', scope);
      let next = flow;
      if (node.variableDeclaration) {
        next = bindOther(catchScope, node.variableDeclaration.name, next, true);
        next = initializeBindingName(
          node.variableDeclaration.name,
          otherValue,
          catchScope,
          next,
        );
      }
      return visit(node.block, catchScope, next);
    }
    if (ts.isFunctionLike(node)) {
      return visitFunctionLike(node, scope, flow);
    }
    if (ts.isVariableDeclaration(node)) {
      const initializer = node.initializer
        ? evaluateExpression(node.initializer, scope, flow)
        : {flow, value: otherValue};
      return initializeBindingName(
        node.name,
        initializer.value,
        variableScope(node, scope),
        initializer.flow,
      );
    }
    if (ts.isExpression(node)) {
      return evaluateExpression(node, scope, flow).flow;
    }
    if (ts.isPropertyAssignment(node)) {
      const evaluatedName = evaluatePropertyName(node.name, scope, flow);
      const name = evaluatedName.name;
      if (name?.startsWith(':global(')) {
        report(node, 'arbitrary-global-selector');
      } else if (name?.startsWith('@')) {
        report(node, 'at-rule');
      } else if (name?.startsWith(':') && name !== ':focus-visible') {
        report(node, `selector ${name}`);
      }
      return evaluateExpression(node.initializer, scope, evaluatedName.flow)
        .flow;
    }
    let next = flow;
    ts.forEachChild(node, (child) => {
      next = visit(child, scope, next);
    });
    return next;
  }

  visit(sourceFile, rootScope, rootFlow);
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
