
import { describe, expect, it } from "vitest";
import { compareLearningEffect, compareStrategies, evaluateStressScenarios } from "./comparison";
import type { SavedExperiment } from "./storage";
import type { DayRecord } from "./engine";

describe("strategy comparison", () => {
  it("runs both strategies from the same initial conditions", () => {
    const result = compareStrategies();

    expect(result.baseline.mode).toBe("baseline");
    expect(result.adaptive.mode).toBe("adaptive");

    expect(result.baseline.state.records[0]?.resourcesBefore).toEqual({
      food: 12,
      water: 12,
      shelter: 65,
      health: 100,
    });

    expect(result.adaptive.state.records[0]?.resourcesBefore).toEqual({
      food: 12,
      water: 12,
      shelter: 65,
      health: 100,
    });
  });

  it("reports valid survival and resource outcomes", () => {
    const result = compareStrategies();

    for (const strategy of [result.baseline, result.adaptive]) {
      expect(strategy.finalDay).toBeGreaterThanOrEqual(1);
      expect(strategy.finalDay).toBeLessThanOrEqual(30);
      expect(strategy.decisions).toBe(strategy.state.records.length);
      expect(strategy.survived).toBe(
        strategy.state.alive && strategy.state.day >= 30,
      );

      for (const value of Object.values(strategy.finalResources)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });

  it("produces consistent comparison metrics", () => {
    const result = compareStrategies();

    expect(result.adaptiveSurvivalAdvantage).toBe(
      Number(result.adaptive.survived) -
        Number(result.baseline.survived),
    );

    expect(result.differentDecisionCount).toBe(
      result.adaptive.state.records.filter(
        (record, index) =>
          record.action !== result.baseline.state.records[index]?.action,
      ).length,
    );
  });

  it("does not mutate the initial state", async () => {
    const { INITIAL_STATE } = await import("./engine");
    const before = structuredClone(INITIAL_STATE);

    compareStrategies();

    expect(INITIAL_STATE).toEqual(before);
  });
});


describe("stress scenario evaluation", () => {
  it("evaluates multiple starting-resource conditions", () => {
    const scenarios = evaluateStressScenarios();

    expect(scenarios.map((scenario) => scenario.id)).toEqual([
      "standard",
      "water-stress",
      "shelter-stress",
      "combined-stress",
    ]);

    for (const scenario of scenarios) {
      expect(scenario.comparison.baseline.state.records[0]?.resourcesBefore)
        .toEqual(scenario.initialResources);
      expect(scenario.comparison.adaptive.state.records[0]?.resourcesBefore)
        .toEqual(scenario.initialResources);
    }
  });

  it("uses matching initial conditions for both strategies in every scenario", () => {
    for (const scenario of evaluateStressScenarios()) {
      expect(scenario.comparison.baseline.state.records[0]?.resourcesBefore)
        .toEqual(scenario.comparison.adaptive.state.records[0]?.resourcesBefore);
    }
  });
});


function makeWaterRiskExperiment(id: string): SavedExperiment {
  const record = {
    day: 1,
    observation: "Water reserve was critically low.",
    action: "collect-water",
    explanation: "The agent responded to low water.",
    event: null,
    resourcesBefore: { food: 12, water: 6, shelter: 65, health: 100 },
    resourcesAfter: { food: 12, water: 3, shelter: 65, health: 100 },
    alive: true,
    mode: "adaptive",
    baselineAction: "forage",
    diagnoses: ["Water reached a critical level."],
    strategyAdjustment: "Prioritize water earlier after repeated water stress.",
  } satisfies DayRecord;

  return {
    id,
    completedAt: "2026-10-24T12:00:00.000Z",
    mode: "adaptive",
    finalDay: 30,
    survived: true,
    finalResources: { food: 12, water: 3, shelter: 65, health: 100 },
    records: [record],
    lessons: ["Water reached a critical level."],
  };
}

describe("cross-run learning effect comparison", () => {
  it("uses matching initial resources for all three measured runs", () => {
    const initial = { food: 12, water: 6, shelter: 65, health: 100 };
    const result = compareLearningEffect(initial, [
      makeWaterRiskExperiment("water-risk-1"),
      makeWaterRiskExperiment("water-risk-2"),
    ]);

    for (const strategy of [
      result.baseline,
      result.adaptiveWithoutMemory,
      result.adaptiveWithMemory,
    ]) {
      expect(strategy.state.resources).toBeDefined();
      expect(strategy.state.records[0]?.resourcesBefore).toEqual(initial);
    }
  });

  it("reports measured differences without assuming memory improves outcomes", () => {
    const result = compareLearningEffect(undefined, [
      makeWaterRiskExperiment("water-risk-1"),
      makeWaterRiskExperiment("water-risk-2"),
    ]);

    expect(result.survivalDayDifference).toBe(
      result.adaptiveWithMemory.finalDay - result.adaptiveWithoutMemory.finalDay,
    );
    expect(result.survivalStatusDifference).toBe(
      Number(result.adaptiveWithMemory.survived) -
        Number(result.adaptiveWithoutMemory.survived),
    );
    expect(result.resourceDifferences.water).toBe(
      result.adaptiveWithMemory.finalResources.water -
        result.adaptiveWithoutMemory.finalResources.water,
    );
    expect(result.differentDecisionCount).toBeGreaterThanOrEqual(0);
  });

  it("produces identical adaptive runs when no prior history is supplied", () => {
    const result = compareLearningEffect();

    expect(result.adaptiveWithMemory.state.records.map((record) => record.action)).toEqual(
      result.adaptiveWithoutMemory.state.records.map((record) => record.action),
    );
    expect(result.resourceDifferences).toEqual({
      food: 0, water: 0, shelter: 0, health: 0,
    });
    expect(result.differentDecisionCount).toBe(0);
  });
});
