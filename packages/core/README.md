# `@misoto22/kioku-ui`

Product-neutral React 19 components, semantic theme contracts, and compiled
styles for Kioku UI.

Compiled consumers import the runtime and both core stylesheets:

```tsx
import {Button} from '@misoto22/kioku-ui';
import '@misoto22/kioku-ui/reset.css';
import '@misoto22/kioku-ui/styles.css';
```

Source consumers use `@misoto22/kioku-ui/source` with the build integration
from `@misoto22/kioku-ui-build`. StyleX recipes that only need the public
semantic variables can import `@misoto22/kioku-ui/authoring.stylex`; the
compiled `@misoto22/kioku-ui/authoring` entry is available when no source
transform is configured.

The host application supplies themes, routing adapters, and persistence. This
package contains no Kioku routes, APIs, domain records, or theme defaults.
