import { describe, expect, it } from "vitest";
import { PARTS } from "../src/lib/parts";

describe("descent spine", () => {
  it("defines all six reachable parts in order", () => {
    expect(PARTS.map((part) => part.index)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(PARTS.map((part) => part.slug)).toEqual([
      "0-hook",
      "1-transformer",
      "2-weights",
      "3-software",
      "4-hardware",
      "5-synthesis",
    ]);
  });
});
