const knnExamples = [
  { x: 18, y: 78, label: "Technical" },
  { x: 24, y: 88, label: "Technical" },
  { x: 34, y: 72, label: "Technical" },
  { x: 42, y: 82, label: "Technical" },
  { x: 16, y: 62, label: "Technical" },
  { x: 72, y: 26, label: "Billing" },
  { x: 82, y: 32, label: "Billing" },
  { x: 66, y: 42, label: "Billing" },
  { x: 88, y: 18, label: "Billing" },
  { x: 58, y: 22, label: "Billing" },
  { x: 24, y: 24, label: "Account" },
  { x: 34, y: 34, label: "Account" },
  { x: 44, y: 18, label: "Account" },
  { x: 54, y: 46, label: "Account" },
  { x: 12, y: 38, label: "Account" },
];

const knnState = {
  k: 5,
  features: { billing: 24, technical: 82 },
};

const knnPresets = {
  outage: { billing: 24, technical: 82, k: 5 },
  mixed: { billing: 58, technical: 52, k: 7 },
  lonely: { billing: 14, technical: 18, k: 3 },
  scale: { billing: 80, technical: 66, k: 5 },
};

const knnColors = {
  Technical: "#4bf3ff",
  Billing: "#ff755f",
  Account: "#ffd45c",
};

const knnChart = document.querySelector("#knn-chart");
const knnFeatureInputs = Array.from(document.querySelectorAll("[data-knn-feature]"));
const knnPresetButtons = Array.from(document.querySelectorAll("[data-knn-preset]"));
const knnKInput = document.querySelector("#knn-k");

function knnSetText(id, value) {
  const element = document.querySelector(id);
  if (element) element.textContent = value;
}

function distanceToExample(example) {
  const dx = knnState.features.billing - example.x;
  const dy = knnState.features.technical - example.y;
  return Math.hypot(dx, dy);
}

