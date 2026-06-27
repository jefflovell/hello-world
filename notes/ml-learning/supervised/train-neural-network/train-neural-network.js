const trainingExamples = [
  { name: "Broad family adventure", x: [0.82, 0.88, 0.76], y: 0.87, note: "High affinity, high awareness, strong tone fit." },
  { name: "Quiet critical favorite", x: [0.78, 0.35, 0.82], y: 0.64, note: "Great fit, but fewer people notice it early." },
  { name: "Big campaign, poor fit", x: [0.34, 0.9, 0.31], y: 0.42, note: "Awareness is high, but the audience match is weak." },
  { name: "Low-signal catalog title", x: [0.22, 0.25, 0.3], y: 0.24, note: "The model should learn a low completion baseline." },
  { name: "Sleeper with strong tone", x: [0.74, 0.28, 0.9], y: 0.58, note: "Affinity and tone help even with lower awareness." },
  { name: "Decent fit, visible launch", x: [0.55, 0.78, 0.61], y: 0.68, note: "A middle case that needs balanced weights." },
];

const heldoutExamples = [
  { name: "Held-out: premium fit", x: [0.88, 0.72, 0.84], y: 0.86 },
  { name: "Held-out: noisy campaign", x: [0.3, 0.82, 0.44], y: 0.43 },
  { name: "Held-out: quiet genre fit", x: [0.66, 0.4, 0.72], y: 0.57 },
];

const initialState = {
  weights: [0.2, -0.35, 0.15],
  bias: -0.08,
  rate: 0.2,
  example: 0,
  epoch: 0,
  phase: 0,
  draft: null,
  lastUpdate: null,
  surfaceTrace: [{ weights: [0.2, -0.35], exampleName: "Starting parameters", exampleIndex: -1 }],
};

const state = structuredClone(initialState);
const featureNames = ["Audience affinity", "Title awareness", "Tone match"];
const exampleColors = ["#ffd45c", "#4bf3ff", "#ff755f", "#a670ff", "#7be36f", "#ff9f4a"];

const ui = {
  surface: document.querySelector("#train-surface"),
  status: document.querySelector("#train-status"),
  prediction: document.querySelector("#train-prediction"),
  target: document.querySelector("#train-target"),
  residual: document.querySelector("#train-residual"),
  exampleLoss: document.querySelector("#train-example-loss"),
  epoch: document.querySelector("#train-epoch"),
  trainLoss: document.querySelector("#train-loss"),
  heldoutLoss: document.querySelector("#train-heldout"),
  gradients: document.querySelector("#train-gradients"),
  gradientTitle: document.querySelector("#train-gradient-title"),
  example: document.querySelector("#train-example"),
  exampleCopy: document.querySelector("#train-example-copy"),
  rate: document.querySelector("#train-rate"),
  rateOutput: document.querySelector("#train-rate-output"),
  stepCopy: document.querySelector("#train-step-copy"),
  wAffinity: document.querySelector("#train-w-affinity"),
  wAwareness: document.querySelector("#train-w-awareness"),
  wTone: document.querySelector("#train-w-tone"),
  bias: document.querySelector("#train-bias"),
  residualBars: document.querySelector("#train-residual-bars"),
  updateMath: document.querySelector("#train-update-math"),
  updateCopy: document.querySelector("#train-update-copy"),
  try: document.querySelector("#train-try"),
  notice: document.querySelector("#train-notice"),
};

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

function format(value, digits = 3) {
  return Number(value).toFixed(digits);
}

