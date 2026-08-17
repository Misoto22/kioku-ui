# `@misoto22/kioku-ui-build`

Build integrations for applications that compile the public Kioku UI source
distribution. Compiled consumers do not need this package: import
`@misoto22/kioku-ui/reset.css`, `@misoto22/kioku-ui/styles.css`, and a theme
pack's CSS instead.

## Vite source builds

The Vite integration selects the public `@misoto22/kioku-ui/source` entrypoint
and runs the official StyleX Vite plugin. It does not depend on a monorepo
alias.

```ts
import {kiokuUiVitePlugin} from '@misoto22/kioku-ui-build/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [...kiokuUiVitePlugin({rootDir: import.meta.dirname}), react()],
});
```

Import reset and theme CSS once, but do not import the compiled
`@misoto22/kioku-ui/styles.css` bundle in a source build.

## Babel and PostCSS source builds

Frameworks that expose Babel and PostCSS can use the two integrations
together. The Babel config preserves consumer presets and plugins. The
PostCSS config scans application source plus the installed public Kioku UI
source and replaces `@stylex;` with extracted CSS.

```js
// babel.config.js
import {createKiokuUiBabelConfig} from '@misoto22/kioku-ui-build/babel';

export default createKiokuUiBabelConfig({
  presets: ['next/babel'],
  rootDir: import.meta.dirname,
});
```

```js
// postcss.config.mjs
import {createKiokuUiPostcssConfig} from '@misoto22/kioku-ui-build/postcss';

export default createKiokuUiPostcssConfig({cwd: import.meta.dirname});
```

```css
@import '@misoto22/kioku-ui/reset.css';
@import '@misoto22/kioku-ui-theme-kioku/theme.css';

@stylex;
```

Import components from `@misoto22/kioku-ui/source` and configure the framework
to transpile `@misoto22/kioku-ui`. Source files use NodeNext-style `.js`
specifiers, so webpack consumers must map `.js` to `.ts` and `.tsx`; the
source Next.js reference app demonstrates that small resolver setting.

## API entrypoints

- `@misoto22/kioku-ui-build/babel` exports the Babel plugin and config/options
  builders.
- `@misoto22/kioku-ui-build/postcss` exports the PostCSS plugin and
  config/options builders. It supports both ESM import and CommonJS framework
  loading.
- `@misoto22/kioku-ui-build/vite` exports the Vite plugin integration.
- The package root re-exports all three APIs and their TypeScript types.

See `apps/example-vite-source` and `apps/example-nextjs-source` for complete
source consumers. Their compiled counterparts show the no-build-integration
path.
