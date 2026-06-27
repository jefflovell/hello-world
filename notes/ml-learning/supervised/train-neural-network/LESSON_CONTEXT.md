# Lesson context: Train a Neural Network

Use with `../../LESSON_PLAYBOOK.md`, `../../ML_ROADMAP.md`, and
`../../NEURAL-NETWORK-PLAN.md`.

## Role in the tree

Second neural-network foundation lesson. This page should bridge “we built a
network” and “now the network learns.”

Current page is a lightweight scaffold, not the final lesson.

## Intended teaching frame

The mountain comes next: loss creates the landscape, gradients point downhill,
and gradient descent updates parameters toward lower loss.

Key promise:

> Loss measures the miss, backpropagation assigns responsibility, and gradient
> descent turns those gradients into better parameters.

## Planned mini-labs

- **Residuals:** show actual minus prediction for individual examples.
- **Loss surface:** move a weight and watch error rise or fall.
- **Gradient descent:** step downhill; compare tiny, useful, and oversized
  learning rates.
- **Backpropagation:** highlight responsibility moving backward through edges.
- **Parameters vs hyperparameters:** learned weights and biases versus chosen
  settings like learning rate, epochs, and architecture.
- **Generalization:** compare training loss with held-out/new-example loss.

## Build plan

Implement this as a full interactive lesson, not a placeholder.

### Teaching arc

1. Start from the finished Build lesson: a feedforward pass can produce `ŷ`
   (“y-hat”), but it does not learn.
2. Introduce the training loop in plain language:
   - run a forward pass
   - compare prediction to the known target
   - turn the miss into loss
   - send responsibility backward
   - update parameters with gradient descent
3. Keep the mountain mental model: loss creates the landscape, gradients point
   downhill, and learning rate controls step size. Clarify that this is guided
   by slope, not random wandering.
4. End by separating training improvement from generalization: lower training
   loss is useful only when held-out examples also improve.

### Page structure

Follow the lesson playbook:

1. Hero and neural-network path navigation.
2. Short recap from Build: feedforward makes a prediction.
3. Three-stage learning loop: predict, measure, update.
4. Interactive training lab.
5. “What to watch” guidance.
6. Mechanics cards with equations that match the implementation.
7. Training and generalization section.
8. Vocabulary cards.
9. Navigation backward to Build and forward to Apply.

### Interactive implementation

Create `train-neural-network.js` for the page.

The first version should use a compact teaching model so the training behavior
is inspectable:

- a small fixed supervised dataset based on the streaming-title completion
  example
- visible selected example with feature values, actual target `y`, prediction
  `ŷ`, residual, and squared loss
- one or two trainable weights plus bias for a readable loss surface
- controls for learning rate, selected example, step once, train one epoch,
  compare preset learning rates, and reset
- train loss and held-out loss readouts
- a simple SVG loss landscape where the current parameter position moves
  downhill as updates apply
- a backward-responsibility view that highlights which parameter is being
  updated without requiring a full chain-rule derivation

### Equations to use

The visible formulas must match the JavaScript:

- `residual = y - ŷ`
- `SE = (y - ŷ)²`
- `MSE = (1/n) Σ(yᵢ - ŷᵢ)²`
- `w ← w - η(∂L/∂w)`

Expand notation on first use:

- `ŷ` (“y-hat”): the prediction
- `η` (“eta”): the learning rate
- `Σ` (“capital sigma”): add a sequence of values
- `∂L/∂w` (“partial L over partial w”): sensitivity of loss to a weight

### Visual and code direction

- Reuse the established neural lesson path navigation.
- Keep the Build lesson’s “object, arithmetic, algebra” spirit, but shift the
  main visual metaphor to a loss mountain/valley.
- Add scoped `train-*` classes in `styles.css`.
- Avoid disturbing existing MLP lab behavior unless shared styles require a
  careful adjustment.
- Bump the Train page stylesheet and script cache keys when implementation
  changes.

### Verification

Before considering the lesson ready:

- verify one-step training changes prediction, residual, loss, and parameter
  readouts
- verify one epoch increments epoch and changes train/held-out loss
- verify tiny, useful, and oversized learning-rate presets visibly differ
- verify reset restores the starting state
- check desktop and mobile layouts for overflow in equations, SVG labels,
  sliders, and readouts
- confirm Build → Train → Apply navigation remains correct

## Concepts to explain before the lab gets dense

- residual / error
- loss function
- MSE (Mean Squared Error)
- gradient
- gradient descent
- learning rate `η` (“eta”)
- backpropagation
- epoch
- batch
- parameter
- hyperparameter
- training examples vs held-out examples

## Design direction

Build up from neuron to network, and keep the 3Blue1Brown-ish alignment between
object diagram, arithmetic, and algebra.

The user specifically likes the “randomly walks down the mountain to the
valley” mental model for gradient descent, but the lesson should clarify that
gradient descent is guided by slope, not truly random wandering.

## Navigation

Neural-network path:

1. Build
2. Train
3. Apply

This page should link backward to `../build-neural-network/` and forward to
`../mlp-regression/` once the training foundation is strong enough.
