import { describe, expect, it } from "vitest";
import { chooseAction } from "./engine";
import { getAdaptiveDecision } from "./adaptation";
import type { DayRecord, Resources } from "./engine";
import type { CrossRunMemory } from "./learning";

const drySpellRecord: DayRecord = {
  day: 3,
  observation: "Water supply was exposed to a dry spell.",
  action: "forage",
  explanation: "The agent gathered food.",
  event: {
    name: "Dry spell",
    description: "Hot weather reduced available water.",
    effects: { water: -3 },
  },
  resourcesBefore: {
    food: 10,
    water: 11,
    shelter: 60,
    health: 90,
  },
  resourcesAfter: {
    food: 14,
    water: 7,
    shelter: 58,
    health: 88,
  },
  alive: true,
  mode: "baseline",
  baselineAction: "forage",
  diagnoses: [],
  strategyAdjustment: null,
};

describe("Evidence-based adaptation", () => {

  it("prioritizes food collection after food stress when shelter also needs repair", () => {
    const resources: Resources = {
      food: 6,
      water: 12,
      shelter: 25,
      health: 90,
    };

    const foodStressRecord: DayRecord = {
      ...drySpellRecord,
      event: {
        name: "Food loss",
        description: "An unexpected event reduced food supplies.",
        effects: { food: -3 },
      },
      resourcesAfter: {
        food: 7,
        water: 11,
        shelter: 58,
        health: 88,
      },
    };

    const baseline = chooseAction(resources);
    const decision = getAdaptiveDecision(
      resources,
      [foodStressRecord],
      baseline,
    );

    expect(baseline).toBe("repair-shelter");
    expect(decision.action).toBe("forage");
    expect(decision.diagnoses).toContain(
      "Recent food shortages or food losses justify earlier food collection.",
    );
    expect(decision.strategyAdjustment).not.toBeNull();
  });

  it("follows baseline behavior when no history indicates additional risk", () => {
    const resources: Resources = {
      food: 10,
      water: 6,
      shelter: 60,
      health: 90,
    };

    const baseline = chooseAction(resources);
    const decision = getAdaptiveDecision(resources, [], baseline);

    expect(decision.action).toBe(baseline);
    expect(decision.strategyAdjustment).toBeNull();
    expect(decision.diagnoses).toEqual([]);
  });

  it("raises the water threshold after recorded water stress", () => {
    const resources: Resources = {
      food: 10,
      water: 6,
      shelter: 60,
      health: 90,
    };

    const baseline = chooseAction(resources);
    const decision = getAdaptiveDecision(
      resources,
      [drySpellRecord],
      baseline,
    );

    expect(baseline).toBe("forage");
    expect(decision.action).toBe("collect-water");
    expect(decision.diagnoses.length).toBeGreaterThan(0);
    expect(decision.explanation).toContain("threshold from 4 to 8");
    expect(decision.strategyAdjustment).not.toBeNull();
  });

  it("does not change the baseline when water is above the adjusted threshold", () => {
    const resources: Resources = {
      food: 10,
      water: 12,
      shelter: 60,
      health: 90,
    };

    const baseline = chooseAction(resources);
    const decision = getAdaptiveDecision(
      resources,
      [drySpellRecord],
      baseline,
    );

    expect(decision.action).toBe(baseline);
    expect(decision.strategyAdjustment).toBeNull();
    expect(decision.diagnoses).toContain(
      "Recent water shortages or damaging water events justify a larger reserve.",
    );
  });

  it("only uses the five most recent records for diagnosis", () => {
    const oldRisk = {
      ...drySpellRecord,
      day: 1,
    };

    const safeRecord: DayRecord = {
      ...drySpellRecord,
      event: null,
      resourcesAfter: {
        food: 20,
        water: 20,
        shelter: 70,
        health: 80,
      },
    };

    const resources: Resources = {
      food: 10,
      water: 6,
      shelter: 60,
      health: 90,
    };

    const baseline = chooseAction(resources);
    const decision = getAdaptiveDecision(
      resources,
      [
        oldRisk,
        safeRecord,
        safeRecord,
        safeRecord,
        safeRecord,
        safeRecord,
      ],
      baseline,
    );

    expect(decision.action).toBe(baseline);
    expect(decision.diagnoses).toEqual([]);
  });

  it("uses repeated cross-run water evidence to raise the water threshold", () => {
    const resources: Resources = {
      food: 10,
      water: 6,
      shelter: 60,
      health: 90,
    };

    const memory: CrossRunMemory = {
      sourceExperimentCount: 2,
      analyzedExperimentIds: ["adaptive-1", "adaptive-2"],
      resourceRiskCounts: {
        food: 0,
        water: 2,
        shelter: 0,
        health: 0,
      },
      resourceRisks: [
        { resource: "water", experimentCount: 2, totalExperiments: 2 },
      ],
      lessons: [
        "Water reached a critical level in 2 of 2 recent adaptive experiment(s) (100%).",
      ],
    };

    const decision = getAdaptiveDecision(
      resources,
      [],
      chooseAction(resources),
      memory,
    );

    expect(decision.action).toBe("collect-water");
    expect(decision.explanation).toContain(
      "prior adaptive experiments",
    );
    expect(decision.diagnoses).toContain(
      "Cross-run evidence: water reached a critical level in multiple recent adaptive experiments.",
    );
  });

  it("does not activate a cross-run threshold from only one risky experiment", () => {
    const resources: Resources = {
      food: 10,
      water: 6,
      shelter: 60,
      health: 90,
    };

    const memory: CrossRunMemory = {
      sourceExperimentCount: 1,
      analyzedExperimentIds: ["adaptive-1"],
      resourceRiskCounts: {
        food: 0,
        water: 1,
        shelter: 0,
        health: 0,
      },
      resourceRisks: [
        { resource: "water", experimentCount: 1, totalExperiments: 1 },
      ],
      lessons: [
        "Water reached a critical level in 1 of 1 recent adaptive experiment(s) (100%).",
      ],
    };

    const decision = getAdaptiveDecision(
      resources,
      [],
      chooseAction(resources),
      memory,
    );

    expect(decision.action).toBe("forage");
    expect(decision.explanation).not.toContain(
      "prior adaptive experiments",
    );
    expect(decision.diagnoses).toEqual([]);
  });

  it("keeps current-run evidence active when cross-run memory is absent", () => {
    const resources: Resources = {
      food: 10,
      water: 6,
      shelter: 60,
      health: 90,
    };

    const decision = getAdaptiveDecision(
      resources,
      [drySpellRecord],
      chooseAction(resources),
    );

    expect(decision.action).toBe("collect-water");
    expect(decision.diagnoses).toContain(
      "Recent water shortages or damaging water events justify a larger reserve.",
    );
  });

});
