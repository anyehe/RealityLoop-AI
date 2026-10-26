---
doc: prd
status: approved
---

# RealityLoop AI — Product Requirements

One line: RealityLoop AI is an observable survival simulation for people exploring how an AI agent can learn from past attempts, improve its plans, and demonstrate progress through evidence.

Source: `scope.md > The Unique Kernel`, `The Core Loop`, and `What "Working" Looks Like`.

## The Core Journey

1. **Open the dashboard.** The observer sees the survival challenge, settlement resources, simulation controls, and the agent's current status.
2. **Start a survival attempt.** The agent begins a 30-day challenge involving food, water, shelter, health, and unexpected events.
3. **Observe and act.** The agent assesses the current conditions, chooses an action, and receives an outcome from the simulation.
4. **Review decisions.** The observer can inspect recorded actions, outcomes, risks, and explanations of mistakes.
5. **Diagnose and learn.** At the end of an attempt, the agent reviews its results, identifies useful lessons, and updates its bounded strategy memory.
6. **Try again.** The agent uses relevant lessons from previous attempts to plan the next attempt. It should not assume every change is beneficial.
7. **Compare results.** The observer compares baseline and adaptive performance, examines strategy changes, and sees whether the evidence supports improvement.

Source: `scope.md > The Core Loop` and `What "Working" Looks Like`.

## Screens and Layout

The proof of concept uses one primary dashboard, organized into clear areas rather than many separate pages.

- **Simulation overview:** Current day, run status, and a clear way to start or restart an attempt.
- **Settlement resources:** Readable indicators for food, water, shelter, and health.
- **Settlement view:** A simple visual representation of the settlement and relevant events.
- **Agent observation and plan:** What the agent notices, its current priorities, its selected action, and a concise explanation of its decision.
- **Decision and event history:** A chronological record of actions, outcomes, mistakes, and significant events.
- **Learning and diagnosis:** What went wrong, the evidence supporting the diagnosis, the lesson retained, and the proposed strategy change.
- **Experiment comparison:** Results from baseline and adaptive runs, including survival, resource management, and recorded mistakes.

The observer should be able to follow a run, inspect an important decision, and review the accumulated lessons without losing the overall simulation context.

## Look and Feel

The visual direction is **Living World Research Lab**.

- Dark navy and deep teal provide a focused research-dashboard atmosphere.
- Resource indicators and the settlement view make the simulation state easy to understand.
- Clear typography and organized panels prioritize readability over decoration.
- Amber highlights risks and warnings; green indicates a verified positive result, not merely an agent's claim.
- Charts, run history, and decision records make changes over time visible.
- The interface should feel analytical, exploratory, and evidence-driven, not sensational or anthropomorphic.

Specific visual references have not been established. This direction is the recommended starting point accepted by the learner.

## Features and Behavior

### Survival Simulation

The simulation represents one settlement over a 30-day challenge.

- The environment tracks food, water, shelter, and health.
- A small set of unexpected events creates changing conditions and meaningful decisions.
- The agent observes available information and selects from permitted survival actions.
- The simulation records the action, resulting state, and relevant event.
- The observer can see the current day and whether the settlement remains alive.
- An attempt ends when the challenge is completed or the settlement can no longer survive under the simulation's rules.

Acceptance criteria:

- [ ] A user can start a new 30-day attempt.
- [ ] The dashboard displays the current day and all four resource categories.
- [ ] Actions and environmental events produce visible, recorded outcomes.
- [ ] The simulation has a clear completion or failure state.

Source: `scope.md > The POC Boundary`.

### Agent Decisions and Diagnosis

The agent should connect its decisions to observable outcomes.

- Before acting, it identifies relevant conditions and priorities.
- The dashboard shows the chosen action and a concise explanation of the evidence or rules behind it.
- When an outcome reveals a problem, the agent identifies the likely mistake or risk.
- It distinguishes recorded facts from interpretations or uncertain explanations.
- It recommends a change that addresses the diagnosed problem.
- It does not claim that a diagnosis is correct merely because it generated an explanation.

Acceptance criteria:

- [ ] An observer can inspect an action and its outcome.
- [ ] A recorded mistake or resource shortage can lead to a specific diagnosis.
- [ ] The diagnosis identifies the relevant evidence and proposes a practical adjustment.
- [ ] When evidence is insufficient, the agent communicates uncertainty instead of inventing a cause.

Source: `scope.md > The Unique Kernel` and `The Core Loop`.

### Cumulative Strategic Learning

The agent should build on lessons from multiple attempts, similar to how people and civilizations improve by retaining and building upon useful experience.

- At the end of a run, the agent reviews its outcomes and identifies lessons worth retaining.
- Retained lessons are available to inform later attempts in the same experiment.
- Before a new attempt, the agent uses relevant lessons to form a survival plan.
- The agent can change priorities or permitted strategy rules when earlier approaches repeatedly cause problems.
- It records what changed and why.
- If a change performs poorly, the agent reports the setback, reviews the evidence, preserves earlier lessons that remain useful, and considers another approach.
- A proposed improvement is not considered successful until its outcomes provide supporting evidence.
- Strategy adaptation is bounded and auditable; unrestricted rewriting of the application's source code is not part of this proof of concept.

Acceptance criteria:

