import {createServer} from 'node:http';
import {mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {extname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const visualStoryIds = [
  'core-button--states',
  'core-badge--tones',
  'core-text-input--states',
  'core-toggle--states',
  'core-segmented-control--states',
  'core-empty-state--composition',
  'core-alert--tones',
  'core-table--composition',
  'core-metric-grid--composition',
  'core-card--composition',
  'core-grid--composition',
];
const fullThemeStoryIds = new Set([
  'core-button--states',
  'core-card--composition',
  'core-table--composition',
]);
const requiredModes = ['light', 'dark'];
const requiredThemes = ['washi', 'muji', 'sumi'];
const pseudoStateStoryIds = new Set(['core-button--states']);
const visualCaptureCaseCount = 68;
const viewports = [
  {height: 900, name: 'desktop-1440x900', width: 1440},
  {height: 844, name: 'narrow-390x844', width: 390},
];

export function forcedPseudoStateTargets() {
  return [
    {pseudoClasses: ['hover'], selector: '[data-story-state="hover"]'},
    {
      pseudoClasses: ['hover', 'active'],
      selector: '[data-story-state="active"]',
    },
    {
      pseudoClasses: ['focus', 'focus-visible'],
      selector: '[data-story-state="focus"]',
    },
  ];
}

function requiredPseudoStateTargets(storyId) {
  return pseudoStateStoryIds.has(storyId) ? forcedPseudoStateTargets() : [];
}

export function assertRequiredPseudoStateTargets(storyId, foundSelectors) {
  const found = new Set(foundSelectors);
  for (const {selector} of requiredPseudoStateTargets(storyId)) {
    if (!found.has(selector)) {
      throw new Error(
        `Missing required pseudo-state target for ${storyId}: ${selector}`,
      );
    }
  }
}

function assertExactToolbarValues(name, values, requiredValues) {
  if (
    values.length !== requiredValues.length ||
    requiredValues.some((requiredValue) => !values.includes(requiredValue))
  ) {
    throw new Error(
      `Storybook ${name} toolbar must expose exactly: ${requiredValues.join(', ')}`,
    );
  }
}

function assertUniqueFilenames(cases) {
  const filenames = new Set();
  for (const captureCase of cases) {
    if (filenames.has(captureCase.filename)) {
      throw new Error(
        `Visual capture filename collision: ${captureCase.filename}`,
      );
    }
    filenames.add(captureCase.filename);
  }
}

export function visualCaptureCases({storyIds, themes, modes, viewports}) {
  assertExactToolbarValues('theme', themes, requiredThemes);
  assertExactToolbarValues('mode', modes, requiredModes);
  const available = new Set(storyIds);
  const cases = [];

  for (const storyId of visualStoryIds) {
    if (!available.has(storyId)) {
      throw new Error(`Missing visual story: ${storyId}`);
    }
    const storyThemes = fullThemeStoryIds.has(storyId)
      ? themes
      : themes.filter((theme) => theme === 'washi');
    for (const theme of storyThemes) {
      for (const mode of modes) {
        for (const viewport of viewports) {
          cases.push({
            filename: `${storyId}-${theme}-${mode}-${viewport.name}.png`,
            globals: `theme:${theme};mode:${mode}`,
            storyId,
            theme,
            mode,
            viewport,
          });
        }
      }
    }
  }

  assertUniqueFilenames(cases);
  if (cases.length !== visualCaptureCaseCount) {
    throw new Error(
      `Visual capture matrix must contain exactly ${visualCaptureCaseCount} cases; received ${cases.length}`,
    );
  }
  return cases.sort((left, right) =>
    left.filename.localeCompare(right.filename),
  );
}

function contentType(path) {
  return (
    {
      '.css': 'text/css; charset=utf-8',
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
    }[extname(path)] ?? 'application/octet-stream'
  );
}

async function serveDirectory(directory) {
  const root = resolve(directory);
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, 'http://local').pathname,
      );
      const requested = pathname === '/' ? 'index.html' : pathname.slice(1);
      const path = resolve(root, requested);
      if (path !== root && !path.startsWith(`${root}/`)) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      response.writeHead(200, {'content-type': contentType(path)});
      response.end(await readFile(path));
    } catch {
      response.writeHead(404).end('Not found');
    }
  });

  await new Promise((resolveListening, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListening);
  });
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Visual capture server did not expose a TCP address');
  }
  return {
    close: () => new Promise((resolveClose) => server.close(resolveClose)),
    url: `http://127.0.0.1:${address.port}`,
  };
}

function toolbarValues(globalTypes, name) {
  const items = globalTypes?.[name]?.toolbar?.items;
  if (!Array.isArray(items)) {
    throw new Error(`Storybook ${name} toolbar must declare capture values`);
  }
  const values = items.map((item) =>
    typeof item === 'string' ? item : item?.value,
  );
  if (
    values.length === 0 ||
    values.some((value) => typeof value !== 'string' || value.length === 0) ||
    new Set(values).size !== values.length
  ) {
    throw new Error(
      `Storybook ${name} toolbar must declare unique string capture values`,
    );
  }
  return values;
}

