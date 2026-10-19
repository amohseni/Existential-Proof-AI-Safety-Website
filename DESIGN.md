# ∃xProof AI site: design notes

The full plan is in `docs/PLAN.md`. This file records how the build follows the plan and where it departs from it.

## What follows the plan

- **Brand.** Wordmark `∃xProof AI`, pronounced "ExProof AI" (spec in `docs/WORDMARK-AND-SEARCH.md`). ∃ is set in STIX Two Math and `xProof AI` in EB Garamond, both self-hosted as subsets containing only the wordmark's glyphs (under 4 KB together). ∃ is red; on hover the whole wordmark turns red. Monogram `∃xP` (favicon in `assets/favicon.svg`).
- **Color.** Black field (`#050505`), warm white text (`#f5f5f2`), secondary text `#b8b8b3`, blood red `#b0122b` with `#d11c3d` for hover and large accent text, green `#1fa463` only for the success path.
- **Type.** ET Book for text and headings, IBM Plex Sans for navigation and metadata, IBM Plex Mono for problem numbers and the monogram.
- **Pages.** Home, Research, Projects, Publications, People, About, plus a 404 page.
- **Background search.** `assets/search.js`, drawn in SVG, following `docs/WORDMARK-AND-SEARCH.md`. Each cycle generates a tree of depth 26 to 34 (by viewport width) spanning 5% to 95% of the width. With probability exactly 1/3 one witness path is planted to depth D; otherwise no branch reaches D. Other branches die out by a depth-dependent extinction hazard, with a node-budget pressure term, so dead ends spread across depths. A light searches by heuristic depth-first search that never reads the witness flag. The light is an area, not a dot: a small core, a soft glow, and a faint pool, each with a smooth falloff. It stretches along its direction of travel in proportion to speed, its glow trails slightly behind the core, it breathes faintly at rest, and its intensity eases toward a level set by the search (full when advancing, dimmer when backtracking, dimmest at a dead end). It also illuminates the explored edges near it, through a brighter copy of the explored graph masked by a radial falloff centered on the light. Edges appear as they are traversed and stay gray; nodes are never drawn. Motion uses quintic smootherstep, grouped into runs between decision points; dead ends decelerate more and pause; backtracking is faster. A found path turns the light green and sweeps the proof path green, then the path brightens once (brighter green, heavier stroke, soft glow) and holds before dissolving, followed by a one-second pause; an exhausted search lets the light's halo subside. Edges are dimmed under the text column. Reduced motion shows one still, partly explored tree.
  - Tested over 3,000 trees: share solvable 0.331; every solvable tree has exactly one node at depth D, on the witness path; every unsolvable tree has none; the search finds a path exactly when one exists; zero edge crossings (exact check on 150 trees). Mean tree size 259 nodes; mean search 44 seconds. Dead ends peak around depth 15 and thin out toward D, with 0.1% at D minus 1.
  - Layout departs from the spec's uniform-leaf tidy tree in one respect: subtrees are packed by contour (Reingold–Tilford), which keeps the tree planar and parents at the average of their children but removes the tall empty gaps that uniform leaf spacing leaves under unbalanced subtrees.
- **Navigation.** Sticky, minimal header on desktop; red underline marks the current page.

## Where the build departs from the plan

1. **Plain HTML instead of Astro.** Six pages with about a dozen entries do not need a build toolchain. Plain HTML deploys on GitHub Pages with no Actions workflow, previews anywhere, and can be edited with a text editor. Moving to Astro is worth it once Notes has regular posts; the page structure carries over unchanged.
2. **No Notes page yet.** An empty or thin Notes page signals an inactive lab. Add it to the navigation with the first two notes.
3. **Projects on one page, without status categories.** Each project has a stable anchor (`projects.html#adaptations` and so on), a one- or two-sentence summary, and, where there is more to say, a "More" toggle (`details.expand`) that opens the longer explanation in place. A project gets its own page once it has enough content to fill one.
4. **Links are plain white text that turns red on hover.** No underline at rest (changed 18 October 2026 at Daniel's request). Blood red text on black has a contrast ratio near 2.9:1, below the 4.5:1 needed for small text, so red appears only on hover, in marks, for the current page, and in large accent text.
5. **Added the evolutionary-adaptations project**, which the plan's project list omits. It is the project with Daniel and Sven Neth. Its six-part scheme is set as text, and it carries the site's one table.
6. **Layout rules are enforced.** `STYLE.md` defines the zones and section types; `tools/check_layout.py` fails on any protrusion into the margin column, sideways scrolling, overlapping notes, or clipped text.

7. **Names link to personal websites.** The `PEOPLE` table in the generator maps each name to a URL; names without a confirmed URL stay unlinked. Aydin's only listed affiliation besides CMU is CoRe Safe AI.
8. **People are grouped.** The current entries are "Core members"; graduate students and team members will get their own groups.

## Hero

"We are searching for a path to safe AI." The site asserts only what the group does, not what it will find.
