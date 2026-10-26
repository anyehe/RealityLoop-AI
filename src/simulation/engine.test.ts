import { describe, expect, it } from "vitest";
import {
  advanceDay,
  getEnvironmentalEvent,
  INITIAL_STATE,
  chooseAction,
} from "./engine";

describe("RealityLoop survival simulation", () => {
  it("starts on day 1 with the expected initial resources", () => {
    expect(INITIAL_STATE.day).toBe(1);
    expect(INITIAL_STATE.resources).toEqual({
      food: 12,
      water: 12,
      shelter: 65,
      health: 100,
    });
    expect(INITIAL_STATE.alive).toBe(true);
  });

  it("prioritizes collecting water when water is critically low", () => {
    expect(
      chooseAction({
        food: 50,
        water: 4,
        shelter: 65,
        health: 100,
      }),
    ).toBe("collect-water");
  });

  it("advances one day and records a history entry", () => {
    const next = advanceDay(INITIAL_STATE);

    expect(next.day).toBe(2);
    expect(next.history.length).toBe(INITIAL_STATE.history.length + 1);
    expect(next.resources.food).toBeGreaterThan(
      INITIAL_STATE.resources.food,
    );
  });

  it("records the agent decision and before-and-after resources", () => {
    const next = advanceDay(INITIAL_STATE);
    const record = next.records[0];

    expect(record).toBeDefined();
    expect(record.day).toBe(2);
    expect(record.action).toBe("forage");
    expect(record.explanation).toContain("gathers food");
    expect(record.resourcesBefore.food).toBe(12);
    expect(record.resourcesAfter.food).toBe(16);
    expect(record.alive).toBe(true);
  });

  it("provides a predictable environmental event on day 3", () => {
    expect(getEnvironmentalEvent(2)).toBeNull();
    expect(getEnvironmentalEvent(3)?.name).toBe("Dry spell");
  });

  it("applies the day 3 event and records its consequences", () => {
    const state = {
      ...INITIAL_STATE,
      day: 2,
      resources: { ...INITIAL_STATE.resources },
      history: [...INITIAL_STATE.history],
      records: [],
    };

    const next = advanceDay(state);
    const record = next.records[0];

    expect(next.day).toBe(3);
    expect(record.event?.name).toBe("Dry spell");
    expect(record.resourcesBefore.water).toBe(12);
    expect(record.resourcesAfter.water).toBe(8);
  });

  it("produces the same outcome from the same starting state", () => {
    const first = advanceDay(INITIAL_STATE);
    const second = advanceDay(INITIAL_STATE);

    expect(first.resources).toEqual(second.resources);
    expect(first.records).toEqual(second.records);
    expect(first.history).toEqual(second.history);
  });

  it("keeps resource values between 0 and 100", () => {
    let state = INITIAL_STATE;

    for (let i = 0; i < 30 && state.alive; i += 1) {
      state = advanceDay(state);

      for (const value of Object.values(state.resources)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });

  it("does not advance a completed or failed simulation", () => {
    const completed = { ...INITIAL_STATE, day: 30 };
    const failed = { ...INITIAL_STATE, alive: false };

    expect(advanceDay(completed)).toBe(completed);
    expect(advanceDay(failed)).toBe(failed);
  });
});
