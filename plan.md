# GOAL: Build "Descent" — a visual, top-to-bottom LLM inference explainer

> **One-line goal:** Build a visual, scroll-driven website that explains how LLM
> inference works as a single continuous *descent* — from the transformer model,
> down through how weights are represented as numbers, down through the software
> serving stack, down to the GPU hardware — with a small set of high-quality
> interactive visualizations as the centerpieces.

---

## 0. Operating instructions (read first)

This document is a `/goal` runbook. Execute it **milestone by milestone, in order**.

1. Work one milestone at a time. Do **not** start a milestone until the previous
   one's **Acceptance criteria** all pass.
2. After every milestone: run the full check suite (§11), then commit with a
   conventional message (`feat(m2): attention fan interactive`, etc.).
3. The **Invariants** in §7 must hold after *every* milestone, not just at the end.
4. **Checkpoint at the end of M3.** M0–M3 produce a deployable MVP (the spine plus
   the three through-line-proving interactives). Stop, run the full QA checklist,
   and surface a summary before continuing to M4.
5. You (the agent) cannot fully self-verify visual correctness. Do **not** claim a
   visual "looks right." Instead: keep a `/dev` sandbox route per interactive,
   write unit tests for all underlying math, and emit/update `QA.md` (§11.2) listing
   what a human must eyeball. Producer does not judge its own visual output.
6. If a decision isn't specified here, prefer the **simplest** option that keeps the
   build green and the Invariants intact. Note the decision in `DECISIONS.md`.
7. Keep scope tight. Anything in §12 (Non-goals) is explicitly out for now.

---

## 1. Product overview (self-contained context)

**What this is.** A long-form, visual explainer website. The organizing metaphor is
a **descent**: the reader scrolls from the most abstract idea (what a transformer
does) down toward the most physical (electrons moving through tensor cores). The
site's structure mirrors the inference stack itself.

**Why it's differentiated.** Most explainers cover one slice — the transformer
internals, OR number representation, OR the serving stack. This one connects
**model → numbers → software → silicon** as one continuous journey. That through-line
is the entire point; never let a section become an island.

**Audience.** Technically curious readers, from strong undergrads to working
engineers. Two depth tracks: a main path built on intuition and interaction, and
inline collapsible "go deeper" blocks with the math/precise mechanics for experts.

**The six parts (the descent):**

| Part | Title | Question it answers | Signature interactive |
|------|-------|--------------------|----------------------|
| 0 | Hook | "What just happened when I hit enter?" | Type a prompt → one token predicted |
| 1 | The transformer | "What is the model?" | Attention fan |
| 2 | Weights as numbers | "How are weights represented?" | Float exploder + quantization slider |
| 3 | Inference: software | "How is it served?" | Prefill/decode + KV cache |
| 4 | Inference: hardware | "How does the silicon run it?" | Roofline (drag batch size) |
| 5 | Put it together | "Now show me the whole thing" | Full-stack replay |

**Recurring motif.** A "token" is rendered identically everywhere via a single
`<Token/>` component and becomes the through-line character the reader follows all
the way down the stack.

**Color encoding (consistent site-wide).** Active / high-attention / energy = warm
(amber→coral). Inert / low / dormant = gray/cool. "Model" sections accent purple;
"hardware" sections accent teal. All encoding lives in one constants module; no
ad-hoc colors anywhere.

---

## 2. Locked tech stack (do not deliberate; use exactly this)

- **Runtime / package manager:** Bun (`bun`, `bunx`). Lockfile committed.
- **Framework:** Astro 4+ (static-first; interactive bits are React islands).
- **Interactive UI:** React 18 islands, TypeScript in `strict` mode.
- **Content:** MDX via `@astrojs/mdx` (prose lives in MDX, interactives embedded).
- **Styling:** Tailwind CSS via `@astrojs/tailwind`. Design tokens in CSS custom
  properties (`src/styles/tokens.css`) mirrored by a TS constants module.
