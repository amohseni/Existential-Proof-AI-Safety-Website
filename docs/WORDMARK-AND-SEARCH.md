# ∃xProof AI — Logo + Generative Search Background

## 1. Core concept

The site belongs to **∃xProof AI**, pronounced **“ExProof AI.”**

`∃x` is the existential quantifier: *there exists an x*. The name suggests both:

- there exists a solution to safe AI;
- there exists a proof/witness/path demonstrating that solution.

The site background makes this idea literal: an initially unknown mathematical search space is explored for a path from the left side of the screen to the right.

The overall aesthetic should be austere, mathematical, elegant, black-field, and extremely polished—not cyberpunk, game-like, or generically “AI-looking.”

---

# 2. Wordmark

The wordmark is:

**∃xProof AI**

There is no space between `∃x` and `Proof`.

There **is** a deliberate word space between `Proof` and `AI`.

## Typographic intent

The logo should look like refined mathematical/editorial typography rather than an illustrated logo.

Important optical requirements:

- `∃` should have approximately the same visual/capital height as `AI`.
- `x` is italic.
- The `x` should have the **same x-height as the lowercase letters in `Proof`**.
- `xProof` should read fluidly as one typographic construction.
- There must be no collisions or awkward overlaps.
- Kerning should be tight but visibly intentional.
- `Proof AI` should use a refined Garamond-style serif.
- White/off-white on black.

Preferred fonts:

- `∃`: STIXGeneral / Cambria Math / another high-quality mathematical serif.
- `xProof AI`: EB Garamond or a close high-quality Garamond.

## HTML

```html
<div class="exproof-wordmark" aria-label="Existence Proof AI">
  <span class="exists">∃</span><span class="x">x</span><span class="proof">Proof</span><span class="ai">AI</span>
</div>
```

## CSS

```css
.exproof-wordmark {
  display: inline-flex;
  align-items: baseline;
  white-space: nowrap;
  color: #f5f5f2;

  font-size: 30px;
  line-height: 0.92;
  font-weight: 400;

  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
  font-kerning: normal;
}

.exproof-wordmark .exists {
  font-family:
    "STIXGeneral",
    "Cambria Math",
    "DejaVu Math TeX Gyre",
    Georgia,
    serif;

  font-size: 0.965em;
  line-height: 1;

  display: inline-block;
  transform: translateY(0.016em) scaleX(0.975);
  transform-origin: center;

  margin-right: 0.008em;
}

.exproof-wordmark .x {
  /*
   * IMPORTANT:
   * Same family and nominal size as Proof so its x-height
   * matches the lowercase letters in Proof.
   */
  font-family: "EB Garamond", Garamond, Georgia, serif;
  font-size: 0.94em;
  font-style: italic;
  line-height: 1;

  display: inline-block;
  transform: translateY(0.012em);

  margin-left: -0.010em;
  margin-right: 0.010em;
  letter-spacing: -0.010em;
}

.exproof-wordmark .proof {
  font-family: "EB Garamond", Garamond, Georgia, serif;
  font-size: 0.94em;
  line-height: 1;

  letter-spacing: -0.022em;
  display: inline-block;
}

.exproof-wordmark .ai {
  font-family: "EB Garamond", Garamond, Georgia, serif;
  font-size: 0.965em;
  line-height: 1;

  letter-spacing: -0.014em;
  display: inline-block;

  /* Deliberate word space: ∃xProof AI */
  margin-left: 0.18em;
}
```

Treat these numeric values as carefully tuned starting points. Final production implementation should be visually inspected at actual header size; optical kerning takes priority over mechanically preserving the numbers.

---

# 3. Background concept

The animation represents a search for a path to safe AI through an initially unknown mathematical possibility space.

A binary tree exists latently in the background.

Initially, none of the graph is visible.

A small white search light begins at the root and explores the graph.

As an edge is traversed:

- that edge becomes visible;
- it remains visible in muted gray;
- nodes themselves are **never drawn**.

The search therefore gradually reveals exactly the parts of the mathematical space it has explored.

---

# 4. Exact solvability probability

Every new tree instance should independently be solvable with probability exactly:

```js
1 / 3
```

Do **not** try to obtain approximately 1/3 solvability as an emergent property of random branching.

Instead sample it directly:

```js
const solvable = rng.next() < 1 / 3;
```

If `solvable === true`, plant one hidden witness path from depth `0` through terminal depth `D`.

If `solvable === false`, no branch may reach terminal depth `D`.

