
import { describe, expect, it } from "vitest";
import type { DayRecord, Resources } from "./engine";
import type { SavedExperiment } from "./storage";
import { buildCrossRunMemory } from "./learning";

const SAFE_RESOURCES: Resources = {
  food: 10,
  water: 10,
  shelter: 60,
  health: 90,
};

function makeRecord(
  resourcesAfter: Resources,
  day = 1,
): DayRecord {
  return {
    day,
    observation: "Test observation",
    action: "forage",
    explanation: "Test decision",
    event: null,
    resourcesBefore: SAFE_RESOURCES,
    resourcesAfter,
    alive: true,
    mode: "adaptive",
    baselineAction: "forage",
    diagnoses: [],
    strategyAdjustment: null,
  };
}

function makeExperiment(
  id: string,
  mode: "baseline" | "adaptive",
  records: DayRecord[],
): SavedExperiment {
  const lastRecord = records.at(-1);

  return {
    id,
    completedAt: "2026-10-25T00:00:00.000Z",
    mode,
    finalDay: lastRecord?.day ?? 1,
    survived: true,
    finalResources: lastRecord?.resourcesAfter ?? SAFE_RESOURCES,
    records,
    lessons: [],
  };
}

describe("buildCrossRunMemory", () => {
  it("returns empty evidence when there is no experiment history", () => {
    const memory = buildCrossRunMemory([]);

    expect(memory.sourceExperimentCount).toBe(0);
    expect(memory.resourceRisks).toEqual([]);
    expect(memory.lessons).toEqual([]);
  });

  it("does not learn from baseline experiments", () => {
    const baseline = makeExperiment("baseline-1", "baseline", [
      makeRecord({ ...SAFE_RESOURCES, water: 2 }),
    ]);

    const memory = buildCrossRunMemory([baseline]);

    expect(memory.sourceExperimentCount).toBe(0);
    expect(memory.resourceRiskCounts.water).toBe(0);
  });

  it("identifies resource-specific risk from recorded outcomes", () => {
    const experiment = makeExperiment("adaptive-1", "adaptive", [
      makeRecord({ ...SAFE_RESOURCES, water: 4 }),
      makeRecord({ ...SAFE_RESOURCES, water: 3, food: 4 }, 2),
    ]);

    const memory = buildCrossRunMemory([experiment]);

    expect(memory.resourceRiskCounts.water).toBe(1);
    expect(memory.resourceRiskCounts.food).toBe(1);
    expect(memory.resourceRiskCounts.shelter).toBe(0);
    expect(memory.resourceRiskCounts.health).toBe(0);
    expect(memory.resourceRisks).toHaveLength(2);
  });

  it("counts each resource only once per experiment", () => {
    const experiment = makeExperiment("adaptive-1", "adaptive", [
      makeRecord({ ...SAFE_RESOURCES, water: 4 }, 1),
      makeRecord({ ...SAFE_RESOURCES, water: 3 }, 2),
      makeRecord({ ...SAFE_RESOURCES, water: 2 }, 3),
    ]);

    const memory = buildCrossRunMemory([experiment]);

    expect(memory.resourceRiskCounts.water).toBe(1);
  });

  it("uses only the three most recent adaptive experiments by default", () => {
    const experiments = [
      makeExperiment("old-risk", "adaptive", [
        makeRecord({ ...SAFE_RESOURCES, food: 1 }),
      ]),
      makeExperiment("baseline-risk", "baseline", [
        makeRecord({ ...SAFE_RESOURCES, water: 1 }),
      ]),
      makeExperiment("adaptive-2", "adaptive", [
        makeRecord(SAFE_RESOURCES),
      ]),
      makeExperiment("adaptive-3", "adaptive", [
        makeRecord(SAFE_RESOURCES),
      ]),
      makeExperiment("adaptive-4", "adaptive", [
        makeRecord(SAFE_RESOURCES),
      ]),
      makeExperiment("adaptive-5", "adaptive", [
        makeRecord(SAFE_RESOURCES),
      ]),
    ];

    const memory = buildCrossRunMemory(experiments);

    expect(memory.analyzedExperimentIds).toEqual([
      "adaptive-3",
      "adaptive-4",
      "adaptive-5",
    ]);
    expect(memory.resourceRiskCounts.food).toBe(0);
    expect(memory.resourceRiskCounts.water).toBe(0);
  });

  it("reports how frequently a resource became critical", () => {
    const experiments = [
      makeExperiment("adaptive-1", "adaptive", [
        makeRecord({ ...SAFE_RESOURCES, shelter: 20 }),
      ]),
      makeExperiment("adaptive-2", "adaptive", [
        makeRecord(SAFE_RESOURCES),
      ]),
    ];

    const memory = buildCrossRunMemory(experiments);

    expect(memory.resourceRiskCounts.shelter).toBe(1);
    expect(memory.lessons).toContain(
      "Shelter reached a critical level in 1 of 2 recent adaptive experiment(s) (50%).",
    );
  });

  it("does not classify safe recorded resources as critical", () => {
    const experiment = makeExperiment("adaptive-safe", "adaptive", [
      makeRecord(SAFE_RESOURCES),
    ]);

    const memory = buildCrossRunMemory([experiment]);

    expect(memory.resourceRisks).toEqual([]);
    expect(memory.lessons).toEqual([]);
  });
});
