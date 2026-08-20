---
name: feature-delivery
description: Execute an assigned KIOKU-UI node within a durable cross-repo delivery graph.
---

# KIOKU-UI feature delivery

The work is assigned by a KIOKU delivery task. Do not self-release or self-approve.

1. Read the task, affected KIOKU contract, and acceptance criteria.
2. Implement only in the assigned KIOKU-UI worktree.
3. Run the repository's CI-equivalent verification and attach evidence.
4. If an API/type contract must change, create or link the KIOKU core task; do not fake compatibility in UI code.
5. Send the result to independent review, then to the cross-repository integrator.
6. A task is complete only when integration evidence confirms the consumer matches the producer contract.

Never read or materialize production secrets.
