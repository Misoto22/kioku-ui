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

  type CallableNode =
    ts.ArrowFunction | ts.FunctionDeclaration | ts.FunctionExpression;
  type BindingValue =
    | {elements: readonly BindingValue[]; kind: 'aggregate'}
    | {kind: 'callable'; nodes: readonly CallableNode[]; optional: boolean}
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
    kind:
      | 'block'
      | 'catch'
      | 'class-static'
      | 'function'
      | 'loop'
      | 'source'
      | 'switch';
    parent?: Scope;
  }
  type FlowState = ReadonlyMap<BindingId, BindingValue>;
  interface Evaluation {
    completes: boolean;
    flow: FlowState;
    throws?: FlowState;
    value: BindingValue;
  }
  interface Transfer {
    break?: FlowState;
    continue?: FlowState;
    normal?: FlowState;
    return?: FlowState;
    throw?: FlowState;
  }

  const otherValue = {kind: 'other'} as const satisfies BindingValue;
  const rootScope: Scope = {bindings: new Map(), kind: 'source'};
  const childScopes = new WeakMap<ts.Node, Scope>();
  const bindingScopes = new WeakMap<BindingId, Scope>();
  const functionDefinitionScopes = new WeakMap<CallableNode, Scope>();
  let functionCallDepth = 0;
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
  const aggregateValue = (elements: readonly BindingValue[]): BindingValue => ({
    elements,
    kind: 'aggregate',
  });
  const callableValue = (
    nodes: readonly CallableNode[],
    optional = false,
  ): BindingValue => ({kind: 'callable', nodes, optional});
  const containsStylexValue = (value: BindingValue): boolean =>
    value.kind === 'namespace' ||
    value.kind === 'member' ||
    value.kind === 'maybe-stylex' ||
    (value.kind === 'aggregate' && value.elements.some(containsStylexValue));
  const stylexValueWasReported = (value: BindingValue) =>
    (value.kind === 'member' || value.kind === 'maybe-stylex') &&
    value.reported;
  const sameBindingValue = (
    left: BindingValue,
    right: BindingValue,
  ): boolean => {
    if (left.kind !== right.kind) return false;
    if (left.kind === 'other') return true;
    if (left.kind === 'aggregate' && right.kind === 'aggregate') {
      return (
        left.elements.length === right.elements.length &&
        left.elements.every((value, index) =>
          sameBindingValue(value, right.elements[index] ?? otherValue),
        )
      );
    }
    if (left.kind === 'callable' && right.kind === 'callable') {
      return (
        left.optional === right.optional &&
        left.nodes.length === right.nodes.length &&
        left.nodes.every((node, index) => node === right.nodes[index])
      );
    }
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
    if (sameBindingValue(left, right)) return left;
    if (left.kind === 'aggregate' && right.kind === 'aggregate') {
      if (left.elements.length === right.elements.length) {
        return aggregateValue(
          left.elements.map((value, index) =>
            joinBindingValues(value, right.elements[index] ?? otherValue),
          ),
        );
      }
    }
    if (left.kind === 'callable' && right.kind === 'callable') {
      return callableValue(
        [...new Set([...left.nodes, ...right.nodes])],
        left.optional || right.optional,
      );
    }
    if (left.kind === 'callable' && right.kind === 'other') {
      return callableValue(left.nodes, true);
    }
    if (left.kind === 'other' && right.kind === 'callable') {
      return callableValue(right.nodes, true);
    }
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
    if (containsStylexValue(left) || containsStylexValue(right)) {
      const stylexValues = [left, right].filter(containsStylexValue);
      return maybeStylexValue(stylexValues.every(stylexValueWasReported));
    }
    return otherValue;
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
  const joinOptionalFlows = (...states: Array<FlowState | undefined>) => {
    const present = states.filter(
      (state): state is FlowState => state !== undefined,
    );
    return present.length > 0 ? joinFlowStates(...present) : undefined;
  };
  const normalTransfer = (normal: FlowState): Transfer => ({normal});
  const joinTransfers = (...transfers: Transfer[]): Transfer => ({
    break: joinOptionalFlows(...transfers.map((result) => result.break)),
    continue: joinOptionalFlows(...transfers.map((result) => result.continue)),
    normal: joinOptionalFlows(...transfers.map((result) => result.normal)),
    return: joinOptionalFlows(...transfers.map((result) => result.return)),
    throw: joinOptionalFlows(...transfers.map((result) => result.throw)),
  });
  const transferFromEvaluation = (evaluation: Evaluation): Transfer => ({
    normal: evaluation.completes ? evaluation.flow : undefined,
    throw: evaluation.throws,
  });
  const evaluation = (
    flow: FlowState,
    value: BindingValue = otherValue,
    throws?: FlowState,
    completes = true,
  ): Evaluation => ({completes, flow, throws, value});

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
      bindingScopes.set(binding, scope);
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
    while (
      current.kind !== 'class-static' &&
      current.kind !== 'function' &&
      current.kind !== 'source'
    ) {
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
        const value = ts.isFunctionDeclaration(statement)
          ? callableValue([statement])
          : otherValue;
        if (ts.isFunctionDeclaration(statement)) {
          functionDefinitionScopes.set(statement, scope);
        }
        const declaration = declareBinding(
          scope,
          statement.name.text,
          next,
          value,
        );
        next = setBindingValue(declaration.flow, declaration.binding, value);
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
    reset = false,
  ) => {
    let next = flow;
    const visitVar = (child: ts.Node) => {
      if (
        child !== node &&
        (ts.isFunctionLike(child) || ts.isClassStaticBlockDeclaration(child))
      ) {
        return;
      }
      if (
        ts.isVariableDeclarationList(child) &&
        (child.flags & ts.NodeFlags.BlockScoped) === 0
      ) {
        for (const declaration of child.declarations) {
          next = bindOther(scope, declaration.name, next, reset);
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
      return {
        completes: true,
        flow,
        name: propertyName(name),
        throws: undefined as FlowState | undefined,
      };
    }
    const evaluated = evaluateExpression(name.expression, scope, flow);
    return {
      completes: evaluated.completes,
      flow: evaluated.flow,
      name: propertyName(name),
      throws: evaluated.throws,
    };
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
      for (const [index, element] of normalized.elements.entries()) {
        if (ts.isOmittedExpression(element)) continue;
        const elementValue =
          value.kind === 'aggregate'
            ? ts.isSpreadElement(element)
              ? aggregateValue(value.elements.slice(index))
              : (value.elements[index] ?? otherValue)
            : value.kind === 'maybe-stylex'
              ? value
              : otherValue;
        next = assignTarget(
          ts.isSpreadElement(element) ? element.expression : element,
          elementValue,
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
    for (const [index, element] of name.elements.entries()) {
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
        ? value.kind === 'aggregate'
          ? aggregateValue(value.elements.slice(index))
          : value.kind === 'namespace' || value.kind === 'maybe-stylex'
            ? maybeStylexValue()
            : otherValue
        : ts.isObjectBindingPattern(name)
          ? destructuredValue(element, importedName, localName, value)
          : value.kind === 'aggregate'
            ? (value.elements[index] ?? otherValue)
            : value.kind === 'namespace' || value.kind === 'maybe-stylex'
              ? maybeStylexValue()
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
    if (!receiver.completes) {
      return evaluation(receiver.flow, otherValue, receiver.throws, false);
    }
    let next = receiver.flow;
    let throws = receiver.throws;
    if (ts.isElementAccessExpression(expression)) {
      const argument = evaluateExpression(
        expression.argumentExpression,
        scope,
        next,
      );
      throws = joinOptionalFlows(throws, argument.throws);
      if (!argument.completes) {
        return evaluation(argument.flow, otherValue, throws, false);
      }
      next = argument.flow;
    }
    const method = memberName(expression);
    if (receiver.value.kind === 'namespace' && method) {
      return {
        completes: true,
        flow: next,
        throws,
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
      return evaluation(next, maybeStylexValue(true), throws);
    }
    return evaluation(next, otherValue, throws);
  }

  function evaluateObjectLiteral(
    expression: ts.ObjectLiteralExpression,
    scope: Scope,
    flow: FlowState,
  ): Evaluation {
    let next = flow;
    let throws: FlowState | undefined;
    for (const property of expression.properties) {
      if (ts.isPropertyAssignment(property)) {
        const evaluatedName = evaluatePropertyName(property.name, scope, next);
        throws = joinOptionalFlows(throws, evaluatedName.throws);
        if (!evaluatedName.completes) {
          return evaluation(evaluatedName.flow, otherValue, throws, false);
        }
        next = evaluatedName.flow;
        const name = evaluatedName.name;
        if (name?.startsWith(':global(')) {
          report(property, 'arbitrary-global-selector');
        } else if (name?.startsWith('@')) {
          report(property, 'at-rule');
        } else if (name?.startsWith(':') && name !== ':focus-visible') {
          report(property, `selector ${name}`);
        }
        const initializer = evaluateExpression(
          property.initializer,
          scope,
          next,
        );
        throws = joinOptionalFlows(throws, initializer.throws);
        if (!initializer.completes) {
          return evaluation(initializer.flow, otherValue, throws, false);
        }
        next = initializer.flow;
      } else if (ts.isShorthandPropertyAssignment(property)) {
        const shorthand = evaluateExpression(property.name, scope, next);
        throws = joinOptionalFlows(throws, shorthand.throws);
        if (!shorthand.completes) {
          return evaluation(shorthand.flow, otherValue, throws, false);
        }
        next = shorthand.flow;
        if (property.objectAssignmentInitializer) {
          const fallback = evaluateExpression(
            property.objectAssignmentInitializer,
            scope,
            next,
          );
          throws = joinOptionalFlows(throws, fallback.throws);
          if (!fallback.completes) {
            return evaluation(fallback.flow, otherValue, throws, false);
          }
          next = joinFlowStates(next, fallback.flow);
        }
      } else if (ts.isSpreadAssignment(property)) {
        const spread = evaluateExpression(property.expression, scope, next);
        throws = joinOptionalFlows(throws, spread.throws);
        if (!spread.completes) {
          return evaluation(spread.flow, otherValue, throws, false);
        }
        next = spread.flow;
      } else if (
        ts.isMethodDeclaration(property) ||
        ts.isGetAccessorDeclaration(property) ||
        ts.isSetAccessorDeclaration(property)
      ) {
        const method = visitFunctionLike(property, scope, next);
        throws = joinOptionalFlows(throws, method.throw);
        if (!method.normal) {
          return evaluation(method.throw ?? next, otherValue, throws, false);
        }
        next = method.normal;
      }
    }
    return evaluation(next, otherValue, throws);
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
      return evaluation(
        flow,
        binding ? (flow.get(binding) ?? otherValue) : otherValue,
      );
    }
    if (isMemberExpression(normalized)) {
      return evaluateMemberExpression(normalized, scope, flow);
    }
    if (ts.isConditionalExpression(normalized)) {
      const condition = evaluateExpression(normalized.condition, scope, flow);
      if (!condition.completes) {
        return evaluation(condition.flow, otherValue, condition.throws, false);
      }
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
      const normalFlows = [whenTrue, whenFalse]
        .filter((branch) => branch.completes)
        .map((branch) => branch.flow);
      const throws = joinOptionalFlows(
        condition.throws,
        whenTrue.throws,
        whenFalse.throws,
      );
      if (normalFlows.length === 0) {
        return evaluation(condition.flow, otherValue, throws, false);
      }
      const values = [whenTrue, whenFalse].filter((branch) => branch.completes);
      return evaluation(
        joinFlowStates(...normalFlows),
        values.length === 2
          ? joinBindingValues(values[0]!.value, values[1]!.value)
          : values[0]!.value,
        throws,
      );
    }
    if (ts.isBinaryExpression(normalized)) {
      const operator = normalized.operatorToken.kind;
      if (operator === ts.SyntaxKind.EqualsToken) {
        if (isMemberExpression(normalizeExpression(normalized.left))) {
          const target = evaluateExpression(normalized.left, scope, flow);
          if (!target.completes) return target;
          const right = evaluateExpression(
            normalized.right,
            scope,
            target.flow,
          );
          return evaluation(
            right.flow,
            right.value,
            joinOptionalFlows(target.throws, right.throws),
            right.completes,
          );
        }
        const right = evaluateExpression(normalized.right, scope, flow);
        if (!right.completes) return right;
        return evaluation(
          assignTarget(normalized.left, right.value, scope, right.flow),
          right.value,
          right.throws,
        );
      }
      if (logicalAssignmentOperators.has(operator)) {
        const left = evaluateExpression(normalized.left, scope, flow);
        if (!left.completes) return left;
        const right = evaluateExpression(normalized.right, scope, left.flow);
        const throws = joinOptionalFlows(left.throws, right.throws);
        if (!right.completes) {
          return evaluation(left.flow, left.value, throws);
        }
        const assigned = assignTarget(
          normalized.left,
          right.value,
          scope,
          right.flow,
        );
        return evaluation(
          joinFlowStates(left.flow, assigned),
          joinBindingValues(left.value, right.value),
          throws,
        );
      }
      if (valueReplacingAssignmentOperators.has(operator)) {
        const left = evaluateExpression(normalized.left, scope, flow);
        if (!left.completes) return left;
        const right = evaluateExpression(normalized.right, scope, left.flow);
        if (!right.completes) {
          return evaluation(
            right.flow,
            otherValue,
            joinOptionalFlows(left.throws, right.throws),
            false,
          );
        }
        return evaluation(
          assignTarget(normalized.left, otherValue, scope, right.flow),
          otherValue,
          joinOptionalFlows(left.throws, right.throws),
        );
      }
      const left = evaluateExpression(normalized.left, scope, flow);
      if (!left.completes) return left;
      if (
        normalized.operatorToken.kind ===
          ts.SyntaxKind.AmpersandAmpersandToken ||
        normalized.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
        normalized.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
      ) {
        const right = evaluateExpression(normalized.right, scope, left.flow);
        const throws = joinOptionalFlows(left.throws, right.throws);
        if (!right.completes) {
          return evaluation(left.flow, left.value, throws);
        }
        return evaluation(
          joinFlowStates(left.flow, right.flow),
          joinBindingValues(left.value, right.value),
          throws,
        );
      }
      const right = evaluateExpression(normalized.right, scope, left.flow);
      return evaluation(
        right.flow,
        normalized.operatorToken.kind === ts.SyntaxKind.CommaToken
          ? right.value
          : otherValue,
        joinOptionalFlows(left.throws, right.throws),
        right.completes,
      );
    }
    if (ts.isCallExpression(normalized)) {
      const callee = evaluateExpression(normalized.expression, scope, flow);
      if (!callee.completes) return callee;
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
      let throws = callee.throws;
      const argumentValues: BindingValue[] = [];
      for (const argument of normalized.arguments) {
        const evaluatedArgument = evaluateExpression(argument, scope, next);
        throws = joinOptionalFlows(throws, evaluatedArgument.throws);
        if (!evaluatedArgument.completes) {
          return evaluation(evaluatedArgument.flow, otherValue, throws, false);
        }
        next = evaluatedArgument.flow;
        argumentValues.push(evaluatedArgument.value);
      }
      if (callee.value.kind === 'callable') {
        const invoked = invokeLocalFunctions(
          callee.value,
          scope,
          next,
          argumentValues,
        );
        return evaluation(
          invoked.flow,
          otherValue,
          joinOptionalFlows(throws, invoked.throws),
          invoked.completes,
        );
      }
      return evaluation(next, otherValue, throws);
    }
    if (ts.isObjectLiteralExpression(normalized)) {
      return evaluateObjectLiteral(normalized, scope, flow);
    }
    if (ts.isArrayLiteralExpression(normalized)) {
      let next = flow;
      let throws: FlowState | undefined;
      const elements: BindingValue[] = [];
      for (const element of normalized.elements) {
        if (ts.isOmittedExpression(element)) {
          elements.push(otherValue);
          continue;
        }
        const expression = ts.isSpreadElement(element)
          ? element.expression
          : element;
        const item = evaluateExpression(expression, scope, next);
        throws = joinOptionalFlows(throws, item.throws);
        if (!item.completes) {
          return evaluation(item.flow, otherValue, throws, false);
        }
        next = item.flow;
        if (ts.isSpreadElement(element) && item.value.kind === 'aggregate') {
          elements.push(...item.value.elements);
        } else {
          elements.push(item.value);
        }
      }
      return evaluation(next, aggregateValue(elements), throws);
    }
    if (ts.isArrowFunction(normalized) || ts.isFunctionExpression(normalized)) {
      const defined = visitFunctionLike(normalized, scope, flow);
      return evaluation(
        defined.normal ?? flow,
        callableValue([normalized]),
        defined.throw,
        defined.normal !== undefined,
      );
    }
    if (ts.isClassExpression(normalized)) {
      const defined = visitClassLike(normalized, scope, flow);
      return evaluation(
        defined.normal ?? flow,
        otherValue,
        defined.throw,
        defined.normal !== undefined,
      );
    }
    if (ts.isAwaitExpression(normalized) || ts.isYieldExpression(normalized)) {
      return normalized.expression
        ? evaluateExpression(normalized.expression, scope, flow)
        : evaluation(flow);
    }
    if (ts.isPrefixUnaryExpression(normalized)) {
      const operand = evaluateExpression(normalized.operand, scope, flow);
      if (!operand.completes) return operand;
      const mutates =
        normalized.operator === ts.SyntaxKind.PlusPlusToken ||
        normalized.operator === ts.SyntaxKind.MinusMinusToken;
      return evaluation(
        mutates
          ? assignTarget(normalized.operand, otherValue, scope, operand.flow)
          : operand.flow,
        otherValue,
        operand.throws,
      );
    }
    if (ts.isPostfixUnaryExpression(normalized)) {
      const operand = evaluateExpression(normalized.operand, scope, flow);
      if (!operand.completes) return operand;
      return evaluation(
        assignTarget(normalized.operand, otherValue, scope, operand.flow),
        otherValue,
        operand.throws,
      );
    }
    let next = flow;
    let throws: FlowState | undefined;
    let completes = true;
    ts.forEachChild(normalized, (child) => {
      if (!completes) return;
      if (ts.isExpression(child)) {
        const childEvaluation = evaluateExpression(child, scope, next);
        throws = joinOptionalFlows(throws, childEvaluation.throws);
        next = childEvaluation.flow;
        completes = childEvaluation.completes;
      } else {
        const childTransfer = visit(child, scope, next);
        throws = joinOptionalFlows(throws, childTransfer.throw);
        if (childTransfer.normal) {
          next = childTransfer.normal;
        } else {
          completes = false;
        }
      }
    });
    return evaluation(next, otherValue, throws, completes);
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

  const sequenceStatements = (
    statements: readonly ts.Statement[],
    scope: Scope,
    flow: FlowState,
  ): Transfer => {
    let result = normalTransfer(flow);
    for (const statement of statements) {
      if (!result.normal) break;
      const statementResult = visit(statement, scope, result.normal);
      result = {
        break: joinOptionalFlows(result.break, statementResult.break),
        continue: joinOptionalFlows(result.continue, statementResult.continue),
        normal: statementResult.normal,
        return: joinOptionalFlows(result.return, statementResult.return),
        throw: joinOptionalFlows(result.throw, statementResult.throw),
      };
    }
    return result;
  };

  const sequenceChildNodes = (
    node: ts.Node,
    scope: Scope,
    flow: FlowState,
  ): Transfer => {
    let result = normalTransfer(flow);
    ts.forEachChild(node, (child) => {
      if (!result.normal) return;
      const childResult = visit(child, scope, result.normal);
      result = {
        break: joinOptionalFlows(result.break, childResult.break),
        continue: joinOptionalFlows(result.continue, childResult.continue),
        normal: childResult.normal,
        return: joinOptionalFlows(result.return, childResult.return),
        throw: joinOptionalFlows(result.throw, childResult.throw),
      };
    });
    return result;
  };

  const visitLoopInitializer = (
    initializer: ts.ForInitializer | undefined,
    scope: Scope,
    flow: FlowState,
  ): Transfer => {
    if (!initializer) return normalTransfer(flow);
    if (ts.isVariableDeclarationList(initializer)) {
      let next = predeclareVariableList(initializer, scope, flow);
      let result = normalTransfer(next);
      for (const declaration of initializer.declarations) {
        if (!result.normal) break;
        const declarationResult = visit(declaration, scope, result.normal);
        result = joinTransfers(
          {...result, normal: undefined},
          declarationResult,
        );
      }
      return result;
    }
    return transferFromEvaluation(evaluateExpression(initializer, scope, flow));
  };

  const analyzeLoopHeader = (
    entry: FlowState,
    transfer: (header: FlowState) => Transfer,
  ) => {
    let header = entry;
    let iterations = 0;
    let result = transfer(header);
    while (iterations++ <= nextBindingId + 4) {
      const backedge = joinOptionalFlows(result.normal, result.continue);
      const joined = backedge ? joinFlowStates(entry, backedge) : entry;
      if (sameFlowState(header, joined)) return {header, result};
      header = joined;
      result = transfer(header);
    }
    return {header, result};
  };

  const scopeContains = (scope: Scope, candidate: Scope) => {
    let current: Scope | undefined = candidate;
    while (current) {
      if (current === scope) return true;
      current = current.parent;
    }
    return false;
  };

  const projectFlow = (
    base: FlowState,
    result: FlowState,
    callScope: Scope,
  ): FlowState => {
    let projected = base;
    for (const binding of result.keys()) {
      const bindingScope = bindingScopes.get(binding);
      if (
        !base.has(binding) &&
        (!bindingScope || !scopeContains(bindingScope, callScope))
      ) {
        continue;
      }
      projected = setBindingValue(
        projected,
        binding,
        result.get(binding) ?? otherValue,
      );
    }
    return projected;
  };

  function analyzeFunctionExecution(
    node: ts.SignatureDeclaration,
    definitionScope: Scope,
    flow: FlowState,
    argumentValues?: readonly BindingValue[],
  ): Transfer {
    const functionScope = childScope(node, 'function', definitionScope);
    let functionFlow = flow;
    if (
      (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) &&
      node.name
    ) {
      const value = callableValue([node]);
      const declaration = declareBinding(
        functionScope,
        node.name.text,
        functionFlow,
        value,
      );
      functionFlow = setBindingValue(
        declaration.flow,
        declaration.binding,
        value,
      );
    }
    for (const parameter of node.parameters) {
      functionFlow = bindOther(
        functionScope,
        parameter.name,
        functionFlow,
        true,
      );
    }
    let throws: FlowState | undefined;
    for (const [index, parameter] of node.parameters.entries()) {
      let parameterValue = argumentValues?.[index] ?? otherValue;
      if (
        parameter.initializer &&
        (argumentValues === undefined || index >= argumentValues.length)
      ) {
        const initializer = evaluateExpression(
          parameter.initializer,
          functionScope,
          functionFlow,
        );
        throws = joinOptionalFlows(throws, initializer.throws);
        if (!initializer.completes) return {throw: throws};
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
    if (!('body' in node) || !node.body) {
      return {normal: functionFlow, throw: throws};
    }
    functionFlow = predeclareVarBindings(
      node.body,
      functionScope,
      functionFlow,
      true,
    );
    const bodyResult = ts.isBlock(node.body)
      ? visit(node.body, functionScope, functionFlow)
      : transferFromEvaluation(
          evaluateExpression(node.body, functionScope, functionFlow),
        );
    return {
      ...bodyResult,
      throw: joinOptionalFlows(throws, bodyResult.throw),
    };
  }

  function visitFunctionLike(
    node: ts.SignatureDeclaration,
    scope: Scope,
    flow: FlowState,
  ): Transfer {
    let definitionFlow = flow;
    let throws: FlowState | undefined;
    if (node.name && ts.isComputedPropertyName(node.name)) {
      const name = evaluateExpression(
        node.name.expression,
        scope,
        definitionFlow,
      );
      throws = name.throws;
      if (!name.completes) return {throw: throws};
      definitionFlow = name.flow;
    }
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node)
    ) {
      functionDefinitionScopes.set(node, scope);
    }
    analyzeFunctionExecution(node, scope, definitionFlow);
    return {normal: definitionFlow, throw: throws};
  }

  function invokeLocalFunctions(
    callable: Extract<BindingValue, {kind: 'callable'}>,
    callScope: Scope,
    flow: FlowState,
    argumentValues: readonly BindingValue[],
  ): Evaluation {
    const normalFlows: FlowState[] = callable.optional ? [flow] : [];
    const throwFlows: FlowState[] = [];
    for (const node of callable.nodes) {
      if (functionCallDepth >= nextBindingId * 2 + 8) {
        normalFlows.push(flow);
        continue;
      }
      const definitionScope = functionDefinitionScopes.get(node) ?? callScope;
      functionCallDepth++;
      let result: Transfer;
      try {
        result = analyzeFunctionExecution(
          node,
          definitionScope,
          flow,
          argumentValues,
        );
      } finally {
        functionCallDepth--;
      }
      const normal = joinOptionalFlows(result.normal, result.return);
      if (normal) normalFlows.push(projectFlow(flow, normal, callScope));
      if (result.throw) {
        throwFlows.push(projectFlow(flow, result.throw, callScope));
      }
    }
    const throws =
      throwFlows.length > 0 ? joinFlowStates(...throwFlows) : undefined;
    if (normalFlows.length === 0) {
      return evaluation(throws ?? flow, otherValue, throws, false);
    }
    return evaluation(joinFlowStates(...normalFlows), otherValue, throws);
  }

  function visitClassLike(
    node: ts.ClassLikeDeclaration,
    scope: Scope,
    flow: FlowState,
  ): Transfer {
    let result = normalTransfer(flow);
    for (const heritageClause of node.heritageClauses ?? []) {
      for (const type of heritageClause.types) {
        if (!result.normal) break;
        const heritage = evaluateExpression(
          type.expression,
          scope,
          result.normal,
        );
        result = joinTransfers(
          {...result, normal: undefined},
          transferFromEvaluation(heritage),
        );
      }
    }
    for (const member of node.members) {
      if (!result.normal) break;
      const memberResult = ts.isClassStaticBlockDeclaration(member)
        ? visit(member, scope, result.normal)
        : ts.isMethodDeclaration(member) ||
            ts.isGetAccessorDeclaration(member) ||
            ts.isSetAccessorDeclaration(member) ||
            ts.isConstructorDeclaration(member)
          ? visitFunctionLike(member, scope, result.normal)
          : visit(member, scope, result.normal);
      result = joinTransfers({...result, normal: undefined}, memberResult);
    }
    return result;
  }

  const applyFinally = (
    result: Transfer,
    finallyBlock: ts.Block,
    scope: Scope,
  ): Transfer => {
    const completions: Array<keyof Transfer> = [
      'normal',
      'break',
      'continue',
      'return',
      'throw',
    ];
    let combined: Transfer = {};
    for (const completion of completions) {
      const completionFlow = result[completion];
      if (!completionFlow) continue;
      const finalResult = visit(finallyBlock, scope, completionFlow);
      const resumed: Transfer = {
        break: finalResult.break,
        continue: finalResult.continue,
        return: finalResult.return,
        throw: finalResult.throw,
      };
      if (finalResult.normal) resumed[completion] = finalResult.normal;
      combined = joinTransfers(combined, resumed);
    }
    return combined;
  };

  function visit(node: ts.Node, scope: Scope, flow: FlowState): Transfer {
    if (ts.isSourceFile(node)) {
      let next = predeclareStatements(node.statements, scope, flow);
      next = predeclareVarBindings(node, scope, next);
      return sequenceStatements(node.statements, scope, next);
    }
    if (ts.isImportDeclaration(node)) return normalTransfer(flow);
    if (ts.isIfStatement(node)) {
      const condition = evaluateExpression(node.expression, scope, flow);
      if (!condition.completes) return {throw: condition.throws};
      const whenTrue = visit(node.thenStatement, scope, condition.flow);
      const whenFalse = node.elseStatement
        ? visit(node.elseStatement, scope, condition.flow)
        : normalTransfer(condition.flow);
      return {
        ...joinTransfers(whenTrue, whenFalse),
        throw: joinOptionalFlows(
          condition.throws,
          whenTrue.throw,
          whenFalse.throw,
        ),
      };
    }
    if (ts.isSwitchStatement(node)) {
      const discriminant = evaluateExpression(node.expression, scope, flow);
      if (!discriminant.completes) return {throw: discriminant.throws};
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
      const evaluateSelection = (start?: number): Transfer => {
        let selection = normalTransfer(entry);
        const startClause =
          start === undefined ? undefined : node.caseBlock.clauses[start];
        const limit =
          start === undefined ||
          (startClause && ts.isDefaultClause(startClause))
            ? node.caseBlock.clauses.length - 1
            : start;
        for (let index = 0; index <= (limit ?? -1); index++) {
          const candidate = node.caseBlock.clauses[index];
          if (
            !selection.normal ||
            !candidate ||
            ts.isDefaultClause(candidate)
          ) {
            continue;
          }
          const expression = evaluateExpression(
            candidate.expression,
            switchScope,
            selection.normal,
          );
          selection = {
            normal: expression.completes ? expression.flow : undefined,
            throw: joinOptionalFlows(selection.throw, expression.throws),
          };
        }
        return selection;
      };
      let combined: Transfer = node.caseBlock.clauses.some(ts.isDefaultClause)
        ? {}
        : evaluateSelection();
      for (const [start] of node.caseBlock.clauses.entries()) {
        let branch = evaluateSelection(start);
        for (
          let index = start;
          index < node.caseBlock.clauses.length && branch.normal;
          index++
        ) {
          const fallthrough = sequenceStatements(
            node.caseBlock.clauses[index]!.statements,
            switchScope,
            branch.normal,
          );
          branch = {
            break: joinOptionalFlows(branch.break, fallthrough.break),
            continue: joinOptionalFlows(branch.continue, fallthrough.continue),
            normal: fallthrough.normal,
            return: joinOptionalFlows(branch.return, fallthrough.return),
            throw: joinOptionalFlows(branch.throw, fallthrough.throw),
          };
        }
        branch = {
          continue: branch.continue,
          normal: joinOptionalFlows(branch.normal, branch.break),
          return: branch.return,
          throw: branch.throw,
        };
        combined = joinTransfers(combined, branch);
      }
      return {
        ...combined,
        throw: joinOptionalFlows(discriminant.throws, combined.throw),
      };
    }
    if (ts.isForStatement(node)) {
      const loopScope = childScope(node, 'loop', scope);
      const initialized = visitLoopInitializer(
        node.initializer,
        loopScope,
        flow,
      );
      if (!initialized.normal) return initialized;
      const transfer = (header: FlowState): Transfer => {
        const condition = node.condition
          ? evaluateExpression(node.condition, loopScope, header)
          : evaluation(header);
        if (!condition.completes) return {throw: condition.throws};
        const body = visit(node.statement, loopScope, condition.flow);
        const backedge = joinOptionalFlows(body.normal, body.continue);
        let increment: Transfer = backedge ? normalTransfer(backedge) : {};
        if (backedge && node.incrementor) {
          increment = transferFromEvaluation(
            evaluateExpression(node.incrementor, loopScope, backedge),
          );
        }
        return {
          break: body.break,
          normal: increment.normal,
          return: body.return,
          throw: joinOptionalFlows(
            condition.throws,
            body.throw,
            increment.throw,
          ),
        };
      };
      const analyzed = analyzeLoopHeader(initialized.normal, transfer);
      const exitCondition = node.condition
        ? evaluateExpression(node.condition, loopScope, analyzed.header)
        : undefined;
      const exits = exitCondition
        ? joinOptionalFlows(
            exitCondition.completes ? exitCondition.flow : undefined,
            analyzed.result.break,
          )
        : analyzed.result.break;
      return {
        break: initialized.break,
        continue: initialized.continue,
        normal: exits,
        return: joinOptionalFlows(initialized.return, analyzed.result.return),
        throw: joinOptionalFlows(
          initialized.throw,
          analyzed.result.throw,
          exitCondition?.throws,
        ),
      };
    }
    if (ts.isForInStatement(node) || ts.isForOfStatement(node)) {
      const loopScope = childScope(node, 'loop', scope);
      let entry = flow;
      if (ts.isVariableDeclarationList(node.initializer)) {
        entry = predeclareVariableList(node.initializer, loopScope, entry);
      }
      const iterable = evaluateExpression(node.expression, loopScope, entry);
      if (!iterable.completes) return {throw: iterable.throws};
      entry = iterable.flow;
      const transfer = (header: FlowState): Transfer => {
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
        const body = visit(node.statement, loopScope, iteration);
        return {
          break: body.break,
          normal: joinOptionalFlows(body.normal, body.continue),
          return: body.return,
          throw: body.throw,
        };
      };
      const analyzed = analyzeLoopHeader(entry, transfer);
      return {
        normal: joinOptionalFlows(analyzed.header, analyzed.result.break),
        return: analyzed.result.return,
        throw: joinOptionalFlows(iterable.throws, analyzed.result.throw),
      };
    }
    if (ts.isWhileStatement(node)) {
      const transfer = (header: FlowState): Transfer => {
        const condition = evaluateExpression(node.expression, scope, header);
        if (!condition.completes) return {throw: condition.throws};
        const body = visit(node.statement, scope, condition.flow);
        return {
          break: body.break,
          normal: joinOptionalFlows(body.normal, body.continue),
          return: body.return,
          throw: joinOptionalFlows(condition.throws, body.throw),
        };
      };
      const analyzed = analyzeLoopHeader(flow, transfer);
      const exitCondition = evaluateExpression(
        node.expression,
        scope,
        analyzed.header,
      );
      return {
        normal: joinOptionalFlows(
          exitCondition.completes ? exitCondition.flow : undefined,
          analyzed.result.break,
        ),
        return: analyzed.result.return,
        throw: joinOptionalFlows(analyzed.result.throw, exitCondition.throws),
      };
    }
    if (ts.isDoStatement(node)) {
      const execute = (header: FlowState): Transfer => {
        const body = visit(node.statement, scope, header);
        const conditionEntry = joinOptionalFlows(body.normal, body.continue);
        const condition = conditionEntry
          ? evaluateExpression(node.expression, scope, conditionEntry)
          : undefined;
        return {
          break: body.break,
          normal: condition?.completes ? condition.flow : undefined,
          return: body.return,
          throw: joinOptionalFlows(body.throw, condition?.throws),
        };
      };
      const first = execute(flow);
      if (!first.normal) {
        return {
          normal: first.break,
          return: first.return,
          throw: first.throw,
        };
      }
      const analyzed = analyzeLoopHeader(first.normal, execute);
      return {
        normal: joinOptionalFlows(
          first.normal,
          first.break,
          analyzed.header,
          analyzed.result.break,
        ),
        return: joinOptionalFlows(first.return, analyzed.result.return),
        throw: joinOptionalFlows(first.throw, analyzed.result.throw),
      };
    }
    if (ts.isTryStatement(node)) {
      const tried = visit(node.tryBlock, scope, flow);
      let result = tried;
      if (node.catchClause && tried.throw) {
        const caught = visit(node.catchClause, scope, tried.throw);
        result = joinTransfers({...tried, throw: undefined}, caught);
      }
      return node.finallyBlock
        ? applyFinally(result, node.finallyBlock, scope)
        : result;
    }
    if (ts.isBlock(node)) {
      const blockScope = childScope(node, 'block', scope);
      let next = predeclareStatements(node.statements, blockScope, flow, true);
      return sequenceStatements(node.statements, blockScope, next);
    }
    if (ts.isClassStaticBlockDeclaration(node)) {
      const staticScope = childScope(node, 'class-static', scope);
      let next = predeclareVarBindings(node.body, staticScope, flow, true);
      return visit(node.body, staticScope, next);
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
    if (ts.isBreakStatement(node)) {
      return {break: flow};
    }
    if (ts.isContinueStatement(node)) {
      return {continue: flow};
    }
    if (ts.isReturnStatement(node)) {
      if (!node.expression) return {return: flow};
      const returned = evaluateExpression(node.expression, scope, flow);
      return {
        return: returned.completes ? returned.flow : undefined,
        throw: returned.throws,
      };
    }
    if (ts.isThrowStatement(node)) {
      const thrown = evaluateExpression(node.expression, scope, flow);
      return {
        throw: joinOptionalFlows(
          thrown.throws,
          thrown.completes ? thrown.flow : undefined,
        ),
      };
    }
    if (ts.isFunctionLike(node)) {
      return visitFunctionLike(node, scope, flow);
    }
    if (ts.isClassDeclaration(node)) {
      return visitClassLike(node, scope, flow);
    }
    if (ts.isVariableDeclaration(node)) {
      const initializer = node.initializer
        ? evaluateExpression(node.initializer, scope, flow)
        : evaluation(flow);
      return {
        normal: initializer.completes
          ? initializeBindingName(
              node.name,
              initializer.value,
              variableScope(node, scope),
              initializer.flow,
            )
          : undefined,
        throw: initializer.throws,
      };
    }
    if (ts.isExpression(node)) {
      return transferFromEvaluation(evaluateExpression(node, scope, flow));
    }
    if (ts.isPropertyAssignment(node)) {
      const evaluatedName = evaluatePropertyName(node.name, scope, flow);
      if (!evaluatedName.completes) return {throw: evaluatedName.throws};
      const name = evaluatedName.name;
      if (name?.startsWith(':global(')) {
        report(node, 'arbitrary-global-selector');
      } else if (name?.startsWith('@')) {
        report(node, 'at-rule');
      } else if (name?.startsWith(':') && name !== ':focus-visible') {
        report(node, `selector ${name}`);
      }
      const initializer = evaluateExpression(
        node.initializer,
        scope,
        evaluatedName.flow,
      );
      return {
        ...transferFromEvaluation(initializer),
        throw: joinOptionalFlows(evaluatedName.throws, initializer.throws),
      };
    }
    return sequenceChildNodes(node, scope, flow);
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
