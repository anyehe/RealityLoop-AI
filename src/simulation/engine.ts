export type Resources = {
  food: number;
  water: number;
  shelter: number;
  health: number;
};
export type AgentAction =
  | "forage"
  | "collect-water"
  | "repair-shelter"
  | "rest";

export type EnvironmentalEvent = {
  name: string;
  description: string;
  effects: Partial<Record<keyof Resources, number>>;
};

export type DayRecord = {
  day: number;
  observation: string;
  action: AgentAction;
  explanation: string;
  event: EnvironmentalEvent | null;
  resourcesBefore: Resources;
  resourcesAfter: Resources;
  alive: boolean;
  mode: "baseline" | "adaptive";
  baselineAction: AgentAction;
  diagnoses: string[];
  strategyAdjustment: string | null;
};

export type SimulationState = {
  day: number;
  resources: Resources;
  alive: boolean;
  history: string[];
  records: DayRecord[];
};

export const INITIAL_STATE: SimulationState = {
  day: 1,
  resources: {
    food: 12,
    water: 12,
    shelter: 65,
    health: 100,
  },
  alive: true,
  history: [
    "Day 1: The settlement begins with limited supplies.",
  ],
  records: [],
};

const clamp = (value: number): number =>
  Math.max(0, Math.min(100, value));

const copyResources = (resources: Resources): Resources => ({
  ...resources,
});

export function chooseAction(resources: Resources): AgentAction {
  if (resources.water <= 4) return "collect-water";
  if (resources.food <= 4) return "forage";
  if (resources.shelter <= 30) return "repair-shelter";
  if (resources.health <= 35) return "rest";

  return "forage";
}

export function explainDecision(
  resources: Resources,
  action: AgentAction,
): string {
  switch (action) {
    case "collect-water":
      return `Water is critically low at ${resources.water}/100, so the agent prioritizes collecting water.`;

    case "forage":
      if (resources.food <= 4) {
        return `Food is critically low at ${resources.food}/100, so the agent prioritizes foraging.`;
      }
      return `No higher-priority survival threshold is critical, so the agent gathers food for future days.`;

    case "repair-shelter":
      return `Shelter is critically low at ${resources.shelter}/100, so the agent prioritizes repairs.`;

    case "rest":
      return `Health is critically low at ${resources.health}/100, so the agent rests to recover.`;
  }
}

const ENVIRONMENTAL_EVENTS: Record<number, EnvironmentalEvent> = {
  3: {
    name: "Dry spell",
    description: "Hot, dry weather reduces the settlement's water supply.",
    effects: { water: -3 },
  },
  5: {
    name: "Severe storm",
    description: "Strong winds damage the shelter and exhaust the residents.",
    effects: { shelter: -8, health: -4 },
  },
  8: {
    name: "Spoiled food",
    description: "Some stored food spoils and becomes unusable.",
    effects: { food: -4 },
  },
  11: {
    name: "Seasonal illness",
    description: "An illness outbreak affects the settlement's health.",
    effects: { health: -8 },
  },
  14: {
    name: "Heatwave",
    description: "Extreme heat places additional pressure on water supplies.",
    effects: { water: -4, health: -2 },
  },
  17: {
    name: "Wind damage",
    description: "Another storm damages the shelter.",
    effects: { shelter: -10 },
  },
  20: {
    name: "Water contamination",
    description: "Part of the available water supply becomes unusable.",
    effects: { water: -5 },
  },
  23: {
    name: "Crop pests",
    description: "Pests reduce the food available to the settlement.",
    effects: { food: -5 },
  },
  26: {
    name: "Cold snap",
    description: "Cold weather strains both shelter and health.",
    effects: { shelter: -4, health: -6 },
  },
  29: {
    name: "Late-season storm",
    description: "A final storm damages the shelter and weakens the settlement.",
    effects: { shelter: -8, health: -4 },
  },
};

export function getEnvironmentalEvent(
  day: number,
): EnvironmentalEvent | null {
  const event = ENVIRONMENTAL_EVENTS[day];

  return event
    ? {
        ...event,
        effects: { ...event.effects },
      }
    : null;
}

export function advanceDay(
  state: SimulationState,
  decision?: {
    action: AgentAction;
    explanation: string;
    baselineAction: AgentAction;
    diagnoses: string[];
    strategyAdjustment: string | null;
  },
): SimulationState {
  if (!state.alive || state.day >= 30) return state;

  const resourcesBefore = copyResources(state.resources);
  const baselineAction = chooseAction(resourcesBefore);
  const action = decision?.action ?? baselineAction;
  const explanation =
    decision?.explanation ?? explainDecision(resourcesBefore, action);
  const nextDay = state.day + 1;

  // Daily consumption and natural shelter wear.
  const resources: Resources = {
    food: resourcesBefore.food - 1,
    water: resourcesBefore.water - 1,
    shelter: resourcesBefore.shelter - 2,
    health: resourcesBefore.health - 2,
  };

  // Apply the selected action.
  switch (action) {
    case "forage":
      resources.food += 5;
      break;

    case "collect-water":
      resources.water += 5;
      break;

    case "repair-shelter":
      resources.shelter += 12;
      break;

    case "rest":
      resources.health += 15;
      break;
  }

  // Events occur on fixed days, making runs reproducible.
  const event = getEnvironmentalEvent(nextDay);

  if (event) {
    for (const [key, change] of Object.entries(event.effects) as [
      keyof Resources,
      number,
    ][]) {
      resources[key] += change;
    }
  }

  // Enforce valid resource boundaries.
  for (const key of Object.keys(resources) as Array<keyof Resources>) {
    resources[key] = clamp(resources[key]);
  }

  const alive = Object.values(resources).every((value) => value > 0);

  const observation =
    `Before the decision: food ${resourcesBefore.food}, ` +
    `water ${resourcesBefore.water}, shelter ${resourcesBefore.shelter}, ` +
    `health ${resourcesBefore.health}.`;

  const record: DayRecord = {
    day: nextDay,
    observation,
    action,
    explanation,
    event,
    resourcesBefore,
    resourcesAfter: copyResources(resources),
    alive,
    mode: decision ? "adaptive" : "baseline",
    baselineAction: decision?.baselineAction ?? baselineAction,
    diagnoses: decision?.diagnoses ?? [],
    strategyAdjustment: decision?.strategyAdjustment ?? null,
  };

  const outcome = alive
    ? `Day ${nextDay}: ${action}. ${event ? `Event: ${event.name}.` : "No major environmental event."}`
    : `Day ${nextDay}: Survival failed because a critical resource reached zero.`;

  return {
    day: nextDay,
    resources,
    alive,
    history: [...state.history, outcome],
    records: [...state.records, record],
  };
}
