
import {
  INITIAL_STATE,
  advanceDay,
  type Resources,
  type SimulationState,
} from "./engine";
import { advanceAdaptiveDay } from "./adaptiveEngine";
import type { SavedExperiment } from "./storage";

export type StrategyResult = {
  mode: "baseline" | "adaptive";
  survived: boolean;
  finalDay: number;
  decisions: number;
  finalResources: Resources;
  state: SimulationState;
};

export type StrategyComparison = {
  baseline: StrategyResult;
  adaptive: StrategyResult;
  adaptiveSurvivalAdvantage: number;
  resourceDifferences: Resources;
  differentDecisionCount: number;
};

function runStrategy(
  mode: "baseline" | "adaptive",
  initialResources: Resources = INITIAL_STATE.resources,
  priorExperiments: SavedExperiment[] = [],
): StrategyResult {
  let state: SimulationState = {
    ...INITIAL_STATE,
    resources: { ...initialResources },
    history: [...INITIAL_STATE.history],
    records: [],
  };

  while (state.alive && state.day < 30) {
    state =
      mode === "adaptive"
        ? advanceAdaptiveDay(state, priorExperiments)
        : advanceDay(state);
  }

  return {
    mode,
    survived: state.alive && state.day >= 30,
    finalDay: state.day,
    decisions: state.records.length,
    finalResources: { ...state.resources },
    state,
  };
}

export function compareStrategies(
  initialResources: Resources = INITIAL_STATE.resources,
): StrategyComparison {
  const baseline = runStrategy("baseline", initialResources);
  const adaptive = runStrategy("adaptive", initialResources);

  const resourceDifferences: Resources = {
    food:
      adaptive.finalResources.food - baseline.finalResources.food,
    water:
      adaptive.finalResources.water - baseline.finalResources.water,
    shelter:
      adaptive.finalResources.shelter - baseline.finalResources.shelter,
    health:
      adaptive.finalResources.health - baseline.finalResources.health,
  };

  const differentDecisionCount = adaptive.state.records.filter(
    (record, index) =>
      record.action !== baseline.state.records[index]?.action,
  ).length;

  return {
    baseline,
    adaptive,
    adaptiveSurvivalAdvantage:
      Number(adaptive.survived) - Number(baseline.survived),
    resourceDifferences,
    differentDecisionCount,
  };
}


export type LearningEffectComparison = {
  baseline: StrategyResult;
  adaptiveWithoutMemory: StrategyResult;
  adaptiveWithMemory: StrategyResult;
  survivalDayDifference: number;
  survivalStatusDifference: number;
  resourceDifferences: Resources;
  differentDecisionCount: number;
};

/**
 * Separates the adaptive strategy's within-run behavior from the effect of
 * supplying lessons from prior completed adaptive experiments. All three runs
 * use the same initial resources and deterministic event schedule.
 */
export function compareLearningEffect(
  initialResources: Resources = INITIAL_STATE.resources,
  priorExperiments: SavedExperiment[] = [],
): LearningEffectComparison {
  const baseline = runStrategy("baseline", initialResources);
  const adaptiveWithoutMemory = runStrategy("adaptive", initialResources);
  const adaptiveWithMemory = runStrategy(
    "adaptive",
    initialResources,
    priorExperiments,
  );

  const resourceDifferences: Resources = {
    food: adaptiveWithMemory.finalResources.food - adaptiveWithoutMemory.finalResources.food,
    water: adaptiveWithMemory.finalResources.water - adaptiveWithoutMemory.finalResources.water,
    shelter: adaptiveWithMemory.finalResources.shelter - adaptiveWithoutMemory.finalResources.shelter,
    health: adaptiveWithMemory.finalResources.health - adaptiveWithoutMemory.finalResources.health,
  };

  const sharedRecordCount = Math.min(
    adaptiveWithoutMemory.state.records.length,
    adaptiveWithMemory.state.records.length,
  );
  let differentDecisionCount = 0;

  for (let index = 0; index < sharedRecordCount; index += 1) {
    if (
      adaptiveWithoutMemory.state.records[index]?.action !==
      adaptiveWithMemory.state.records[index]?.action
    ) {
      differentDecisionCount += 1;
    }
  }

  return {
    baseline,
    adaptiveWithoutMemory,
    adaptiveWithMemory,
    survivalDayDifference: adaptiveWithMemory.finalDay - adaptiveWithoutMemory.finalDay,
    survivalStatusDifference:
      Number(adaptiveWithMemory.survived) -
      Number(adaptiveWithoutMemory.survived),
    resourceDifferences,
    differentDecisionCount,
  };
}


export type StressScenario = {
  id: string;
  label: string;
  description: string;
  initialResources: Resources;
};

export type StressScenarioResult = StressScenario & {
  comparison: StrategyComparison;
};

/**
 * Repeat the controlled comparison under different starting-resource pressures.
 * Environmental events remain deterministic and identical within each pair.
 */
export function evaluateStressScenarios(): StressScenarioResult[] {
  const scenarios: StressScenario[] = [
    {
      id: "standard",
      label: "Standard start",
      description: "The default starting resource levels.",
      initialResources: { ...INITIAL_STATE.resources },
    },
    {
      id: "water-stress",
      label: "Water stress",
      description: "Starts with reduced water reserves.",
      initialResources: { ...INITIAL_STATE.resources, water: 8 },
    },
    {
      id: "shelter-stress",
      label: "Shelter stress",
      description: "Starts with reduced shelter durability.",
      initialResources: { ...INITIAL_STATE.resources, shelter: 48 },
    },
    {
      id: "combined-stress",
      label: "Combined stress",
      description: "Starts with reduced water and shelter reserves.",
      initialResources: {
        ...INITIAL_STATE.resources,
        water: 8,
        shelter: 48,
      },
    },
  ];

  return scenarios.map((scenario) => ({
    ...scenario,
    comparison: compareStrategies(scenario.initialResources),
  }));
}
