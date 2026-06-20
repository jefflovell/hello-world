const scenarios = {
  hot: { title: "Hot weekday", center: 38, truth: 37, spread: 12, features: ["temperature", "occupancy", "solar", "hour"] },
  mild: { title: "Mild weekend", center: 21, truth: 22, spread: 7, features: ["occupancy", "temperature", "appliances", "hour"] },
  storm: { title: "Storm evening", center: 31, truth: 34, spread: 16, features: ["weather", "solar", "temperature", "occupancy"] },
};
const state = { count: 7, scenario: "hot" };
const ui = {
  votes: document.querySelector("#tree-votes"), prediction: document.querySelector("#forest-prediction"),
  range: document.querySelector("#forest-range"), marker: document.querySelector("#forest-marker"),
  spread: document.querySelector("#forest-spread"), singleError: document.querySelector("#single-error"),
  forestError: document.querySelector("#forest-error"), title: document.querySelector("#forest-scenario-title"),
  truth: document.querySelector("#forest-truth"),
  stateTitle: document.querySelector("#forest-state-title"), stateCopy: document.querySelector("#forest-state-copy"),
  count: document.querySelector("#tree-count"), countOutput: document.querySelector("#tree-count-output"),
};

function seededNoise(index, scenario) {
  const seed = Math.sin((index + 1) * 91.17 + scenario.center * 3.1) * 43758.5453;
  return ((seed - Math.floor(seed)) * 2 - 1) * scenario.spread;
}

function treeDetails(index, scenario) {
  const sampleSeed = Math.abs(Math.sin((index + 2) * 18.73 + scenario.truth));
  const uniqueHomes = 7 + Math.floor(sampleSeed * 6);
  const firstFeature = scenario.features[index % scenario.features.length];
  const secondFeature = scenario.features[(index + 2) % scenario.features.length];
  return { uniqueHomes, firstFeature, secondFeature };
}

function render() {
  const scenario = scenarios[state.scenario];
  const values = Array.from({ length: state.count }, (_, index) => scenario.center + seededNoise(index, scenario));
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const averageTreeError = values.reduce((sum, value) => sum + Math.abs(value - scenario.truth), 0) / values.length;
  const min = Math.min(...values); const max = Math.max(...values);
  ui.votes.innerHTML = values.map((value, index) => {
    const details = treeDetails(index, scenario);
    return `<article>
      <span>Tree ${index + 1}</span>
      <strong>${value.toFixed(1)} kWh</strong>
      <small>${details.uniqueHomes}/14 unique homes</small>
      <small>first split: ${details.firstFeature} or ${details.secondFeature}</small>
    </article>`;
  }).join("");
  ui.prediction.textContent = `${average.toFixed(1)} kWh`;
  ui.spread.textContent = `${(max - min).toFixed(1)} kWh`;
  ui.truth.textContent = `${scenario.truth.toFixed(1)} kWh`;
  ui.singleError.textContent = `${averageTreeError.toFixed(1)} kWh`;
  ui.forestError.textContent = `${Math.abs(average - scenario.truth).toFixed(1)} kWh`;
  ui.title.textContent = scenario.title;
  ui.countOutput.textContent = `${state.count} ${state.count === 1 ? "tree" : "trees"}`;
  ui.range.style.left = `${(min / 55) * 100}%`; ui.range.style.width = `${((max - min) / 55) * 100}%`;
  ui.marker.style.left = `${(average / 55) * 100}%`;
  if (state.count === 1) {
    ui.stateTitle.textContent = "One opinion";
    ui.stateCopy.textContent = "This is a decision tree, not yet a forest. Its quirks pass directly into the forecast.";
  } else if (state.count < 9) {
    ui.stateTitle.textContent = "Small committee";
    ui.stateCopy.textContent = "A few trees soften individual mistakes, but one unusual vote can still move the average.";
  } else {
    ui.stateTitle.textContent = "Stable chorus";
    ui.stateCopy.textContent = "Many varied trees make the average less sensitive to any single tree.";
  }
}

ui.count.addEventListener("input", () => { state.count = Number(ui.count.value); render(); });
document.querySelectorAll("[data-scenario]").forEach((button) => button.addEventListener("click", () => {
  state.scenario = button.dataset.scenario;
  document.querySelectorAll("[data-scenario]").forEach((item) => item.classList.toggle("is-selected", item === button));
  render();
}));
render();
