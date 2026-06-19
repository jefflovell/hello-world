const canvas = document.querySelector("#knn-canvas");
const ctx = canvas.getContext("2d");

const ui = {
  list: document.querySelector("#neighbor-list"),
  prediction: document.querySelector("#knn-prediction"),
  count: document.querySelector("#knn-count"),
  readoutPrediction: document.querySelector("#knn-readout-prediction"),
  move: document.querySelector("#move-title"),
  reset: document.querySelector("#reset-knn"),
  kButtons: [...document.querySelectorAll("[data-k]")],
};

const titles = [
  { name: "Weekend Detour", x: 0.18, y: 0.72, minutes: 49 },
  { name: "Kitchen Rivals", x: 0.28, y: 0.82, minutes: 54 },
  { name: "Tiny Detectives", x: 0.12, y: 0.58, minutes: 42 },
  { name: "Summer Camp Chaos", x: 0.34, y: 0.7, minutes: 51 },
  { name: "Second Chances", x: 0.38, y: 0.42, minutes: 46 },
  { name: "City After Dark", x: 0.67, y: 0.76, minutes: 58 },
  { name: "The Last Signal", x: 0.84, y: 0.7, minutes: 63 },
  { name: "Quiet Orbit", x: 0.76, y: 0.3, minutes: 37 },
  { name: "Paper Kingdom", x: 0.52, y: 0.36, minutes: 44 },
  { name: "Hard Reset", x: 0.72, y: 0.88, minutes: 61 },
  { name: "Midnight Trial", x: 0.9, y: 0.52, minutes: 48 },
  { name: "Harbor Lights", x: 0.58, y: 0.2, minutes: 34 },
  { name: "Neighborhood Legends", x: 0.24, y: 0.48, minutes: 47 },
  { name: "Velocity", x: 0.56, y: 0.92, minutes: 66 },
  { name: "Wildflower Road", x: 0.4, y: 0.24, minutes: 39 },
  { name: "Deep Current", x: 0.82, y: 0.16, minutes: 31 },
  { name: "Laugh Track", x: 0.08, y: 0.88, minutes: 57 },
  { name: "The Long Winter", x: 0.94, y: 0.24, minutes: 35 },
  { name: "Golden Hour", x: 0.3, y: 0.3, minutes: 41 },
  { name: "Fault Line", x: 0.7, y: 0.58, minutes: 55 },
  { name: "Family Recipe", x: 0.16, y: 0.36, minutes: 45 },
  { name: "Neon County", x: 0.48, y: 0.68, minutes: 53 },
  { name: "Black Ice", x: 0.88, y: 0.84, minutes: 59 },
  { name: "Museum of Us", x: 0.62, y: 0.1, minutes: 29 },
];

const plot = { left: 62, right: 28, top: 28, bottom: 62 };
const state = { k: 5, query: { x: 0.47, y: 0.55 }, dragging: false };

function plotWidth() {
  return canvas.width - plot.left - plot.right;
}

function plotHeight() {
  return canvas.height - plot.top - plot.bottom;
}

function toCanvas(point) {
  return [plot.left + point.x * plotWidth(), plot.top + (1 - point.y) * plotHeight()];
}

