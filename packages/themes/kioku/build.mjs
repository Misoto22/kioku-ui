import {copyFile} from 'node:fs/promises';

await copyFile(
  new URL('./src/theme.css', import.meta.url),
  new URL('./dist/theme.css', import.meta.url),
);
