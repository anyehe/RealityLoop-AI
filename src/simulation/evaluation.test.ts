
import { describe, expect, it } from "vitest";
import { compareStrategies } from "./comparison";
import { evaluateStrategy } from "./evaluation";

describe("strategy evaluation metrics", () => {


  it("reports the minimum resource levels including the initial state", () => {
    const result = compareStrategies();

    expect(evaluateStrategy(result.baseline).minimumResources).toEqual({
      food: 12,
      water: 1,
      shelter: 25,
      health: 26,
    });

    expect(evaluateStrategy(result.adaptive).minimumResources).toEqual({
      food: 12,
      water: 2,
      shelter: 27,
      health: 26,
    });
  });


  it("counts days at or below each safety threshold", () => {
    const result = compareStrategies();

    expect(
      evaluateStrategy(result.baseline).daysAtOrBelowThreshold,
    ).toEqual({
      food: 0,
      water: 12,
      shelter: 1,
      health: 3,
    });

    expect(
      evaluateStrategy(result.adaptive).daysAtOrBelowThreshold,
    ).toEqual({
      food: 0,
      water: 1,
      shelter: 0,
      health: 3,
    });
  });



  it("counts every recorded action", () => {
    const result = compareStrategies();

    for (const strategy of [result.baseline, result.adaptive]) {
      const evaluation = evaluateStrategy(strategy);

      expect(
        Object.values(evaluation.actionCounts).reduce(
          (sum, count) => sum + count,
          0,
        ),
      ).toBe(strategy.decisions);
    }

    expect(evaluateStrategy(result.baseline).actionCounts).toEqual({
      forage: 16,
      "collect-water": 7,
      "repair-shelter": 5,
      rest: 1,
    });

    expect(evaluateStrategy(result.adaptive).actionCounts).toEqual({
      forage: 15,
      "collect-water": 7,
      "repair-shelter": 6,
      rest: 1,
    });
  });


  it("includes the actual starting resources in minimums for stress scenarios", () => {
    const result = compareStrategies();

    const stressedBaseline = {
      ...result.baseline,
      state: {
        ...result.baseline.state,
        records: [],
        resources: {
          food: 3,
          water: 2,
          shelter: 10,
          health: 20,
        },
      },
      finalResources: {
        food: 3,
        water: 2,
        shelter: 10,
        health: 20,
      },
    };

    expect(evaluateStrategy(stressedBaseline).minimumResources).toEqual({
      food: 3,
      water: 2,
      shelter: 10,
      health: 20,
    });
  });

});
