# ML lesson playbook

Use this file as the low-cost context anchor for future machine-learning notes.
It captures the teaching voice, page conventions, and interaction standards for
the ML section. Use `LESSON-TEMPLATE.md` for the detailed page scaffold.

## Teaching promise

Each lesson should answer three questions:

1. **What is this?** Name the model or concept in plain English before notation.
2. **How does it work?** Show the moving parts, then connect them to equations.
3. **Why is it useful?** Ground the method in a lived, modern use case.

Aim for ELI5-to-ELI16: approachable enough for a curious beginner, but honest
enough that the math and vocabulary are not hand-waved away.

## Voice and pedagogy

- Start with a concrete decision, not an abstract definition.
- Prefer “watch this change” over “trust this explanation.”
- Introduce terms before using them as load-bearing concepts.
- Keep prose tight, vivid, and practical. No textbook fog machine.
- Make the learner feel oriented: “here is the object, here is the arithmetic,
  here is the algebra.”
- When a concept first appears, explain what it is, how it works, and why it
  helps.

## Standard lesson shape

1. Problem opener
2. Plain-English model framing
3. What / how / why explanation
4. Interactive lab
5. Mechanics or equation cards
6. Vocabulary cards
7. What to watch / guided experiments
8. Takeaways
9. Parent and sibling navigation

Not every page needs every section at the same weight, but each lesson should
include an interaction, at least one mechanics pass, and a compact vocabulary
section.

## Interaction standard

Every algorithm page should let the learner perturb something and see a model
response. Good controls include:

- changing a feature value
- moving a point or example
- changing a model parameter or hyperparameter
- toggling model choice
- stepping through a training update
- comparing training behavior to new-example behavior

The lab should include short instructions that say what to manipulate and what
to notice. Avoid decorative controls that do not teach a mechanism.

## Math and notation standard

Use equations, but make them searchable and speakable.

- Expand acronyms on first use: `MSE` (Mean Squared Error).
- Spell symbols in human language: `ŷ` (“y-hat”), `η` (“eta”), `λ` (“lambda”).
- Distinguish case when it matters: `σ` (“lowercase sigma”) vs. `Σ` (“capital
  sigma”).
- Explain subscripts: `xᵢ` (“x sub i”) means the value of feature or example
  `i`.
- Tie every equation to visible behavior in the lab.

If the page uses a formula, the implementation should match the formula or
clearly say it is a simplified teaching approximation.

## Vocabulary standard

Use compact vocab cards for terms that become reusable across lessons:

- feature
- vector
- parameter
- hyperparameter
- coefficient / weight
- bias / intercept
- prediction
- residual / error
- loss function
- gradient
- training example
- held-out or new-example behavior

Do not hide essential definitions only in tooltips. Tooltips can reinforce; the
page still needs a visible first explanation.

## Visual and layout conventions

- Keep lab frames visually distinct from explanatory copy.
- Use cards for dense concepts and callouts for “this is the thing to notice.”
- Watch for overflow on equation cards, SVG labels, sliders, and mobile widths.
- Backlinks should move one level up the taxonomy, not skip parents.
- If a shared style changes, bump the relevant CSS cache key on edited pages.

## Analogy library

Use varied examples so the section does not become one-note:

- GPU performance and market segmentation
- streaming cold start, catalog retrieval, and recommender signals
- rideshare pickup-time prediction
- first-week title completion or watch behavior
- content fit: audience affinity, awareness, tone, timing, and context

Prefer examples with enough “play” to support sliders, outliers, uncertainty,
or tradeoffs.

## Current neural-network teaching arc

Neural nets are deep enough to deserve a small sequence:

1. **Build a neural network:** features, vectors, weights, bias, activations,
   hidden layers, and feedforward signal flow.
2. **Train a neural network:** loss, residuals, gradients, learning rate,
   gradient descent, backpropagation, epochs, and generalization.
3. **Apply an MLP:** use the full lab to explore nonlinear prediction,
   capacity, and overfitting.

The sequence should build from neuron to network, and from object diagram to
arithmetic to algebra.
