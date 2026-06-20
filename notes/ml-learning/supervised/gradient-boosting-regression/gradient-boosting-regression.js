const homes = [
  { name: "Hot apartment · occupied", actual: 44 },
  { name: "Solar home · empty", actual: 16 },
  { name: "Older house · occupied", actual: 39 },
  { name: "Efficient condo · empty", actual: 18 },
  { name: "Large home · evening", actual: 35 },
  { name: "Shaded townhouse", actual: 24 },
  { name: "Pool pump · afternoon", actual: 33 },
  { name: "Solar home · occupied", actual: 23 },
];
const rounds = [
  { focus: "temperature", weights: [0.72, 0.18, 0.45, 0.2, 0.35, 0.3, 0.65, 0.25] },
  { focus: "occupancy", weights: [0.62, 0.3, 0.58, 0.34, 0.64, 0.28, 0.38, 0.55] },
  { focus: "solar generation", weights: [0.32, 0.7, 0.3, 0.45, 0.28, 0.35, 0.32, 0.68] },
  { focus: "insulation", weights: [0.4, 0.32, 0.72, 0.58, 0.42, 0.62, 0.38, 0.42] },
  { focus: "home size", weights: [0.36, 0.28, 0.48, 0.32, 0.7, 0.4, 0.52, 0.36] },
  { focus: "appliance load", weights: [0.42, 0.35, 0.4, 0.34, 0.55, 0.38, 0.74, 0.4] },
  { focus: "remaining hot homes", weights: [0.58, 0.3, 0.5, 0.34, 0.5, 0.42, 0.6, 0.38] },
  { focus: "remaining residuals", weights: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] },
];
const baseline = homes.reduce((sum, home) => sum + home.actual, 0) / homes.length;
const state = { count: 0, rate: 0.4, selected: 0 };
const ui = {
  steps: document.querySelector("#boost-steps"), prediction: document.querySelector("#boost-prediction"),
  total: document.querySelector("#boost-total"), mae: document.querySelector("#boost-mae"),
  actual: document.querySelector("#boost-actual"), residual: document.querySelector("#boost-residual"),
  treeCount: document.querySelector("#boost-tree-count"), stateTitle: document.querySelector("#boost-state-title"),
  stateCopy: document.querySelector("#boost-state-copy"), rounds: document.querySelector("#boost-rounds"),
  roundsOutput: document.querySelector("#boost-rounds-output"), rate: document.querySelector("#boost-rate"),
  rateOutput: document.querySelector("#boost-rate-output"), residuals: document.querySelector("#boost-residuals"),
  homeName: document.querySelector("#boost-home-name"),
};
function calculateModel() {
  const predictions = homes.map(() => baseline);
  const corrections = [];
  for (let round = 0; round < state.count; round += 1) {
    const residuals = homes.map((home, index) => home.actual - predictions[index]);
    const scaled = residuals.map((residual, index) => state.rate * residual * rounds[round].weights[index]);
    scaled.forEach((value, index) => { predictions[index] += value; });
    corrections.push({ focus: rounds[round].focus, scaled });
  }
  return { predictions, corrections };
}
function render() {
  const { predictions, corrections } = calculateModel();
  const residuals = homes.map((home, index) => home.actual - predictions[index]);
  const mae = residuals.reduce((sum, residual) => sum + Math.abs(residual), 0) / homes.length;
  const selectedPrediction = predictions[state.selected];
  const selectedResidual = residuals[state.selected];
  ui.steps.innerHTML = `<article class="boost-step baseline"><span>Baseline mean</span><strong>${baseline.toFixed(1)} kWh</strong><small>same start for every home</small></article>` +
    corrections.map((round, index) => `<article class="boost-step"><span>Tree ${index + 1} · ${round.focus}</span><strong>${round.scaled[state.selected] >= 0 ? "+" : ""}${round.scaled[state.selected].toFixed(1)} kWh</strong><small>scaled residual correction</small></article>`).join("");
  ui.prediction.textContent = `${selectedPrediction.toFixed(1)} kWh`;
  ui.total.textContent = `${selectedPrediction.toFixed(1)} kWh`;
  ui.mae.textContent = `${mae.toFixed(1)} kWh`;
  ui.actual.textContent = `${homes[state.selected].actual.toFixed(1)} kWh`;
  ui.residual.textContent = `${selectedResidual >= 0 ? "+" : ""}${selectedResidual.toFixed(1)} kWh`;
  ui.treeCount.textContent = state.count;
  ui.homeName.textContent = homes[state.selected].name;
  ui.roundsOutput.textContent = `${state.count} ${state.count === 1 ? "tree" : "trees"}`;
  ui.rateOutput.textContent = state.rate.toFixed(1);
  ui.residuals.innerHTML = homes.map((home, index) => {
    const residual = residuals[index];
    const width = Math.min(100, (Math.abs(residual) / 18) * 100);
    return `<button type="button" data-home="${index}" class="${index === state.selected ? "is-selected" : ""}"><span>${home.name}</span><div><i class="${residual >= 0 ? "positive" : "negative"}" style="width:${width}%"></i></div><strong>${residual >= 0 ? "+" : ""}${residual.toFixed(1)}</strong></button>`;
  }).join("");
  if (state.count === 0) {
    ui.stateTitle.textContent = "Baseline only"; ui.stateCopy.textContent = "Every home receives the mean. Large systematic residuals remain.";
  } else if (state.rate >= 0.8 && state.count >= 6) {
    ui.stateTitle.textContent = "Aggressive corrections"; ui.stateCopy.textContent = "Large steps fit quickly, but leave less room for later trees to correct gracefully.";
  } else if (state.count < 4) {
    ui.stateTitle.textContent = "Early revisions"; ui.stateCopy.textContent = "The largest patterns are shrinking, but meaningful residuals remain.";
  } else {
    ui.stateTitle.textContent = "Refined ensemble"; ui.stateCopy.textContent = "Several modest trees have converted a crude baseline into tailored forecasts.";
  }
}
ui.rounds.addEventListener("input", () => { state.count = Number(ui.rounds.value); render(); });
ui.rate.addEventListener("input", () => { state.rate = Number(ui.rate.value) / 10; render(); });
ui.residuals.addEventListener("click", (event) => { const button = event.target.closest("[data-home]"); if (!button) return; state.selected = Number(button.dataset.home); render(); });
render();
