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
- Added explicit active/token foreground tokens and dark-mode highlight fills after checkpoint
  review found low-contrast text on highlighted backgrounds.
- Reordered `ScrollScene` so narration precedes the sticky visual and standardized sandbox cards
  around a top intro, grouped controls, primary visual, and readout flow.

## M4

- Built the non-signature Part 1 visuals as lightweight React islands with shared helper math in
  `transformer.ts`. They are intentionally simpler than the four signature sandboxes.
- Folded the autoregression animation into `SamplingPlayground` instead of adding another
  top-level project-structure component.

## M5

- Added a `WeightZoom` component for the model-to-one-weight transition even though it is not in
  the locked project tree. The milestone explicitly requires this visual.
- Reused the existing KV-cache formula for `MemoryBudget`, with a small tested breakdown helper
  for weights, KV cache, overhead, and total.

## M6

- Put serving-specific math in `serving.ts` so batching, paging, and speculative decoding visuals
  use deterministic helpers instead of duplicating illustrative calculations inside components.
- Kept the engine overview as MDX cards rather than a React island. It is comparative reference
  content, while the interactive state belongs to scheduling, cache paging, and speculation.

## M7

- Kept the GPU floorplan two-dimensional. The milestone allows 2D, and the main teaching goal is
  the memory hierarchy plus tensor-core work path rather than spatially accurate chip layout.
- Used illustrative hardware presets in `hardware.ts` for roofline behavior. The visual teaches the
  compute-roof vs bandwidth-slope relationship without tying the copy to one exact GPU SKU.

## M8

- Added the optional `ConfigSandbox` because the existing memory, quantization, and hardware
  helpers made a useful first-order estimate small enough to keep in scope.
- Kept prompt prediction deterministic and illustrative. The hook teaches next-token continuation,
  not real model inference against a live vocabulary.

## M9

- Switched article-embedded islands to `client:visible` for final performance polish while leaving
  `/dev` sandboxes on `client:load` so isolated review pages hydrate immediately.
- Added a header theme toggle on top of system color-scheme detection to make light/dark contrast
  checks explicit during QA.

## Post-M9 content audit

- Added one running toy prompt, `The GPU keeps KV cache ready for`, across the narrative and replay
  copy so the descent has a concrete through-line rather than isolated chapter examples.
- Labeled tokenizer, prompt prediction, sampling, config, and roofline widgets as simplified
  teaching models where appropriate. The site explains real mechanisms, but the displayed IDs,
  candidate probabilities, and throughput estimates are illustrative.
- Updated `MemoryBudget` so the 70B preset changes the KV-cache layer shape instead of reusing the
  7B-style layer count. This keeps the educational readout aligned with the synthesis sandbox.
