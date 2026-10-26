import { getAdaptiveDecision } from "./adaptation";
import { buildCrossRunMemory } from "./learning";
import type { SavedExperiment } from "./storage";
import {
  advanceDay,
  chooseAction,
  type SimulationState,
} from "./engine";

export function advanceAdaptiveDay(
  state: SimulationState,
  experiments: SavedExperiment[] = [],
): SimulationState {
  if (!state.alive || state.day >= 30) {
    return state;
  }

  const baselineAction = chooseAction(state.resources);
  const crossRunMemory = buildCrossRunMemory(experiments);

  const decision = getAdaptiveDecision(
    state.resources,
    state.records,
    baselineAction,
    crossRunMemory,
  );

  return advanceDay(state, {
    ...decision,
    baselineAction,
  });
}