Thus:

```text
P(there exists a complete path) = 1/3
```

exactly by construction.

The visible search procedure must **not** inspect the hidden `winning` information.

---

# 5. Organic tree generation

## Critical requirement

Do **not** generate non-winning branches by simply allowing them to continue until `D−1` and then forcing them to stop.

That produces an artificial concentration of leaves exactly one step before success.

Instead use a **depth-dependent extinction process**.

Branches should terminate naturally throughout the tree:

- some relatively early;
- many around intermediate depths;
- progressively fewer very deep;
- occasional convincing near-misses;
- very few failures precisely at `D−1`.

The result should resemble an organic branching process rather than a collection of artificially truncated paths.

---

# 6. Recommended branching process

For each **non-witness node**, let

```js
const u = depth / D;
```

where `u ∈ [0,1]`.

Use a smoothly increasing stopping hazard:

```js
function stopProbability(depth, D, pressure = 0) {
  const u = depth / D;

  let p =
    0.035 +
    0.60 * Math.pow(u, 1.70);

  /*
   * If the graph is approaching its node budget,
   * taper gracefully instead of suddenly truncating it.
   */
  const budgetEffect =
    0.35 *
    Math.pow(
      Math.max(0, (pressure - 0.72) / 0.28),
      2
    );

  return Math.min(0.98, p + budgetEffect);
}
```

This gives:

- very low extinction near the beginning;
- gradually increasing extinction through the middle;
- strong tapering late in the tree.

Do not permit extinction before roughly depth 2 so the structure always establishes itself visually.

---

# 7. One-child versus two-child branching

Conditional on surviving, a node should produce either one or two children.

Two-way branching should also become gradually less common deeper in the graph:

```js
function twoChildProbability(depth, D, pressure = 0) {
  const u = depth / D;

  const base =
    Math.max(
      0.10,
      0.40 - 0.24 * u
    );

  return base * (1 - Math.pow(pressure, 1.6));
}
```

Then:

```js
const childCount =
  rng.next() < twoChildProbability(depth, D, pressure)
    ? 2
    : 1;
```

The root can be forced to bifurcate so the visual field starts with meaningful alternatives:

```js
if (depth === 0) childCount = 2;
```

This produces trees that are dense near the left/middle but naturally taper as they progress.

---

# 8. Witness path

When `solvable === true`, create one guaranteed witness path:

```js
for (let depth = 1; depth <= D; depth++) {
  // add exactly one guaranteed winning child
}
```

At nodes on this witness path, optionally generate a non-winning sibling subtree.

A reasonable side-branch probability is:

```js
function witnessSideBranchProbability(depth, D) {
  const u = depth / D;

  if (depth === 0) return 0.92;

  return 0.06 + 0.34 * (1 - u);
}
```

Thus the real solution is visually embedded in a plausible search space rather than sitting alone.

Side branches should use the same organic extinction process as every other non-winning branch.

---

# 9. Hard terminal boundary

Non-winning branches still need a formal safety guard:

```js
if (depth >= D - 1) {
  stop();
}
```

But this should be only a **boundary condition**, not the main termination mechanism.

Because the extinction hazard rises naturally with depth, very few branches should ever reach this boundary.

This is the important behavioral difference from the earlier implementation.

---

# 10. Node-budget behavior

Suggested limits:

```js
minDepth: 26
maxDepth: 34
maxNodes: 320
```

Do not simply stop creating children when `maxNodes` is approached, because that creates another visible artificial truncation layer.

Instead calculate:

```js
const pressure = nodes.length / maxNodes;
```

and smoothly:

- increase extinction probability;
- decrease two-child probability.

The formulas above already do this.

The graph should therefore naturally taper before reaching its computational budget.

---

# 11. Tree geometry: zero crossings

All visible graph edges are straight line segments.

No curves.

No rendered nodes.

The tree must be **planar**: branches must never cross.

Use a tidy-tree / ordered-leaf layout.

Algorithm:

1. Give every node's children a stable ordering.
2. Recursively count terminal leaves in every subtree.
3. Assign leaves monotonically increasing vertical positions.
4. Place each internal node at the average vertical position of its children.
5. Position nodes horizontally entirely according to depth.
6. Preserve recursive child ordering.

This guarantees that sibling subtrees occupy disjoint vertical intervals, preventing edge crossings.

Conceptually:

