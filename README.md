# ∃x AI website

Static site for the AI safety research group of Aydin Mohseni and Daniel Herrmann. Plain HTML, no build step.

## Files

- `index.html`, `research.html`, `projects.html`, `publications.html`, `people.html`, `about.html`, `404.html`: the pages.
- `assets/site.css`: layout, type, color, print styles.
- `assets/site.js`: review mode, publication filters, citation copy buttons.
- `assets/search.js`: the background search animation.
- `assets/favicon.svg`: the ∃xP monogram.
- `assets/fonts/`: ET Book (MIT license, from tufte-css).
- `docs/PLAN.md`: the site plan. `DESIGN.md`: how the build follows and departs from it.
- `CONTENT_REVIEW.md`: claims that still need confirming.

## Going live on GitHub Pages

The repository starts private so draft content is not public. When the content is confirmed:

1. Settings, General: change visibility to public (or keep it private if the account has GitHub Pro).
2. Settings, Pages: source "Deploy from a branch", branch `main`, folder `/ (root)`.
3. The site appears at `https://amohseni.github.io/Existential-Proof-AI-Safety-Website/`. For a custom domain, add a `CNAME` file with the domain.

## Editing

- **Header and footer** are repeated in every page. A change to the navigation must be made in all seven files.
- **Add a publication:** copy one `<li class="work">` block in `publications.html`. Set `data-type` to `working`, `paper`, or `talk`. Status classes: `active` (in progress), none (under review or revision), `out` (published or given). If you add the first published paper, add a "Papers" filter button with `data-filter="paper"`.
- **Add a margin note:** inside a paragraph, add
  `<label for="sn-x" class="margin-toggle sidenote-number"></label><input type="checkbox" id="sn-x" class="margin-toggle"><span class="sidenote">Note text.</span>`
  with an `id` unique on that page.
- **Review mode:** open any page with `#review` at the end of the URL. Every element with a `data-verify` attribute is highlighted, and hovering shows what needs confirming. Delete the attribute once the claim is confirmed.
- **Animation settings** are at the top of `assets/search.js`: `P_SOLVABLE` (1/3) and the timings in `T`. Running `window.__searchField.sample(10000)` in the browser console checks the 1/3 share and the tree invariants.
