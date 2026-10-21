# ∃xProof AI website

Static site for the AI safety research group of Aydin Mohseni and Daniel Herrmann. Plain HTML, no build step.

## Files

- `index.html`, `research.html`, `publications.html`, `people.html`, `about.html`, `work-with-us.html`, `404.html`: the main pages. `adaptations.html`, `naturalizing-agency.html`, `measuring-attitudes.html`, `value-uncertainty.html`, `delegation.html`: one page per research program. `projects.html` only redirects old links (with their anchors) to the program pages.
- `assets/site.css`: layout, type, color, print styles.
- `assets/site.js`: review mode, publication filters, citation copy buttons.
- `assets/search.js`: the background search animation.
- `assets/favicon.svg`: the ∃xP monogram.
- `assets/fonts/`: ET Book (MIT license, from tufte-css); wordmark subsets of STIX Two Math and EB Garamond (SIL Open Font License).
- `docs/PLAN.md`: the site plan. `docs/WORDMARK-AND-SEARCH.md`: the wordmark and background spec. `DESIGN.md`: how the build follows and departs from it.
- `STYLE.md`: the style guide (layout zones, section types, type, color, writing rules). `tools/check_layout.py`: the automated layout check.
- `CONTENT_REVIEW.md`: claims that still need confirming.

## Hosting

The repository is public and served by GitHub Pages from `main`, folder `/ (root)`, at `https://exproof.ai/` (set by the `CNAME` file; the old `amohseni.github.io/Existential-Proof-AI-Safety-Website/` address redirects there). Every push to `main` republishes the site within a minute or two. Aydin Mohseni and Daniel Herrmann both have write access.

## Editing

This repository is the only source of the site. Edit the HTML files here and push; nothing is generated from a local copy, so a change made here is never overwritten by a rebuild.

### Editing at the same time

Both of us push to `main`. To keep edits from colliding:

1. Pull before you start: `git pull --rebase`.
2. Make one change per commit, with a message that says what changed and on which page.
3. Push soon after each change. If the push is rejected because the other person pushed first, run `git pull --rebase`, check the result, and push again.
4. If the rebase stops on a conflict, keep both people's text unless one plainly replaces the other, then `git add` the file and `git rebase --continue`. If unsure, ask the other person before pushing.
5. The header and footer are repeated in every page, so a navigation change touches every file. Say so before making one, so the other person is not editing pages at the same time.

Small fixes can also be made in the GitHub web editor (open a file, click the pencil, commit to `main`).

Read `STYLE.md` before adding content, and run `python3 tools/check_layout.py` (with a local server running, as described there) before pushing.


- **Header and footer** are repeated in every page. A change to the navigation must be made in every page.
- **Add a publication:** copy one `<li class="work">` block in `publications.html`. List the authors in the order they appear on the paper, book, or report itself, in the author line, the BibTeX, and the project meta line alike; check the source (arXiv, the journal, or the manuscript) instead of reordering by role or alphabet. Set `data-type` to `paper`, `working`, or `report`. The page has four sections in this order: Published (newest first, preprints included), In progress (manuscripts, papers under review, revisions), Talks, Workshops. Put an entry in the right section; entries carry no status label. Update the counts in the line under the page title. Link every version that exists: the journal or proceedings version and the open archive version (arXiv, PhilPapers, a free-to-read link). Once the list mixes types, the type filter in `assets/site.js` works with buttons of the form `<button type="button" data-filter="paper" aria-pressed="false">Papers</button>` inside a `<div class="filters">`.
- **Add a program:** a program is a line of work that outlasts any one paper; a single paper goes on Publications and in a program's Outputs. Each program has its own page (copy an existing one): a hero with the area in the eyebrow, the title, a one- or two-sentence summary; then Overview, Why it matters (one paragraph: the risk the program bears on and who would use the result), Current work, Outputs (each output with its authors), and More research. List it on `research.html` under its area, with a one-line description, and on the home page. Margin-note ids and table numbers restart on each page. If you rename or merge a program, add its old anchor to the map in `projects.html`.
- **Link a name:** link every person's name to their main personal website every time it appears: people cards, author lines, project meta lines, the home page, and the contact list. Citations inside margin notes and BibTeX blocks stay plain. Look up the website of anyone newly added. Known URLs:

  | Name | URL |
  |---|---|
  | Aydin Mohseni | https://aydinmohseni.com/ |
  | Daniel Herrmann | https://www.danielherrmann.ca/ |
  | Bruce Rushing | https://brucemrushing.com/ |
  | Sven Neth | https://www.ocf.berkeley.edu/~nethsven/ |
  | Alex J. London | https://www.cmu.edu/dietrich/philosophy/people/faculty/london.html |
  | Benjamin A. Levinstein | https://www.levinstein.org/ |
  | Gerard Rothfus | https://gerardrothfus.com/ |
  | Pietro Cibinel | https://pietrocibinel.com/ |
  | Simon DeDeo | https://www.cmu.edu/dietrich/sds/people/faculty/simon-dedeo.html |
  | Travis LaCroix | https://durham.ac.uk/staff/travis-lacroix |
  | Dorian Clay | https://www.cmu.edu/dietrich/philosophy/people/masters/dorian-clay.html |
  | Daniel Kopp | https://www.cmu.edu/dietrich/philosophy/people/masters/daniel-kopp.html |
  | Sree Sharvesh | https://www.sreesharvesh.com/ |
  | Katalin Berlow | https://katalinberlow.github.io/ |
  | Abinav Chari | https://www.linkedin.com/in/abinav-chari1 (as on Daniel's site) |
  | Isabelle Qian | https://www.linkedin.com/in/isabelle-athena-qian (as on Daniel's site) |

  Names with no confirmed URL stay unlinked: Jeremy Saal, L. G. Demo, Jens Jäger, Haotian Zong, Yosra Kazemi, Yang Hu.
- **Add a margin note:** inside a paragraph, add
  `<label for="sn-x" class="margin-toggle sidenote-number"></label><input type="checkbox" id="sn-x" class="margin-toggle"><span class="sidenote">Note text.</span>`
  with an `id` unique on that page.
- **Review mode:** open any page with `#review` at the end of the URL. Every element with a `data-verify` attribute is highlighted, and hovering shows what needs confirming. Delete the attribute once the claim is confirmed.
- **Animation settings** are at the top of `assets/search.js`: `CFG` (the 1/3 probability, depth range, node budget, colors, speeds, and timings). Running `window.__exproof.sample(1000)` in the browser console checks the 1/3 share and the tree invariants. To watch a solvable cycle, run `window.__exproofForce = true` in the console before the next cycle starts.

- **Example questions** appear twice: inside each area on `research.html` (under its More toggle) and on `work-with-us.html`. Change both together.

- **Each fall, update the PhD admissions line** on `work-with-us.html` (the admission year and the UNC and Carnegie Mellon deadlines).