```js
function assignY(node) {
  if (node.children.length === 0) {
    node.y = nextLeafY();
    return node.y;
  }

  const ys = node.children.map(assignY);

  node.y =
    ys.reduce((a, b) => a + b, 0) /
    ys.length;

  return node.y;
}
```

---

# 12. Exact horizontal extent

Every generated tree should span the middle **90% of the viewport width**.

Root:

```js
x = width * 0.05;
```

Terminal depth:

```js
x = width * 0.95;
```

Implementation:

```js
const left = width * 0.05;
const usableWidth = width * 0.90;
const dx = usableWidth / D;

node.x =
  left +
  node.depth * dx;
```

This must be fully responsive.

---

# 13. Visual treatment

Background:

```css
#050505
```

Primary page text:

```css
#f5f5f2
```

Explored graph:

```css
#91918b
```

Search light:

```css
#ffffff
```

Successful proof path:

```css
#1fa463
```

Site accent / links:

```css
#b0122b
```

Graph edges should be:

```js
strokeWidth ≈ 1.2px
opacity ≈ 0.44
```

They should be clearly visible after discovery but remain visually subordinate to the website's text.

---

# 14. Search light

Use three layers:

1. tiny bright white core;
2. subtle local halo;
3. very faint larger halo.

No neon appearance.

No particles.

No lens-flare effects.

The light should feel more like a mathematical cursor or point of attention than an energy orb.

---

# 15. Search procedure

Use heuristic depth-first search.

Branch choice can favor:

```text
directional continuity
+ rightward/depth progress
+ mild center preference
+ very small random tie-break
```

The search must never inspect whether a node belongs to the planted witness path.

It should genuinely discover the solution through traversal.

---

# 16. Motion

Use `requestAnimationFrame`.

Use quintic smootherstep:

```js
function smootherstep(t) {
  return t * t * t *
    (t * (t * 6 - 15) + 10);
}
```

Normal movement should:

- accelerate gently;
- move decisively through the middle;
- decelerate smoothly.

When approaching a leaf/dead end:

- decelerate more noticeably;
- subtly reduce apparent urgency;
- pause briefly.

When backtracking:

- begin softly;
- accelerate slightly faster than forward travel;
- settle smoothly at the previous decision point.

The motion should suggest *recognition of failure followed by renewed search*, without anthropomorphic animation.

---

# 17. Explored-state rendering

An edge begins completely invisible.

As the light traverses it, progressively reveal it using SVG stroke dash offset.

After traversal:

```text
edge → permanent muted gray
```

Previously explored branches stay visible throughout the search.

Nodes stay invisible at all times.

---

# 18. Success

When the search reaches terminal depth `D`:

1. pause momentarily;
2. white light transitions subtly toward green;
3. the discovered root-to-goal proof path illuminates green in a smooth sweep;
4. all other explored branches remain gray;
5. hold the completed proof briefly;
6. dissolve the entire structure slowly;
7. generate a new tree.

Success should feel like a proof becoming evident—not like winning a game.

No explosions, flashes, or celebratory effects.

---

# 19. Failure

When the frontier becomes empty:

1. the light rests briefly;
2. its halo slowly subsides;
3. the explored gray tree remains visible for a moment;
4. everything fades away smoothly.

Do not use red.

Do not show an error state.

Failure means only:

> this search space contained no witness.

---

# 20. Reduced motion

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

Instead of animated traversal, show a quiet static partially explored tree.

The website must remain fully functional without the animation.

---

# 21. Layering

Background SVG:

```css
#exproof-search-background {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;

  z-index: 0;
  pointer-events: none;

  background: transparent;
}
```

Site content:

```css
.exproof-site-content {
  position: relative;
  z-index: 1;
}
```

Animation must never interfere with scrolling, links, selection, or accessibility.

---

# 22. Performance

Use SVG unless performance testing shows a real problem.

Target approximately:

```text
26–34 depth layers
~100–300 structural nodes
straight SVG paths
one animated search light
```

Do not animate every graph edge continuously.

Only the current traversal and occasional final-state transitions need per-frame updates.

---

# 23. Final aesthetic criterion

The animation should feel like:

> a theorem prover searching an unknown formal space

rather than:

> an animated computer network.

It should communicate disciplined uncertainty, search, failure, backtracking, and eventual proof.

The mathematics is the visual language.

The site content must always remain perceptually primary.

The key change from the prior handoff is the **depth-dependent extinction process plus node-budget pressure**; that is what removes the artificial pile-up of failures at `D−1`.