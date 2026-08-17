const transformReactJsx = require('@babel/plugin-transform-react-jsx').default;

module.exports = function runtimeTransform(api) {
  const jsxTransform = transformReactJsx(api, {runtime: 'automatic'});

  return {
    ...jsxTransform,
    name: 'kioku-ui-runtime-transform',
    visitor: {
      ...jsxTransform.visitor,
      Program: {
        enter: jsxTransform.visitor.Program.enter,
        exit(path) {
          for (const statement of path.get('body')) {
            if (!statement.isImportDeclaration()) {
              continue;
            }

            const source = statement.node.source.value;
            if (source.endsWith('/authoring.stylex')) {
              statement.node.source.value = `${source}.js`;
            }
          }
        },
      },
    },
  };
};
