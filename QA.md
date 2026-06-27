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
- ScrollScene: confirm each placeholder scene advances while scrolling, and arrow keys move
  focus between narration steps.
- Reduced motion: confirm OS/browser reduced-motion mode removes tweened movement without
  breaking layout.
- Mobile: confirm the rail moves to the bottom and does not cover essential content.

## Upcoming Signature Sandboxes

- AttentionFan: inspect `/dev/attention`; confirm the three heads show distinct patterns,
  high-weight lines read warmer/thicker, click and arrow-key query changes feel coherent,
  and reduced-motion mode removes tweening without losing the fan relationship.
- FloatExploder: inspect `/dev/float`; confirm bit boundaries match FP32, FP16, and BF16,
  toggling bits feels direct, and the BF16-vs-FP16 exponent/mantissa tradeoff is clear.
- QuantizationSlider: inspect `/dev/quant`; confirm the histogram visibly stair-steps as
  precision drops, and the size/quality readouts feel believable and clearly illustrative.
- PrefillDecode: inspect `/dev/prefill`; confirm the parallel-vs-loop distinction is obvious,
  the no-cache toggle reads as wasteful recompute, the KV grid fills cell-by-cell, and
  reduced-motion mode still teaches through stepped states.
- Review hub: inspect `/dev/`; confirm the M0-M3 sandbox list and per-sandbox side navigation
  make the checkpoint flow clear.
