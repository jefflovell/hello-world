const canvas = document.querySelector("#regression-canvas");
const ctx = canvas.getContext("2d");

const ui = {
  epoch: document.querySelector("#epoch-count"),
  error: document.querySelector("#error-count"),
  baseline: document.querySelector("#baseline-count"),
  performance: document.querySelector("#performance-input"),
  performanceValue: document.querySelector("#performance-value"),
  estimate: document.querySelector("#price-estimate"),
  equation: document.querySelector("#model-equation"),
  step: document.querySelector("#step-training"),
  fit: document.querySelector("#fit-model"),
  reset: document.querySelector("#reset-data"),
};

const chart = {
  left: 72,
  right: 28,
  top: 28,
  bottom: 62,
  minPerformance: 40,
  maxPerformance: 220,
  minPrice: 0,
  maxPrice: 1500,
};

const state = {
  points: [],
  slope: 0,
  intercept: 260,
  epoch: 0,
  learningRate: 0.08,
};

function seedPoints() {
  state.points = [
    { name: "Arc A580", performance: 58, price: 150 },
    { name: "RTX 3060", performance: 72, price: 220 },
    { name: "RX 6700 XT", performance: 91, price: 285 },
    { name: "RTX 3070", performance: 101, price: 330 },
    { name: "RX 6800", performance: 118, price: 390 },
    { name: "RTX 3080", performance: 132, price: 470 },
    { name: "RX 7900 GRE", performance: 151, price: 560 },
    { name: "RTX 4070 Super", performance: 164, price: 650 },
    { name: "RX 7900 XTX", performance: 196, price: 830 },
    { name: "RTX 4090", performance: 218, price: 1375 },
  ];
  state.slope = 0;
  state.intercept = 260;
  state.epoch = 0;
  update();
}

function normalizePerformance(value) {
  return (value - chart.minPerformance) / (chart.maxPerformance - chart.minPerformance);
}

function predict(performance) {
  return state.intercept + state.slope * normalizePerformance(performance);
}

function trainEpoch() {
  const count = state.points.length;
  let interceptGradient = 0;
  let slopeGradient = 0;

  state.points.forEach((point) => {
    const x = normalizePerformance(point.performance);
    const error = predict(point.performance) - point.price;
    interceptGradient += error;
    slopeGradient += error * x;
  });

  state.intercept -= state.learningRate * (2 / count) * interceptGradient;
  state.slope -= state.learningRate * (2 / count) * slopeGradient;
  state.epoch += 1;
  update();
}

function fitModel() {
  for (let index = 0; index < 80; index += 1) trainEpoch();
}

function meanAbsoluteError() {
  const total = state.points.reduce(
    (sum, point) => sum + Math.abs(point.price - predict(point.performance)),
    0,
  );
  return total / state.points.length;
}

function plotWidth() {
  return canvas.width - chart.left - chart.right;
}

function plotHeight() {
  return canvas.height - chart.top - chart.bottom;
}

function toCanvas(performance, price) {
  const x =
    chart.left +
    ((performance - chart.minPerformance) /
      (chart.maxPerformance - chart.minPerformance)) *
      plotWidth();
  const y =
    chart.top +
    (1 - (price - chart.minPrice) / (chart.maxPrice - chart.minPrice)) *
      plotHeight();
  return [x, y];
}

function fromCanvas(clientX, clientY) {
  const performance =
    chart.minPerformance +
    ((clientX - chart.left) / plotWidth()) *
      (chart.maxPerformance - chart.minPerformance);
  const price =
    chart.maxPrice -
    ((clientY - chart.top) / plotHeight()) *
      (chart.maxPrice - chart.minPrice);
  return {
    performance: Math.max(chart.minPerformance, Math.min(chart.maxPerformance, performance)),
    price: Math.max(chart.minPrice, Math.min(chart.maxPrice, price)),
  };
}

function drawGrid() {
  ctx.fillStyle = "#07101f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "500 13px DM Sans, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  [0, 300, 600, 900, 1200, 1500].forEach((price) => {
    const [, y] = toCanvas(chart.minPerformance, price);
    ctx.strokeStyle = "rgba(75, 243, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(chart.left, y);
    ctx.lineTo(canvas.width - chart.right, y);
    ctx.stroke();
    ctx.fillStyle = "rgba(247, 246, 241, 0.66)";
    ctx.fillText(`$${price}`, chart.left - 12, y);
  });

  [40, 80, 120, 160, 200, 220].forEach((performance) => {
    const [x] = toCanvas(performance, 0);
    ctx.strokeStyle = "rgba(75, 243, 255, 0.08)";
    ctx.beginPath();
    ctx.moveTo(x, chart.top);
    ctx.lineTo(x, canvas.height - chart.bottom);
    ctx.stroke();
    ctx.fillStyle = "rgba(247, 246, 241, 0.66)";
    ctx.textAlign = "center";
    ctx.fillText(performance, x, canvas.height - chart.bottom + 22);
  });

  ctx.fillStyle = "#f7f6f1";
  ctx.textAlign = "center";
  ctx.fillText(
    "Relative gaming performance (reference = 100)",
    chart.left + plotWidth() / 2,
    canvas.height - 18,
  );
  ctx.save();
  ctx.translate(18, chart.top + plotHeight() / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Used price", 0, 0);
  ctx.restore();
}

function drawModel() {
  const start = toCanvas(chart.minPerformance, predict(chart.minPerformance));
  const end = toCanvas(chart.maxPerformance, predict(chart.maxPerformance));
  ctx.strokeStyle = "#4bf3ff";
  ctx.lineWidth = 4;
  ctx.shadowBlur = 18;
  ctx.shadowColor = "rgba(75, 243, 255, 0.7)";
  ctx.beginPath();
  ctx.moveTo(...start);
  ctx.lineTo(...end);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawPoints() {
  state.points.forEach((point, index) => {
    const [x, y] = toCanvas(point.performance, point.price);
    const [, predictionY] = toCanvas(point.performance, predict(point.performance));
    ctx.strokeStyle = "rgba(255, 117, 95, 0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, predictionY);
    ctx.stroke();
    ctx.fillStyle = index >= 10 ? "#ffd166" : "#ff755f";
    ctx.shadowBlur = 12;
    ctx.shadowColor = "rgba(255, 117, 95, 0.68)";
    ctx.beginPath();
    ctx.arc(x, y, index >= 10 ? 9 : 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function render() {
  drawGrid();
  drawModel();
  drawPoints();
}

function update() {
  const selectedPerformance = Number(ui.performance.value);
  const estimate = Math.max(0, predict(selectedPerformance));
  ui.epoch.textContent = state.epoch;
  ui.error.textContent = `$${Math.round(meanAbsoluteError())}`;
  ui.baseline.textContent = `$${Math.round(Math.max(0, predict(100)))}`;
  ui.performanceValue.textContent = selectedPerformance;
  ui.estimate.textContent = `$${Math.round(estimate)}`;
  ui.equation.textContent =
    state.epoch === 0
      ? "Waiting to train"
      : `$${(state.slope / 180).toFixed(2)} × (performance − 40) + $${Math.round(state.intercept)}`;
  render();
}

ui.step.addEventListener("click", trainEpoch);
ui.fit.addEventListener("click", fitModel);
ui.reset.addEventListener("click", seedPoints);
ui.performance.addEventListener("input", update);

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const point = fromCanvas(
    (event.clientX - rect.left) * scaleX,
    (event.clientY - rect.top) * scaleY,
  );
  state.points.push({
    name: "Added listing",
    performance: Math.round(point.performance),
    price: Math.round(point.price),
  });
  update();
});

seedPoints();
