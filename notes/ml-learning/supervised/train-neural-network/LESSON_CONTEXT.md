# Lesson context: Training a Neural Network

Use with `../../LESSON_PLAYBOOK.md`, `../../ML_ROADMAP.md`, and
`../../NEURAL-NETWORK-PLAN.md`.

## Role in the tree

Second neural-network foundation lesson. This page should bridge “we built a
network” and “now the network learns.”

Current page is a working interactive lesson that still benefits from teaching
voice passes and polish.

## Intended teaching frame

Keep the title active and parallel with the previous lesson:
**Building a Neural Network** → **Training a Neural Network**.

The opening must teach, not pitch. Define the model's adjustable numbers before
using training vocabulary:

- A **parameter** is an internal number the model can learn from data.
- A **weight** is a parameter attached to an input or connection.
- A **bias** is also a parameter; it shifts the neuron's baseline.
- Training changes parameters after the model sees examples with known answers.
- Make the machine-learning moment explicit: in Build, humans inspected or set
  the numbers; in Training, the machine changes those parameters using the loss
  signal. That automatic parameter update is the "learning" in machine
  learning.

Use the map carefully. The lab shows a 2D heat map, not a 3D mountain. It is a
slice through two parameters: audience-affinity weight on the horizontal axis
and title-awareness weight on an intentionally inverted vertical axis. The
inversion makes useful gradient steps visibly descend on screen. Cooler/cyan
cells mean lower loss; warmer/red cells mean higher loss. If the word "downhill"
appears, explain that it means moving from warmer, higher-loss cells toward
cooler, lower-loss cells on this map. The yellow dot marks the current
two-weight position. The trail is one continuous model path because every
example updates the same shared parameters. Draw it as colored segments so each
segment can show which training example caused that update, with a tooltip for
example name, loss, and learning rate.

Key promise:

> Training is where the machine changes the numbers inside the model, using
> answer-key examples to make future predictions less wrong.

## Planned mini-labs

- **Residuals:** show actual minus prediction for individual examples.
- **Loss map:** show a two-parameter slice where each point is one setting of two
  weights and each color shows the resulting loss.
- **Gradient descent:** compare tiny, useful, and oversized learning rates by
  watching how far the yellow weight point moves after an update.
- **Backpropagation:** show gradients for weights and bias without leading with
  the abstract "responsibility" shorthand.
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
   - calculate a gradient for each weight and the bias
   - use gradient descent to update those parameters
3. Introduce the map as a two-parameter view of loss, not a literal mountain.
   Clarify what the horizontal axis, vertical axis, colors, and yellow point
   mean before asking learners to interpret movement.
4. End by separating training improvement from generalization: lower training
   loss is useful only when held-out examples also improve.

### Page structure

Follow the lesson playbook:

1. Hero and neural-network path navigation.
2. Short recap from Build: feedforward makes a prediction.
3. Three-stage learning loop: predict with current numbers, measure the miss,
   let the machine update.
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
- one or two trainable weights plus bias for a readable loss map
- controls for learning rate, selected example, step once, train one epoch,
  compare preset learning rates, and reset
- train loss and held-out loss readouts
- a simple SVG loss map where the current two-weight position moves as updates
  apply
- a gradient preview that shows one gradient per weight and bias without
  requiring a full chain-rule derivation

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
- Keep the Build lesson’s “object, arithmetic, algebra” spirit. When using the
  loss map, name what the learner can actually see instead of using unsupported
  mountain/valley shorthand.
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

Do not lead with pithy abstractions such as "loss creates the landscape" or
"backpropagation finds responsibility." They are too self-referential for this
lesson. Say what is happening in inspectable terms: predictions, known answers,
residuals, squared error, gradients, weights, bias, learning rate, and parameter
updates.

## Navigation

Neural-network path:

1. Build
2. Train
3. Apply

This page should link backward to `../build-neural-network/` and forward to
`../mlp-regression/` once the training foundation is strong enough.
