# RealityLoop AI

**An observable adaptive survival agent evaluated in a deterministic 30-day settlement simulation.**

RealityLoop AI explores whether feedback-driven strategy adjustments can change survival outcomes. It manages food, water, shelter, and health; records each decision and outcome; and summarizes recurring resource risks across completed adaptive experiments.

## At a glance

- **Simulation:** 30-day settlement survival challenge with deterministic events.
- **Strategies:** fixed baseline, within-run adaptive, and adaptive strategy supplied with bounded cross-run memory.
- **Evidence:** decision traces, resource outcomes, stress scenarios, and paired strategy comparisons.
- **Persistence:** completed experiments saved in browser local storage.
- **Stack:** React, TypeScript, Vite, CSS, and Vitest.
- **External services:** no backend or external AI API required for the local prototype.

## Start here

1. Read [`docs/CODE_MAP.md`](docs/CODE_MAP.md) to locate each module.
2. Read [`docs/REVIEW_GUIDE.md`](docs/REVIEW_GUIDE.md) for the suggested code-review order.
3. Read [`devpost/scope.md`](devpost/scope.md) for the agreed project boundaries.

## Requirements

Install a Node.js version compatible with the Vite version in `package.json`, along with npm. The exact dependency versions are recorded in `package-lock.json`.

## Run locally (Windows PowerShell)

Open PowerShell in the project root—the folder containing `package.json`—then run:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. Stop the development server with `Ctrl+C`.

## Verify the code

```powershell
npm test
npm run lint
npm run build
```

Run these commands on the exact copy you intend to review or submit. See [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) for the verification checklist.

## How the comparisons work

- `compareStrategies()` compares baseline and adaptive behavior using matching initial resources and the same deterministic event schedule. It does not pass saved history into either run.
- `compareLearningEffect()` measures three runs: baseline, adaptive without cross-run memory, and adaptive with supplied prior experiments. The measured differences are reported even if they are zero or negative.
- `evaluateStressScenarios()` repeats the baseline/adaptive comparison with standard, water-stressed, shelter-stressed, and combined-stress starting resources.
- `evaluateStrategy()` calculates resource and action metrics. Review the code and labels to confirm whether each metric counts post-action days or resource snapshots.

Evaluation thresholds are reporting criteria, not simulation rules. The results describe only the scenarios tested and do not guarantee that adaptation always improves survival.

## Limitations and honest claims

This is a deterministic local simulation with a rule-based adaptation layer. Cross-run memory summarizes recurring resource stress; it does not establish causation or represent a trained foundation model. The application does not claim consciousness, self-awareness, or unrestricted self-modifying code. Local storage is tied to the current browser profile and is not cloud synchronization.

## Project structure

```text
RealityLoop-AI/
├── docs/                  # Code map, review guide, project status
├── devpost/               # Scope, PRD, specification, ship checklist
├── public/                # Static public assets and icons
├── src/
│   ├── simulation/        # Engine, adaptation, learning, storage, evaluation, tests
│   ├── App.tsx            # Main application interface
│   ├── App.css            # Application styles
│   ├── index.css          # Global styles
│   └── main.tsx           # React entry point
├── package.json
├── package-lock.json
└── CODE_REVIEW.md         # Review notes/history
```

The `.agents/skills/` and `agent/skills/` folders contain workflow reference material for the Devpost skill pack; they are not runtime application code.
