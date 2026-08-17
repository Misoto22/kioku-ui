import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const previewPath = resolve(
  repositoryRoot,
  'apps/storybook/.storybook/preview.ts',
);
const foundationStoriesPath = resolve(
  repositoryRoot,
  'apps/storybook/stories/foundations.stories.tsx',
);

test('Storybook preview loads the public core stylesheet that contains extracted StyleX rules', async () => {
  const preview = await readFile(previewPath, 'utf8');

  assert.match(preview, /import '@misoto22\/kioku-ui\/styles\.css';/);
});

test('structural Card stories render their components in a complete Card context', async () => {
  const stories = await readFile(foundationStoriesPath, 'utf8');

  assert.match(stories, /function CardFixture\(\)/);
  assert.match(stories, /<CardComponent style=\{\{maxWidth: '34rem'\}\}>/);
  assert.match(stories, /<CardHeaderComponent>/);
  assert.match(stories, /<CardFooterComponent>/);
  assert.match(stories, /<DividerComponent \/>/);

  for (const name of ['Card', 'CardHeader', 'CardFooter']) {
    assert.match(
      stories,
      new RegExp(
        `export const ${name}: Story = \\{\\s*parameters: \\{controls: \\{disable: true\\}\\},\\s*render: \\(\\) => <CardFixture \\/>,\\s*\\};`,
      ),
    );
  }
});
