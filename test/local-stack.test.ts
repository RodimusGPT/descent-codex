import { describe, expect, it } from "vitest";
import { selectLocalStack } from "../src/lib/local-stack";

describe("local stack selector", () => {
  it("routes a solo small-model setup to the desktop local pattern", () => {
    const recommendation = selectLocalStack({
      builder: "solo",
      concurrency: "single",
      hardware: "desktop-gpu",
      model: "small",
      privacy: "local-required",
    });

    expect(recommendation.id).toBe("desktop-lab");
    expect(recommendation.fit).toBe("fits");
  });

  it("rejects a 70B-class model on a mini system", () => {
    const recommendation = selectLocalStack({
      builder: "team",
      concurrency: "team",
      hardware: "mini",
      model: "large",
      privacy: "local-required",
    });

    expect(recommendation.id).toBe("large-reframe");
    expect(recommendation.fit).toBe("reframe");
  });

  it("routes company service traffic to a managed on-prem service", () => {
    const recommendation = selectLocalStack({
      builder: "company",
      concurrency: "service",
      hardware: "server",
      model: "mid",
      privacy: "local-required",
    });

    expect(recommendation.id).toBe("managed-fleet");
    expect(recommendation.operations).toContain("auth");
  });

  it("treats frontier-scale models as a workload reframing problem", () => {
    const recommendation = selectLocalStack({
      builder: "solo",
      concurrency: "single",
      hardware: "workstation",
      model: "frontier",
      privacy: "flexible",
    });

    expect(recommendation.id).toBe("frontier-reframe");
    expect(recommendation.fit).toBe("reframe");
  });
});
