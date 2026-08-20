# KIOKU-UI Agent Delivery Contract

KIOKU-UI is a consumer of KIOKU's published contracts. For cross-repository work, read the sibling KIOKU repository's `docs/agent-delivery/system.yaml` and the assigned Kanban task.

## Rules

- Work only in the assigned worktree and feature branch.
- Do not invent or fork API/type contracts locally. Create or link the KIOKU core task when a producer change is required.
- Link the associated KIOKU issue or PR and contract change in every cross-repository PR.
- Run the repository's CI-equivalent verification before review.
- An implementation session cannot approve its own final diff or release.
- A UI task is complete only after the integrator confirms API contract, build/typecheck, and relevant end-to-end behavior agree.

## Secrets and release

1Password is the credential source of truth. Never read, print, commit, or materialize production secrets. Production release decisions belong to the KIOKU delivery graph, not an individual UI worker.

Use `.agents/skills/feature-delivery/SKILL.md` for the assigned-worker procedure.