- **Scrollytelling:** `scrollama` (Intersection-Observer-based step triggers).
- **Animation:** `framer-motion` (inside islands only). Every animation gated on
  `prefers-reduced-motion` with a static fallback.
- **Data viz:** `d3` (d3-scale, d3-shape, d3-selection) for data-driven SVG; plain
  React + SVG for simpler diagrams.
- **Math typesetting:** KaTeX via `remark-math` + `rehype-katex` (for DeeperBlocks).
- **Lint/format:** Biome (`biome check`). Strict; CI-gating locally.
- **Unit tests:** Vitest. Required for all interactive math (§9).
- **3D:** `@react-three/fiber` + `@react-three/drei` — **DEFERRED**. MVP is 2D only.
  3D is optional polish in M7/M9 (embedding space, GPU floorplan); never block on it.
- **Build target:** static (`astro build`). Must produce a deployable static bundle.
  Hosting/deploy config is out of scope (§12).

---

## 3. Project structure (create exactly this shape)

```
/
  astro.config.mjs            # integrations: react, mdx, tailwind; remark/rehype math
  tailwind.config.mjs
  tsconfig.json               # strict: true
  biome.json
  package.json                # bun scripts (see §11)
  src/
    layouts/
      BaseLayout.astro        # <html> shell, fonts, global css, dark-mode hook
      PartLayout.astro        # per-part scaffold: ProgressRail + scroll container
    components/
      scroll/
        ScrollScene.tsx       # sticky visual pane + stepped narration primitive
        ProgressRail.tsx      # descent depth indicator (the spine)
        DeeperBlock.tsx       # collapsible "go deeper" detail (KaTeX-friendly)
        Token.tsx             # the recurring token motif (single source of truth)
      viz/
        AttentionFan.tsx          # M1
        FloatExploder.tsx         # M2
        QuantizationSlider.tsx    # M2
        PrefillDecode.tsx         # M3 (includes KV cache)
        Tokenizer.tsx             # M4
        EmbeddingSpace.tsx        # M4 (2D scatter; 3D optional later)
        TransformerStack.tsx      # M4 (structural overview)
        QKVMultiHead.tsx          # M4
        MoERouter.tsx             # M4
        SamplingPlayground.tsx    # M4
        MemoryBudget.tsx          # M5
        BatchingTimeline.tsx      # M6
        PagedAttention.tsx        # M6
        SpeculativeDecoding.tsx   # M6
        GpuFloorplan.tsx          # M7
        GemmTiling.tsx            # M7
        FlashAttention.tsx        # M7
        Roofline.tsx              # M7
        Parallelism.tsx           # M7
        ConfigSandbox.tsx         # M8 (model+quant+gpu -> VRAM/tok/s)
    content/
      config.ts               # content collection schema (zod)
      parts/
        0-hook.mdx
        1-transformer.mdx
        2-weights.mdx
        3-software.mdx
        4-hardware.mdx
        5-synthesis.mdx
    pages/
      index.astro             # landing + hook + descent navigation
      parts/[slug].astro      # renders a part from the content collection
      dev/[component].astro    # sandbox routes for each interactive (dev only)
    lib/
      encoding.ts             # color-encoding + type constants (single source)
      attention-data.ts       # sample sentence + per-head weight matrices (mock)
      float.ts                # IEEE-754 <-> bits (FP32/FP16/BF16) round-trip
      quant.ts                # quantization bucketing, model-size + quality math
      memory.ts               # KV-cache + weight memory formulas
    styles/
      tokens.css
      global.css
  test/                       # vitest specs (float, quant, attention geometry, ...)
  QA.md                       # human visual-QA checklist (agent maintains)
  DECISIONS.md                # any unspecified decisions the agent made
```

---

## 4. Shared primitives (build in M0; everything else depends on them)

