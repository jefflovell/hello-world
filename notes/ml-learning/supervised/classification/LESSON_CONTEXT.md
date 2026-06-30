# Lesson context: Classification

Use with `../../LESSON_PLAYBOOK.md` and `../../ML_ROADMAP.md`.

## Role in the tree

Canonical classification task page. The old `../classifiers/` address is a
redirect; do not build new work there.

Classification predicts a category. This page currently teaches the perceptron
as the first classification model and acts as the classification sibling to the
regression path.

## Current use case and model

The lab teaches a perceptron learning a boundary from labeled examples. The
reader should understand that a classifier scores an example, guesses a class,
then updates after mistakes.

The page now also acts as the first-pass classifier roadmap. Each planned model
card should make a mechanism promise:

- perceptron: score, guess a side, update the straight boundary after mistakes
- logistic regression: convert a linear score into a probability and threshold
- k-nearest neighbors: vote from nearby labeled examples
- Naive Bayes: compare feature likelihoods by class
- decision trees: route examples through feature questions to a labeled leaf
- support vector classifier: find a boundary with a wide margin
- ensembles: combine many imperfect decisions into a steadier vote
- neural networks: bend the decision surface through hidden-layer
  transformations

The cards now link to first-draft child pages. Keep this page focused on the
classification task family plus the perceptron foundation; deepen model-specific
labs on the child pages instead of expanding the overview into a catalog.

## Current classifier child drafts

- `../logistic-regression/`: linear score, sigmoid probability, threshold, and
  calibration.
- `../knn-classification/`: distance, local votes, `k`, and feature scaling.
- `../naive-bayes-classification/`: priors, likelihoods, independence
  assumption, and smoothing.
- `../decision-tree-classification/`: feature questions, leaf votes, impurity,
  depth, and pruning.
- `../support-vector-classification/`: boundary, margin, support vectors, soft
  margin, and kernels.
- `../ensemble-classification/`: random-forest style votes and boosting-style
  corrections in one first-draft ensemble page.
- `../neural-network-classification/`: hidden activations, logits, sigmoid or
  softmax probability outputs, cross-entropy loss, and generalization.

These are first drafts. They use a shared compact case-switching lab in
`../classifier-draft.js` rather than fully bespoke visualizations. Future passes
should replace the shared draft labs with richer interactions where the teaching
need justifies the complexity.

## Current learning loop

1. Train on labels.
2. Adjust after mistakes.
3. Predict without labels.

## Interactive lab

Current lab: “A perceptron learns a boundary.”

The interaction should make the decision boundary, misclassified points, and
parameter updates visible. Preserve the feeling that the model is correcting
itself from labeled feedback.

## Mechanics and vocab to preserve

- perceptron
- classifier
- label
- feature
- weight
- bias
- activation / step rule
- learning rate `η` (“eta”)
- prediction
- mistake-driven update

Keep notation speakable and searchable. Continue using equation cards and vocab
cards as the standard evolves.

## Future update notes

- This page has received a first voice/mechanism pass after the neural-network
  sequence. Future work should deepen the lab and styling, not revert it to a
  generic catalog.
- Classifier child pages now exist as first drafts. Prioritize tightening the
  most confusing or high-value model-specific labs before adding more
  classifiers.