- [ ] Lessons from more than one previous attempt can influence a later plan.
- [ ] The observer can see the retained lesson and the strategy change it informed.
- [ ] A later run records whether the intended change helped or harmed performance.
- [ ] A failed strategy change can be identified and reconsidered.
- [ ] The interface does not label an untested change as a proven improvement.

Source: `scope.md > The Unique Kernel`, `What "Working" Looks Like`, and `The POC Boundary`.

### Baseline and Adaptive Comparison

The project must show whether accumulated lessons provide measurable value.

- A baseline run uses a defined strategy without lessons accumulated from earlier adaptive attempts.
- An adaptive run uses the defined learning and strategy-update process.
- Comparisons use equivalent starting conditions and comparable event settings where the simulation permits.
- The dashboard compares survival days, final resource levels, and recorded mistakes.
- It shows the strategies or priorities that changed between attempts.
- The results may show improvement, no meaningful difference, or worse performance.
- The interface must report the measured outcome rather than promise that the adaptive agent will always win.

Acceptance criteria:

- [ ] The observer can view baseline and adaptive results side by side.
- [ ] The comparison displays survival duration, resource outcomes, and recorded mistakes.
- [ ] Relevant strategy changes are visible alongside the results.
- [ ] A regression or unsuccessful change is shown honestly.
- [ ] The comparison uses sufficiently consistent conditions to make the results interpretable.

Source: `scope.md > What "Working" Looks Like`.

## States and Boundaries

- **Before the first run:** Show the challenge, starting conditions, and a clear start action. Do not display invented learning history.
- **During a run:** Show the current day, resources, recent events, agent decisions, and run status.
- **After a successful run:** Show the final outcome, diagnosis, retained lessons, and available comparison.
- **After a failed run:** Explain the recorded failure, preserve the run history, and allow the observer to review lessons before another attempt.
- **No previous lessons:** Clearly indicate that this is the first attempt and no accumulated experience is available yet.
- **No proven improvement:** Report that the change is untested or did not improve the measured result.
- **Uncertain diagnosis:** Show what is known and what remains uncertain.
- **Invalid or incomplete run:** Do not treat missing results as successful evidence; explain that the run cannot be compared reliably.
- **Experiment history:** Lessons and results must remain available across attempts within the same experiment. Persistence after closing and reopening the application is not yet decided.
- **Agent boundaries:** The agent operates within defined simulation actions and strategy-update limits. Its explanations are evidence to inspect, not proof of consciousness or human-like subjective experience.

Source: `scope.md > The POC Boundary` and `Explicitly Cut`.

## Product Decisions

- **Thirty-day survival challenge:** Keeps the experiment small and provides a clear objective.
- **Cumulative strategic learning:** The learner wants the agent to build on lessons from multiple previous attempts, not just the most recent one.
- **Visible diagnosis and planning:** The learner wants the agent to identify mistakes and develop better plans rather than repeatedly waste resources.
- **Honest setbacks:** The learner accepted the recommendation that the agent should report failed changes, preserve useful lessons, and try another approach.
- **Evidence over claims:** The project compares measurable results rather than assuming the agent is improving.
- **Research-dashboard presentation:** The learner accepted a recommended visual direction focused on a clear, analytical, dark teal interface.
- **Bounded adaptation:** The first version tests controlled strategy changes rather than unrestricted self-modifying code.

## What We're Building

- One settlement and one 30-day survival scenario.
- Food, water, shelter, health, and a small set of environmental events.
- One primary dashboard for the simulation and agent monitoring.
- Recorded observations, actions, outcomes, mistakes, and diagnoses.
- A bounded memory of lessons accumulated across attempts.
- Strategy planning and controlled adaptation informed by those lessons.
- Honest handling of unsuccessful changes and uncertain diagnoses.
- Baseline-versus-adaptive comparison with visible metrics.
- Basic automated tests and setup documentation.

## Deferred From the POC

- Persistent learning history across application restarts: the first version needs reliable learning across attempts within an experiment; longer-term storage can be decided during implementation.
- Multiple settlements or agents: they add complexity without being necessary to demonstrate the core learning loop.
- Unrestricted source-code modification: risky and unnecessary for proving strategy adaptation.
- Advanced machine-learning research or model retraining: outside the first proof of concept.
- Accounts, multiplayer, online collaboration, and cloud synchronization: not needed for the core demonstration.

## Possible Later Enhancements

- More complex environments, longer campaigns, and additional survival challenges.
- Multiple agents with different strategies that can be compared.
- Longer-lived experiment histories and reusable lesson libraries.
- More advanced learning algorithms and controlled strategy-modification experiments.
- Further research into the difference between complex adaptive behavior and consciousness.

## Non-Goals

- Proving or claiming that the agent is conscious.
- Guaranteeing that every subsequent attempt performs better.
- Presenting generated explanations as verified facts without supporting evidence.
- Building a complete commercial survival game.
- Implementing multiplayer, combat, or a large open world.
- Allowing the agent to rewrite application code without controlled limits and evaluation.

## Open Questions

- **Persistence after restart — can wait until `4-spec`:** Should lessons survive closing and reopening the application, or is keeping them within the current experiment sufficient for the demo?
- **Event consistency for comparisons — resolve during `4-spec`:** The comparison needs equivalent starting conditions and sufficiently consistent events so changes in results can be interpreted fairly.
- **Exact scoring formula — resolve during `4-spec`:** Survival, resource outcomes, and mistakes are required measures; their precise definitions and any combined score remain to be specified.