**`encoding.ts`** — the single source of truth for meaning→color. Export named
constants (e.g. `COLOR.active`, `COLOR.inert`, `COLOR.modelAccent`,
`COLOR.hwAccent`) and a `weightToColor(w: number)` helper. No component may
hardcode a hex value; all color comes from here (Invariant I3).

**`Token.tsx`** — renders a single token consistently (pill, mono font, optional
id, optional highlight state). Used anywhere a token appears, in every part.

**`ScrollScene.tsx`** — the core scrollytelling primitive. Props:
`steps: {id, narration: ReactNode}[]` and `render: (activeStep: number) => ReactNode`.
Layout: narration column scrolls; visual pane is `position: sticky` and re-renders
as `activeStep` changes (driven by `scrollama`). Must degrade gracefully with
reduced motion (snap between steps, no tweening) and be keyboard-navigable
(steps reachable, focus managed).

**`ProgressRail.tsx`** — a fixed vertical indicator of the 6-part descent showing
current part + scroll depth within it. Reinforces the spine; must stay accurate as
the reader navigates (Invariant I2).

**`DeeperBlock.tsx`** — a collapsible "go deeper" disclosure (semantic
`<details>`/`<summary>` or an accessible button), KaTeX-capable, used for the
expert/math track. Collapsed by default.

---

## 5. Per-interactive design philosophy

Build intuition first; add precision on demand. Prioritize the four **signature
sandboxes** (attention, float/quant, prefill-decode, roofline) — they carry the
site and deserve the most polish. The rest can be lighter animations or static
diagrams. Every interactive: keyboard-operable, reduced-motion-safe, no console
errors, and backed by unit tests for any non-trivial math.

---

## 6. Milestones

