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
- `STYLE.md`: the style guide (layout zones, section types, type, color, writing rules). `tools/check_layout.py`: the automated layout check.
- `CONTENT_REVIEW.md`: claims that still need confirming.

## Hosting

The repository is public and served by GitHub Pages from `main`, folder `/ (root)`, at `https://amohseni.github.io/Existential-Proof-AI-Safety-Website/`. Every push to `main` republishes the site within a minute or two. Aydin Mohseni and Daniel Herrmann both have write access.

## Editing

This repository is the only source of the site. Edit the HTML files here and push; nothing is generated from a local copy, so a change made here is never overwritten by a rebuild.

Read `STYLE.md` before adding content, and run `python3 tools/check_layout.py` (with a local server running, as described there) before pushing.


- **Header and footer** are repeated in every page. A change to the navigation must be made in all seven files.
- **Add a publication:** copy one `<li class="work">` block in `publications.html`. Set `data-type` to `paper`, `working`, or `report`. Talks do not go on this page. Status classes: `active` (in progress), none (under review or revision), `out` (published). Once the list mixes types, the type filter in `assets/site.js` works with buttons of the form `<button type="button" data-filter="paper" aria-pressed="false">Papers</button>` inside a `<div class="filters">`.
- **Add a project:** copy one `<article class="block">` in `projects.html`. Give it an `id`, an `h2`, a `p.meta-line` with linked names, a one- or two-sentence `p.summary`, and optionally a `<details class="expand"><summary>More</summary><div class="expand-body">…</div></details>` for the longer explanation. Do not add status labels.
- **Link a name:** link every person's name to their main personal website every time it appears: people cards, author lines, project meta lines, the home page, and the contact list. Citations inside margin notes and BibTeX blocks stay plain. Look up the website of anyone newly added. Known URLs:

  | Name | URL |
  |---|---|
  | Aydin Mohseni | https://aydinmohseni.com/ |
  | Daniel Herrmann | https://www.danielherrmann.ca/ |
  | Bruce Rushing | https://brucemrushing.com/ |
  | Sven Neth | https://www.ocf.berkeley.edu/~nethsven/ |
  | Alex J. London | https://www.cmu.edu/dietrich/philosophy/people/faculty/london.html |
  | Benjamin A. Levinstein | https://philpeople.org/profiles/ben-levinstein (until a personal site is confirmed) |

  Names with no confirmed URL stay unlinked: Jens Jäger, Haotian Zong, Yosra Kazemi, Yang Hu, Abinav Chari, Isabelle Qian, Sree Sharvesh.
- **Add a margin note:** inside a paragraph, add
  `<label for="sn-x" class="margin-toggle sidenote-number"></label><input type="checkbox" id="sn-x" class="margin-toggle"><span class="sidenote">Note text.</span>`
  with an `id` unique on that page.
- **Review mode:** open any page with `#review` at the end of the URL. Every element with a `data-verify` attribute is highlighted, and hovering shows what needs confirming. Delete the attribute once the claim is confirmed.
- **Animation settings** are at the top of `assets/search.js`: `CFG` (the 1/3 probability, depth range, node budget, colors, speeds, and timings). Running `window.__exproof.sample(1000)` in the browser console checks the 1/3 share and the tree invariants. To watch a solvable cycle, run `window.__exproofForce = true` in the console before the next cycle starts.
