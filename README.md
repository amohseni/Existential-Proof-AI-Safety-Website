# ∃xProof AI website

Static site for the AI safety research group of Aydin Mohseni and Daniel Herrmann. Plain HTML, no build step.

## Files

- `index.html`, `research.html`, `projects.html`, `publications.html`, `people.html`, `about.html`, `404.html`: the pages.
- `assets/site.css`: layout, type, color, print styles.
- `assets/site.js`: review mode, publication filters, citation copy buttons.
- `assets/search.js`: the background search animation.
- `assets/favicon.svg`: the ∃xP monogram.
- `assets/fonts/`: ET Book (MIT license, from tufte-css); wordmark subsets of STIX Two Math and EB Garamond (SIL Open Font License).
- `docs/PLAN.md`: the site plan. `docs/WORDMARK-AND-SEARCH.md`: the wordmark and background spec. `DESIGN.md`: how the build follows and departs from it.
- `CONTENT_REVIEW.md`: claims that still need confirming.

## Going live on GitHub Pages

The repository starts private so draft content is not public. When the content is confirmed:

1. Settings, General: change visibility to public (or keep it private if the account has GitHub Pro).
2. Settings, Pages: source "Deploy from a branch", branch `main`, folder `/ (root)`.
3. The site appears at `https://amohseni.github.io/Existential-Proof-AI-Safety-Website/`. For a custom domain, add a `CNAME` file with the domain.

## Editing

- **Header and footer** are repeated in every page. A change to the navigation must be made in all seven files.
- **Add a publication:** copy one `<li class="work">` block in `publications.html`. Set `data-type` to `paper`, `working`, or `report`. Talks do not go on this page. Status classes: `active` (in progress), none (under review or revision), `out` (published). Once the list mixes types, the type filter in `assets/site.js` works with buttons of the form `<button type="button" data-filter="paper" aria-pressed="false">Papers</button>` inside a `<div class="filters">`.
- **Add a margin note:** inside a paragraph, add
  `<label for="sn-x" class="margin-toggle sidenote-number"></label><input type="checkbox" id="sn-x" class="margin-toggle"><span class="sidenote">Note text.</span>`
  with an `id` unique on that page.
- **Review mode:** open any page with `#review` at the end of the URL. Every element with a `data-verify` attribute is highlighted, and hovering shows what needs confirming. Delete the attribute once the claim is confirmed.
- **Animation settings** are at the top of `assets/search.js`: `CFG` (the 1/3 probability, depth range, node budget, colors, speeds, and timings). Running `window.__exproof.sample(1000)` in the browser console checks the 1/3 share and the tree invariants. To watch a solvable cycle, run `window.__exproofForce = true` in the console before the next cycle starts.
