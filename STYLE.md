# ∃xProof AI style guide

Rules for every page on the site. Follow them when adding content, and run the layout check (last section) before pushing.

## 1. Layout rules

### Zones

Every section is laid out on one grid with three zones, left to right:

| Zone | Width | What goes there |
|---|---|---|
| Rail | 8.5rem | The section label only (small capitals, `.label`). |
| Text column | up to 34rem (about 65 characters) | All content: prose, headings, lists, tables, figures, grids. |
| Margin column | 15rem (12rem below 1100px) | Margin notes only (`.sidenote`, `.marginnote`). |

### Section types

- **Text section** (`<section class="section">`, the default). Content stays inside the text column. Only margin notes enter the margin column. Use this for prose, project descriptions, lists, and anything with margin notes.
- **Wide section** (`<section class="section section--wide">`). There is no margin column; content spans the text and margin columns together. Margin notes are not allowed and are hidden if present. Use this only for grids of short, parallel items: the research areas on the home page and the people grid.

A section is one type or the other, never both. Nothing reaches into another zone by negative margins; margin notes are the only elements with a negative margin.

### Vertical rhythm and rules

- **No hairlines between text.** Sections, list items, and works have no dividing lines; the tree in the background is the only line work between them.
- **No rules between sections.** The only horizontal line on a page is the one under the masthead, at half the strength of `--rule-strong`. Tables keep their internal rules.
- **Cap lines align.** An imaginary line drawn along the tops of the capitals of a rail label runs along the tops of the capitals of the first line beside it (or the top of a photo), and, on the Publications page, along the year and the title of each entry. The label's offset depends on what the section body starts with (see the `--label-pt` rules in `site.css`). After changing any type size, run `tools/check_alignment.py`.
- **Link targets land below the menu.** A linked item (`#id`) stops so its first line sits level with the pinned section label, just below the menu bar, not under it. The `scroll-margin-top` rules in `site.css` do this; an element with its own top padding subtracts it, as `.work` does.
- **Closing notes sit midway.** A section ends `--tail` (1.4rem, 1.1rem under 860px) above its lower edge. A closing note (`p.more` as the last element of a section body, such as "All research" or "Back to Agency") sits `--tail` below the element above it and `--tail` above that edge, so it is centered between the two. Any new closing line follows the same rule; do not give it its own margins.

### Figures, tables, and diagrams

1. First ask whether the content can be said in a sentence. A formal statement belongs in the text as a `.scheme` block (italic, indented, variables upright), not as a grid or diagram.
2. A table must fit the text column. Three columns is the practical limit there. A table that needs more goes in its own wide section, or is split.
3. A table or code block that can grow wider than its column goes inside `<div class="table-wrap">`, which scrolls sideways within the column rather than pushing out of it.
4. Captions are labeled by kind and numbered within the page: "Table 1", "Figure 1".
5. No figure, table, or image goes in the margin column.

### Responsive behavior

| Viewport | Behavior |
|---|---|
| over 1100px | Full three-zone grid. |
| 860 to 1100px | Margin column narrows to 12rem. Research areas grid drops to two columns. |
| under 860px | One column. The rail label sits above each section. Margin notes become numbered toggles that open in place. Grids stack. |
| under 560px | Header is no longer sticky. Lists of works stack their metadata above the title. |

### Clipping

- Every grid or flex child that holds text has `min-width: 0`, so long text wraps instead of overflowing.
- Labels, metadata, roles, and addresses wrap anywhere if needed (`overflow-wrap: anywhere`).
- No element has a fixed width larger than its column.

## 2. Type

| Role | Face | Use |
|---|---|---|
| Text and headings | ET Book | Body text, headings, questions, the scheme block. |
| Labels and metadata | IBM Plex Sans | Navigation, section labels, author lines, statuses, buttons. |
| Wordmark | STIX Two Math (∃) and EB Garamond (xProof AI) | The name only, through the `.brand` markup. |

Headings are plain and descriptive. Section labels are one or two words in small capitals. Italic marks emphasis, titles, terms being defined, and variables in running text.

## 3. Color

| Token | Value | Use |
|---|---|---|
| `--bg` | #050505 | Page background. |
| `--fg` | #f5f5f2 | Primary text. |
| `--fg-2` | #b8b8b3 | Secondary text, metadata, labels. |
| `--rule`, `--rule-strong` | #2c2c2a, #6c6c68 | `--rule` only inside tables and the citation box; `--rule-strong` (at half opacity) for the masthead line. Never used for text. |
| `--red`, `--red-bright` | #b0122b, #d11c3d | The ∃, link hover, the current page, status marks, large accent words. Never small body text, because its contrast on black is too low. |
| `--green` | #1fa463 | The found path in the background search only. |

## 4. The name

- Written ∃xProof AI, pronounced "ExProof AI". The monogram is ∃xP.
- In HTML, always set the name with the `.brand` markup so the ∃ is red and the typefaces match the header. In page titles and meta descriptions, where styling is impossible, use the plain characters "∃xProof AI".
- The ∃ is always red. On hover, the whole header wordmark turns red.

## 5. Writing

- State only what is true and confirmed. Mark anything unconfirmed with `data-verify="question"` and check it with `#review` before publishing.
- Plain, direct sentences. No em dashes. No clever turns or slogans.
- One term per concept, used consistently across pages.
- Link each person's name to their main personal website wherever it appears. Leave it unlinked if no URL is confirmed.
- Programs carry no status labels, no collaborator lists, and no "Led by" line. Each has a one- or two-sentence summary; longer text goes inside its "More" toggle.
- Publications lists books, papers, working papers, and reports. Talks and workshops go in their own sections below the list, not in it.

## 6. Layout check

`tools/check_layout.py` loads every page at 390, 768, 1024, 1280, and 1600 pixels wide and fails if:

1. any page scrolls sideways;
2. anything other than a margin note extends past the text column in a text section;
3. anything extends past its section in a wide section;
4. two margin notes overlap;
5. any text is clipped by its container.

Run it from the repository root:

```
python3 -m http.server 8765 &
python3 tools/check_layout.py
```

It needs Playwright (`pip install playwright`, then `python3 -m playwright install chromium`).