function storyIdsFromIndex(index) {
  const storyIds = Object.values(index?.entries ?? {})
    .filter((entry) => entry.type === 'story')
    .map((entry) => entry.id)
    .filter((id) => typeof id === 'string')
    .sort();
  if (storyIds.length === 0 || new Set(storyIds).size !== storyIds.length) {
    throw new Error('Storybook index must contain unique canonical story IDs');
  }
  return storyIds;
}

async function waitForReadyStory(page) {
  await page.waitForFunction(() => {
    const root = document.querySelector('#storybook-root');
    if (!root || root.childElementCount === 0) {
      return false;
    }
    const bounds = root.getBoundingClientRect();
    return bounds.width > 0 && bounds.height > 0;
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolveFrame) =>
      requestAnimationFrame(() => requestAnimationFrame(resolveFrame)),
    );
  });
}

async function screenshotHasVariation(page, screenshot) {
  return page.evaluate(
    async (dataUrl) => {
      const image = new Image();
      await new Promise((resolveImage, rejectImage) => {
        image.addEventListener('load', resolveImage, {once: true});
        image.addEventListener('error', rejectImage, {once: true});
        image.src = dataUrl;
      });
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext('2d');
      if (!context) return false;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
      ).data;
      const first = pixels.slice(0, 4);
      for (let offset = 4; offset < pixels.length; offset += 4) {
        if (
          Math.abs(pixels[offset] - first[0]) > 2 ||
          Math.abs(pixels[offset + 1] - first[1]) > 2 ||
          Math.abs(pixels[offset + 2] - first[2]) > 2 ||
          Math.abs(pixels[offset + 3] - first[3]) > 2
        ) {
          return true;
        }
      }
      return false;
    },
    `data:image/png;base64,${screenshot.toString('base64')}`,
  );
}

async function forceInspectablePseudoStates(page, storyId) {
  const targets = requiredPseudoStateTargets(storyId);
  if (targets.length === 0) {
    return undefined;
  }

  const session = await page.context().newCDPSession(page);
  try {
    await Promise.all([session.send('DOM.enable'), session.send('CSS.enable')]);
    const {root} = await session.send('DOM.getDocument');
    const targetNodes = [];

    for (const target of targets) {
      const {nodeId} = await session.send('DOM.querySelector', {
        nodeId: root.nodeId,
        selector: target.selector,
      });
      targetNodes.push({...target, nodeId});
    }
    assertRequiredPseudoStateTargets(
      storyId,
      targetNodes
        .filter(({nodeId}) => nodeId !== 0)
        .map(({selector}) => selector),
    );

    for (const {nodeId, pseudoClasses} of targetNodes) {
      await session.send('CSS.forcePseudoState', {
        forcedPseudoClasses: pseudoClasses,
        nodeId,
      });
    }
    return session;
  } catch (error) {
    await session.detach();
    throw error;
  }
}

async function captureStory({baseUrl, captureCase, outputDirectory, page}) {
  const {filename, globals, storyId, viewport} = captureCase;
  await page.setViewportSize(viewport);
  const url = new URL('/iframe.html', baseUrl);
  url.searchParams.set('id', storyId);
  url.searchParams.set('viewMode', 'story');
  url.searchParams.set('globals', globals);
  await page.goto(url.href, {waitUntil: 'networkidle'});
  await waitForReadyStory(page);

  const pseudoStateSession = await forceInspectablePseudoStates(page, storyId);
  try {
    const screenshot = await page.screenshot({animations: 'disabled'});
    if (
      screenshot.length < 1_000 ||
      !(await screenshotHasVariation(page, screenshot))
    ) {
      throw new Error(`Visual capture is blank: ${filename}`);
    }
    await writeFile(join(outputDirectory, filename), screenshot);
  } finally {
    await pseudoStateSession?.detach();
  }
}

async function captureVisuals({baseUrl, cases, outputDirectory}) {
  const {chromium} = await import('@playwright/test');
  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext({reducedMotion: 'reduce'});
  const page = await context.newPage();

  try {
    for (const captureCase of cases) {
      await captureStory({baseUrl, captureCase, outputDirectory, page});
    }
  } finally {
    await browser.close();
  }
}

async function runVisualCapture() {
  const workspaceRoot = fileURLToPath(new URL('../../', import.meta.url));
  const storybookDirectory = join(
    workspaceRoot,
    'apps/storybook/storybook-static',
  );
  const outputDirectory = join(
    workspaceRoot,
    '.artifacts/astryx-visual-alignment',
  );
  const index = JSON.parse(
    await readFile(join(storybookDirectory, 'index.json'), 'utf8'),
  );
  const {storybookGlobalTypes} =
    await import('../../apps/storybook/.storybook/audit-globals.ts');
  const cases = visualCaptureCases({
    modes: toolbarValues(storybookGlobalTypes, 'mode'),
    storyIds: storyIdsFromIndex(index),
    themes: toolbarValues(storybookGlobalTypes, 'theme'),
    viewports,
  });

  await rm(outputDirectory, {force: true, recursive: true});
  await mkdir(outputDirectory, {recursive: true});
  const server = await serveDirectory(storybookDirectory);
  try {
    await captureVisuals({baseUrl: server.url, cases, outputDirectory});
  } finally {
    await server.close();
  }
  console.log(
    `Captured ${cases.length} visual scenarios in ${outputDirectory}.`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await runVisualCapture();
}
