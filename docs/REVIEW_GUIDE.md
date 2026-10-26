# Code Review Guide

Use this guide to review RealityLoop AI without having to paste source files into a chat.

## Recommended review order

1. `README.md` — understand the purpose, setup, and limits.
2. `devpost/scope.md` — confirm what the prototype is supposed to do.
3. `src/simulation/engine.ts` — understand the rules before reviewing AI behavior.
4. `src/simulation/adaptation.ts` — inspect the decision policy.
5. `src/simulation/learning.ts` — inspect what is remembered between runs.
6. `src/simulation/adaptiveEngine.ts` — check how memory reaches decisions.
7. `src/simulation/comparison.ts` — check whether the comparisons are fair.
8. `src/simulation/evaluation.ts` — check the meaning of each metric.
9. `src/simulation/storage.ts` — inspect browser persistence and validation.
10. `src/App.tsx`, `src/App.css`, `src/index.css` — inspect presentation and user interactions.
11. Read each matching `*.test.ts` file alongside its implementation.

## Local verification commands

Open PowerShell in the project root (the folder containing `package.json`) and run:

```powershell
npm install
npm test
npm run lint
npm run build
```

Expected meaning:

- `npm test`: automated behavior tests pass.
- `npm run lint`: ESLint reports no configured lint issues.
- `npm run build`: TypeScript project build and Vite production build complete.

These commands must be run on the downloaded checkout. A prior pass on a different copy does not prove the current copy passes.

## Fairness checklist

- [ ] Baseline and adaptive comparisons use the same initial resource values.
- [ ] Event schedule is deterministic and shared across paired runs.
- [ ] Baseline receives no cross-run adaptive memory.
- [ ] The learning-effect comparison separates adaptive-without-memory from adaptive-with-memory.
- [ ] Metrics show observed differences, including zero or negative results.
- [ ] Survival days and survival success are reported separately.
- [ ] Resource differences are shown per resource and are not collapsed into an unsupported overall score.
- [ ] Test scenarios are labelled; conclusions do not imply universal performance.
- [ ] Lessons from historical runs describe observed recurring risks, not proven causal explanations.

## What the prototype does not prove

- It does not prove that adaptation always improves survival.
- It does not establish causation from a resource becoming low.
- It does not use an external AI API or a trained foundation model.
- Browser local storage is local to the current browser profile and is not cloud synchronization.
- A deterministic set of scenarios is evidence about those scenarios, not every possible world.

## How to ask for code help without re-uploading snippets

Keep this project ZIP as the canonical source. In a later conversation, attach the ZIP once if it is not available in that conversation, then refer to paths such as `src/simulation/comparison.ts` or `src/App.tsx`. When the code changes, create and attach a new ZIP only if the conversation cannot access the latest one; always state which ZIP/version is current.
