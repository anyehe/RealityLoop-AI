---
doc: spec
status: approved
---

# RealityLoop AI — Technical Specification

## 1. How This Works, in Plain Language

RealityLoop AI is a small survival world where an agent makes decisions about food, water, shelter, and health.

The simulation is the world. It follows fixed rules and produces the outcomes of the agent's actions. The learning engine reviews those outcomes and adjusts the agent's strategy within defined limits. The dashboard shows what happened, what the agent learned, and whether the next attempt improved.

The app runs in the browser. Browser storage acts like a sticky note for this website: it can keep experiment history when the user closes and reopens the app in the same browser.

The first version does not require a paid AI service, a server, user accounts, or a database. Its learning mechanism is implemented in application logic, not through model retraining or unrestricted source-code rewriting.

## 2. Core Journey

1. The user opens the dashboard and sees the settlement's current state and previous experiment history.
2. The user starts a 30-day simulation.
3. Each day, the simulation provides the current conditions and any scheduled event.
4. The agent observes the state, selects an available action, and records its reason.
5. The simulation applies the action and updates resources and health.
6. The agent records the outcome and identifies risks, mistakes, or useful lessons.
7. At the end of the run, the app records survival days, final resources, shortages, waste, and strategy changes.
8. The user runs a baseline or adaptive experiment under comparable conditions.
9. The dashboard compares the results and reports improvement, regression, or inconclusive evidence.
10. Lessons and experiment results are saved locally for later sessions.

## 3. Technology Stack

- React: builds the dashboard from reusable interface components.
- TypeScript: makes the shapes of simulation data and learning records explicit.
- Vite: runs the development server and builds the frontend.
- Vitest: tests simulation rules, learning behavior, evaluation, and storage.
- Browser localStorage: saves experiment history and bounded learning memory.
- Git and GitHub: track source changes and provide the public project repository.

No backend, external AI API, account system, or paid service is required for the initial proof of concept.

## 4. Where It Runs

Development environment: Windows, VS Code, and PowerShell.

The app runs locally in a browser using Vite. The terminal displays the local development URL when the server starts; use the URL Vite reports rather than assuming a particular port.

The app must also be buildable as static frontend files. Optional free deployment can be considered during the official 6-ship stage. The demo video and public GitHub repository remain submission deliverables.

## 5. Look and Feel

Use the approved "Living World Research Lab" direction:

- Dark navy and deep teal as the main visual palette.
- A readable settlement overview with food, water, shelter, and health indicators.
- Clear day number and simulation status.
- An agent observation and decision panel.
- A chronological history of actions, events, and outcomes.
- A learning and diagnosis panel explaining proposed strategy changes.
- An experiment comparison area for baseline and adaptive results.
- Amber for risks and warnings; green for verified positive outcomes.
- Text labels and accessible contrast so color is not the only way to communicate status.

Keep the main experience on one dashboard. Prioritize clarity and inspectable evidence over decorative complexity.

## 6. Components and Responsibilities

### 6.1 Dashboard

Implements `prd.md > Screens and Layout` and `prd.md > Features and Behavior`.

Displays current resources, simulation progress, controls, recent events, agent reasoning, learning records, and experiment comparisons. It calls the simulation and experiment modules rather than implementing their rules inside UI components.

### 6.2 Simulation Engine

Implements `prd.md > Features and Behavior` for survival simulation.

Owns the rules for advancing a day, applying events, executing actions, consuming resources, updating health, and determining survival or failure. The same input state and event sequence must produce the same outcome.

Use a small, explicitly documented action set. Candidate actions include gathering food, collecting water, repairing shelter, resting, and preparing for a known risk. Final action costs and effects must be defined in code and covered by tests.

The simulation, not the learning engine, is the authority on actual outcomes.

### 6.3 Agent Decision Engine

Implements `prd.md > Features and Behavior` for agent decisions and diagnosis.

