// Properties whose value must come from the token contract rather than a
// literal. Layout properties are absent on purpose: a `50%` translate or a
// `1fr` track is geometry, not a design decision the contract models.
const tokenedProperties = new Set([
  'backgroundColor',
  'borderBlockEndColor',
  'borderBlockStartColor',
  'borderColor',
  'borderInlineEndColor',
  'borderInlineStartColor',
  'borderRadius',
  'boxShadow',
  'color',
  'columnGap',
  'fill',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'gap',
  'lineHeight',
  'margin',
  'marginBlock',
  'marginInline',
  'outlineColor',
  'padding',
  'paddingBlock',
  'paddingInline',
  'rowGap',
  'stroke',
  'transitionDuration',
  'transitionTimingFunction',
]);

// Values that carry no design decision, so a literal is the honest spelling.
const neutralValues = new Set([
  '0',
  'auto',
  'currentColor',
  'inherit',
  'initial',
  'none',
  'normal',
  'revert',
  'transparent',
  'unset',
]);

// `1.5`, `0.875em`, `90%`: a ratio to the surrounding context rather than an
// absolute value, so the contract has nothing to supply in its place.
const relativeValue = /^-?[\d.]+(?:em|%)$/u;

function isNeutral(value) {
  if (typeof value === 'number') {
    return true;
  }
  if (typeof value !== 'string') {
    return false;
  }
  return neutralValues.has(value) || relativeValue.test(value);
}

/**
 * Reports a literal colour, spacing, or type value inside `stylex.create`.
 * Components consume roles from the token contract so a theme can change what
 * they mean; a literal silently opts one rule out of theming.
 */
export const noRawDesignValues = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require design values inside stylex.create to come from the token contract',
    },
    messages: {
      rawValue:
        "'{{property}}' uses the literal {{value}}; take it from semanticTokens so themes can change it.",
    },
    schema: [],
  },
  create(context) {
    let insideCreate = 0;

    function isStylexCreate(node) {
      const {callee} = node;
      return (
        callee.type === 'MemberExpression' &&
        callee.property.type === 'Identifier' &&
        callee.property.name === 'create' &&
        callee.object.type === 'Identifier' &&
        (callee.object.name === 'stylex' || callee.object.name === 'styleX')
      );
    }

    return {
      CallExpression(node) {
        if (isStylexCreate(node)) {
          insideCreate += 1;
        }
      },
      'CallExpression:exit'(node) {
        if (isStylexCreate(node)) {
          insideCreate -= 1;
        }
      },
      Property(node) {
        if (insideCreate === 0) {
          return;
        }

        const name =
          node.key.type === 'Identifier'
            ? node.key.name
            : node.key.type === 'Literal'
              ? String(node.key.value)
              : undefined;
        if (name === undefined || !tokenedProperties.has(name)) {
          return;
        }
        if (node.value.type !== 'Literal') {
          return;
        }
        if (isNeutral(node.value.value)) {
          return;
        }

        context.report({
          data: {
            property: name,
            value: String(node.value.raw ?? node.value.value),
          },
          messageId: 'rawValue',
          node: node.value,
        });
      },
    };
  },
};
