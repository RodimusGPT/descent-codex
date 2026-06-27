# QA Checklist

The agent maintains this file but does not self-certify visual correctness.

## M0 - Scaffold and Spine

- Landing: confirm `/` makes the product and descent path immediately legible.
- Spine: confirm `/parts/0-hook` through `/parts/5-synthesis` are reachable and the rail
  marks the current part.
- Navigation: confirm the top nav, landing actions, part map, and previous/next links make it
  obvious how to move through the descent.
- Layout flow: confirm scrollytelling steps read on the left with the sticky visual on the right,
  and that sandbox pages scan as intro, controls, visual, then readouts.
- Color contrast: confirm light and dark mode keep active states, token pills, muted labels, and
  review navigation readable against their backgrounds.
- Theme: confirm the header theme toggle switches light/dark mode and preserves readable
  contrast across landing, part, and review pages.
- ScrollScene primitive: keep available for future scrollytelling sections; if reused, confirm
  scrolling advances steps and arrow keys move focus between narration steps.
- Reduced motion: confirm OS/browser reduced-motion mode removes tweened movement and autoplay
  without breaking layout.
- Mobile: confirm the rail moves to the bottom and does not cover essential content.

## Upcoming Signature Sandboxes

- Part 1: inspect `/parts/1-transformer`; confirm the tokenizer, embeddings, stack, attention,
  Q/K/V, MoE, sampling, and autoregression sections read as one transformer narrative.
- Tokenizer: inspect `/dev/tokenizer`; confirm edits split into clear token pieces and IDs.
- EmbeddingSpace: inspect `/dev/embedding`; confirm clusters are legible and point selection is
  obvious.
- TransformerStack: inspect `/dev/stack`; confirm the repeated layer structure is easy to scan.
- AttentionFan: inspect `/dev/attention`; confirm the three heads show distinct patterns,
  high-weight lines read warmer/thicker, click and arrow-key query changes feel coherent,
  and reduced-motion mode removes tweening without losing the fan relationship.
- QKVMultiHead: inspect `/dev/qkv`; confirm head switching changes score emphasis.
- MoERouter: inspect `/dev/moe`; confirm top-k routing makes active vs idle experts clear.
- SamplingPlayground: inspect `/dev/sampling`; confirm temperature/top-k/top-p controls and the
  autoregressive loop are understandable.
- Part 2: inspect `/parts/2-weights`; confirm weight zoom, float formats, quantization, memory
  math, MXFP4/NVFP4 detail, and distillation read as one number-representation narrative.
- WeightZoom: inspect `/dev/weight-zoom`; confirm model-to-weight scale is clear.
- FloatExploder: inspect `/dev/float`; confirm bit boundaries match FP32, FP16, and BF16,
  toggling bits feels direct, and the BF16-vs-FP16 exponent/mantissa tradeoff is clear.
- QuantizationSlider: inspect `/dev/quant`; confirm the histogram visibly stair-steps as
  precision drops, and the size/quality readouts feel believable and clearly illustrative.
- MemoryBudget: inspect `/dev/memory-budget`; confirm weights vs KV cache vs overhead are legible
  and context length visibly affects the budget.
- Part 3: inspect `/parts/3-software`; confirm prefill/decode, batching, PagedAttention, engines,
  and speculative decoding read as one serving narrative.
- PrefillDecode: inspect `/dev/prefill`; confirm the parallel-vs-loop distinction is obvious,
  the no-cache toggle reads as wasteful recompute, the KV grid fills cell-by-cell, and
  reduced-motion mode still teaches through stepped states.
- BatchingTimeline: inspect `/dev/batching`; confirm continuous vs windowed admission makes wait
  time and active batch occupancy easy to compare.
- PagedAttention: inspect `/dev/paged-attention`; confirm logical tokens, block table entries, tail
  waste, and prefix sharing read as one cache-allocation model.
- SpeculativeDecoding: inspect `/dev/speculative`; confirm draft size and acceptance rate visibly
  affect accepted tokens and speedup.
- Part 4: inspect `/parts/4-hardware`; confirm GPU memory hierarchy, GEMM tiling,
  FlashAttention, roofline, and parallelism read as one hardware narrative.
- GpuFloorplan: inspect `/dev/gpu-floorplan`; confirm SMs, tensor cores, HBM, L2, and
  memory hierarchy are visually distinct.
- GemmTiling: inspect `/dev/gemm-tiling`; confirm tile-size controls change tile count and
  edge tiles remain visible.
- FlashAttention: inspect `/dev/flash-attention`; confirm naive vs fused traffic comparison is
  legible and sequence length changes the HBM readout.
- Roofline: inspect `/dev/roofline`; confirm dragging batch size moves the point from the
  bandwidth slope toward the compute roof.
- Parallelism: inspect `/dev/parallelism`; confirm TP, PP, and EP show different communication
  patterns clearly.
- Part 0: inspect `/parts/0-hook`; confirm the prompt-to-token hook immediately explains
  autoregressive next-token generation.
- PromptToken: inspect `/dev/prompt-token`; confirm prompt edits and temperature changes update
  tokenization, candidate probabilities, and selected token clearly.
- Part 5: inspect `/parts/5-synthesis`; confirm the replay ties text, model, numbers, software,
  hardware, and output into one loop.
- FullStackReplay: inspect `/dev/full-stack`; confirm step controls move through the descent in
  order and the active panel is obvious.
- ConfigSandbox: inspect `/dev/config`; confirm model, quant, GPU, and context controls update
  fit status, memory totals, and throughput estimate.
- Lighthouse: automated desktop run on June 27, 2026 passed `/` at Performance 96 /
  Accessibility 100 and `/parts/1-transformer/` at Performance 92 / Accessibility 100.
- Review hub: inspect `/dev/`; confirm the sandbox list and per-sandbox side navigation make the
  review flow clear.

## Post-M9 Content Audit

- Content: confirm the running prompt `The GPU keeps KV cache ready for` is easy to follow from
  Part 0 through Part 5 and that the new Part 5 recap table clarifies behavior-changing choices
  versus serving-efficiency choices.
- Demo framing: confirm tokenizer, prompt-token, sampling, config, and roofline copy clearly mark
  simplified teaching estimates without making the pages feel caveated to death.
- Automated checks on June 27, 2026: `bun run check` passed, `bun run build` passed, and route
  smokes returned 200 for `/parts/0-hook/` through `/parts/5-synthesis/` plus the changed `/dev`
  sandboxes.
