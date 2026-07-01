const treeState = {
  maxDepth: 3,
  features: {
    velocity: 22,
    payment: 84,
    device: 12,
  },
};

const treePresets = {
  good: { velocity: 22, payment: 84, device: 12, maxDepth: 3 },
  odd: { velocity: 76, payment: 72, device: 62, maxDepth: 3 },
  rare: { velocity: 92, payment: 18, device: 88, maxDepth: 3 },
  pruned: { velocity: 68, payment: 38, device: 54, maxDepth: 2 },
};

const treeFeatureInputs = Array.from(document.querySelectorAll("[data-tree-feature]"));
const treePresetButtons = Array.from(document.querySelectorAll("[data-tree-preset]"));
const treeDepthInput = document.querySelector("#tree-max-depth");
const treeChart = document.querySelector("#tree-chart");

const treeLeaves = {
  allow: { label: "Allow", size: 128, counts: { Allow: 118, Review: 8, Block: 2 }, path: "low velocity → good payment" },
  reviewDevice: { label: "Review", size: 42, counts: { Allow: 8, Review: 30, Block: 4 }, path: "high velocity → known payment → device mismatch" },
  reviewPruned: { label: "Review", size: 86, counts: { Allow: 28, Review: 48, Block: 10 }, path: "high velocity → mixed risk" },
  block: { label: "Block", size: 12, counts: { Allow: 1, Review: 2, Block: 9 }, path: "high velocity → poor payment → mismatch" },
  reviewPayment: { label: "Review", size: 34, counts: { Allow: 9, Review: 20, Block: 5 }, path: "low velocity → weak payment" },
};

function treeSetText(id, value) {
  const element = document.querySelector(id);
  if (element) element.textContent = value;
}

function routeTree() {
  const path = ["root"];
  const { velocity, payment, device } = treeState.features;

  if (velocity <= 55) {
    path.push("payment");
    if (payment >= 55) return { leafKey: "allow", path, depth: 2 };
    return { leafKey: "reviewPayment", path, depth: 2 };
  }

  path.push("device");
  if (treeState.maxDepth < 3) return { leafKey: "reviewPruned", path, depth: 2 };
  if (payment < 30 && device > 70) return { leafKey: "block", path: [...path, "payment"], depth: 3 };
  if (device > 45) return { leafKey: "reviewDevice", path, depth: 3 };
  return { leafKey: "reviewPruned", path, depth: 2 };
}

function drawTree(path, leafKey) {
  if (!treeChart) return;
  const active = new Set(path);
  active.add(leafKey);
  const nodes = {
    root: { x: 360, y: 64, text: "velocity ≤ 55?" },
    payment: { x: 210, y: 178, text: "payment ≥ 55?" },
    device: { x: 510, y: 178, text: "device > 45?" },
    allow: { x: 110, y: 318, text: "Allow leaf" },
    reviewPayment: { x: 300, y: 318, text: "Review leaf" },
    reviewDevice: { x: 468, y: 318, text: "Review leaf" },
    block: { x: 646, y: 318, text: "Block leaf" },
    reviewPruned: { x: 574, y: 248, text: "Pruned review" },
  };
  const edges = [
    ["root", "payment", "yes"],
    ["root", "device", "no"],
    ["payment", "allow", "yes"],
    ["payment", "reviewPayment", "no"],
    ["device", "reviewDevice", "yes"],
    ["device", "block", "high risk"],
    ["device", "reviewPruned", "pruned"],
  ];

  const edgeMarkup = edges
    .map(([from, to, label]) => {
      const a = nodes[from];
      const b = nodes[to];
      const isActive = active.has(from) && active.has(to);
      return `<path class="tree-edge${isActive ? " is-active" : ""}" d="M${a.x} ${a.y + 28}L${b.x} ${b.y - 28}" /><text class="tree-edge-label" x="${(a.x + b.x) / 2}" y="${(a.y + b.y) / 2}">${label}</text>`;
    })
    .join("");
  const nodeMarkup = Object.entries(nodes)
    .map(([key, node]) => `<g class="tree-node${active.has(key) ? " is-active" : ""}"><rect x="${node.x - 70}" y="${node.y - 28}" width="140" height="56" rx="8" /><text x="${node.x}" y="${node.y + 5}">${node.text}</text></g>`)
    .join("");

  treeChart.innerHTML = `${edgeMarkup}${nodeMarkup}`;
}

function updateTreeLab() {
  const route = routeTree();
  const leaf = treeLeaves[route.leafKey];
  const ordered = Object.entries(leaf.counts).sort((a, b) => b[1] - a[1]);
  const purity = ordered[0][1] / leaf.size;

  treeSetText("#tree-decision", leaf.label);
  treeSetText("#tree-purity", `${Math.round(purity * 100)}%`);
  treeSetText("#tree-size", leaf.size);
  treeSetText("#tree-depth", route.depth);
  treeSetText("#tree-path-label", leaf.path);
  treeSetText("#tree-max-depth-label", treeState.maxDepth);
  Object.entries(treeState.features).forEach(([key, value]) => {
    treeSetText(`#tree-${key}-value`, value);
    const input = document.querySelector(`[data-tree-feature="${key}"]`);
    if (input) input.value = value;
  });
  if (treeDepthInput) treeDepthInput.value = treeState.maxDepth;

  let trustTitle = "Strong leaf";
  let trustCopy = "The reached leaf is large and mostly one class.";
  if (leaf.size < 20) {
    trustTitle = "Tiny leaf warning";
    trustCopy = "This leaf is pure, but it has few examples. That can be memorization presented as certainty.";
  } else if (purity < 0.68) {
    trustTitle = "Mixed leaf";
    trustCopy = "The path reaches a leaf with a mixed class distribution. The label is a majority vote, not certainty.";
  } else if (treeState.maxDepth < 3) {
    trustTitle = "Pruned path";
    trustCopy = "The tree stops early. The answer may be less tailored, but it is less likely to chase a tiny training wrinkle.";
  }
  treeSetText("#tree-trust-title", trustTitle);
  treeSetText("#tree-trust-copy", trustCopy);
  drawTree(route.path, route.leafKey);
}

treeFeatureInputs.forEach((input) => {
  input.addEventListener("input", () => {
    treeState.features[input.dataset.treeFeature] = Number(input.value);
    treePresetButtons.forEach((button) => button.classList.remove("is-selected"));
    updateTreeLab();
  });
});

treeDepthInput?.addEventListener("input", () => {
  treeState.maxDepth = Number(treeDepthInput.value);
  updateTreeLab();
});

treePresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const preset = treePresets[button.dataset.treePreset];
    if (!preset) return;
    treeState.maxDepth = preset.maxDepth;
    Object.keys(treeState.features).forEach((key) => {
      treeState.features[key] = preset[key];
    });
    treePresetButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
    updateTreeLab();
  });
});

document.querySelector("#tree-reset")?.addEventListener("click", () => {
  const preset = treePresets.good;
  treeState.maxDepth = preset.maxDepth;
  Object.keys(treeState.features).forEach((key) => {
    treeState.features[key] = preset[key];
  });
  treePresetButtons.forEach((button) => button.classList.toggle("is-selected", button.dataset.treePreset === "good"));
  updateTreeLab();
});

treePresetButtons[0]?.classList.add("is-selected");
updateTreeLab();
