import { describe, expect, it } from "vitest";
import { advanceAdaptiveDay } from "./adaptiveEngine";
import { chooseAction, INITIAL_STATE } from "./engine";
import type { DayRecord } from "./engine";
import type { SavedExperiment } from "./storage";

const waterStressRecord: DayRecord = {
  day: 3,
  observation: "Water supply was reduced by a dry spell.",
  action: "forage",
  explanation: "The baseline agent gathered food.",
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

describe("Integrated adaptive simulation", () => {
  it("records when adaptation changes the baseline action", () => {
    const state = {
      ...INITIAL_STATE,
      day: 3,
      resources: {
        food: 10,
        water: 6,
        shelter: 60,
        health: 90,
      },
      history: [...INITIAL_STATE.history],
      records: [waterStressRecord],
    };

    const baselineAction = chooseAction(state.resources);
    const next = advanceAdaptiveDay(state);
    const record = next.records[next.records.length - 1];

    expect(baselineAction).toBe("forage");
    expect(record.mode).toBe("adaptive");
    expect(record.baselineAction).toBe("forage");
    expect(record.action).toBe("collect-water");
    expect(record.strategyAdjustment).not.toBeNull();
    expect(record.diagnoses.length).toBeGreaterThan(0);
  });

  it("uses the shared simulation rules and records normal decisions", () => {
    const next = advanceAdaptiveDay(INITIAL_STATE);
    const record = next.records[0];

    expect(next.day).toBe(2);
    expect(record.mode).toBe("adaptive");
    expect(record.baselineAction).toBe("forage");
    expect(record.action).toBe("forage");
    expect(record.strategyAdjustment).toBeNull();
  });

  it("does not advance a completed or failed simulation", () => {
    const completed = { ...INITIAL_STATE, day: 30 };
    const failed = { ...INITIAL_STATE, alive: false };

    expect(advanceAdaptiveDay(completed)).toBe(completed);
    expect(advanceAdaptiveDay(failed)).toBe(failed);
  });

  it("uses repeated saved adaptive experiments in a later run", () => {
    const priorRecord: DayRecord = {
      ...waterStressRecord,
      mode: "adaptive",
      resourcesAfter: {
        food: 14,
        water: 3,
        shelter: 58,
        health: 88,
      },
    };

    const makeExperiment = (id: string): SavedExperiment => ({
      id,
      completedAt: "2026-10-25T00:00:00.000Z",
      mode: "adaptive",
      finalDay: 3,
      survived: true,
      finalResources: { ...priorRecord.resourcesAfter },
      records: [priorRecord],
      lessons: [],
    });

    const state = {
      ...INITIAL_STATE,
      day: 4,
      resources: {
        food: 10,
        water: 6,
        shelter: 60,
        health: 90,
      },
      history: [...INITIAL_STATE.history],
      records: [],
    };

    const next = advanceAdaptiveDay(state, [
      makeExperiment("adaptive-1"),
      makeExperiment("adaptive-2"),
    ]);

    const record = next.records[next.records.length - 1];

    expect(record.action).toBe("collect-water");
    expect(record.explanation).toContain(
      "prior adaptive experiments",
    );
    expect(record.diagnoses).toContain(
      "Cross-run evidence: water reached a critical level in multiple recent adaptive experiments.",
    );
  });

});