function getNeighbors() {
  return knnExamples
    .map((example, index) => ({ ...example, index, distance: distanceToExample(example) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, knnState.k);
}

function voteFromNeighbors(neighbors) {
  const votes = { Technical: 0, Billing: 0, Account: 0 };
  neighbors.forEach((neighbor) => {
    votes[neighbor.label] += 1;
  });

  const ordered = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  return { label: ordered[0][0], votes, margin: ordered[0][1] - ordered[1][1] };
}

function drawKnnChart(neighbors) {
  if (!knnChart) return;
  const left = 70;
  const right = 664;
  const top = 42;
  const bottom = 346;
  const xFor = (value) => left + (value / 100) * (right - left);
  const yFor = (value) => bottom - (value / 100) * (bottom - top);
  const neighborIds = new Set(neighbors.map((neighbor) => neighbor.index));
  const maxNeighborDistance = Math.max(...neighbors.map((neighbor) => neighbor.distance), 1);
  const currentX = xFor(knnState.features.billing);
  const currentY = yFor(knnState.features.technical);

  const lines = neighbors
    .map((neighbor) => `<path class="knn-neighbor-line" d="M${currentX} ${currentY}L${xFor(neighbor.x)} ${yFor(neighbor.y)}" />`)
    .join("");

  const points = knnExamples
    .map((example, index) => {
      const isNeighbor = neighborIds.has(index);
      const radius = isNeighbor ? 11 : 7;
      return `<circle class="knn-point${isNeighbor ? " is-neighbor" : ""}" cx="${xFor(example.x)}" cy="${yFor(example.y)}" r="${radius}" fill="${knnColors[example.label]}" />`;
    })
    .join("");

  const radius = (maxNeighborDistance / 100) * (right - left);

  knnChart.innerHTML = `
    <path class="classifier-axis" d="M${left} ${bottom}H${right}M${left} ${bottom}V${top}" />
    <path class="classifier-gridline" d="M${left} ${yFor(50)}H${right}M${xFor(50)} ${bottom}V${top}" />
    <circle class="knn-radius" cx="${currentX}" cy="${currentY}" r="${radius}" />
    ${lines}
    ${points}
    <circle class="knn-current" cx="${currentX}" cy="${currentY}" r="15" />
    <text class="classifier-axis-label" x="${right}" y="${bottom + 34}">billing language</text>
    <text class="classifier-axis-label" x="${left}" y="${top - 14}">technical language</text>
    <text class="classifier-chart-label" x="${Math.min(currentX + 18, right - 110)}" y="${Math.max(currentY - 18, top + 20)}">new ticket x</text>
    <text class="classifier-tick" x="${left}" y="${bottom + 22}">0</text>
    <text class="classifier-tick" x="${xFor(50)}" y="${bottom + 22}">50</text>
    <text class="classifier-tick" x="${right}" y="${bottom + 22}">100</text>
  `;
}

function updateKnnLab() {
  const neighbors = getNeighbors();
  const result = voteFromNeighbors(neighbors);
  const nearestDistance = neighbors[0]?.distance ?? 0;
  const voteLabel = `T ${result.votes.Technical} · B ${result.votes.Billing} · A ${result.votes.Account}`;

  knnSetText("#knn-decision", result.label);
  knnSetText("#knn-k-readout", knnState.k);
  knnSetText("#knn-k-label", knnState.k);
  knnSetText("#knn-vote-count", voteLabel);
  knnSetText("#knn-nearest-distance", (nearestDistance / 100).toFixed(2));
  knnSetText("#knn-margin", result.margin);
  knnSetText("#knn-billing-value", knnState.features.billing);
  knnSetText("#knn-technical-value", knnState.features.technical);
  if (knnKInput) knnKInput.value = knnState.k;

  let trustTitle = "Dense local agreement";
  let trustCopy = "The nearest examples mostly agree, so the vote is supported by local precedent.";
  if (result.margin <= 1) {
    trustTitle = "Split neighborhood";
    trustCopy = "The vote is close. A different k value or a small feature move can change the predicted route.";
  } else if (nearestDistance > 28) {
    trustTitle = "Lonely point";
    trustCopy = "The nearest stored ticket is still far away, so the label may reflect sparse history rather than a strong local pattern.";
  } else if (knnState.features.billing > 75 && knnState.features.technical > 60) {
    trustTitle = "Scale warning";
    trustCopy = "Both feature values are high. If one feature were measured on a larger raw scale, it could dominate distance without being more meaningful.";
  }
  knnSetText("#knn-trust-title", trustTitle);
  knnSetText("#knn-trust-copy", trustCopy);

  knnFeatureInputs.forEach((input) => {
    input.value = knnState.features[input.dataset.knnFeature];
  });

  drawKnnChart(neighbors);
}

knnFeatureInputs.forEach((input) => {
  input.addEventListener("input", () => {
    knnState.features[input.dataset.knnFeature] = Number(input.value);
    knnPresetButtons.forEach((button) => button.classList.remove("is-selected"));
    updateKnnLab();
  });
});

knnKInput?.addEventListener("input", () => {
  knnState.k = Number(knnKInput.value);
  updateKnnLab();
});

knnPresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const preset = knnPresets[button.dataset.knnPreset];
    if (!preset) return;
    knnState.k = preset.k;
    knnState.features.billing = preset.billing;
    knnState.features.technical = preset.technical;
    knnPresetButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
    updateKnnLab();
  });
});

document.querySelector("#knn-reset")?.addEventListener("click", () => {
  const preset = knnPresets.outage;
  knnState.k = preset.k;
  knnState.features.billing = preset.billing;
  knnState.features.technical = preset.technical;
  knnPresetButtons.forEach((button) => button.classList.toggle("is-selected", button.dataset.knnPreset === "outage"));
  updateKnnLab();
});

knnPresetButtons[0]?.classList.add("is-selected");
updateKnnLab();
