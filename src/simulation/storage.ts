
import type {
  AgentAction,
  DayRecord,
  SimulationState,
} from "./engine";

export const STORAGE_KEY = "realityloop-learning-history";
export const STORAGE_VERSION = 1;

const ACTIONS: AgentAction[] = [
  "forage",
  "collect-water",
  "repair-shelter",
  "rest",
];

const MODES = ["baseline", "adaptive"] as const;
const RESOURCE_KEYS = ["food", "water", "shelter", "health"] as const;

export type SavedExperiment = {
  id: string;
  completedAt: string;
  mode: "baseline" | "adaptive";
  finalDay: number;
  survived: boolean;
  finalResources: SimulationState["resources"];
  records: DayRecord[];
  lessons: string[];
};

export type LearningHistory = {
  version: typeof STORAGE_VERSION;
  experiments: SavedExperiment[];
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isResources(value: unknown): value is SimulationState["resources"] {
  if (!isObject(value)) return false;

  return RESOURCE_KEYS.every(
    (key) => typeof value[key] === "number" && Number.isFinite(value[key]),
  );
}

function isDayRecord(value: unknown): value is DayRecord {
  if (!isObject(value)) return false;

  const event = value.event;
  const validEvent =
    event === null ||
    (isObject(event) &&
      typeof event.name === "string" &&
      typeof event.description === "string" &&
      isObject(event.effects) &&
      Object.entries(event.effects).every(
        ([key, amount]) =>
          RESOURCE_KEYS.includes(key as (typeof RESOURCE_KEYS)[number]) &&
          typeof amount === "number" &&
          Number.isFinite(amount),
      ));

  return (
    Number.isInteger(value.day) &&
    (value.day as number) >= 1 &&
    typeof value.observation === "string" &&
    ACTIONS.includes(value.action as AgentAction) &&
    typeof value.explanation === "string" &&
    validEvent &&
    isResources(value.resourcesBefore) &&
    isResources(value.resourcesAfter) &&
    typeof value.alive === "boolean" &&
    MODES.includes(value.mode as (typeof MODES)[number]) &&
    ACTIONS.includes(value.baselineAction as AgentAction) &&
    Array.isArray(value.diagnoses) &&
    value.diagnoses.every((item) => typeof item === "string") &&
    (value.strategyAdjustment === null ||
      typeof value.strategyAdjustment === "string")
  );
}

function isSavedExperiment(value: unknown): value is SavedExperiment {
  if (!isObject(value)) return false;

  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.completedAt === "string" &&
    Number.isFinite(Date.parse(value.completedAt)) &&
    MODES.includes(value.mode as (typeof MODES)[number]) &&
    Number.isInteger(value.finalDay) &&
    (value.finalDay as number) >= 1 &&
    typeof value.survived === "boolean" &&
    isResources(value.finalResources) &&
    Array.isArray(value.records) &&
    value.records.length > 0 &&
    value.records.every(isDayRecord) &&
    Array.isArray(value.lessons) &&
    value.lessons.every((item) => typeof item === "string")
  );
}

export function createEmptyLearningHistory(): LearningHistory {
  return { version: STORAGE_VERSION, experiments: [] };
}

export function loadLearningHistory(raw: string | null): LearningHistory {
  if (raw === null) return createEmptyLearningHistory();

  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      !isObject(parsed) ||
      parsed.version !== STORAGE_VERSION ||
      !Array.isArray(parsed.experiments) ||
      !parsed.experiments.every(isSavedExperiment)
    ) {
      return createEmptyLearningHistory();
    }

    return {
      version: STORAGE_VERSION,
      experiments: parsed.experiments,
    };
  } catch {
    return createEmptyLearningHistory();
  }
}

export function createSavedExperiment(
  simulation: SimulationState,
  mode: "baseline" | "adaptive",
): SavedExperiment | null {
  const finished = !simulation.alive || simulation.day >= 30;

  if (!finished || simulation.records.length === 0) return null;



  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    completedAt: new Date().toISOString(),
    mode,
    finalDay: simulation.day,
    survived: simulation.alive && simulation.day >= 30,
    finalResources: { ...simulation.resources },
    records: simulation.records.map((record) => ({
      ...record,
      resourcesBefore: { ...record.resourcesBefore },
      resourcesAfter: { ...record.resourcesAfter },
      diagnoses: [...record.diagnoses],
      event: record.event
        ? { ...record.event, effects: { ...record.event.effects } }
        : null,
    })),
    lessons: [...new Set(simulation.records.flatMap((record) => record.diagnoses))],
  };
}

export function saveLearningHistory(history: LearningHistory): string {
  return JSON.stringify(history);
}

export function clearLearningHistory(): LearningHistory {
  return createEmptyLearningHistory();
}
