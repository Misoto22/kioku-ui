import {createServer} from 'node:http';
import {readFile, writeFile} from 'node:fs/promises';
import {extname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const themes = ['washi', 'muji', 'sumi'];
const modes = ['light', 'dark'];

function fingerprintKey(fingerprint) {
  return [
    fingerprint.storyId,
    fingerprint.theme,
    fingerprint.mode,
    fingerprint.ruleId,
    fingerprint.target,
  ].join('\u0000');
}

function compareFingerprints(left, right) {
  return fingerprintKey(left).localeCompare(fingerprintKey(right));
}

export function accessibilityViolationFingerprints(audits) {
  const fingerprints = new Map();

  for (const audit of audits) {
    for (const violation of audit.violations) {
      for (const node of violation.nodes) {
        const fingerprint = {
          mode: audit.mode,
          ruleId: violation.id,
          storyId: audit.storyId,
          target: node.target.join(' > '),
          theme: audit.theme,
        };
        fingerprints.set(fingerprintKey(fingerprint), fingerprint);
      }
    }
  }

  return [...fingerprints.values()].sort(compareFingerprints);
}

export function newAccessibilityViolations(audits, baseline) {
  const known = new Set(
    (baseline.violations ?? []).map((violation) => fingerprintKey(violation)),
  );
  return accessibilityViolationFingerprints(audits).filter(
    (violation) => !known.has(fingerprintKey(violation)),
  );
}

function sameStringSet(actual, expected) {
  return (
    Array.isArray(actual) &&
    actual.length === expected.length &&
    new Set(actual).size === actual.length &&
    expected.every((value) => actual.includes(value))
  );
}

function scopeList(value) {
  return `[${Array.isArray(value) ? value.join(', ') : 'missing'}]`;
}

export function accessibilityBaselineScopeProblems(baseline, expected) {
  const scope = baseline.scope ?? {};
  const problems = [];

  if (scope.storyCount !== expected.storyCount) {
    problems.push(
      `story count: expected ${expected.storyCount}, received ${scope.storyCount ?? 'missing'}`,
    );
  }
  if (!sameStringSet(scope.themes, expected.themes)) {
    problems.push(
      `themes: expected ${scopeList(expected.themes)}, received ${scopeList(scope.themes)}`,
    );
  }
  if (!sameStringSet(scope.modes, expected.modes)) {
    problems.push(
      `modes: expected ${scopeList(expected.modes)}, received ${scopeList(scope.modes)}`,
    );
  }

  return problems;
}

function contentType(path) {
  return (
    {
      '.css': 'text/css; charset=utf-8',
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
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
    throw new Error('Accessibility server did not expose a TCP address');
  }

  return {
    close: () => new Promise((resolveClose) => server.close(resolveClose)),
    url: `http://127.0.0.1:${address.port}`,
  };
}

async function auditStories({baseUrl, storyIds}) {
  const [{AxeBuilder}, {chromium}] = await Promise.all([
    import('@axe-core/playwright'),
    import('@playwright/test'),
  ]);
  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext({reducedMotion: 'reduce'});
  const page = await context.newPage();
  const audits = [];

  try {
    for (const storyId of storyIds) {
      for (const theme of themes) {
        for (const mode of modes) {
          const url = new URL('/iframe.html', baseUrl);
          url.searchParams.set('id', storyId);
          url.searchParams.set('viewMode', 'story');
          url.searchParams.set('globals', `theme:${theme};mode:${mode}`);
          await page.goto(url.href, {waitUntil: 'networkidle'});
          await page.waitForFunction(() => {
            const root = document.querySelector('#storybook-root');
            return root && root.childElementCount > 0;
          });

          const results = await new AxeBuilder({page})
            .include('#storybook-root')
            .analyze();
          audits.push({
            mode,
            storyId,
            theme,
            violations: results.violations,
          });
        }
      }
    }
  } finally {
    await browser.close();
  }

  return audits;
}

async function runAccessibilityAudit() {
  const workspaceRoot = fileURLToPath(new URL('../../', import.meta.url));
  const storybookDirectory = join(
    workspaceRoot,
    'apps/storybook/storybook-static',
  );
  const baselinePath = join(workspaceRoot, '.github/a11y-baseline.json');
  const index = JSON.parse(
    await readFile(join(storybookDirectory, 'index.json'), 'utf8'),
  );
  const storyIds = Object.values(index.entries)
    .filter((entry) => entry.type === 'story')
    .map((entry) => entry.id)
    .sort();

  if (storyIds.length === 0) {
    throw new Error('Storybook index contains no auditable stories');
  }

  const updateBaseline = process.argv.includes('--update-baseline');
  let baseline;
  if (!updateBaseline) {
    baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
    if (baseline.version !== 1 || !Array.isArray(baseline.violations)) {
      throw new Error('Accessibility baseline must use schema version 1');
    }
    const scopeProblems = accessibilityBaselineScopeProblems(baseline, {
      modes,
      storyCount: storyIds.length,
      themes,
    });
    if (scopeProblems.length > 0) {
      throw new Error(
        `Accessibility baseline scope does not match the discovered audit surface:\n${scopeProblems.join('\n')}`,
      );
    }
  }

  const server = await serveDirectory(storybookDirectory);
  let audits;
  try {
    audits = await auditStories({baseUrl: server.url, storyIds});
  } finally {
    await server.close();
  }

  const current = accessibilityViolationFingerprints(audits);
  if (updateBaseline) {
    const baseline = {
      scope: {
        modes,
        storyCount: storyIds.length,
        themes,
      },
      version: 1,
      violations: current,
    };
    await writeFile(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
    console.log(
      `Updated ${relative(workspaceRoot, baselinePath)} with ${current.length} known violation(s) across ${storyIds.length * themes.length * modes.length} scenarios.`,
    );
    return;
  }

  const regressions = newAccessibilityViolations(audits, baseline);
  if (regressions.length > 0) {
    for (const regression of regressions) {
      console.error(
        `${regression.storyId} [${regression.theme}/${regression.mode}] ${regression.ruleId}: ${regression.target}`,
      );
    }
    throw new Error(
      `${regressions.length} new accessibility violation(s) exceeded the checked-in baseline`,
    );
  }

  const known = new Set(current.map(fingerprintKey));
  const resolved = baseline.violations.filter(
    (violation) => !known.has(fingerprintKey(violation)),
  );
  console.log(
    `Accessibility audit passed ${storyIds.length * themes.length * modes.length} scenarios with ${current.length} known violation(s) and ${resolved.length} resolved baseline entry(s).`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await runAccessibilityAudit();
}
