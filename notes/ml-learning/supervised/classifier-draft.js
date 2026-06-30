const classifierDemos = document.querySelectorAll("[data-classifier-demo]");

classifierDemos.forEach((demo) => {
  const buttons = Array.from(demo.querySelectorAll("[data-demo-title]"));
  const title = demo.querySelector("[data-demo-title-output]");
  const prediction = demo.querySelector("[data-demo-prediction-output]");
  const trust = demo.querySelector("[data-demo-trust-output]");
  const copy = demo.querySelector("[data-demo-copy-output]");
  const visual = demo.querySelector("[data-demo-visual]");

  function selectDemo(button) {
    buttons.forEach((item) => item.classList.toggle("is-selected", item === button));

    if (title) title.textContent = button.dataset.demoTitle || "";
    if (prediction) prediction.textContent = button.dataset.demoPrediction || "";
    if (trust) trust.textContent = button.dataset.demoTrust || "";
    if (copy) copy.textContent = button.dataset.demoCopy || "";

    if (visual) {
      visual.dataset.state = button.dataset.demoState || "neutral";
      visual.setAttribute("aria-label", button.dataset.demoVisualLabel || button.dataset.demoTitle || "Classifier demonstration");
    }
  }

  const initial = buttons.find((button) => button.classList.contains("is-selected")) || buttons[0];
  if (initial) selectDemo(initial);
});
