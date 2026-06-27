# QA Checklist

The agent maintains this file but does not self-certify visual correctness.

## M0 - Scaffold and Spine

- Landing: confirm `/` makes the product and descent path immediately legible.
- Spine: confirm `/parts/0-hook` through `/parts/5-synthesis` are reachable and the rail
  marks the current part.
- ScrollScene: confirm each placeholder scene advances while scrolling, and arrow keys move
  focus between narration steps.
- Reduced motion: confirm OS/browser reduced-motion mode removes tweened movement without
  breaking layout.
- Mobile: confirm the rail moves to the bottom and does not cover essential content.

## Upcoming Signature Sandboxes

- AttentionFan: inspect `/dev/attention`; confirm the three heads show distinct patterns,
  high-weight lines read warmer/thicker, click and arrow-key query changes feel coherent,
  and reduced-motion mode removes tweening without losing the fan relationship.
- FloatExploder: pending M2.
- QuantizationSlider: pending M2.
- PrefillDecode: pending M3.
