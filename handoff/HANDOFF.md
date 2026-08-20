# Handoff — Kioku UI, finishing the component audit

## What this is

An audit of all 130 components in `Misoto22/kioku-ui` returned **202 findings**:
31 `broken` (wrong on screen), 120 `shoddy`, 51 `polish`.

**All 31 `broken` are fixed and merged.** Four pull requests have landed. The
remaining work is the `shoddy` and `polish` lists, in `audit-backlog.md` beside
this file.

The next session's job: **keep going until every component is done.**

## Where things stand

Merged to `main` (read the PR bodies — they carry the reasoning, do not
duplicate it here):

| PR | What |
|----|------|
| [#13](https://github.com/Misoto22/kioku-ui/pull/13) | Five native controls redrawn, `DatePicker` added, dark-mode failures, docsite layout, bilingual site |
| [#14](https://github.com/Misoto22/kioku-ui/pull/14) | `Tokenizer` reads the whole field contract |
| [#15](https://github.com/Misoto22/kioku-ui/pull/15) | 16 shoddy findings in `Chat` and `Table` |
| [#16](https://github.com/Misoto22/kioku-ui/pull/16) | Controls and the recipes they share (9) |
| [#17](https://github.com/Misoto22/kioku-ui/pull/17) | The scrollbar in 11 regions, last two native controls |

Roughly 38 of the 120 shoddy are done. **That count is approximate**: batch 3
fixed things by sweeping for a pattern rather than by finding id, so some
entries in the backlog are already resolved. Re-check the source before fixing.

The design canvas behind the redesign:
<https://claude.ai/code/artifact/5c9b4771-2251-4ae3-94bb-9479e54379ed>

## The working loop — follow it exactly

Every batch:

1. Pick a coherent cluster of findings (by component or by shared theme).
2. **Sweep the codebase for the pattern, not just the named file.** This is the
   single most valuable habit learned here. A finding about `CheckboxInput`'s
   `accent-color` was really about four components; a finding about `Carousel`'s
   scrollbar was really about eleven regions. Use the finding's own evidence
   text as the clue — it often states the wider scope.
3. Fix, with a comment that says *why*, in the voice the codebase already uses.
4. Verify **exactly as CI does**, before pushing:
   ```
   pnpm typecheck          # full --noEmit; `tsc -b` hides errors behind its cache
   pnpm test               # 442 tests
   pnpm check:repo
   pnpm check:package-boundaries
   pnpm format
   pnpm lint
   pnpm build:packages && pnpm a11y:audit   # 2968 scenarios, ~18 min
   ```
5. Write a changeset (`.changeset/*.md`). CI fails without one for package
   changes. `@misoto22/kioku-ui` is `minor` for new API, `patch` otherwise.
6. Commit, then **merge main with `-s ours`** (see the trap below), push, open a
   PR, watch CI, squash-merge.

## Traps that cost time here

- **`git merge -s ours origin/main` is required before every PR.** Each merge is
  squashed, so the branch's merge base falls behind and GitHub cannot compute a
  merge ref — the PR reads `CONFLICTING`/`DIRTY` and **no workflow runs at all**.
  Recording main as a parent with `-s ours` fixes it. Always verify the tree
  hash is unchanged afterwards. Do **not** use `-X ours` (the merge *option*):
  it does a textual merge and produced duplicate `const` declarations in three
  files.
- **`tsc -b` lies.** It skips packages on incremental info. CI runs
  `pnpm typecheck` (full `--noEmit`) and caught three errors the local build had
  passed. Always run the full one before pushing.
- **Never regenerate the a11y baseline to make a failure go away.**
  `pnpm a11y:baseline` will happily record new violations as accepted. It tried
  to bless 8 real `label` violations. Fix the component; run `pnpm a11y:audit`
  (not `:baseline`) to confirm. Only regenerate when the *scope* changes, i.e.
  when stories are added or removed.
- **Adding a message key to `packages/core/src/i18n/messages.ts` is a breaking
  change by design** — hosts supply a full `Messages` replacement. The docsite's
  own catalogue at `apps/docsite/src/i18n/library.zh.ts` must be updated in the
  same commit or typecheck fails.
- **A story's `meta.args` merges into every story.** `args: {label: ''}` added to
  satisfy a required prop silently blanked a real label and re-introduced 8 a11y
  violations. Put the demo's own props *after* the `{...props}` spread, the way
  `Calendar.stories.tsx` does.
- **New files in `packages/core/src` need the local dev server restarted.** The
  build emits them correctly; a long-running Vite server keeps a stale module
  graph and reports `Failed to resolve import`. Not a code bug. CI never sees it.
- **A checked-in policy may contradict a finding.** One finding pointed at
  `Table`'s row `:active` with no argument; `internal/vibe-tests` *requires* the
  Table story to expose that state. When a finding has no reasoning attached,
  check whether the behaviour is deliberate before removing it.

## Repository rules that bite

- `internal/stylex-capabilities/src/capabilities.ts` is an allowlist of
  selectors. `:checked` is **not** on it — drive marks from React state instead.
  Twelve `::-webkit-` selectors were added there with an argument written in the
  file; follow that style if more are needed.
- `internal/vibe-tests` requires every public component to have a Storybook
  story titled `Core/<Name>`, a `<Name>.doc.ts` entry wired into
  `packages/core/src/docs/index.ts`, and a row in the docsite catalogue. Two
  ordered name lists in `packages/core/src/docs/index.test.ts` and
  `packages/core/src/package-build.test.ts` must be updated for a new component.
- `docs/design-language.md` is the law, but it has been wrong three times this
  session. When a component contradicts it with an argued comment, consider
  whether the document is the stale one — and say so explicitly in the PR.
- Shared internal style modules follow `packages/core/src/scrolling/`: a
  `stylex.create` in its own file, an `index.ts` re-export, **not** exported from
  the root barrel.

## Open follow-ups already filed as separate tasks

- Consolidate the three hand-drawn choice-mark recipes (`CheckboxInput`,
  `RadioList`, `SelectableCard`) into one shared module.
- `Calendar` formats month and weekday names with `toLocaleDateString(undefined)`
  — the browser's locale, not the page's, so a Chinese page reads "August 2026".
- ~170 shared strings (130 component descriptions, 40 template titles) still read
  English on the Chinese docsite.

## Suggested skills

- **`ego-browser`** — for looking at the running docsite. Every visual claim in
  this work was verified by measuring computed styles in a real browser, not by
  reading CSS. Keep doing that: a green test suite cannot see that something
  looks wrong.
- **`/code-review`** — worth running over a batch before opening the PR.

## Conventions to keep

- Commit messages and code comments in English; prose to the user in Chinese.
- Comments explain *why*, never *what*.
- Report honestly: if a finding is not acted on, say so in the PR body and give
  the reason. Two such cases are recorded in #15's body.
