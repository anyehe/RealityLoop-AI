
import { describe, expect, it } from "vitest";
import {
  STORAGE_VERSION,
  clearLearningHistory,
  createEmptyLearningHistory,
  createSavedExperiment,
  loadLearningHistory,
  saveLearningHistory,
} from "./storage";
import {
  INITIAL_STATE,
  advanceDay,
  type SimulationState,
} from "./engine";

describe("learning history storage", () => {
  it("creates an empty history with the current version", () => {
    expect(createEmptyLearningHistory()).toEqual({
      version: STORAGE_VERSION,
      experiments: [],
    });
  });

  it("saves and restores a completed experiment with its records", () => {
    let simulation: SimulationState = {
      ...INITIAL_STATE,
      resources: { ...INITIAL_STATE.resources },
      history: [...INITIAL_STATE.history],
      records: [],
    };

    while (simulation.alive && simulation.day < 30) {
      simulation = advanceDay(simulation);
    }

    const experiment = createSavedExperiment(simulation, "baseline");

    if (!experiment) {
      throw new Error("Expected the completed simulation to be saved.");
    }

    const history = {
      version: STORAGE_VERSION,
      experiments: [experiment],
      } satisfies import("./storage").LearningHistory;

    const serialized = saveLearningHistory(history);
    const restored = loadLearningHistory(serialized);

    expect(restored).toEqual(history);
    expect(restored.experiments).toHaveLength(1);
    expect(restored.experiments[0].records.length).toBeGreaterThan(0);
  });

  it("returns empty history when no saved data exists", () => {
    expect(loadLearningHistory(null)).toEqual(
      createEmptyLearningHistory(),
    );
  });

  it("handles malformed JSON safely", () => {
    expect(loadLearningHistory("{not valid JSON")).toEqual(
      createEmptyLearningHistory(),
    );
  });

  it("rejects an incompatible storage version", () => {
    expect(
      loadLearningHistory(
        JSON.stringify({ version: 999, experiments: [] }),
      ),
    ).toEqual(createEmptyLearningHistory());
  });

  it("rejects malformed experiment entries", () => {
    expect(
      loadLearningHistory(
        JSON.stringify({
          version: STORAGE_VERSION,
          experiments: [{ id: "broken" }],
        }),
      ),
    ).toEqual(createEmptyLearningHistory());
  });

  it("round-trips an empty history through JSON", () => {
    const history = createEmptyLearningHistory();

    expect(loadLearningHistory(saveLearningHistory(history))).toEqual(
      history,
    );
  });

  it("clears history by creating a fresh empty history", () => {
    expect(clearLearningHistory()).toEqual(
      createEmptyLearningHistory(),
    );
  });
});