function fromCanvas(clientX, clientY) {
  return {
    x: Math.max(0, Math.min(1, (clientX - plot.left) / plotWidth())),
    y: Math.max(0, Math.min(1, 1 - (clientY - plot.top) / plotHeight())),
  };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function neighbors() {
  return titles
    .map((title) => ({ ...title, distance: distance(title, state.query) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, state.k);
}

function prediction(selected = neighbors()) {
  return selected.reduce((sum, title) => sum + title.minutes, 0) / selected.length;
}

function drawGrid() {
  ctx.fillStyle = "#07101f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(75, 243, 255, 0.09)";
  ctx.lineWidth = 1;
  for (let index = 0; index <= 5; index += 1) {
    const x = plot.left + (plotWidth() / 5) * index;
    const y = plot.top + (plotHeight() / 5) * index;
    ctx.beginPath();
    ctx.moveTo(x, plot.top);
    ctx.lineTo(x, canvas.height - plot.bottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(plot.left, y);
    ctx.lineTo(canvas.width - plot.right, y);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(247, 246, 241, 0.72)";
  ctx.font = "600 13px DM Sans, sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText("Lighthearted", plot.left, canvas.height - 24);
  ctx.textAlign = "right";
  ctx.fillText("Serious", canvas.width - plot.right, canvas.height - 24);
  ctx.save();
  ctx.translate(18, plot.top + plotHeight() / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText("Slow burn  →  High energy", 0, 0);
  ctx.restore();
}

function drawNeighborhood(selected) {
  const [qx, qy] = toCanvas(state.query);
  const radius = selected.length
    ? Math.max(...selected.map((title) => distance(title, state.query))) *
      Math.min(plotWidth(), plotHeight())
    : 0;

  ctx.fillStyle = "rgba(75, 243, 255, 0.06)";
  ctx.strokeStyle = "rgba(75, 243, 255, 0.72)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 7]);
  ctx.beginPath();
  ctx.arc(qx, qy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);

  selected.forEach((title) => {
    const [x, y] = toCanvas(title);
    ctx.strokeStyle = "rgba(75, 243, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(qx, qy);
    ctx.lineTo(x, y);
    ctx.stroke();
  });
}

function drawTitles(selected) {
  const selectedNames = new Set(selected.map((title) => title.name));
  titles.forEach((title) => {
    const [x, y] = toCanvas(title);
    const isSelected = selectedNames.has(title.name);
    ctx.fillStyle = isSelected ? "#4bf3ff" : "#ff755f";
    ctx.shadowBlur = isSelected ? 16 : 8;
    ctx.shadowColor = isSelected
      ? "rgba(75, 243, 255, 0.8)"
      : "rgba(255, 117, 95, 0.55)";
    ctx.beginPath();
    ctx.arc(x, y, isSelected ? 8 : 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function drawQuery() {
  const [x, y] = toCanvas(state.query);
  ctx.fillStyle = "#f7f6f1";
  ctx.strokeStyle = "#4bf3ff";
  ctx.lineWidth = 4;
  ctx.shadowBlur = 20;
  ctx.shadowColor = "rgba(75, 243, 255, 0.9)";
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#f7f6f1";
  ctx.font = "700 13px DM Sans, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("New title", x, y - 25);
}

function renderList(selected) {
  ui.list.innerHTML = selected
    .map(
      (title, index) => `<li>
        <span class="neighbor-rank">${index + 1}</span>
        <span class="neighbor-title">${title.name}</span>
        <span class="neighbor-distance">${title.distance.toFixed(2)} away</span>
        <strong>${title.minutes} min</strong>
      </li>`,
    )
    .join("");
}

function update() {
  const selected = neighbors();
  const estimate = Math.round(prediction(selected));
  drawGrid();
  drawNeighborhood(selected);
  drawTitles(selected);
  drawQuery();
  renderList(selected);
  ui.prediction.textContent = `${estimate} min/viewer`;
  ui.count.textContent = state.k;
  ui.readoutPrediction.textContent = `${estimate} min`;
}

function setQueryFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  state.query = fromCanvas(
    (event.clientX - rect.left) * scaleX,
    (event.clientY - rect.top) * scaleY,
  );
  update();
}

canvas.addEventListener("pointerdown", (event) => {
  state.dragging = true;
  canvas.setPointerCapture(event.pointerId);
  setQueryFromEvent(event);
});

canvas.addEventListener("pointermove", (event) => {
  if (state.dragging) setQueryFromEvent(event);
});

canvas.addEventListener("pointerup", () => {
  state.dragging = false;
});

ui.kButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.k = Number(button.dataset.k);
    ui.kButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
    update();
  });
});

ui.move.addEventListener("click", () => {
  state.query = {
    x: 0.12 + Math.random() * 0.76,
    y: 0.12 + Math.random() * 0.76,
  };
  update();
});

ui.reset.addEventListener("click", () => {
  state.k = 5;
  state.query = { x: 0.47, y: 0.55 };
  ui.kButtons.forEach((item) =>
    item.classList.toggle("is-selected", Number(item.dataset.k) === state.k),
  );
  update();
});

update();
