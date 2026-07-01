# Handoff: k-Nearest Neighbors Classification

Use this with:

- `../../ML_ROADMAP.md`
- `../../LESSON_PLAYBOOK.md`
- `../classification/LESSON_CONTEXT.md`

## Lesson role

This lesson follows logistic regression in the classification sibling sequence.
It should feel like a sharp contrast: logistic regression learns parameters,
while k-NN mostly stores labeled examples and predicts from local precedent.

## Current teaching target

Teach k-NN classification as:

1. store labeled examples,
2. measure distance from a new example to stored examples,
3. select the `k` nearest neighbors,
4. predict by local vote,
5. audit whether “nearby” means meaningful similarity.

## Neural-network sequence learnings to preserve

- Mechanism before slogan. Do not call k-NN intuitive without showing distance
  and votes.
- Define notation before using it: `x` is the new example, `xᵢ` (“x sub i”) is a
  stored training example, `k` is the neighbor count, and `ŷ` is the voted route.
- Trust is earned by local density and agreement. A lonely nearest neighbor is
  not a strong pattern just because it is closest.
- Make simplifications explicit. The two-feature map is a teaching slice of a
  richer support-ticket feature space.

## Current implementation

- Page: `index.html`
- Lab script: `knn-classification.js`
- Shared production styles: `styles.css` classifier production rules plus
  k-NN map styles.

The lab computes Euclidean distance in a two-feature ticket space, highlights
the `k` nearest stored tickets, draws distance lines, counts class votes, and
updates a trust note.

## Good next pass

- Add a feature-scaling toggle to show how a raw large-range feature can distort
  the neighbor set.
- Consider showing the sorted neighbor list as a compact table under the map.
- Keep this page focused on classification; the regression sibling can reuse
  the same distance idea but average numeric targets instead of voting labels.