Reads the current state and available actions, applies the current strategy priorities, and selects a valid action. It records the relevant observations and a concise explanation based on actual state values and implemented rules.

It must not claim to have performed an analysis that its rules do not support. When evidence is insufficient, the dashboard should say so.

### 6.4 Learning Engine

Implements `prd.md > Features and Behavior` for cumulative strategic learning.

Records lessons from completed runs, identifies recurring shortages or poor outcomes using explicit rules, and adjusts bounded strategy priorities. Each proposed change records its reason and supporting evidence.

The engine can use lessons from multiple prior runs, not only the most recent run. It must distinguish a proposed change from a change that has been tested successfully. Failed changes remain in the history and can be reconsidered.

The engine adjusts strategy settings only. It does not rewrite application source code, retrain a language model, or establish consciousness.

### 6.5 Experiment Runner and Evaluator

Implements `prd.md > Features and Behavior` for baseline and adaptive comparison.

Runs experiments using the same initial conditions and reproducible event sequence. Baseline uses the fixed original strategy; adaptive uses the bounded strategy informed by stored lessons.

Report survival days as the primary outcome. Separately report final food, water, shelter, health, critical shortages, and resource waste. Also show strategy changes and whether a comparable test supports them.

A single improved run is evidence for that scenario, not proof of universal improvement. Report ties and regressions honestly.

### 6.6 Local Storage

Implements `prd.md > States and Boundaries` for persistence across attempts.

Stores versioned experiment records, completed-run summaries, learning lessons, and bounded strategy settings in localStorage. Validate loaded data before using it. Handle missing, malformed, or incompatible stored data with a visible message and a safe recovery option.

Provide a user-controlled way to reset saved experiment and learning history. Reset must require confirmation and must not silently occur during ordinary navigation.

### 6.7 Test Suite

Tests simulation determinism, resource and health rules, terminal states, agent action validity, learning updates, fair experiment setup, scoring, storage recovery, and key dashboard states.

Tests must be repeatable and must not depend on a paid service or live network connection.

## 7. Data Model and Data Flow

Use TypeScript types for these logical records. Exact fields may be refined during implementation while preserving the behaviors specified here.

- `SimulationState`: current day, resource levels, health, and alive/completed status.
- `SimulationConfig`: starting conditions, action rules, and event-sequence identifier.
- `EventRecord`: day, event type, and its defined effect.
- `DecisionRecord`: day, observed state summary, chosen action, and rule-based reason.
- `OutcomeRecord`: action result, resource changes, shortages, and any waste.
- `LessonRecord`: observed pattern, supporting run references, suggested priority adjustment, and confidence or evidence status.
- `StrategyConfig`: named bounded priorities used by the agent.
- `RunRecord`: run identifier, mode, configuration identifier, daily records, end state, and evaluation metrics.
- `ExperimentComparison`: baseline and adaptive run references, comparable conditions, metric differences, and conclusion status.

### Data flow

1. Simulation configuration and a reproducible event sequence initialize a run.
2. The simulation state is passed to the agent decision engine.
3. The chosen action is passed to the simulation engine.
4. The engine returns the next state and an outcome record.
5. The decision, event, and outcome records are collected into the run history.
6. At the end of the run, the learning engine evaluates the history and records bounded lessons.
7. The evaluator compares runs under matching conditions.
8. Completed runs and lessons are validated and saved to localStorage.
9. On reopening the app, valid saved records are loaded to populate experiment history and inform future adaptive runs.

Only completed and valid runs should update cumulative learning by default. Interrupted runs must be labeled incomplete and excluded from fair comparison unless explicitly handled by a documented rule.

## 8. Fair Experiment Rules

- Baseline and adaptive runs use identical starting conditions.
- Both receive the same deterministic event sequence for a comparison.
- Each run starts from a clean simulation state; one run must not inherit another run's resource levels.
- Baseline uses the fixed reference strategy.
- Adaptive uses the current bounded strategy and recorded lessons.
- The event-sequence identifier and strategy version are recorded with each run.
- Results from different scenarios must not be presented as a controlled comparison.
- If a run fails or is incomplete, explain why it was excluded or how it was treated.

