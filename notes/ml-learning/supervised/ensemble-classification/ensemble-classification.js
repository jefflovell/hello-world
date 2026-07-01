const ensembleState = {
  mode: "forest",
  threshold: 0.55,
  features: { device: 82, amount: 74, age: 68 },
};

const ensemblePresets = {
  cluster: { device: 82, amount: 74, age: 68, threshold: 0.55 },
  mixed: { device: 58, amount: 48, age: 46, threshold: 0.55 },
  subtle: { device: 44, amount: 70, age: 62, threshold: 0.52 },
  drift: { device: 88, amount: 18, age: 24, threshold: 0.62 },
};

const treeOffsets = [-0.18, 0.05, 0.12, -0.08, 0.2, -0.12, 0.02, 0.16, -0.04, 0.09, -0.15, 0.14];
const boostLearners = [0.22, 0.16, -0.08, 0.13, 0.09, -0.05, 0.07, 0.04];

const ensembleVisual = document.querySelector("#ensemble-visual");
const ensembleModeButtons = Array.from(document.querySelectorAll("[data-ensemble-mode]"));
const ensemblePresetButtons = Array.from(document.querySelectorAll("[data-ensemble-preset]"));
const ensembleInputs = Array.from(document.querySelectorAll("[data-ensemble-feature]"));
const ensembleThresholdInput = document.querySelector("#ensemble-threshold");

function ensembleSetText(id, value) {
  const element = document.querySelector(id);
  if (element) element.textContent = value;
}

function baseRisk() {
  return (
    0.42 * (ensembleState.features.device / 100) +
    0.32 * (ensembleState.features.amount / 100) +
    0.26 * (ensembleState.features.age / 100)
  );
}

function forestVotes() {
  const risk = baseRisk();
  return treeOffsets.map((offset, index) => ({
    index,
    review: risk + offset > ensembleState.threshold,
  }));
}

function boostSteps() {
  let score = baseRisk() - 0.46;
  return boostLearners.map((learner, index) => {
    const adjusted = learner * (1 + (ensembleState.features.amount - 50) / 180);
    score += adjusted;
    return { index, value: adjusted, score };
  });
}

function drawEnsembleVisual(votes, steps) {
  if (!ensembleVisual) return;
  if (ensembleState.mode === "forest") {
    ensembleVisual.innerHTML = `<div class="ensemble-vote-grid">${votes
      .map((vote) => `<span class="${vote.review ? "review" : "allow"}">T${vote.index + 1}</span>`)
      .join("")}</div>`;
    return;
  }

  ensembleVisual.innerHTML = `<div class="ensemble-boost-grid">${steps
    .map((step) => `<article><span>L${step.index + 1}</span><i><b class="${step.value >= 0 ? "positive" : "negative"}" style="width:${Math.min(100, Math.abs(step.value) * 360)}%"></b></i><strong>${step.score.toFixed(2)}</strong></article>`)
    .join("")}</div>`;
}

function updateEnsembleLab() {
  const votes = forestVotes();
  const steps = boostSteps();
  const reviewVotes = votes.filter((vote) => vote.review).length;
  const forestStrength = reviewVotes / votes.length;
  const boostedScore = steps[steps.length - 1].score;
  const boostedStrength = 1 / (1 + Math.exp(-boostedScore * 4));
  const strength = ensembleState.mode === "forest" ? forestStrength : boostedStrength;
  const decision = strength >= ensembleState.threshold ? "Review" : "Allow";
  const margin = Math.abs(strength - ensembleState.threshold);

  ensembleSetText("#ensemble-decision", decision);
  ensembleSetText("#ensemble-strength", `${Math.round(strength * 100)}%`);
  ensembleSetText("#ensemble-margin", ensembleState.mode === "forest" ? Math.abs(reviewVotes - (votes.length - reviewVotes)) : margin.toFixed(2));
  ensembleSetText("#ensemble-count", ensembleState.mode === "forest" ? votes.length : steps.length);
  ensembleSetText("#ensemble-mode-readout", ensembleState.mode === "forest" ? "Forest" : "Boosting");
  ensembleSetText("#ensemble-stage-title", ensembleState.mode === "forest" ? "Forest votes" : "Boosting corrections");
  ensembleSetText("#ensemble-threshold-label", ensembleState.threshold.toFixed(2));
  if (ensembleThresholdInput) ensembleThresholdInput.value = Math.round(ensembleState.threshold * 100);
  Object.entries(ensembleState.features).forEach(([key, value]) => {
    ensembleSetText(`#ensemble-${key}-value`, value);
    const input = document.querySelector(`[data-ensemble-feature="${key}"]`);
    if (input) input.value = value;
  });
  ensembleModeButtons.forEach((button) => button.classList.toggle("is-selected", button.dataset.ensembleMode === ensembleState.mode));

  let trustTitle = "Broad agreement";
  let trustCopy = "Many different trees reach the same class.";
  if (margin < 0.08) {
    trustTitle = "Narrow aggregation";
    trustCopy = "The aggregate score sits near the threshold. Treat the action as review-worthy uncertainty, not certainty.";
  } else if (ensembleState.mode === "boost") {
    trustTitle = "Correction path";
    trustCopy = "The sequence is adding corrections. Check held-out performance to make sure it is not chasing noise.";
  } else if (ensembleState.features.device > 80 && ensembleState.features.amount < 25) {
    trustTitle = "Shared blind spot";
    trustCopy = "This pattern is unusual. If all trees are missing the same signal, agreement will not rescue the model.";
  }
  ensembleSetText("#ensemble-trust-title", trustTitle);
  ensembleSetText("#ensemble-trust-copy", trustCopy);
  drawEnsembleVisual(votes, steps);
}

ensembleInputs.forEach((input) => {
  input.addEventListener("input", () => {
    ensembleState.features[input.dataset.ensembleFeature] = Number(input.value);
    ensemblePresetButtons.forEach((button) => button.classList.remove("is-selected"));
    updateEnsembleLab();
  });
});

ensembleThresholdInput?.addEventListener("input", () => {
  ensembleState.threshold = Number(ensembleThresholdInput.value) / 100;
  updateEnsembleLab();
});

ensembleModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    ensembleState.mode = button.dataset.ensembleMode;
    updateEnsembleLab();
  });
});

ensemblePresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const preset = ensemblePresets[button.dataset.ensemblePreset];
    if (!preset) return;
    ensembleState.threshold = preset.threshold;
    Object.keys(ensembleState.features).forEach((key) => {
      ensembleState.features[key] = preset[key];
    });
    ensemblePresetButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
    updateEnsembleLab();
  });
});

document.querySelector("#ensemble-reset")?.addEventListener("click", () => {
  const preset = ensemblePresets.cluster;
  ensembleState.mode = "forest";
  ensembleState.threshold = preset.threshold;
  Object.keys(ensembleState.features).forEach((key) => {
    ensembleState.features[key] = preset[key];
  });
  ensemblePresetButtons.forEach((button) => button.classList.toggle("is-selected", button.dataset.ensemblePreset === "cluster"));
  updateEnsembleLab();
});

ensemblePresetButtons[0]?.classList.add("is-selected");
updateEnsembleLab();
