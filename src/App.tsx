import { evaluateStrategy } from "./simulation/evaluation";
import { compareStrategies, evaluateStressScenarios } from "./simulation/comparison";
import { useEffect, useRef, useState } from "react";
import {
  advanceDay,
  INITIAL_STATE,
  type Resources,
  type SimulationState,
} from "./simulation/engine";
import { advanceAdaptiveDay } from "./simulation/adaptiveEngine";
import {
  STORAGE_KEY,
  createSavedExperiment,
  loadLearningHistory,
  saveLearningHistory,
  type LearningHistory,
} from "./simulation/storage";
import { DashboardHeader, Sidebar } from "./components/DashboardChrome";
import "./App.css";

const RESOURCE_KEYS: (keyof Resources)[] = [
  "food",
  "water",
  "shelter",
  "health",
];

const RESOURCE_LABELS: Record<keyof Resources, string> = {
  food: "Food",
  water: "Water",
  shelter: "Shelter",
  health: "Health",
};

const ACTION_LABELS = {
  forage: "Forage for food",
  "collect-water": "Collect water",
  "repair-shelter": "Repair shelter",
  rest: "Rest and recover",
};

function ResourceBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const status =
    value <= 20 ? "critical" : value <= 45 ? "warning" : "healthy";

  return (
    <div className="resource">
      <div className="resource-heading">
        <span>{label}</span>
        <strong>{value}/100</strong>
      </div>
      <div
        className="resource-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <div
          className={`resource-fill ${status}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ResourceTrendChart({
  simulation,
}: {
  simulation: SimulationState;
}) {
  const chartWidth = 600;
  const chartHeight = 230;
  const padding = 36;

  const points = [
    { day: 1, resources: INITIAL_STATE.resources },
    ...simulation.records.map((record) => ({
      day: record.day,
      resources: record.resourcesAfter,
    })),
  ];

  const x = (day: number) =>
    padding + ((day - 1) / 29) * (chartWidth - padding * 2);

  const y = (value: number) =>
    chartHeight -
    padding -
    (value / 100) * (chartHeight - padding * 2);

  const series = [
    { key: "food" as const, label: "Food", color: "#0FA4AF" },
    { key: "water" as const, label: "Water", color: "#70B7FF" },
    { key: "shelter" as const, label: "Shelter", color: "#D9A17D" },
    { key: "health" as const, label: "Health", color: "#75D6A2" },
  ];

  return (
    <section className="panel trend-panel" id="analytics">
      <div className="section-heading">
        <div>
          <p className="eyebrow">EXPERIMENT ANALYTICS</p>
          <h3>Resource trends</h3>
        </div>
        <span className="muted">
          {simulation.records.length} days recorded
        </span>
      </div>

      <p className="muted trend-description">
        Track how each resource changes as the agent acts and environmental
        events affect the settlement. Values are measured on a 0–100 scale.
      </p>

      <div className="trend-chart-wrap">
        <svg
          className="trend-chart"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label="Line chart of food, water, shelter, and health from day 1 through the current simulation day"
        >
          {[0, 25, 50, 75, 100].map((value) => (
            <g key={value}>
              <line
                x1={padding}
                y1={y(value)}
                x2={chartWidth - padding}
                y2={y(value)}
                stroke="currentColor"
                strokeOpacity="0.14"
                strokeDasharray="4 5"
              />
              <text
                x={padding - 8}
                y={y(value) + 4}
                textAnchor="end"
                fontSize="11"
                fill="currentColor"
                opacity="0.75"
              >
                {value}
              </text>
            </g>
          ))}

          {[1, 10, 20, 30].map((day) => (
            <text
              key={day}
              x={x(day)}
              y={chartHeight - 8}
              textAnchor="middle"
              fontSize="11"
              fill="currentColor"
              opacity="0.75"
            >
              {day}
            </text>
          ))}

          {series.map((item) => (
            <g key={item.key}>
              <polyline
                points={points
                  .map(
                    (point) =>
                      `${x(point.day)},${y(point.resources[item.key])}`,
                  )
                  .join(" ")}
                fill="none"
                stroke={item.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {points.map((point, index) => (
                <circle
                  key={`${item.key}-${point.day}-${index}`}
                  cx={x(point.day)}
                  cy={y(point.resources[item.key])}
                  r={index === points.length - 1 ? 4 : 2}
                  fill={item.color}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      <div className="trend-legend">
        {series.map((item) => (
          <span className="trend-legend-item" key={item.key}>
            <span
              className="trend-legend-dot"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>

      <div className="trend-current-values">
        {series.map((item) => (
          <div className="trend-value" key={item.key}>
            <span>{item.label}</span>
            <strong>{simulation.resources[item.key]}/100</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
function App() {
  const [agentMode, setAgentMode] = useState<"baseline" | "adaptive">("adaptive");
  const [simulation, setSimulation] =
    useState<SimulationState>(() => ({
      ...INITIAL_STATE,
      resources: { ...INITIAL_STATE.resources },
      history: [...INITIAL_STATE.history],
      records: [],
    }));

  const strategyComparison = compareStrategies();
  const baselineEvaluation = evaluateStrategy(strategyComparison.baseline);
  const adaptiveEvaluation = evaluateStrategy(strategyComparison.adaptive);
  const stressScenarios = evaluateStressScenarios();

  // Load saved learning history safely, including when storage is unavailable.
  const [learningHistory, setLearningHistory] = useState<LearningHistory>(() => {
    try {
      return loadLearningHistory(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      return loadLearningHistory(null);
    }
  });

  const savedRunRef = useRef(false);

  const finished = !simulation.alive || simulation.day >= 30;

  useEffect(() => {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      saveLearningHistory(learningHistory),
    );
  } catch {
    console.error("Unable to save RealityLoop learning history.");
  }
}, [learningHistory]);

  const latestRecord =
    simulation.records[simulation.records.length - 1];


function advanceSelectedDay(current: SimulationState): SimulationState {
  return agentMode === "adaptive"
    ? advanceAdaptiveDay(current, learningHistory.experiments)
    : advanceDay(current);
}

function applySimulationUpdate(next: SimulationState) {
  setSimulation(next);

  const runFinished = !next.alive || next.day >= 30;

  if (!runFinished || next.records.length === 0 || savedRunRef.current) {
    return;
  }

  const experiment = createSavedExperiment(next, agentMode);

  if (!experiment) {
    return;
  }

  savedRunRef.current = true;

  setLearningHistory((current) => ({
    ...current,
    experiments: [...current.experiments, experiment],
  }));
}

function handleAdvanceDay() {
  const next = advanceSelectedDay(simulation);
  applySimulationUpdate(next);
}

function handleAdvanceFiveDays() {
  let next = simulation;

  for (let i = 0; i < 5 && next.alive && next.day < 30; i += 1) {
    next = advanceSelectedDay(next);
  }

  applySimulationUpdate(next);
}


  function restartSimulation() {
  savedRunRef.current = false;

  setSimulation({
    ...INITIAL_STATE,
    resources: { ...INITIAL_STATE.resources },
    history: [...INITIAL_STATE.history],
    records: [],
  });
}

  const latestHistory =
    simulation.history[simulation.history.length - 1];

  const dashboardStatus = finished
    ? simulation.alive ? "MISSION COMPLETE" : "SURVIVAL FAILED"
    : "LOCAL SIMULATION";

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-workspace">
        <DashboardHeader status={dashboardStatus} />
        <main className="dashboard-content">

      <section className="intro" id="dashboard">
        <p className="eyebrow">MISSION CONTROL / EXPERIMENT 001</p>
        <h2>Survive. Observe. Adapt.</h2>
        <p>
          Guide an agent through a 30-day survival challenge.
          Every decision changes the settlement's condition.
        </p>
      </section>

      <section className="overview-grid" id="simulation">
        <article className="panel day-panel">
          <p className="eyebrow">SIMULATION PROGRESS</p>
          <div className="day-number">
            {Math.min(simulation.day, 30)}
            <span> / 30</span>
          </div>
          <div className="day-track">
            <div
              className="day-fill"
              style={{
                width: `${(Math.min(simulation.day, 30) / 30) * 100}%`,
              }}
            />
          </div>
          <p className="muted">
            {finished
              ? simulation.alive
                ? "Mission complete"
                : "Mission ended"
              : "Settlement is active"}
          </p>
        </article>

        <article className="panel mission-panel">
          <p className="eyebrow">CURRENT OBJECTIVE</p>
          <h3>Keep the settlement alive</h3>
          <p className="muted">
            Monitor supplies, protect the shelter, and maintain health.
            The agent prioritizes urgent survival needs.
          </p>
          <div className="mission-tags">
            <span>01 / Observe</span>
            <span>02 / Decide</span>
            <span>03 / Evaluate</span>
          </div>
        </article>
      </section>

      <ResourceTrendChart simulation={simulation} />

      <section className="main-grid">
        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SETTLEMENT STATUS</p>
              <h3>Vital resources</h3>
            </div>
            <span className="muted">LIVE STATE</span>
          </div>

          <div className="resource-list">
            {RESOURCE_KEYS.map((key) => (
              <ResourceBar
                key={key}
                label={RESOURCE_LABELS[key]}
                value={simulation.resources[key]}
              />
            ))}
          </div>

          <section className="evidence-section">
            <p className="eyebrow">AGENT OBSERVATION</p>
            <h3>What the agent sees</h3>
            <p>
              {latestRecord
                ? latestRecord.observation
                : "The settlement is ready. Advance one day to record the agent's first decision."}
            </p>
          </section>

          <section className="evidence-section">
            <p className="eyebrow">DECISION EXPLANATION</p>
            <h3>
              {latestRecord
                ? ACTION_LABELS[latestRecord.action]
                : "Waiting for the first decision"}
            </h3>
            <p>
              {latestRecord
                ? latestRecord.explanation
                : "The agent will assess available resources before selecting an action."}
            </p>
            {latestRecord && (
              <p className="muted">
                Baseline decision: {ACTION_LABELS[latestRecord.baselineAction]}
              </p>
            )}
            {latestRecord?.diagnoses.length ? (
              <ul className="diagnosis-list">
                {latestRecord.diagnoses.map((diagnosis) => (
                  <li key={diagnosis}>{diagnosis}</li>
                ))}
              </ul>
            ) : null}
            {latestRecord?.strategyAdjustment && (
              <p className="strategy-adjustment">
                <strong>Strategy adjusted:</strong>{" "}
                {latestRecord.strategyAdjustment}
              </p>
            )}
          </section>

          <section className="evidence-section">
            <p className="eyebrow">ENVIRONMENTAL EVENT</p>
            {latestRecord?.event ? (
              <>
                <h3>{latestRecord.event.name}</h3>
                <p>{latestRecord.event.description}</p>
              </>
            ) : (
              <>
                <h3>No major event recorded</h3>
                <p>
                  {latestRecord
                    ? "No scheduled environmental event occurred on this day."
                    : "Scheduled events can affect resources as the simulation advances."}
                </p>
              </>
            )}
          </section>

          <section className="evidence-section">
            <p className="eyebrow">RESOURCE IMPACT</p>
            <h3>Before and after the day</h3>
            {latestRecord ? (
              <div className="impact-list">
                {RESOURCE_KEYS.map((key) => {
                  const before = latestRecord.resourcesBefore[key];
                  const after = latestRecord.resourcesAfter[key];
                  const delta = after - before;

                  return (
                    <div className="impact-row" key={key}>
                      <span>{RESOURCE_LABELS[key]}</span>
                      <span>{before} → {after}</span>
                      <strong
                        className={
                          delta > 0
                            ? "impact-positive"
                            : delta < 0
                              ? "impact-negative"
                              : ""
                        }
                      >
                        {delta > 0 ? "+" : ""}
                        {delta}
                      </strong>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>
                Resource changes will appear after the first simulated day.
              </p>
            )}
          </section>

          <div className="agent-box">
            <span className="agent-icon">AI</span>
            <div>
              <p className="eyebrow">LATEST SIMULATION RESULT</p>
              <p>{latestHistory}</p>
            </div>
          </div>

          <section className="evidence-section mode-selector">
            <p className="eyebrow">AGENT MODE</p>
            <h3>Choose a strategy</h3>
            <p className="muted">
              Baseline uses fixed thresholds. Adaptive uses recent outcomes
              to adjust its priorities. Restart to switch modes after a run begins.
            </p>
            <div className="action-row">
              <button
                className={agentMode === "baseline" ? "primary-button" : "secondary-button"}
                onClick={() => setAgentMode("baseline")}
                disabled={simulation.records.length > 0}
                aria-pressed={agentMode === "baseline"}
              >
                Baseline
              </button>
              <button
                className={agentMode === "adaptive" ? "primary-button" : "secondary-button"}
                onClick={() => setAgentMode("adaptive")}
                disabled={simulation.records.length > 0}
                aria-pressed={agentMode === "adaptive"}
              >
                Adaptive
              </button>
            </div>
            <p className="muted">
              Selected: {agentMode === "adaptive" ? "Adaptive agent" : "Baseline agent"}
            </p>
          </section>

          <div className="action-row">
            <button
              className="primary-button"
              onClick={handleAdvanceDay}
              disabled={finished}
            >
              {finished ? "Simulation ended" : "Advance one day"}
              {!finished && <span aria-hidden="true"> →</span>}
            </button>
            <button
              className="secondary-button"
              onClick={handleAdvanceFiveDays}
              disabled={finished}
            >
              Advance 5 days
            </button>
            <button className="secondary-button" onClick={restartSimulation}>
              Restart
            </button>
          </div>
        </article>

        <article className="panel history-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">DECISION RECORD</p>
              <h3>Simulation log</h3>
            </div>
            <span className="log-count">
              {simulation.history.length} entries
            </span>
          </div>

          <div className="history-list" aria-live="polite">
            {[...simulation.history].reverse().map((entry, index) => (
              <div className="history-entry" key={`${entry}-${index}`}>
                <span className="history-marker" />
                <p>{entry}</p>
              </div>
            ))}
          </div>

          <div className="evidence-section">
            <p className="eyebrow">EXPERIMENT SUMMARY</p>
            <div className="summary-stat">
              <span>Agent mode</span>
              <strong>{latestRecord?.mode ?? "Not started"}</strong>
            </div>
            <div className="summary-stat">
              <span>Days advanced</span>
              <strong>{simulation.records.length}</strong>
            </div>
            <div className="summary-stat">
              <span>Events encountered</span>
              <strong>
                {simulation.records.filter((record) => record.event).length}
              </strong>
            </div>
            <div className="summary-stat">
              <span>Settlement status</span>
              <strong>
                {!simulation.alive
                  ? "Failed"
                  : simulation.day >= 30
                    ? "Survived"
                    : "Active"}
              </strong>
            </div>
          </div>
        </article>
      </section>


      <section className="panel saved-experiments-panel" id="experiments">
        <div className="section-heading">
          <div>
            <p className="eyebrow">LEARNING HISTORY</p>
            <h3>Saved experiments</h3>
          </div>
          <span className="log-count">
            {learningHistory.experiments.length} saved
          </span>
        </div>

        {learningHistory.experiments.length === 0 ? (
          <p className="muted">
            No completed experiments saved yet. Complete a simulation
            to record its results here.
          </p>
        ) : (
          <div className="history-list">
            {[...learningHistory.experiments]
              .reverse()
              .map((experiment) => (
                <article
                  className="history-entry"
                  key={experiment.id}
                >
                  <div>
                    <h4>
                      {experiment.mode === "adaptive"
                        ? "Adaptive agent"
                        : "Baseline agent"}
                    </h4>

                    <p className="muted">
                      Completed:{" "}
                      {new Date(
                        experiment.completedAt,
                      ).toLocaleString()}
                    </p>

                    <p>
                      Result:{" "}
                      {experiment.survived
                        ? "Survived to day 30"
                        : "Survival failed"}
                    </p>

                    <p>
                      Final day: {experiment.finalDay} / 30
                    </p>

                    <p>
                      Recorded decisions: {experiment.records.length}
                    </p>

                    <div className="summary-stat">
                      <span>Food</span>
                      <strong>{experiment.finalResources.food}</strong>
                    </div>
                    <div className="summary-stat">
                      <span>Water</span>
                      <strong>{experiment.finalResources.water}</strong>
                    </div>
                    <div className="summary-stat">
                      <span>Shelter</span>
                      <strong>{experiment.finalResources.shelter}</strong>
                    </div>
                    <div className="summary-stat">
                      <span>Health</span>
                      <strong>{experiment.finalResources.health}</strong>
                    </div>

                    {experiment.lessons.length > 0 && (
                      <div>
                        <p className="eyebrow">RECORDED LESSONS</p>
                        <ul className="diagnosis-list">
                          {experiment.lessons.map((lesson) => (
                            <li key={lesson}>{lesson}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>


      <section className="panel comparison-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CONTROLLED EVALUATION</p>
            <h3>Baseline vs. adaptive</h3>
          </div>
          <span className="log-count">30-day scenario</span>
        </div>

        <p className="muted">
          Both strategies use identical starting resources and the same
          deterministic environmental event schedule.
        </p>

        <div className="overview-grid">
          {[strategyComparison.baseline, strategyComparison.adaptive].map(
            (result) => (
              <article className="panel" key={result.mode}>
                <p className="eyebrow">
                  {result.mode === "adaptive"
                    ? "ADAPTIVE STRATEGY"
                    : "BASELINE STRATEGY"}
                </p>

                <h3>
                  {result.survived
                    ? "Survived to day 30"
                    : `Survived until day ${result.finalDay}`}
                </h3>

                <div className="summary-stat">
                  <span>Final day</span>
                  <strong>{result.finalDay} / 30</strong>
                </div>

                <div className="summary-stat">
                  <span>Decisions recorded</span>
                  <strong>{result.decisions}</strong>
                </div>

                {(
                  ["food", "water", "shelter", "health"] as const
                ).map((resource) => (
                  <div className="summary-stat" key={resource}>
                    <span>
                      {resource.charAt(0).toUpperCase() +
                        resource.slice(1)}
                    </span>
                    <strong>{result.finalResources[resource]}</strong>
                  </div>
                ))}
              </article>
            ),
          )}
        </div>


          <div className="evidence-section evaluation-report">
            <p className="eyebrow">RESOURCE SAFETY & DECISION ANALYSIS</p>
            <h3>How well did each strategy manage risk?</h3>
            <p className="muted">
              Minimum levels and low-resource snapshots are calculated from
              recorded daily outcomes. Thresholds are evaluation criteria,
              not simulation rules.
            </p>

            <div className="evaluation-grid">
              {[
                {
                  label: "Baseline",
                  evaluation: baselineEvaluation,
                },
                {
                  label: "Adaptive",
                  evaluation: adaptiveEvaluation,
                },
              ].map(({ label, evaluation }) => (
                <article className="evaluation-card" key={label}>
                  <h3>{label}</h3>

                  <div className="evaluation-row evaluation-header">
                    <span>Resource</span>
                    <span>Minimum</span>
                    <span>Low snapshots</span>
                  </div>

                  {RESOURCE_KEYS.map((resource) => (
                    <div className="evaluation-row" key={resource}>
                      <span>{RESOURCE_LABELS[resource]}</span>
                      <strong>
                        {evaluation.minimumResources[resource]}
                      </strong>
                      <strong>
                        {evaluation.daysAtOrBelowThreshold[resource]}
                      </strong>
                    </div>
                  ))}

                  <p className="eyebrow action-count-heading">
                    ACTION COUNTS
                  </p>

                  {(
                    [
                      ["forage", "Forage"],
                      ["collect-water", "Collect water"],
                      ["repair-shelter", "Repair shelter"],
                      ["rest", "Rest"],
                    ] as const
                  ).map(([action, label]) => (
                    <div className="summary-stat" key={action}>
                      <span>{label}</span>
                      <strong>{evaluation.actionCounts[action]}</strong>
                    </div>
                  ))}
                </article>
              ))}
            </div>
          </div>

        <div className="evidence-section stress-scenarios-section">
          <p className="eyebrow">ROBUSTNESS CHECK</p>
          <h3>Does the strategy hold up under resource stress?</h3>
          <p className="muted">
            Both strategies face the same fixed event schedule within each test.
            These tests vary starting resources; they are not randomized weather simulations.
          </p>
          <div className="stress-scenario-grid">
            {stressScenarios.map((scenario) => (
              <article className="stress-scenario-card" key={scenario.id}>
                <h4>{scenario.label}</h4>
                <p className="muted">{scenario.description}</p>
                <div className="summary-stat">
                  <span>Baseline survival</span>
                  <strong>{scenario.comparison.baseline.survived ? "Day 30" : `Day ${scenario.comparison.baseline.finalDay}`}</strong>
                </div>
                <div className="summary-stat">
                  <span>Adaptive survival</span>
                  <strong>{scenario.comparison.adaptive.survived ? "Day 30" : `Day ${scenario.comparison.adaptive.finalDay}`}</strong>
                </div>
                <div className="summary-stat">
                  <span>Low-water snapshots (baseline / adaptive)</span>
                  <strong>{evaluateStrategy(scenario.comparison.baseline).daysAtOrBelowThreshold.water} / {evaluateStrategy(scenario.comparison.adaptive).daysAtOrBelowThreshold.water}</strong>
                </div>
                <div className="summary-stat">
                  <span>Low-shelter snapshots (baseline / adaptive)</span>
                  <strong>{evaluateStrategy(scenario.comparison.baseline).daysAtOrBelowThreshold.shelter} / {evaluateStrategy(scenario.comparison.adaptive).daysAtOrBelowThreshold.shelter}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="evidence-section">
          <p className="eyebrow">COMPARISON RESULTS</p>

          <div className="summary-stat">
            <span>Different decisions</span>
            <strong>
              {strategyComparison.differentDecisionCount}
            </strong>
          </div>

          <div className="summary-stat">
            <span>Adaptive food difference</span>
            <strong>
              {strategyComparison.resourceDifferences.food > 0 ? "+" : ""}
              {strategyComparison.resourceDifferences.food}
            </strong>
          </div>

          <div className="summary-stat">
            <span>Adaptive water difference</span>
            <strong>
              {strategyComparison.resourceDifferences.water > 0 ? "+" : ""}
              {strategyComparison.resourceDifferences.water}
            </strong>
          </div>

          <div className="summary-stat">
            <span>Adaptive shelter difference</span>
            <strong>
              {strategyComparison.resourceDifferences.shelter > 0
                ? "+"
                : ""}
              {strategyComparison.resourceDifferences.shelter}
            </strong>
          </div>

          <div className="summary-stat">
            <span>Adaptive health difference</span>
            <strong>
              {strategyComparison.resourceDifferences.health > 0
                ? "+"
                : ""}
              {strategyComparison.resourceDifferences.health}
            </strong>
          </div>
        </div>

        <p className="muted">
          Results represent one deterministic scenario, not proof that
          adaptive behavior performs better across all conditions.
        </p>
      </section>



          <footer className="footer" id="about">
            <span>REALITYLOOP AI</span>
            <span>Deterministic simulation · Local prototype · No external AI API</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
