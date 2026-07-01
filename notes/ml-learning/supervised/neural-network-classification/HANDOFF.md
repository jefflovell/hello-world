# Handoff: Neural Network Classification

Use this with:

- `../../ML_ROADMAP.md`
- `../../LESSON_PLAYBOOK.md`
- `../classification/LESSON_CONTEXT.md`
- `../build-neural-network/LESSON_CONTEXT.md`
- `../train-neural-network/LESSON_CONTEXT.md`
- `../mlp-regression/LESSON_CONTEXT.md`

## Lesson role

This lesson closes the classifier sibling sequence and connects classification
back to the neural-network Build, Train, and Apply lessons.

## Current teaching target

Teach neural-network classification as:

1. features flow through hidden neurons,
2. hidden activations represent intermediate combinations,
3. the final layer produces logits,
4. sigmoid or softmax converts logits into probabilities,
5. supervised training minimizes classification loss and updates weights/biases,
6. held-out examples grade whether the learned boundary generalizes.

## Neural-network sequence learnings to preserve

- Mechanism before slogan. Hidden layers help because they create intermediate
  activations where feature interactions can be represented.
- Define terms before shorthand: `a` is activation, logits are raw class scores,
  `p` is probability, and `ŷ` is the predicted class.
- Keep Train language precise: supervised learning minimizes loss, updates
  change model parameters, and held-out examples grade without updating.
- Avoid reward language here. Reward belongs mostly to reinforcement learning
  and RLHF, not this basic supervised classifier.

## Current implementation

- Page: `index.html`
- Lab script: `neural-network-classification.js`
- Shared production styles: `styles.css` classifier production rules plus
  neural classifier node/edge styles.

The lab computes three hidden ReLU activations, three logits, and softmax
probabilities for Finish, Abandon, and Uncertain. It includes presets, feature
sliders, a capacity slider, probability readouts, and trust notes for close
probabilities, high capacity, and unfamiliar feature regions.

## Good next pass

- Add a small cross-entropy loss readout for one labeled example.
- Add a held-out MSE/cross-entropy style comparison strip similar to the MLP
  regression page.
- Consider animating a forward pass using the power-pulse pattern from Apply an
  MLP, but keep it mechanism-first.