function percent(value, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

function forward(example, weights = state.weights, bias = state.bias) {
  const z = example.x.reduce((sum, value, index) => sum + value * weights[index], bias);
  return { z, prediction: sigmoid(z) };
}

function squaredError(example, weights = state.weights, bias = state.bias) {
  const { prediction } = forward(example, weights, bias);
  return (example.y - prediction) ** 2;
}

function mse(examples, weights = state.weights, bias = state.bias) {
  return examples.reduce((sum, example) => sum + squaredError(example, weights, bias), 0) / examples.length;
}

function gradients(example, exampleIndex = state.example) {
  const before = forward(example);
  const residual = example.y - before.prediction;
  const dLossDz = -2 * residual * before.prediction * (1 - before.prediction);
  const weightGradients = example.x.map((value) => dLossDz * value);
  return {
    exampleIndex,
    exampleName: example.name,
    before,
    residual,
    loss: residual ** 2,
    weightGradients,
    biasGradient: dLossDz,
  };
}

function applyGradients(draft) {
  const oldWeights = [...state.weights];
  const oldBias = state.bias;
  state.weights = state.weights.map((weight, index) => weight - state.rate * draft.weightGradients[index]);
  state.bias -= state.rate * draft.biasGradient;
  state.lastUpdate = { ...draft, oldWeights, oldBias, newWeights: [...state.weights], newBias: state.bias, rate: state.rate };
  state.surfaceTrace = [...state.surfaceTrace, {
    weights: [state.weights[0], state.weights[1]],
    exampleIndex: draft.exampleIndex,
    exampleName: draft.exampleName,
    loss: draft.loss,
    rate: state.rate,
  }].slice(-36);
}

function trainExample(index = state.example) {
  const draft = gradients(trainingExamples[index], index);
  applyGradients(draft);
  state.phase = 0;
  state.draft = null;
}

function trainEpoch() {
  trainingExamples.forEach((_, index) => trainExample(index));
  state.epoch += 1;
}

function lossColor(value, min, max) {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  const hue = 190 - t * 170;
  const light = 86 - t * 38;
  return `hsl(${hue} 88% ${light}%)`;
}

function mapWeight(value, min, max, size, pad) {
  return pad + ((value - min) / (max - min)) * (size - pad * 2);
}

function mapSurfacePoint(weights, min, max, width, height, pad) {
  return {
    x: mapWeight(weights[0], min, max, width, pad),
    y: mapWeight(weights[1], min, max, height, pad),
  };
}

function renderSurface() {
  const width = 740;
  const height = 420;
  const pad = 54;
  const cols = 20;
  const rows = 13;
  const minWeight = -1.6;
  const maxWeight = 2.2;
  const cells = [];
  const losses = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const w0 = minWeight + (col / (cols - 1)) * (maxWeight - minWeight);
      const w1 = minWeight + (row / (rows - 1)) * (maxWeight - minWeight);
      const testWeights = [w0, w1, state.weights[2]];
      const loss = mse(trainingExamples, testWeights, state.bias);
      losses.push(loss);
      cells.push({ row, col, loss });
    }
  }

  const minLoss = Math.min(...losses);
  const maxLoss = Math.max(...losses);
  const cellWidth = (width - pad * 2) / cols;
  const cellHeight = (height - pad * 2) / rows;
  const rects = cells.map(({ row, col, loss }) => `<rect x="${pad + col * cellWidth}" y="${pad + row * cellHeight}" width="${cellWidth + 1}" height="${cellHeight + 1}" fill="${lossColor(loss, minLoss, maxLoss)}"><title>MSE ${format(loss, 4)}</title></rect>`).join("");
  const currentPoint = mapSurfacePoint(state.weights, minWeight, maxWeight, width, height, pad);
  const tracePoints = state.surfaceTrace.map((entry) => mapSurfacePoint(entry.weights, minWeight, maxWeight, width, height, pad));
  const traceSegments = tracePoints.slice(1).map((point, index) => {
    const previous = tracePoints[index];
    const update = state.surfaceTrace[index + 1];
    const color = exampleColors[update.exampleIndex] || "#07101f";
    return `<line class="train-descent-segment" x1="${previous.x}" y1="${previous.y}" x2="${point.x}" y2="${point.y}" style="stroke:${color}" ${index === tracePoints.length - 2 ? 'marker-end="url(#train-arrow)"' : ""}><title>${update.exampleName}: loss ${format(update.loss, 4)}, η ${format(update.rate, 2)}</title></line>`;
  }).join("");
  const traceMarkers = tracePoints.slice(0, -1).map((point, index) => {
    const update = state.surfaceTrace[index + 1];
    const color = update ? exampleColors[update.exampleIndex] || "#07101f" : "#07101f";
    return `<circle class="train-trace-point" cx="${point.x}" cy="${point.y}" r="4" style="fill:${color}"/>`;
  }).join("");

  ui.surface.innerHTML = `
    <defs><marker id="train-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#07101f"/></marker></defs>
    <text class="train-axis-label" x="${width / 2}" y="${height - 13}">Audience-affinity weight</text>
    <text class="train-axis-label train-axis-y" x="18" y="${height / 2}">Title-awareness weight (inverted)</text>
    <text class="train-layer-label" x="${pad}" y="34">WARMER = HIGHER LOSS</text>
    <text class="train-layer-label" x="${width - pad}" y="34" text-anchor="end">COOLER = LOWER LOSS</text>
    ${rects}
    <line class="train-axis" x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}"/>
    <line class="train-axis" x1="${pad}" y1="${pad}" x2="${pad}" y2="${height - pad}"/>
    ${traceSegments}
    ${traceMarkers}
    <circle class="train-position-ring" cx="${currentPoint.x}" cy="${currentPoint.y}" r="15"/>
    <circle class="train-position" cx="${currentPoint.x}" cy="${currentPoint.y}" r="7"/>
  `;
}

