# ∃x AI site: design notes

The full plan is in `docs/PLAN.md`. This file records how the build follows the plan and where it departs from it.

## What follows the plan

- **Brand.** Wordmark `∃x AI`; monogram `∃xP` (favicon in `assets/favicon.svg`). ET Book has no ∃ glyph, so the wordmark draws ∃ as a mirrored E in ET Book, which keeps it in the same typeface as the rest of the page.
- **Color.** Black field (`#050505`), warm white text (`#f5f5f2`), secondary text `#b8b8b3`, blood red `#b0122b` with `#d11c3d` for hover and large accent text, green `#1fa463` only for the success path.
- **Type.** ET Book for text and headings, IBM Plex Sans for navigation and metadata, IBM Plex Mono for problem numbers and the monogram.
- **Pages.** Home, Research, Projects, Publications, People, About, plus a 404 page.
- **Background search.** `assets/search.js`. Each cycle draws a hidden binary tree. With probability exactly 1/3 one path reaches the right edge; otherwise every branch ends early. A white light searches by depth-first search with a geometric heuristic (continue the current direction, prefer room to grow, small random tiebreak). The heuristic never sees which branch is the solution. Explored edges stay gray; a found path sweeps green; then the tree fades and a new one is drawn. The tree is dimmed under the text column and fully visible in the margins. With reduced motion on, the page shows one still gray tree.
  - Tested over 30,000 trees: share solvable 0.332; every solvable tree has exactly one node at the right edge and every unsolvable tree has none; the search finds a path exactly when one exists. Mean search time is about 13 seconds.
- **Navigation.** Sticky, minimal header on desktop; red underline marks the current page.

## Where the build departs from the plan

1. **Plain HTML instead of Astro.** Six pages with about a dozen entries do not need a build toolchain. Plain HTML deploys on GitHub Pages with no Actions workflow, previews anywhere, and can be edited with a text editor. Moving to Astro is worth it once Notes has regular posts; the page structure carries over unchanged.
2. **No Notes page yet.** An empty or thin Notes page signals an inactive lab. Add it to the navigation with the first two notes.
3. **Projects on one page.** Each project has a stable anchor (`projects.html#adaptations` and so on). A project gets its own page once it has enough content to fill one.
4. **Link text stays white with a red underline.** Blood red text on black has a contrast ratio near 2.9:1, below the 4.5:1 needed for small text. Red is used for underlines, marks, the current page, and large accent text, where it reads clearly.
5. **Added the evolutionary-adaptations project**, which the plan's project list omits. It is the project with Daniel and Sven Neth, and it carries the site's two figures.

## Open question on the hero

The hero states "There exists a path to safe AI." The background animation finds a path in only one cycle out of three, and the earlier name discussion rejected names that sound overconfident. A version that keeps the ∃ idea without asserting the conclusion: "Is there a path to safe AI? We are looking for it." The current text is marked for review.
