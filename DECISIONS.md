# Decisions

## M0

- Initialized a Git repository in this workspace because only `plan.md` existed and milestone
  commits are required by the runbook.
- Kept numeric prefixes in part route slugs (`/parts/0-hook`, etc.) so the filesystem,
  content collection, and descent order stay aligned.
- Made `ScrollScene.render` optional for M0. MDX stubs use serializable step data and the
  built-in placeholder visual; later React-owned interactives can pass render callbacks inside
  sandbox components.
- Set a repository-local Git author identity (`Codex <codex@example.local>`) because the
  workspace had no commit identity configured.

## M1

- Used deterministic mock attention heads rather than model-derived weights. The goal for M1
  is legible, distinct behavior in the standalone fan; later prose can swap in richer data
  without changing the component contract.

## M2

- The quantization sandbox uses a deterministic synthetic weight distribution. This keeps the
  histogram stable in tests while still showing a roughly normal distribution with a few tails.
- Model-size readouts use decimal GB (`params_billions * bytes_per_param`) so the simple
  relationship stays visible in the UI.

## M3

- The PrefillDecode work counter is intentionally illustrative: cached decode counts one unit per
  emitted token, while no-cache decode sums the expanding recomputed prefix to expose the linear
  vs quadratic shape.
- The KV grid displays a fixed number of representative cells while the slider drives the actual
  memory formula. This keeps the animation legible across context lengths.

## M3 checkpoint

- Allowed the Console review host in Astro's Vite dev-server config so the checkpoint server can
  be opened through the forwarded URL.
- Added a persistent site header, explicit part map, adjacent-part pager, and `/dev/` review hub
  as checkpoint UX fixes. These organize existing M0-M3 work without starting M4 scope.
