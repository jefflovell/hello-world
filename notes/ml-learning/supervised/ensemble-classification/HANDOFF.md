# Handoff: Ensemble Classification

Use this with:

- `../../ML_ROADMAP.md`
- `../../LESSON_PLAYBOOK.md`
- `../classification/LESSON_CONTEXT.md`

## Lesson role

This lesson follows support vector classification. It introduces classifiers
that combine many smaller models instead of asking one boundary, vote, or split
path to carry the full decision.

## Current teaching target

Teach ensemble classification as:

1. train multiple imperfect models,
2. make their errors different through sampling, feature subsets, or sequential
   correction,
3. aggregate votes or scores,
4. audit agreement, narrow majorities, residual correction, and shared blind
   spots.

## Neural-network sequence learnings to preserve

- Mechanism before slogan. Do not say “committee” without showing how votes or
  corrections combine.
- Trust is not raw agreement. Agreement helps when models make different errors;
  it fails when every model shares the same missing signal.
- Keep random forests and boosting distinct even if this first production page
  teaches them together.
- Keep readouts tied to the visible aggregation: vote share for forests,
  correction sequence for boosting.

## Current implementation

- Page: `index.html`
- Lab script: `ensemble-classification.js`
- Shared production styles: `styles.css` classifier production rules plus
  ensemble vote/correction styles.

The lab includes a mode toggle for random forest vs boosting. Forest mode shows
12 tree votes. Boosting mode shows sequential learner corrections. Sliders
change fraud signals and threshold; readouts update review strength, vote
margin, model count, and trust state.

## Good next pass

- Split random forest and gradient boosting into separate child lessons if the
  roadmap needs more depth.
- Add a held-out performance strip comparing one tree vs ensemble.
- Add a drift example where a missing feature causes broad agreement to fail.
