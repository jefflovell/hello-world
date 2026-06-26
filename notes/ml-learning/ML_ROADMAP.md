# ML learning roadmap

Use this file as the low-cost taxonomy anchor for the ML notes. It records what
exists, what is planned, and how pages should relate to each other.

## Top-level learning regimes

- **Supervised learning:** examples include inputs and known answers.
- **Unsupervised learning:** examples have no explicit answer; the model looks
  for structure.
- **Semi-supervised learning:** a small labeled set is combined with many
  unlabeled examples.
- **Reinforcement learning:** an agent learns from actions, rewards, and state.

The current build is focused on supervised learning.

## Supervised learning taxonomy

Supervised learning splits into two foundational task types:

1. **Classification:** predict a category.
2. **Regression:** predict a number.

Backlinks should preserve this hierarchy:

`algorithm page → supervised task page → supervised learning → learning types`

## Current supervised pages

### Classification

- `supervised/classification/`
  - Purpose: classification family overview.
  - Current lesson anchor: perceptron / linear classification foundation.
  - Sibling models to expose carefully: logistic regression, k-nearest
    neighbors, support vector machines, decision trees, ensembles, neural nets.

### Regression

- `supervised/linear-regression/`
  - Straight-line numeric prediction.
- `supervised/regularized-linear-models/`
  - Ridge (L2) and Lasso (L1) as one page.
- `supervised/decision-tree-regression/`
  - Rule-based numeric prediction with splits, depth, and overfitting.
- `supervised/knn-regression/`
  - Nearby examples, cold start, and similarity-based prediction.
- `supervised/support-vector-regression/`
  - Error-tolerant margins and support vectors for numeric prediction.
- `supervised/random-forest-regression/`
  - Bagged trees; many imperfect trees voting together.
- `supervised/gradient-boosting-regression/`
  - Sequential trees correcting prior mistakes.
- `supervised/mlp-regression/`
  - Applied neural-network regression lab.

### Neural-network foundations

- `supervised/build-neural-network/`
  - Features, vectors, weights, bias, activations, hidden layer, feedforward.
- `supervised/train-neural-network/`
  - Planned deeper training lesson: loss, gradients, gradient descent,
    backpropagation, learning rate, epochs, and generalization.

Neural networks are a model family, not only regression. For now they live
inside the supervised sequence because the existing lessons are supervised. If
the family grows into embeddings, transformers, autoencoders, or generative
models, create a broader neural-network hub.

## Recommended near-term order

1. Tighten `train-neural-network/`.
2. Revisit `mlp-regression/` after the training concepts have a foundation.
3. Add a lightweight classification sibling when ready:
   - logistic regression, or
   - decision-tree classification.
4. Build unsupervised learning only after the supervised spine feels coherent.

## Planned neural-network mini-labs

The training lesson should use small, focused interactions before the all-up MLP
lab:

- **Loss surface:** move a weight and watch error rise or fall.
- **Gradient descent:** step downhill toward a valley; compare learning rates.
- **Residuals:** show prediction minus actual for individual examples.
- **Backpropagation:** highlight responsibility flowing backward through edges.
- **Parameters vs. hyperparameters:** weights and biases are learned;
  architecture and learning rate are chosen by the builder.
- **Generalization:** compare training improvement with held-out examples.

## Future expansion ideas

- Logistic regression as the natural classification counterpart to linear
  regression.
- Decision-tree classification as a sibling to tree regression.
- Clustering under unsupervised learning.
- Dimensionality reduction and embeddings as a bridge from k-NN to neural
  recommenders.
- Attention and transformers after feedforward networks are no longer arcane.