function renderReadouts() {
  const example = trainingExamples[state.example];
  const result = forward(example);
  const residual = example.y - result.prediction;
  ui.prediction.textContent = percent(result.prediction);
  ui.target.textContent = percent(example.y);
  ui.residual.textContent = `${residual >= 0 ? "+" : ""}${(residual * 100).toFixed(1)} pts`;
  ui.exampleLoss.textContent = format(residual ** 2, 4);
  ui.epoch.textContent = state.epoch;
  ui.trainLoss.textContent = format(mse(trainingExamples), 4);
  ui.heldoutLoss.textContent = format(mse(heldoutExamples), 4);
  ui.exampleCopy.textContent = example.note;
  ui.wAffinity.textContent = format(state.weights[0]);
  ui.wAwareness.textContent = format(state.weights[1]);
  ui.wTone.textContent = format(state.weights[2]);
  ui.bias.textContent = format(state.bias);
  const phaseLabels = ["Ready to train", "Forward pass", "Loss measured", "Gradients ready", "Update applied"];
  ui.status.textContent = state.phase ? phaseLabels[state.phase] : state.lastUpdate ? `Last step: ${state.lastUpdate.residual >= 0 ? "prediction was low" : "prediction was high"}` : "Ready to train";
  ui.stepCopy.textContent = `Current train MSE ${format(mse(trainingExamples), 4)}. Held-out MSE ${format(mse(heldoutExamples), 4)}.`;
}

function renderGradients() {
  const draft = state.draft || state.lastUpdate || gradients(trainingExamples[state.example], state.example);
  ui.gradientTitle.textContent = state.phase >= 3 ? "Gradients for this update" : state.lastUpdate ? "Latest gradients" : "Current gradients preview";
  ui.gradients.innerHTML = featureNames.map((name, index) => `
    <div>
      <dt>${name}</dt>
      <dd>${format(draft.weightGradients[index])}</dd>
    </div>
  `).join("") + `<div><dt>Bias</dt><dd>${format(draft.biasGradient)}</dd></div>`;

  if (state.phase === 1 && state.draft) {
    ui.updateMath.textContent = `ŷ = ${percent(state.draft.before.prediction)}`;
    ui.updateCopy.textContent = "The forward pass made a prediction. No parameter has changed yet.";
    return;
  }

  if (state.phase === 2 && state.draft) {
    ui.updateMath.textContent = `SE = (${percent(state.draft.residual, 1)})² = ${format(state.draft.loss, 4)}`;
    ui.updateCopy.textContent = "Loss turns the miss into one number. The next step calculates a gradient for each weight and the bias.";
    return;
  }

  if (state.phase === 3 && state.draft) {
    const gradient = state.draft.weightGradients[0];
    ui.updateMath.textContent = `∂L/∂w_affinity = ${format(gradient, 4)}`;
    ui.updateCopy.textContent = "Backpropagation has produced gradients. The next click uses them to change the parameters.";
    return;
  }

  if (!state.lastUpdate) {
    ui.updateMath.textContent = "Choose “Start one update.”";
    ui.updateCopy.textContent = "The update will show old parameter − η (eta) × gradient = new parameter.";
    return;
  }

  const oldValue = state.lastUpdate.oldWeights[0];
  const gradient = state.lastUpdate.weightGradients[0];
  const newValue = state.lastUpdate.newWeights[0];
  ui.updateMath.textContent = `${format(oldValue, 4)} − ${format(state.lastUpdate.rate, 2)} × (${format(gradient, 4)}) = ${format(newValue, 4)}`;
  ui.updateCopy.textContent = "This selected line shows the audience-affinity weight update. The same rule updates every weight and the bias.";
}