> Each milestone lists **Scope**, **Deliverables**, **Acceptance criteria**
> (objective, agent-checkable), and **Out of scope** (defer, don't gold-plate).

### M0 — Scaffold & spine
- **Scope:** Project setup + shared primitives + a walkable but placeholder descent.
- **Deliverables:**
  - Bun + Astro + React + MDX + Tailwind + Biome + Vitest configured; `strict` TS.
  - `tokens.css` + `encoding.ts` (color encoding + type scale).
  - `BaseLayout`, `PartLayout`, `Token`, `ScrollScene`, `ProgressRail`, `DeeperBlock`.
  - Content-collection schema + stub MDX for all 6 parts (heading + lorem + one
    `ScrollScene` with a placeholder visual each).
  - `index.astro` landing with hook placeholder + descent nav to all parts.
  - `dev/[component]` sandbox route harness (empty registry to start).
- **Acceptance criteria:**
  - `bun run dev` serves; `bun run build` emits static output.
  - `bun run check` is green: `tsc --noEmit` + `biome check` + `vitest run` all pass,
    zero errors/warnings.
  - Scrolling any part advances `ScrollScene` steps; `ProgressRail` reflects
    part + depth. Reduced-motion mode disables tweening with no broken layout.
- **Out of scope:** real content, real visuals, dark mode polish.

### M1 — Signature interactive: Attention fan  *(Part 1 anchor)*
- **Scope:** The site's centerpiece interactive, standalone.
- **Deliverables:** `AttentionFan.tsx` + `lib/attention-data.ts` + `test/attention.test.ts`
  + `dev/attention` sandbox. See contract §9.1.
- **Acceptance criteria:**
  - Renders in `dev/attention`; clicking a token re-roots the fan; head selector
    switches weight patterns; hover shows weight value.
  - Line opacity/width derive from weights via a tested pure function (geometry +
    `weightToColor` unit-tested).
  - Keyboard: arrow keys move the query token; reduced-motion = no tween, instant.
  - `bun run check` green.
- **Out of scope:** wiring into Part 1 prose (that's M4).

### M2 — Signature interactives: Float exploder + Quantization slider  *(Part 2 anchors)*
- **Scope:** Two number-representation sandboxes, standalone.
- **Deliverables:** `FloatExploder.tsx`, `QuantizationSlider.tsx`, `lib/float.ts`,
  `lib/quant.ts`, tests, `dev/float` + `dev/quant`. Contracts §9.2, §9.3.
- **Acceptance criteria:**
  - FloatExploder: toggling any bit updates the represented value; FP32/FP16/BF16
    field boundaries shown; `float.ts` round-trip unit-tested against known values.
  - QuantizationSlider: precision selector `[FP16, INT8, Q4, Q2]` re-buckets the
    weight histogram and updates model-size + quality-proxy readouts; `quant.ts`
    bucket counts and size math unit-tested.
  - Both keyboard-operable, reduced-motion-safe; `bun run check` green.
- **Out of scope:** MXFP4 block-scaling visual (add as a DeeperBlock in M5).

### M3 — Signature interactive: Prefill/decode + KV cache  *(Part 3 anchor)* — **MVP checkpoint**
- **Scope:** Animated prefill→decode with a filling KV cache, standalone.
- **Deliverables:** `PrefillDecode.tsx` + `lib/memory.ts` + tests + `dev/prefill`.
  Contract §9.4.
- **Acceptance criteria:**
  - Plays a single parallel prefill pass, then a token-by-token decode loop with a
    KV-cache grid filling cell-by-cell.
  - "No cache" toggle replays the wasteful recompute; a context-length slider
    updates a KV-memory readout from `memory.ts` (formula unit-tested).
  - Compute-bound (prefill) vs memory-bound (decode) labeling present.
  - Play/pause works; reduced-motion provides a stepped static fallback.
  - `bun run check` green.
- **CHECKPOINT:** Run §11 full suite + §11.2 QA checklist. Emit an MVP summary
  (what's done, what a human should eyeball, screenshots/paths to `dev/*`). Pause.
- **Out of scope:** everything in Parts 4–5.

### M4 — Part 1 complete: The transformer
- **Scope:** Full Part 1 — wire AttentionFan + remaining sub-visuals + copy.
- **Deliverables (sub-visuals):** `Tokenizer` (live split), `EmbeddingSpace`
  (2D scatter; 3D optional), `TransformerStack` (structural overview),
  `QKVMultiHead`, `MoERouter`, `SamplingPlayground`, plus an autoregression
  animation. MDX prose for each section per §10.1.
- **Acceptance criteria:** Part 1 reads top-to-bottom; every sub-visual renders and
  responds; copy covers the §10.1 concept points; `bun run check` green; `QA.md`
  updated with Part 1 visual items.

### M5 — Part 2 complete: Weights as numbers
- **Scope:** zoom-into-a-weight visual, FloatExploder, QuantizationSlider (+ MXFP4
  block-scaling DeeperBlock), `MemoryBudget` bar, distillation sidebar. Copy §10.2.
- **Acceptance criteria:** as M4, for Part 2.

### M6 — Part 3 complete: Inference (software)
- **Scope:** PrefillDecode+KV, `BatchingTimeline` (static vs continuous),
  `PagedAttention` (block-table mapping), engines overview, `SpeculativeDecoding`
  (draft+verify, acceptance-rate slider). Copy §10.3.
- **Acceptance criteria:** as M4, for Part 3.

### M7 — Part 4 complete: Inference (hardware)
- **Scope:** `GpuFloorplan` + memory pyramid, `GemmTiling`, `FlashAttention`
  (naive-vs-fused), `Roofline` (drag batch size → operating point moves),
  `Parallelism` (TP/PP/EP comms). Copy §10.4. 3D floorplan optional; 2D acceptable.
- **Acceptance criteria:** as M4, for Part 4. Roofline drag is tested for the
  arithmetic-intensity mapping.

### M8 — Part 0 hook + Part 5 synthesis
- **Scope:** Polish the opening prompt→token hook; build the Part 5 full-stack
  replay; optional `ConfigSandbox` (model + quant + GPU → estimated VRAM + tok/s
  using `memory.ts`/`quant.ts`). Copy §10.0, §10.5.
- **Acceptance criteria:** Hook lands; synthesis replays the descent coherently;
  if built, ConfigSandbox estimates are unit-tested; `bun run check` green.

### M9 — Global polish: accessibility, performance, consistency
- **Scope:** Dark mode; reduced-motion audit across all interactives; keyboard nav
  pass; lazy-load heavy islands (Astro `client:visible`); KaTeX in all DeeperBlocks;
  encoding-consistency sweep; Lighthouse/perf pass; final `QA.md`.
- **Acceptance criteria:** Lighthouse (desktop) Performance and Accessibility ≥ 90 on
  the landing page and one representative part; no encoding violations (I3); all
  interactives keyboard + reduced-motion verified; `bun run check` green.

---

## 7. Invariants (must hold after EVERY milestone)

- **I1 — Build green.** `bun run check` (tsc + biome + vitest) passes with zero
  errors/warnings.
- **I2 — Spine intact.** All 6 parts reachable; `ProgressRail` accurately reflects
  position. No orphaned/unreachable part.
- **I3 — Encoding consistency.** Every color comes from `encoding.ts`. No hardcoded
  hex outside `tokens.css`/`encoding.ts`. (Add a simple grep-based test/check.)
- **I4 — Accessibility floor.** Every interactive is keyboard-operable and respects
  `prefers-reduced-motion` with a static fallback. Semantic HTML; no div-only
  controls.
- **I5 — Token motif single-sourced.** Tokens render only via `<Token/>`.
- **I6 — Math is tested.** Every interactive with non-trivial math has Vitest
  coverage of the pure functions (no untested float/quant/memory/geometry logic).
- **I7 — Fully static, no backend.** No network calls at runtime; site builds and
  runs as static assets.

---

## 8. (reserved)

---

## 9. Interactive component contracts

> These four are the signature pieces. Define the data + behavior precisely so the
> visuals are correct, not vibes. Keep all math in `lib/*` and unit-test it.

### 9.1 AttentionFan
- **Data:** `attention-data.ts` exports a sample sentence tokenized into ~8–12
  tokens, and **2–3 heads**, each a `number[][]` row-normalized attention matrix
  (rows = query token, cols = key token). Give the heads *distinct, legible*
  patterns (e.g. a "previous-token" head, a "subject↔verb" head, a "broad/diffuse"
  head) so switching heads visibly changes behavior.
- **Visual:** tokens in a row; for the selected query token, draw lines to every
  token with **opacity and stroke-width ∝ weight** and color via `weightToColor`.
- **Interaction:** click (or arrow-key) selects the query token → fan re-roots;
  head selector toggles the active matrix; hover a target shows its weight.
- **Pure functions (tested):** `weightToGeometry(weight) -> {opacity, width}` and
  `weightToColor(weight)`; row-normalization sanity (each query row sums ≈ 1).
- **A11y/motion:** focusable tokens, arrow-key navigation, reduced-motion = instant
  re-fan (no tween).

### 9.2 FloatExploder
- **Data/logic:** `float.ts` implements exact IEEE-754 encode/decode for **FP32
  (1/8/23)**, **FP16 (1/5/10)**, **BF16 (1/8/7)**. Provide `bitsToValue` and
  `valueToBits` round-trips.
- **Visual:** a togglable bit grid with sign/exponent/mantissa fields visually
  delineated; live-rendered represented value; format switcher (FP32/FP16/BF16);
  a few preset values (0.1, 1/3, max-normal, smallest-subnormal) to load.
- **Teaching hook:** BF16 keeps FP32's exponent range but fewer mantissa bits —
  make that visible when switching FP16↔BF16 on the same value.
- **Tested:** round-trip known values; field boundary indices per format.

### 9.3 QuantizationSlider
- **Data/logic:** `quant.ts` takes a sample weight distribution (generate a
  plausible roughly-normal histogram) and a target precision in
  `[FP16, INT8, Q4, Q2]`; returns bucketed levels, resulting **model size**
  (params × bytes/param; expose a params input, default e.g. 7B and 70B presets),
  and a simple **quality proxy** (e.g. mean quantization error → a 0–100 score;
  label it clearly as illustrative, not a benchmark).
- **Visual:** weight histogram that visibly "stair-steps" into discrete
  quantization levels as precision drops; size + quality readouts update live.
- **Deeper (M5):** a DeeperBlock illustrating MXFP4/NVFP4 **block scaling** (one
  shared scale per block of 32 values) vs a single per-tensor scale.
- **Tested:** bucket counts per precision; size math; monotonic error↑ as bits↓.

### 9.4 PrefillDecode (+ KV cache)
- **Logic:** `memory.ts` implements the KV-cache size formula
  `2 * n_layers * n_kv_heads * head_dim * seq_len * bytes` and a weight-memory
  helper; expose small model presets. Demonstrate GQA shrinking KV (vary
  `n_kv_heads`).
- **Visual:** phase 1 highlights all prompt tokens processed **in parallel**
  (prefill); phase 2 is a **decode loop** emitting one token/step with a KV-cache
  grid filling cell-by-cell. A **"no cache"** toggle replays redundant recompute.
  A **context-length slider** updates a KV-memory readout. Label prefill
  **compute-bound** / decode **memory-bound**.
- **Tested:** KV formula; that "no cache" work scales ~O(n²) vs cached ~O(n) in the
  step counter.
- **Motion:** play/pause; reduced-motion = stepped static frames.

*(Non-signature interactives — Tokenizer, EmbeddingSpace, MoERouter,
SamplingPlayground, BatchingTimeline, PagedAttention, SpeculativeDecoding,
GpuFloorplan, GemmTiling, FlashAttention, Roofline, Parallelism, ConfigSandbox —
follow the same rules: pure math in `lib/`, tested, keyboard + reduced-motion safe.
Keep them lighter than the signature four.)*

---

## 10. Content blueprint (curriculum + facts the copy must convey)

> Write the prose yourself, intuition-first, ~150–300 words per section, with
> precise math/mechanics tucked into DeeperBlocks. The bullets below are the
> **facts each section must get right** — treat them as the source of truth so the
> copy is technically correct. Each section pairs with the visual named.

### 10.0 Part 0 — Hook
- A prompt is just text the model continues, one token at a time.
- Plant the question ("how did it pick that token?") and introduce the `<Token/>`
  motif. Cue the descent. *Visual:* prompt box → single predicted token.

### 10.1 Part 1 — The transformer
- **Tokenization:** text → subword tokens (BPE-style) → integer IDs. *Visual:* live
  tokenizer.
- **Embeddings:** each token id → a vector; similar meanings cluster in vector
  space; directions encode relationships. *Visual:* EmbeddingSpace (2D scatter).
- **The stack:** embeddings flow through N identical layers; each layer = attention
  + FFN, with residuals + RMSNorm (pre-norm). *Visual:* TransformerStack.
- **Attention:** each token attends to others with varying weight; this is how
  context flows. *Visual:* AttentionFan.
- **Q/K/V + multi-head:** project to Query/Key/Value; scores = scaled Q·Kᵀ →
  softmax → weighted sum of V; multiple heads specialize. Mention **GQA/MQA**
  (heads sharing K/V) and that it shrinks the KV cache (pays off in Part 3).
  *Visual:* QKVMultiHead.
- **FFN / MoE:** the per-token "compute"; holds most parameters. MoE = many expert
  FFNs + a router picking **top-k**; only **active** params run per token (e.g.
  ~5B active of ~117B total). *Visual:* MoERouter.
- **Logits → token:** final projection → probability over the vocab; temperature /
  top-p / top-k reshape it; then sample. *Visual:* SamplingPlayground.
- **Autoregression:** append the sampled token, feed back, repeat. This sets up the
  KV-cache motivation. *Visual:* autoregression loop.

### 10.2 Part 2 — Weights as numbers
- A model is billions of numbers arranged in matrices; "running" it is mostly
  matrix multiplication. *Visual:* zoom model → layer → matrix → one float.
- **Floating point:** sign/exponent/mantissa; FP32 vs FP16 vs **BF16** (BF16 trades
  mantissa for FP32-range exponent). *Visual:* FloatExploder.
- **Quantization:** store weights in fewer bits (INT8, Q4, Q2); bigger-model-at-
  lower-precision usually beats smaller-at-higher; quality loss is smaller on
  bigger models. GGUF k-quants mix precision per layer. **MXFP4/NVFP4** use block
  scaling (shared scale per 32 values). *Visual:* QuantizationSlider (+ MXFP4
  DeeperBlock).
- **Memory math:** size = params × bytes/param; rule of thumb `size_B × 0.6 ≈ Q4 GB`;
  KV cache adds on top and grows with context. *Visual:* MemoryBudget bar vs VRAM.
- **Distillation (sidebar):** the *other* route to small models — train a small
  student on a big teacher's outputs (e.g. reasoning traces); even ~1K examples can
  transfer a lot. Distinct from quantization (capability transfer vs compression).

### 10.3 Part 3 — Inference: software
- **Prefill vs decode:** prefill processes the whole prompt in parallel
  (compute-bound; sets TTFT); decode emits one token/step, autoregressively
  (memory-bound; sets inter-token latency). This asymmetry drives everything.
  *Visual:* PrefillDecode.
- **KV cache:** attention at step t needs all prior K/V; caching turns per-step cost
  from O(n²) into O(n). Cost = memory that grows with context × batch; GQA/MQA/MLA
  shrink it. *Visual:* the KV grid in PrefillDecode.
- **Batching & scheduling:** GPUs want big batches; **continuous batching**
  schedules per-iteration so finished sequences free slots immediately; **chunked
  prefill** interleaves long prefills with decodes; **prefix caching** reuses shared
  prompt KV. *Visual:* BatchingTimeline (static vs continuous).
- **PagedAttention:** treat the KV cache like OS virtual memory — fixed-size blocks
  + a block table mapping logical positions → physical blocks; kills fragmentation,
  enables sharing. *Visual:* PagedAttention.
- **Engines:** llama.cpp (portable, GGUF, single-user/local), vLLM (production
  multi-user, PagedAttention), SGLang (RadixAttention prefix caching, agentic),
  TensorRT-LLM (max NVIDIA throughput, compile step).
- **Speculative decoding:** a small draft proposes k tokens; the target verifies all
  k in one pass (rejection sampling preserves the target's distribution); accepted
  prefix is kept. Exploits decode's spare compute. Draft must be much cheaper than
  target; gains depend on acceptance rate. Variants: Medusa/EAGLE/MTP.
  *Visual:* SpeculativeDecoding (acceptance-rate slider).

### 10.4 Part 4 — Inference: hardware
- **The GPU:** SMs with tensor cores; memory hierarchy — HBM (large, ~TB/s) vs
  SRAM (tiny, ~10× faster). *Visual:* GpuFloorplan + memory pyramid.
- **GEMM on tensor cores:** matmul is the workhorse (Q/K/V, FFN, LM head); tiled;
  native FP16/FP8/FP4. *Visual:* GemmTiling.
- **FlashAttention:** fuse QK→softmax→·V and tile through SRAM with an online
  (streaming) softmax; never materialize the n×n matrix → O(n) HBM traffic instead
  of O(n²). *Visual:* FlashAttention (naive-vs-fused).
- **Roofline / arithmetic intensity:** FLOPs-per-byte vs hardware's compute:bandwidth
  ratio decides the bottleneck. Prefill = compute-bound; decode at batch 1 =
  memory-bound; **batching raises decode's arithmetic intensity** toward the compute
  roof. *Visual:* Roofline (drag batch size → operating point moves).
- **Parallelism:** TP (shard matrices, all-reduce per layer, NVLink-bound), PP
  (split by layers, pipeline bubbles), EP (distribute experts, all-to-all routing).
  *Visual:* Parallelism.
- **Why bandwidth rules:** `tok/s ≈ memory_bandwidth ÷ bytes-read-per-token`; hence
  unified-memory machines win on capacity for big models, and MoE flies because only
  active params are read. Closes back to Part 2's memory math.

### 10.5 Part 5 — Synthesis
- Replay the opening prompt traversing the entire stack the reader just learned,
  top to bottom, now fully legible. Optional `ConfigSandbox`: pick model + quant +
  GPU → estimated VRAM + tok/s (reuse `memory.ts`/`quant.ts`).

---

## 11. Verification

### 11.1 Automated checks (agent runs after every milestone)
Define these scripts in `package.json`:
- `bun run dev` — Astro dev server.
- `bun run build` — static build; must succeed.
- `bun run typecheck` — `tsc --noEmit` (strict).
- `bun run lint` — `biome check`.
- `bun run test` — `vitest run`.
- `bun run check` — runs typecheck + lint + test (the green-bar gate; Invariant I1).
Add a tiny `encoding` guard to `check`: grep components for hardcoded hex
(`#[0-9a-fA-F]{3,6}`) outside `tokens.css`/`encoding.ts` and fail if found (I3).

### 11.2 Human visual QA (agent maintains `QA.md`, does NOT self-certify)
For each part/interactive, list the things only a human can confirm, e.g.:
- AttentionFan: do the heads show *distinct, sensible* patterns? Is high weight
  clearly warmer/thicker? Does click + arrow-key feel right?
- FloatExploder: do field boundaries match the format? Does BF16-vs-FP16 read clearly?
- QuantizationSlider: does the histogram visibly stair-step? Are size/quality
  readouts believable and clearly labeled illustrative?
- PrefillDecode: is the parallel-vs-loop distinction obvious? Does "no cache" feel
  wasteful? Does reduced-motion fallback still teach?
- Spine: does scrolling *feel* like a descent? Is the rail legible and accurate?
Keep `QA.md` current each milestone; reference `dev/*` sandbox routes for review.

---

## 12. Non-goals (explicitly out of scope for now)

- No backend, database, auth, accounts, or analytics.
- No CMS; content lives in MDX in-repo.
- No i18n/localization.
- No deployment/hosting/CI pipeline config (build must produce static output, but
  wiring a host is out).
- No pixel-perfect mobile design (must not break on mobile, but desktop-first).
- 3D visuals are optional polish only; never block a milestone on them.
- Copy should be solid and technically correct, but final editorial polish is not a
  gate — flag rough copy in `QA.md`.

---

## 13. Definition of done

- M0–M9 complete; all Acceptance criteria met; all Invariants hold.
- `bun run check` green; `bun run build` produces a deployable static bundle.
- All six parts read top-to-bottom as one coherent descent, each anchored by its
  signature interactive; the four signature sandboxes are polished and tested.
- Landing + one representative part score ≥ 90 Performance and Accessibility
  (Lighthouse desktop).
- `QA.md` enumerates the human-eyeball items; `DECISIONS.md` records any choices not
  fixed by this spec.

---

## 14. Kickoff

Suggested invocation:

```
/goal Build the project described in inference-explainer-GOAL.md. Execute milestone
by milestone (M0→M9), enforce the Invariants (§7) after each, run `bun run check`
and commit per milestone, and STOP at the M3 checkpoint for review before
continuing.
```

Start with **M0**. Do not skip Acceptance criteria. When unsure, choose the simplest
green option and record it in `DECISIONS.md`.
