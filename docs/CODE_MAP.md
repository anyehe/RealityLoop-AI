# RealityLoop AI — Code Map

This document is a guided index to the source code. Start with the application entry point, then follow the simulation flow.

## 1. Application entry points

| File | Responsibility | Review questions |
|---|---|---|
| `index.html` | HTML shell served by Vite | Does the page title and root element match the app? |
| `src/main.tsx` | Mounts the React application | Is `App` mounted once and the global stylesheet loaded? |
| `src/App.tsx` | Main dashboard, experiment controls, history, and displayed metrics | Does the UI label each metric accurately? Are actions and state transitions clear? |
| `src/App.css` | Dashboard and component styling | Are layout, contrast, and responsive behavior consistent? |
| `src/index.css` | Global/reset styles and base typography | Are global styles limited to shared rules? |

## 2. Simulation engine and decision flow

| File | Responsibility | Review questions |
|---|---|---|
| `src/simulation/engine.ts` | Core state, resources, deterministic events, baseline action selection, and day advancement | Are resource changes bounded? Is survival calculated consistently? |
| `src/simulation/adaptation.ts` | Chooses an adaptive action using current state and recent outcomes | Are thresholds and explanations consistent with the decision? |
| `src/simulation/adaptiveEngine.ts` | Connects cross-run memory and adaptive decisions to the engine | Is prior history optional? Does the baseline remain unaffected by memory? |
| `src/simulation/learning.ts` | Builds bounded memory from recent completed adaptive experiments | Are only adaptive experiments included? Are lessons described as evidence rather than causation? |
| `src/simulation/storage.ts` | Validates, loads, saves, and clears local experiment history | Does malformed or old data fall back safely? |

### Decision flow

1. `App.tsx` requests the next day.
2. Baseline mode calls `advanceDay` with the normal decision.
3. Adaptive mode calls `advanceAdaptiveDay`.
4. `adaptiveEngine.ts` calls `buildCrossRunMemory` and `getAdaptiveDecision`.
5. `engine.ts` applies the action and deterministic event, then records the outcome.
6. When a run finishes, `storage.ts` validates and saves the experiment in browser local storage.

## 3. Evaluation and fair comparisons

| File | Responsibility | Important boundary |
|---|---|---|
| `src/simulation/comparison.ts` | Runs baseline/adaptive comparisons, stress scenarios, and cross-run memory-effect comparisons | Each compared run must start with the same resources and deterministic event schedule. |
| `src/simulation/evaluation.ts` | Computes minimum-resource and low-resource reporting metrics | Reporting thresholds are evaluation criteria, not simulation rules. Check whether a metric counts days or snapshots before naming it. |

`compareStrategies()` is the standard baseline-versus-adaptive comparison without saved history. `compareLearningEffect()` separately measures baseline, adaptive without memory, and adaptive with supplied prior experiments. Do not mix prior-history effects into the standard comparison; that would make the comparison less interpretable.

## 4. Tests

Tests are colocated with the module they test:

- `engine.test.ts` — core simulation rules and deterministic events.
- `adaptation.test.ts` — action choice and adaptation decisions.
- `adaptiveEngine.test.ts` — integration between the adaptive decision layer and simulation.
- `learning.test.ts` — memory summaries from previous runs.
- `storage.test.ts` — history validation and persistence helpers.
- `comparison.test.ts` — paired comparisons and stress scenarios.
- `evaluation.test.ts` — calculated evaluation metrics.

Run all tests with `npm test`. Run a focused test file with `npx vitest run src/simulation/comparison.test.ts`.

## 5. Planning and hackathon documents

- `devpost/scope.md` — agreed project boundary.
- `devpost/prd.md` — product requirements and user-facing behavior.
- `devpost/spec.md` — implementation-level behavior and acceptance details.
- `devpost/checklist.md` — build/ship checklist.
- `CODE_REVIEW.md` — previous review notes; treat it as review history, not a guarantee that every issue is already fixed.

## 6. Agent skill pack folders

`.agents/skills/` and `agent/skills/` contain skill-pack reference material. They are documentation/workflow assets, not runtime application modules. Keep them if continuing the Devpost workflow; do not import them into the React app.