function renderResiduals() {
  ui.residualBars.innerHTML = trainingExamples.map((example, index) => {
    const { prediction } = forward(example);
    const residual = example.y - prediction;
    const width = Math.min(100, Math.abs(residual) * 260);
    return `
      <button type="button" class="${index === state.example ? "is-selected" : ""}" data-residual-example="${index}">
        <span>${example.name}</span>
        <i><b class="${residual >= 0 ? "positive" : "negative"}" style="width:${width}%"></b></i>
        <strong>${residual >= 0 ? "+" : ""}${(residual * 100).toFixed(1)} pts</strong>
      </button>
    `;
  }).join("");
}

function renderTrace() {
  const active = state.phase || 0;
  ["forward", "loss", "backward", "update"].forEach((name, index) => {
    const item = document.querySelector(`#train-trace-${name}`);
    item.classList.toggle("is-active", active === index + 1);
    item.classList.toggle("is-complete", active > index + 1 || (active === 4 && index < 3));
  });
}

function renderGuidance() {
  const guidance = {
    0: {
      try: "Choose a training example, then step through one update.",
      notice: "The first pass only predicts. The update happens after loss has been translated into parameter gradients.",
      button: "Start one update",
    },
    1: {
      try: "Click again to measure the miss.",
      notice: "The network has made ŷ, but no weights or bias have changed.",
      button: "Next: measure loss",
    },
    2: {
      try: "Click again to calculate gradients for the parameters.",
      notice: "Squared error makes a miss large enough for the training algorithm to compare.",
      button: "Next: backpropagate",
    },
    3: {
      try: "Click once more to apply the parameter update.",
      notice: "Backpropagation has gradients; gradient descent will use η to choose the step size.",
      button: "Apply update",
    },
    4: {
      try: "Change the learning rate or train another example.",
      notice: "The point moved because the update used the gradient direction, scaled by the learning rate.",
      button: "Start another update",
    },
  };
  const current = guidance[state.phase] || guidance[0];
  if (state.rate <= 0.05 && state.phase === 0) current.notice = "Tiny η changes each parameter by a small amount. Watch for slow but stable loss changes.";
  if (state.rate >= 1 && state.phase === 0) current.notice = "Oversized η can move the yellow dot past the lower-loss region. Useful for seeing why step size matters.";
  ui.try.textContent = current.try;
  ui.notice.textContent = current.notice;
  document.querySelector("#train-step").textContent = current.button;
}

function render() {
  ui.rate.value = Math.round(state.rate * 100);
  ui.rateOutput.textContent = format(state.rate, 2);
  ui.example.value = state.example;
  document.querySelectorAll("[data-rate]").forEach((button) => {
    button.classList.toggle("is-selected", Math.abs(Number(button.dataset.rate) - state.rate) < 0.001);
  });
  renderSurface();
  renderReadouts();
  renderGradients();
  renderResiduals();
  renderTrace();
  renderGuidance();
}

function reset() {
  Object.assign(state, structuredClone(initialState));
  render();
}

ui.example.innerHTML = trainingExamples.map((example, index) => `<option value="${index}">${example.name}</option>`).join("");

ui.example.addEventListener("change", () => {
  state.example = Number(ui.example.value);
  state.phase = 0;
  state.draft = null;
  state.lastUpdate = null;
  render();
});

ui.rate.addEventListener("input", () => {
  state.rate = Number(ui.rate.value) / 100;
  state.phase = 0;
  state.draft = null;
  render();
});

document.querySelectorAll("[data-rate]").forEach((button) => {
  button.addEventListener("click", () => {
    state.rate = Number(button.dataset.rate);
    state.phase = 0;
    state.draft = null;
    render();
  });
});

document.querySelector("#train-step").addEventListener("click", () => {
  if (state.phase === 0 || state.phase === 4 || !state.draft) {
    state.draft = gradients(trainingExamples[state.example], state.example);
    state.phase = 1;
    render();
    return;
  }
  if (state.phase < 3) {
    state.phase += 1;
    render();
    return;
  }
  applyGradients(state.draft);
  state.draft = null;
  state.phase = 4;
  render();
});

document.querySelector("#train-epoch-button").addEventListener("click", () => {
  state.phase = 0;
  state.draft = null;
  trainEpoch();
  render();
});

document.querySelector("#train-reset").addEventListener("click", reset);

ui.residualBars.addEventListener("click", (event) => {
  const button = event.target.closest("[data-residual-example]");
  if (!button) return;
  state.example = Number(button.dataset.residualExample);
  state.phase = 0;
  state.draft = null;
  state.lastUpdate = null;
  render();
});

render();
