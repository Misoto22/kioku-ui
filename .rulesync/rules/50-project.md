---
root: true
targets: ["agentsmd"]
description: KIOKU-UI agent delivery contract migrated into the project rule layer
scope: project
---

# KIOKU-UI Agent Delivery Contract

- **[KUI-READ-001] MUST — Read producer delivery context for cross-repository work.** Use the sibling KIOKU repository's `docs/agent-delivery/system.yaml`, assigned Kanban task, and linked producer contract before implementation.
- **[KUI-GIT-001] MUST — Work only in the assigned worktree and branch.** Do not reuse a shared or dirty checkout.
- **[KUI-CONTRACT-001] MUST — Do not invent producer contracts.** When API or persisted-data behavior must change, create or link the KIOKU core task instead of forking types or behavior locally.
- **[KUI-LINK-001] MUST — Preserve cross-repository traceability.** Link the related KIOKU issue or PR and contract change in each cross-repository PR.
- **[KUI-REVIEW-001] MUST — Separate implementation from final approval.** An implementation session cannot approve its own final diff or release.
- **[KUI-DONE-001] MUST — Require integration evidence.** Completion needs CI-equivalent verification plus integrator confirmation that API contracts, build/typecheck, and relevant end-to-end behavior agree.
- **[KUI-SEC-001] MUST — Protect secrets and release authority.** Use 1Password as credential truth, never materialize production secrets, and leave production release decisions to the KIOKU delivery graph.
- **[KUI-BOUND-001] MUST — Keep packages product-neutral.** Core packages own reusable components, tokens, themes, and build adapters, while host applications own routes, data, persistence, and domain behavior; run the package-boundary gate.
- **[KUI-CMD-001] MUST — Run the repository gate.** Use `pnpm check`; run accessibility, pack-smoke, example-build, or release verification when those surfaces change.
- **[KUI-REL-001] MUST — Record public-package changes.** Add a Changeset for user-visible package changes and preserve protected trusted-publishing authority.
- **[KUI-SKILL-001] SHOULD — Use the assigned-worker workflow.** Use `.agents/skills/feature-delivery/SKILL.md` when the delivery graph assigns this repository work.
