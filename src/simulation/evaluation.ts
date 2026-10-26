
import { type AgentAction, type Resources } from "./engine";
import type { StrategyResult } from "./comparison";

export const RESOURCE_THRESHOLDS: Resources = {
  food: 5,
  water: 5,
  shelter: 25,
  health: 30,
};

export type StrategyEvaluation = {
  minimumResources: Resources;
  daysAtOrBelowThreshold: Resources;
  actionCounts: Record<AgentAction, number>;
};

const ACTIONS: AgentAction[] = [
  "forage",
  "collect-water",
  "repair-shelter",
  "rest",
];

export function evaluateStrategy(
  strategy: StrategyResult,
): StrategyEvaluation {
  const records = strategy.state.records;
  // Include the starting state so the metrics cover the entire scenario.
  const startingResources =
  records.length > 0
    ? records[0].resourcesBefore
    : strategy.state.resources;

  const resourceSnapshots = [
    startingResources,
    ...records.map((record) => record.resourcesAfter),
  ];

  const minimumResources = {} as Resources;
  const daysAtOrBelowThreshold = {} as Resources;

  for (const resource of Object.keys(
    RESOURCE_THRESHOLDS,
  ) as (keyof Resources)[]) {
      const initialResources = strategy.state.records.length > 0
    ? strategy.state.records[0].resourcesBefore
    : strategy.state.resources;

  minimumResources[resource] = Math.min(
    initialResources[resource],
    ...records.map((record) => record.resourcesAfter[resource]),
  );

    daysAtOrBelowThreshold[resource] = resourceSnapshots.filter(
      (snapshot) => snapshot[resource] <= RESOURCE_THRESHOLDS[resource],
    ).length;
  }

  const actionCounts = Object.fromEntries(
    ACTIONS.map((action) => [
      action,
      records.filter((record) => record.action === action).length,
    ]),
  ) as Record<AgentAction, number>;

  return {
    minimumResources,
    daysAtOrBelowThreshold,
    actionCounts,
  };
}
