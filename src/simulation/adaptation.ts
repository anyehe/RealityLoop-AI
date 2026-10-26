import type { AgentAction, DayRecord, Resources } from "./engine";
import type { CrossRunMemory } from "./learning";

export type AdaptationDecision = {
  action: AgentAction;
  explanation: string;
  diagnoses: string[];
  strategyAdjustment: string | null;
};

const RECENT_DAYS = 5;

export function getAdaptiveDecision(
  resources: Resources,
  records: DayRecord[],
  baselineAction: AgentAction,
  crossRunMemory?: CrossRunMemory,
): AdaptationDecision {
  const recent = records.slice(-RECENT_DAYS);

  // Cross-run evidence is trusted only when at least two analyzed
  // adaptive experiments independently recorded this resource at risk.
  const hasRepeatedPriorRisk = (
    resource: keyof Resources,
  ): boolean => {
    const evidence = crossRunMemory?.resourceRisks.find(
      (item) => item.resource === resource,
    );

    return (
      crossRunMemory !== undefined &&
      crossRunMemory.sourceExperimentCount >= 2 &&
      evidence !== undefined &&
      evidence.experimentCount >= 2
    );
  };

  const priorWaterRisk = hasRepeatedPriorRisk("water");
  const priorFoodRisk = hasRepeatedPriorRisk("food");
  const priorShelterRisk = hasRepeatedPriorRisk("shelter");
  const priorHealthRisk = hasRepeatedPriorRisk("health");

  // Detect risk in the current simulation run.
  const waterRisk = recent.some(
    (record) =>
      record.resourcesAfter.water <= 5 ||
      ((record.event?.effects.water ?? 0) < 0 &&
        record.resourcesAfter.water <= 8),
  );

  const foodRisk = recent.some(
    (record) =>
      record.resourcesAfter.food <= 5 ||
      ((record.event?.effects.food ?? 0) < 0 &&
        record.resourcesAfter.food <= 8),
  );

  const shelterRisk = recent.some(
    (record) =>
      record.resourcesAfter.shelter <= 25 ||
      ((record.event?.effects.shelter ?? 0) < 0 &&
        record.resourcesAfter.shelter <= 40),
  );

  const healthRisk = recent.some(
    (record) =>
      record.resourcesAfter.health <= 30 ||
      ((record.event?.effects.health ?? 0) < 0 &&
        record.resourcesAfter.health <= 45),
  );

  const diagnoses: string[] = [];

  if (waterRisk) {
    diagnoses.push(
      "Recent water shortages or damaging water events justify a larger reserve.",
    );
  }

  if (foodRisk) {
    diagnoses.push(
      "Recent food shortages or food losses justify earlier food collection.",
    );
  }

  if (shelterRisk) {
    diagnoses.push(
      "Recent shelter damage justifies earlier repair work.",
    );
  }

  if (healthRisk) {
    diagnoses.push(
      "Recent health deterioration justifies earlier recovery.",
    );
  }

  if (priorWaterRisk) {
    diagnoses.push(
      "Cross-run evidence: water reached a critical level in multiple recent adaptive experiments.",
    );
  }

  if (priorFoodRisk) {
    diagnoses.push(
      "Cross-run evidence: food reached a critical level in multiple recent adaptive experiments.",
    );
  }

  if (priorShelterRisk) {
    diagnoses.push(
      "Cross-run evidence: shelter reached a critical level in multiple recent adaptive experiments.",
    );
  }

  if (priorHealthRisk) {
    diagnoses.push(
      "Cross-run evidence: health reached a critical level in multiple recent adaptive experiments.",
    );
  }

  // Baseline thresholds remain unchanged. Adaptive thresholds rise only
  // when current-run evidence or repeated cross-run evidence supports it.
  const waterThreshold = waterRisk || priorWaterRisk ? 8 : 4;
  const foodThreshold = foodRisk || priorFoodRisk ? 8 : 4;
  const shelterThreshold = shelterRisk || priorShelterRisk ? 40 : 30;
  const healthThreshold = healthRisk || priorHealthRisk ? 45 : 35;

  let action: AgentAction;

  if (resources.water <= waterThreshold) {
    action = "collect-water";
  } else if (resources.food <= foodThreshold) {
    action = "forage";
  } else if (resources.shelter <= shelterThreshold) {
    action = "repair-shelter";
  } else if (resources.health <= healthThreshold) {
    action = "rest";
  } else {
    action = "forage";
  }

  let explanation: string;

  switch (action) {
    case "collect-water":
      explanation =
        resources.water > 4 && priorWaterRisk
          ? `Water is ${resources.water}/100. Repeated shortages across prior adaptive experiments raised the collection threshold from 4 to ${waterThreshold}.`
          : resources.water > 4 && waterRisk
            ? `Water is ${resources.water}/100. Recent water stress raised the collection threshold from 4 to ${waterThreshold}.`
            : `Water is ${resources.water}/100, so the agent prioritizes collecting water.`;
      break;

    case "forage":
      explanation =
        resources.food > 4 &&
        resources.food <= foodThreshold &&
        priorFoodRisk
          ? `Food is ${resources.food}/100. Repeated shortages across prior adaptive experiments raised the collection threshold from 4 to ${foodThreshold}.`
          : resources.food > 4 &&
            resources.food <= foodThreshold &&
            foodRisk
            ? `Food is ${resources.food}/100. Recent food losses raised the collection threshold from 4 to ${foodThreshold}.`
            : foodRisk && resources.food <= 4
              ? `Food is critically low at ${resources.food}/100, so the agent prioritizes foraging.`
              : `No higher-priority survival threshold is critical, so the agent gathers food for future days.`;
      break;

    case "repair-shelter":
      explanation =
        resources.shelter > 30 && priorShelterRisk
          ? `Shelter is ${resources.shelter}/100. Repeated shelter shortages across prior adaptive experiments raised the repair threshold from 30 to ${shelterThreshold}.`
          : resources.shelter > 30 && shelterRisk
            ? `Shelter is ${resources.shelter}/100. Recent damage raised the repair threshold from 30 to ${shelterThreshold}.`
            : `Shelter is low at ${resources.shelter}/100, so the agent prioritizes repairs.`;
      break;

    case "rest":
      explanation =
        resources.health > 35 && priorHealthRisk
          ? `Health is ${resources.health}/100. Repeated health risks across prior adaptive experiments raised the recovery threshold from 35 to ${healthThreshold}.`
          : resources.health > 35 && healthRisk
            ? `Health is ${resources.health}/100. Recent deterioration raised the recovery threshold from 35 to ${healthThreshold}.`
            : `Health is low at ${resources.health}/100, so the agent rests to recover.`;
      break;
  }

  const strategyAdjustment =
    action !== baselineAction ? explanation : null;

  return {
    action,
    explanation,
    diagnoses,
    strategyAdjustment,
  };
}
