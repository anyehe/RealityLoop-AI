
import type { Resources } from "./engine";
import type { SavedExperiment } from "./storage";


export type ResourceKey = keyof Resources;

export interface ResourceRiskEvidence {
  resource: ResourceKey;
  experimentCount: number;
  totalExperiments: number;
}

export interface CrossRunMemory {
  sourceExperimentCount: number;
  analyzedExperimentIds: string[];
  resourceRiskCounts: Record<ResourceKey, number>;
  resourceRisks: ResourceRiskEvidence[];
  lessons: string[];
}

/**
 * A resource is considered at risk when a completed adaptive
 * experiment records it at or below the corresponding threshold.
 *
 * These thresholds identify observed stress; they do not prove
 * that a particular action caused the stress.
 */
const RISK_THRESHOLDS: Record<ResourceKey, number> = {
  food: 5,
  water: 5,
  shelter: 30,
  health: 35,
};

const DEFAULT_EXPERIMENT_LIMIT = 3;

function createEmptyCounts(): Record<ResourceKey, number> {
  return {
    food: 0,
    water: 0,
    shelter: 0,
    health: 0,
  };
}

function hasResourceRisk(
  resources: Resources,
  resource: ResourceKey,
): boolean {
  const value = resources[resource];

  return (
    Number.isFinite(value) &&
    value <= RISK_THRESHOLDS[resource]
  );
}

/**
 * Summarizes evidence from the most recent completed adaptive runs.
 *
 * Experiments must be supplied oldest-to-newest, as they are
 * normally stored by the application. Baseline experiments are
 * deliberately excluded.
 *
 * A resource is counted at most once per experiment, even if it
 * remains low across several days.
 */
export function buildCrossRunMemory(
  experiments: SavedExperiment[],
  maxExperiments = DEFAULT_EXPERIMENT_LIMIT,
): CrossRunMemory {
  const limit =
    Number.isFinite(maxExperiments) && maxExperiments > 0
      ? Math.floor(maxExperiments)
      : DEFAULT_EXPERIMENT_LIMIT;

  const recentExperiments = experiments
    .filter(
      (experiment) =>
        experiment.mode === "adaptive" &&
        Array.isArray(experiment.records),
    )
    .slice(-limit);

  const resourceRiskCounts = createEmptyCounts();

  for (const experiment of recentExperiments) {
    const riskyResources = new Set<ResourceKey>();

    for (const record of experiment.records) {
      for (const resource of Object.keys(
        RISK_THRESHOLDS,
      ) as ResourceKey[]) {
        if (hasResourceRisk(record.resourcesAfter, resource)) {
          riskyResources.add(resource);
        }
      }
    }

    for (const resource of riskyResources) {
      resourceRiskCounts[resource] += 1;
    }
  }

  const sourceExperimentCount = recentExperiments.length;

  const resourceRisks = (
    Object.keys(RISK_THRESHOLDS) as ResourceKey[]
  )
    .filter((resource) => resourceRiskCounts[resource] > 0)
    .map((resource) => ({
      resource,
      experimentCount: resourceRiskCounts[resource],
      totalExperiments: sourceExperimentCount,
    }));

  const resourceLabels: Record<ResourceKey, string> = {
    food: "Food",
    water: "Water",
    shelter: "Shelter",
    health: "Health",
  };

  const lessons = resourceRisks.map((risk) => {
    const percentage =
      sourceExperimentCount === 0
        ? 0
        : Math.round(
            (risk.experimentCount / sourceExperimentCount) * 100,
          );

    return (
      `${resourceLabels[risk.resource]} reached a critical ` +
      `level in ${risk.experimentCount} of ` +
      `${sourceExperimentCount} recent adaptive experiment(s) ` +
      `(${percentage}%).`
    );
  });

  return {
    sourceExperimentCount,
    analyzedExperimentIds: recentExperiments.map(
      (experiment) => experiment.id,
    ),
    resourceRiskCounts,
    resourceRisks,
    lessons,
  };
}