## 9. Scoring and Evaluation

Primary metric: number of days survived, from 0 to 30.

A successful full run survives through day 30 without a terminal survival failure under the implemented rules.

Report these secondary measures independently:

- Final food, water, shelter, and health.
- Number and type of critical shortages.
- Resource waste, using explicitly defined simulation rules.
- Decisions and mistakes recorded.
- Strategy changes proposed and tested.
- Whether the tested change improved, worsened, or did not materially change the comparable outcome.

Do not invent a numerical result when data is missing. Do not use a combined score to conceal failure in a primary survival metric.

## 10. Planned Application File Structure

```text
RealityLoop-AI/
├── .agents/                       # Official planning/build skill resources
├── .claude/                       # Existing project resources
├── .qodo/                         # Existing project resources
├── agent/                         # Existing agent skill resources
├── devpost/
│   ├── learner-profile.md         # Private learner context; excluded from Git
│   ├── scope.md                   # Approved project scope
│   ├── prd.md                     # Approved product requirements
│   └── spec.md                    # This technical specification
├── public/
│   └── ...                        # Static public assets
├── src/
│   ├── components/
│   │   ├── ResourcePanel.tsx      # Resource and health indicators
│   │   ├── SettlementView.tsx     # Compact settlement overview
│   │   ├── AgentPanel.tsx         # Observation, action, and explanation
│   │   ├── EventHistory.tsx       # Events, decisions, and outcomes
│   │   ├── LearningPanel.tsx      # Lessons and strategy changes
│   │   └── ExperimentComparison.tsx # Baseline/adaptive results
│   ├── simulation/
│   │   ├── types.ts               # Simulation and record types
│   │   ├── config.ts              # Initial conditions and rules
│   │   ├── events.ts              # Reproducible event sequences
│   │   └── engine.ts              # Deterministic world updates
│   ├── agent/
│   │   ├── decision.ts            # Rule-based action selection
│   │   └── learning.ts            # Lessons and bounded adjustments
│   ├── experiments/
│   │   ├── runner.ts              # Repeatable run orchestration
│   │   └── evaluation.ts          # Metrics and comparisons
│   ├── storage/
│   │   └── localHistory.ts        # Validated localStorage persistence
│   ├── App.tsx                    # Main dashboard and orchestration
│   ├── main.tsx                   # Frontend entry point
│   └── styles.css                 # Global palette and layout
├── tests/
│   ├── simulation.test.ts         # World rules and deterministic outcomes
│   ├── learning.test.ts           # Learning and bounded strategy changes
│   ├── experiments.test.ts        # Fairness and evaluation
│   └── storage.test.ts            # Persistence and recovery
├── .gitignore                     # Excludes private context and local secrets
├── index.html                     # Browser entry point
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript settings
├── vite.config.ts                 # Vite and Vitest configuration
└── README.md                      # Setup, use, tests, and demo instructions
```

This is the planned application tree, not a claim that these files already exist. Existing repository files and official skill resources must be inspected before creating or changing files.

## 11. Setup and Run Instructions

Prerequisites: a supported Node.js version, npm, Git, and VS Code.

The build stage must verify installed Node.js and npm versions before installing dependencies.

Expected setup workflow:

1. Open PowerShell in the project root.
2. Inspect existing files and Git status before changing anything.
3. Initialize the Vite React TypeScript app in the existing repository without overwriting planning resources.
4. Install project dependencies.
5. Start the development server with `npm run dev` and open the URL printed by Vite.
6. Run automated tests with `npm test`.
7. Create a production build with `npm run build`.
8. Verify the app works locally and that the production build succeeds.

The exact package scripts and dependency versions must be confirmed in `package.json` during implementation. Do not assume a script exists until it has been configured.

## 12. Dependencies and References

Official documentation to consult during implementation:

- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/docs/
- Vite: https://vite.dev/guide/
- Vitest: https://vitest.dev/guide/
- MDN localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- Node.js: https://nodejs.org/en
- GitHub Docs: https://docs.github.com/

No external runtime API is required. Confirm compatible package versions and installation requirements when initializing the app; this specification does not claim a live version or pricing check was performed.

## 13. Important Failure Modes and Fallbacks

- No saved history: show a clear first-run state and allow a new experiment.
- Invalid or outdated saved data: report the issue and offer a controlled reset without crashing the dashboard.
- Browser storage unavailable or full: show a clear warning, keep the current run usable where possible, and disclose that it could not be saved.
- Invalid action: reject it and record a diagnostic rather than corrupting simulation state.
- Incomplete run: mark it incomplete and exclude it from ordinary completed-run comparisons.
- No demonstrated improvement: state that the evidence is inconclusive or that the strategy did not improve results.
- Repeated failure: show the relevant shortage and prior lessons; do not claim success without evidence.
- Reset requested: ask for confirmation before deleting saved learning history.

## 14. Simplifications and Boundaries

Included in the proof of concept:

- One settlement and a 30-day survival challenge.
- Four resource/condition indicators: food, water, shelter, and health.
- A small, documented action and event set.
- One main dashboard.
- Rule-based decisions and transparent explanations.
- Cumulative lessons across completed attempts.
- Bounded strategy adjustments.
- Persistent local experiment history.
- Reproducible baseline-versus-adaptive comparison.
- Automated tests and clear setup documentation.

Deferred:

- Multiple settlements or competing agents.
- Accounts, multiplayer, cloud synchronization, and a backend.
- Paid or hosted language-model APIs.
- Advanced machine learning or model retraining.
- Unrestricted self-modifying source code.
- Claims that the agent is conscious or has human-like understanding.
- Complex open-world gameplay, combat, and commercial game features.

The project may explore why adaptive or complex behavior can appear self-aware, but its measurements cannot establish consciousness.

## 15. Decisions and Open Issues

### Confirmed decisions

- Build the learning mechanism in application code without requiring an AI API.
- Persist experiment history and lessons in browser localStorage.
- Compare baseline and adaptive runs under identical starting conditions and reproducible events.
- Measure survival days as the primary outcome; report resources, shortages, and waste separately.
- Keep the first version frontend-only using React, TypeScript, and Vite.
- Use Vitest for automated testing.
- Permit bounded strategy adjustments but not source-code rewriting.
- Keep the project small enough to implement and demonstrate within the hackathon timeframe.

### To finalize during implementation

- Exact starting quantities, resource consumption, action costs, and health rules.
- The small set of event types and their effects.
- The numerical bounds for strategy adjustments.
- The precise rule for identifying a mistake and promoting an outcome into a reusable lesson.
- The schema version and recovery behavior for saved local history.
- The final demo scenario and hosting choice.

These details must be defined and tested before results are presented as evidence. They must not be chosen after seeing a desired result merely to make the adaptive agent appear successful.

### Genuine uncertainty: adaptation versus consciousness

The app can demonstrate whether recorded feedback changes later decisions and whether those changes improve measured survival. It cannot establish subjective experience or consciousness. Strategy adaptation is the implemented experiment; consciousness remains an open philosophical and scientific question outside the proof-of-concept claim.

## 16. Specification Review Checklist

Before changing the status to approved, confirm that:

- Every major PRD feature has a component or module responsible for it.
- The simulation is deterministic under the same configuration and event sequence.
- Baseline and adaptive experiments are compared fairly.
- Lessons and results persist across browser sessions.
- Resource and learning records have clear data shapes and flow.
- The file tree agrees with the described architecture.
- Tests cover the main rules and failure cases.
- Setup instructions match the actual package scripts.
- No unsupported claims of improvement, self-modifying code, or consciousness are made.

This document remains a draft until reviewed and approved by the learner.
