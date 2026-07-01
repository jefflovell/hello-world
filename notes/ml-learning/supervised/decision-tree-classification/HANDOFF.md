# Handoff: Decision Tree Classification

Use this with:

- `../../ML_ROADMAP.md`
- `../../LESSON_PLAYBOOK.md`
- `../classification/LESSON_CONTEXT.md`

## Lesson role

This lesson follows Naive Bayes in the classifier sequence. It should contrast
evidence scoring with explicit feature-question routing.

## Current teaching target

Teach decision-tree classification as:

1. ask a learned feature question at each node,
2. route the example left or right,
3. stop at a leaf,
4. predict from the class distribution in that leaf,
5. audit purity, sample size, depth, and pruning.

## Neural-network sequence learnings to preserve

- Mechanism before slogan. Do not say trees are interpretable without showing
  the path and the leaf distribution.
- Define notation before shorthand: `xⱼ` (“x sub j”) is one feature, `c` is the
  cutoff, and `ŷ` is the predicted class.
- Trust is not leaf confidence alone. A pure leaf with very few examples can be
  memorization, while a pruned path may generalize better despite being less
  tailored.
- Keep the lab instrument-like: active path, leaf readouts, and feature controls
  should all update together.

## Current implementation

- Page: `index.html`
- Lab script: `decision-tree-classification.js`
- Shared production styles: `styles.css` classifier production rules plus tree
  node/path styles.

The lab routes an account through velocity, payment history, and device mismatch
questions. It highlights the active SVG path, reports leaf purity and sample
size, and lets the reader reduce max depth to see pruning.

## Good next pass

- Add a compact leaf distribution bar for Allow/Review/Block.
- Add a “training split choice” mini-panel showing impurity before and after one
  split.
- Keep this page focused on classification; the tree-regression sibling should
  route to numeric averages rather than class distributions.
