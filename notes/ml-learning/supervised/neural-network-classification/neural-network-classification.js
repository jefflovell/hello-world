const nnState = {
  capacity: 0.7,
  features: { affinity: 84, awareness: 78, runtime: 28, buzz: 76 },
};

const nnPresets = {
  reinforce: { affinity: 84, awareness: 78, runtime: 28, buzz: 76, capacity: 0.7 },
  conflict: { affinity: 72, awareness: 34, runtime: 82, buzz: 28, capacity: 0.7 },
  overfit: { affinity: 94, awareness: 92, runtime: 12, buzz: 96, capacity: 0.95 },
  novel: { affinity: 48, awareness: 90, runtime: 88, buzz: 86, capacity: 0.85 },
};

const nnChart = document.querySelector("#nn-classifier-chart");
const nnInputs = Array.from(document.querySelectorAll("[data-nn-feature]"));
const nnPresetButtons = Array.from(document.querySelectorAll("[data-nn-preset]"));
const nnCapacityInput = document.querySelector("#nn-capacity");

function nnSetText(id, value) {
  const element = document.querySelector(id);
  if (element) element.textContent = value;
}

function relu(value) {
  return Math.max(0, value);
}

function softmax(logits) {
  const maxLogit = Math.max(...logits);
  const exps = logits.map((value) => Math.exp(value - maxLogit));
  const total = exps.reduce((sum, value) => sum + value, 0);
  return exps.map((value) => value / total);
}

function calculateNetwork() {
  const x = Object.fromEntries(Object.entries(nnState.features).map(([key, value]) => [key, value / 100]));
  const h1 = relu(1.2 * x.affinity + 1.1 * x.awareness - 0.8 * x.runtime + 0.4 * x.buzz - 0.7) * nnState.capacity;
  const h2 = relu(0.4 * x.affinity - 1.2 * x.runtime + 1.4 * x.buzz - 0.35) * nnState.capacity;
  const h3 = relu(-0.5 * x.affinity + 1.3 * x.runtime + 0.9 * x.awareness - 0.45) * nnState.capacity;
  const logits = [
    1.8 * h1 + 0.9 * h2 - 1.1 * h3,
    -0.8 * h1 - 0.7 * h2 + 1.7 * h3,
    -0.4 * h1 + 0.5 * h2 + 0.4 * h3,
  ];
  const probs = softmax(logits);
  return { hidden: [h1, h2, h3], logits, probs };
}

function drawNnChart(result) {
  if (!nnChart) return;
  const inputs = [
    ["Affinity", nnState.features.affinity],
    ["Awareness", nnState.features.awareness],
    ["Runtime", nnState.features.runtime],
    ["Buzz", nnState.features.buzz],
  ];
  const classes = ["Finish", "Abandon", "Uncertain"];
  const inputNodes = inputs.map((item, i) => ({ x: 120, y: 80 + i * 76, label: item[0], value: item[1] }));
  const hiddenNodes = result.hidden.map((value, i) => ({ x: 360, y: 112 + i * 82, label: `H${i + 1}`, value }));
  const outputNodes = result.probs.map((value, i) => ({ x: 590, y: 112 + i * 82, label: classes[i], value }));
  const edges = [];
  inputNodes.forEach((input) => hiddenNodes.forEach((hidden) => edges.push(`<path class="nn-class-edge" d="M${input.x + 28} ${input.y}L${hidden.x - 30} ${hidden.y}" />`)));
  hiddenNodes.forEach((hidden) => outputNodes.forEach((output) => edges.push(`<path class="nn-class-edge strong" d="M${hidden.x + 30} ${hidden.y}L${output.x - 36} ${output.y}" />`)));
  const nodeMarkup = (nodes, cls) => nodes.map((node) => `<g class="nn-class-node ${cls}"><circle cx="${node.x}" cy="${node.y}" r="${cls === "output" ? 38 : 30}" /><text x="${node.x}" y="${node.y - 3}">${node.label}</text><text class="value" x="${node.x}" y="${node.y + 16}">${cls === "output" ? `${Math.round(node.value * 100)}%` : node.value.toFixed ? node.value.toFixed(2) : node.value}</text></g>`).join("");
  nnChart.innerHTML = `${edges.join("")}${nodeMarkup(inputNodes, "input")}${nodeMarkup(hiddenNodes, "hidden")}${nodeMarkup(outputNodes, "output")}`;
}

function updateNnLab() {
  const result = calculateNetwork();
  const labels = ["Finish", "Abandon", "Uncertain"];
  const ranked = result.probs.map((prob, index) => ({ prob, label: labels[index] })).sort((a, b) => b.prob - a.prob);
  const gap = ranked[0].prob - ranked[1].prob;
  nnSetText("#nn-decision", ranked[0].label);
  nnSetText("#nn-finish-prob", `${Math.round(result.probs[0] * 100)}%`);
  nnSetText("#nn-abandon-prob", `${Math.round(result.probs[1] * 100)}%`);
  nnSetText("#nn-uncertain-prob", `${Math.round(result.probs[2] * 100)}%`);
  nnSetText("#nn-gap", gap.toFixed(2));
  nnSetText("#nn-capacity-label", nnState.capacity.toFixed(2));
  if (nnCapacityInput) nnCapacityInput.value = Math.round(nnState.capacity * 100);
  Object.entries(nnState.features).forEach(([key, value]) => {
    nnSetText(`#nn-${key}-value`, value);
    const input = document.querySelector(`[data-nn-feature="${key}"]`);
    if (input) input.value = value;
  });

  let trustTitle = "Held-out check";
  let trustCopy = "The probability is useful only if similar held-out examples support this boundary.";
  if (gap < 0.12) {
    trustTitle = "Close probabilities";
    trustCopy = "The top classes are close. Treat the answer as uncertainty, not a confident decision.";
  } else if (nnState.capacity > 0.9) {
    trustTitle = "Capacity warning";
    trustCopy = "Higher capacity can create confident boundaries around training quirks. Held-out loss must grade it.";
  } else if (nnState.features.runtime > 80 && nnState.features.buzz > 80) {
    trustTitle = "New-region warning";
    trustCopy = "This feature mix is unusual. The network may be extrapolating beyond familiar training examples.";
  }
  nnSetText("#nn-trust-title", trustTitle);
  nnSetText("#nn-trust-copy", trustCopy);
  drawNnChart(result);
}

nnInputs.forEach((input) => {
  input.addEventListener("input", () => {
    nnState.features[input.dataset.nnFeature] = Number(input.value);
    nnPresetButtons.forEach((button) => button.classList.remove("is-selected"));
    updateNnLab();
  });
});

nnCapacityInput?.addEventListener("input", () => {
  nnState.capacity = Number(nnCapacityInput.value) / 100;
  updateNnLab();
});

nnPresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const preset = nnPresets[button.dataset.nnPreset];
    if (!preset) return;
    nnState.capacity = preset.capacity;
    Object.keys(nnState.features).forEach((key) => {
      nnState.features[key] = preset[key];
    });
    nnPresetButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
    updateNnLab();
  });
});

document.querySelector("#nn-reset")?.addEventListener("click", () => {
  const preset = nnPresets.reinforce;
  nnState.capacity = preset.capacity;
  Object.keys(nnState.features).forEach((key) => {
    nnState.features[key] = preset[key];
  });
  nnPresetButtons.forEach((button) => button.classList.toggle("is-selected", button.dataset.nnPreset === "reinforce"));
  updateNnLab();
});

nnPresetButtons[0]?.classList.add("is-selected");
updateNnLab();
