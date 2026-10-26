# Project Status and Verification Record

## Current implementation scope

- React + TypeScript + Vite frontend.
- Deterministic 30-day survival simulation.
- Baseline and within-run adaptive strategies.
- Cross-run memory derived from recent completed adaptive experiments.
- Browser-local experiment persistence with input validation and fallback for invalid stored data.
- Standard strategy comparison, stress scenarios, and a separate learning-effect comparison.
- Unit and integration tests using Vitest.

## Important interpretation note

Cross-run memory summarizes repeated resource stress in recent adaptive experiments. It does not prove that an action caused a resource shortage, and it should not be described as a trained AI model or unrestricted self-learning.

## Verify the exact downloaded copy

The ZIP contains the source and lockfile but does not include `node_modules` or `dist`. From the extracted project root, run:

```powershell
npm install
npm test
npm run lint
npm run build
```

Record the actual output and date here after running those commands on this copy. No pass/fail status is pre-filled because verification must be performed in the user's local environment.

## Before submitting a demo

- [ ] Complete at least one baseline run and one adaptive run.
- [ ] Complete at least two adaptive runs to create cross-run evidence.
- [ ] Restart the browser and confirm saved history is still present in that browser profile.
- [ ] Compare adaptive-without-memory against adaptive-with-memory using the same initial resources.
- [ ] Record survival day, survived/not survived, final resources, and changed decisions.
- [ ] Run tests, lint, and production build on the final copy.
- [ ] Review the Devpost scope and avoid claims not supported by the observed results.
