---
doc: checklist
status: approved
---

# Build Checklist

Build mode: choose after plan approval

## Slices

- [x] **1. Run a survival simulation and see the agent act**
  Becomes usable: A working browser dashboard displays the settlement's day, food, water, shelter, and health. The user can advance a day and see a deterministic agent decision and its outcome.
  Why now: Establishes the runnable application and proves the core simulation-to-agent path immediately.
  PRD ref: `prd.md > The Core Journey`; `prd.md > Features and Behavior > Survival Simulation`
  Spec ref: `spec.md > Technology Stack`; `spec.md > Look and Feel`; `spec.md > Simulation Engine`; `spec.md > Agent Decision Engine`; `spec.md > Planned Application File Structure`
  Build: Scaffold React, TypeScript, and Vite in the existing repository without overwriting planning files. Install compatible dependencies, build the first dashboard, define starting resources and permitted actions, and implement one deterministic day transition.
  Verify (mechanical): Confirm the development server starts, run the configured automated tests, and run the production build. Verify the initial state and one day transition with a test.
  Learner check: Open the dashboard, advance the simulation, and confirm that the day, resources, and agent decision visibly change.
  Commit: `Build initial survival simulation`

- [x] **2. See decisions, events, and consequences**
  Becomes usable: The dashboard explains what the agent observed, which action it selected, what event occurred, and how the settlement changed.
  Why now: Makes the unique kernel observable early instead of leaving the agent as a black box.
  PRD ref: `prd.md > The Core Journey`; `prd.md > Features and Behavior > Survival Simulation`; `prd.md > Screens and Layout`
  Spec ref: `spec.md > Components and Responsibilities`; `spec.md > Data Model and Data Flow`; `spec.md > Fair Experiment Rules`
  Build: Add reproducible environmental events, decision and outcome records, readable explanations based on actual simulation state, and visible survival or failure status.
  Verify (mechanical): Test that identical initial conditions and event sequences produce identical outcomes, and that recorded decisions match the actions applied by the simulation.
  Learner check: Run several days and follow one decision from observation to its resource consequences.
  Implementation commit: 6d5e0e8 — Add observable adaptive survival agent (shared with Slice 3).

- [x] **3. Diagnose mistakes and adapt the strategy**
  Becomes usable: After a completed attempt, the agent identifies evidence-backed risks or mistakes, records a lesson, and makes a bounded strategy adjustment for a later attempt.
  Why now: Implements the central feedback-driven adaptation feature before building secondary presentation features.
  PRD ref: `prd.md > Features and Behavior > Diagnosis and Learning`; `prd.md > States and Boundaries`
  Spec ref: `spec.md > Agent Decision Engine`; `spec.md > Learning Engine`; `spec.md > Simplifications and Boundaries`
  Build: Implement rule-based diagnosis, bounded lessons, strategy versions, and explanations of why a change was proposed. Distinguish tested improvements from untested hypotheses. Do not rewrite source code or claim consciousness.
  Verify (mechanical): Test that a qualifying outcome creates the expected lesson, that the next adaptive attempt uses the permitted adjustment, and that unsuccessful changes are not reported as proven improvements.
  Learner check: Complete an attempt, inspect a recorded lesson, and compare the agent's later decision with its earlier behavior.
  Implementation commit: 6d5e0e8 — Add observable adaptive survival agent (shared with Slice 2).

- [ ] **4. Retain learning history between sessions**
  Becomes usable: Completed experiment records and bounded lessons survive a browser restart and can inform future adaptive attempts.
  Why now: Gives the agent continuity between sessions while keeping storage local and the architecture simple.
  PRD ref: `prd.md > States and Boundaries`; `prd.md > Features and Behavior > Diagnosis and Learning`
  Spec ref: `spec.md > Local Storage`; `spec.md > Data Model and Data Flow`; `spec.md > Important Failure Modes and Fallbacks`
  Build: Store versioned records and learning memory in browser localStorage. Validate loaded data, handle malformed or incompatible records safely, and provide a confirmed user-controlled reset.
  Verify (mechanical): Save a completed run, reload the application, verify the history and lessons remain, and test malformed storage and the reset confirmation.
  Learner check: Finish an attempt, close and reopen the application, and confirm that its history and lessons are still available.
  Commit: `Persist experiment history and learning memory`

- [ ] **5. Compare baseline and adaptive survival fairly**
  Becomes usable: The user can compare a fixed baseline strategy against an adaptive strategy under identical starting conditions and the same reproducible event sequence.
  Why now: Tests whether the learning mechanism produces measurable value instead of merely appearing intelligent.
  PRD ref: `prd.md > Features and Behavior > Baseline and Adaptive Comparison`
  Spec ref: `spec.md > Fair Experiment Rules`; `spec.md > Scoring and Evaluation`; `spec.md > Experiment Runner and Evaluator`
  Build: Implement controlled experiment runs and a comparison view. Report survival days as the primary outcome, with final resources, shortages, waste, strategy changes, and an honest conclusion.
  Verify (mechanical): Test matching experiment configurations, reproducible events, correct metric calculations, and honest handling of improvement, ties, regressions, and incomplete runs.
  Learner check: Run a baseline and adaptive experiment, then inspect the results and the evidence behind the conclusion.
  Commit: `Compare baseline and adaptive experiments`

- [ ] **6. Verify the complete journey and prepare the demo**
  Becomes usable: The complete proof of concept has reliable core behavior, automated tests, clear setup instructions, and a dashboard ready for final hands-on review.
  Why now: Final hardening comes after the core behavior and evidence are working, so polish does not conceal missing functionality.
  PRD ref: `prd.md > What We're Building`; `prd.md > States and Boundaries`; `prd.md > Non-Goals`
  Spec ref: `spec.md > Test Suite`; `spec.md > Important Failure Modes and Fallbacks`; `spec.md > Setup and Run Instructions`; `spec.md > Specification Review Checklist`
  Build: Cover important simulation, adaptation, persistence, and evaluation paths; resolve known failures; improve error and empty states; and document installation, running, testing, and demonstration.
  Verify (mechanical): Run the complete test suite and production build, follow the documented setup, and verify the core journey from a new run through learning and comparison.
  Learner check: Explore the finished dashboard independently and report anything confusing, broken, or different from your expectations.
  Commit: `Verify and document RealityLoop AI`

## Hands-on Checkpoints

- [ ] Early usable behavior explored â€” after Slice 2, so feedback can shape adaptation and comparison.
- [ ] Final kick-the-tires exploration and feedback completed.

## Final Review

- [ ] Final review complete â€” feedback resolved and learner confirms ready to ship.

## Code Tour and App Map

- [ ] Learning activity complete â€” guided route, focused alternative, prior practice connected, or brief recap.
- [ ] Optional edit and transfer reflection addressed â€” offered/declined/already covered/not applicable as appropriate.
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse.

Activity and evidence: Not yet completed.
Route and stops: To be recorded after implementation.
Edit outcome: Not yet completed.
Reflection: To be offered during the learning wrap-up.
Activity mode: To be recorded after implementation.

## Revisions


