"""Layout check for the ∃xProof AI site.

Loads every page at five viewport widths and fails if any of the style guide's layout rules
is broken (see STYLE.md, "Layout rules"):

  1. The page never scrolls sideways.
  2. In a text section, nothing except a margin note extends past the right edge of the text column.
  3. In a wide section, nothing extends past the right edge of the section.
  4. No margin note overlaps another margin note.
  5. No text is clipped: no element's content is wider than its box unless the element is a
     deliberate scroll container (overflow-x: auto).

Usage (from the repository root):
    python3 -m http.server 8765 &
    python3 tools/check_layout.py            # uses http://127.0.0.1:8765
Requires: pip install playwright && python3 -m playwright install chromium
"""
import sys
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8765"
PAGES = ["index", "research", "adaptations", "naturalizing-agency", "measuring-attitudes", "value-uncertainty", "delegation", "publications", "people", "about", "join", "404"]
WIDTHS = [390, 768, 1024, 1280, 1600]

CHECK = r"""
() => {
  const problems = [];
  // Open every collapsible block so its content is checked as a reader would see it.
  document.querySelectorAll('details').forEach(d => d.open = true);
  const tol = 1;
  const vw = document.documentElement.clientWidth;
  if (document.documentElement.scrollWidth > vw + tol)
    problems.push(`page scrolls sideways (${document.documentElement.scrollWidth} > ${vw})`);
  const isNote = el => el.closest('.sidenote, .marginnote');
  const name = el => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '');
  const visible = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };

  document.querySelectorAll('.section').forEach(sec => {
    const body = sec.querySelector(':scope > .body');
    if (!body) return;
    const wide = sec.classList.contains('section--wide');
    const br = body.getBoundingClientRect();
    const pr = parseFloat(getComputedStyle(body).paddingRight) || 0;
    const limit = wide ? br.right : br.right - pr;
    body.querySelectorAll('*').forEach(el => {
      if (isNote(el) || !visible(el) || el.matches('input, label.margin-toggle')) return;
      const r = el.getBoundingClientRect();
      if (r.right > limit + tol)
        problems.push(`${wide ? 'wide' : 'text'} section: ${name(el)} ends at ${Math.round(r.right)}, past ${Math.round(limit)}`);
    });
    const notes = [...body.querySelectorAll('.sidenote, .marginnote')].filter(visible).map(n => n.getBoundingClientRect());
    for (let i = 0; i < notes.length; i++) for (let j = i + 1; j < notes.length; j++) {
      const a = notes[i], b = notes[j];
      if (a.left < b.right && b.left < a.right && a.top < b.bottom - tol && b.top < a.bottom - tol)
        problems.push('two margin notes overlap');
    }
  });

  document.querySelectorAll('main *').forEach(el => {
    if (!visible(el)) return;
    const cs = getComputedStyle(el);
    if (cs.overflowX === 'auto' || cs.overflowX === 'scroll' || cs.display === 'inline') return;
    if (isNote(el) || el.querySelector('.sidenote, .marginnote')) return;   // notes hang into the margin by design
    if (el.scrollWidth > el.clientWidth + tol && el.clientWidth > 0)
      problems.push(`clipped content in ${name(el)} (${el.scrollWidth} > ${el.clientWidth})`);
  });
  return [...new Set(problems)];
}
"""

def main():
    failures = 0
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for w in WIDTHS:
            page = browser.new_page(viewport={"width": w, "height": 900})
            for name in PAGES:
                page.goto(f"{BASE}/{name}.html")
                page.wait_for_timeout(250)
                for problem in page.evaluate(CHECK):
                    failures += 1
                    print(f"[{w:>4}px] {name}.html: {problem}")
            page.close()
        browser.close()
    print("Layout check passed." if failures == 0 else f"{failures} problem(s) found.")
    sys.exit(1 if failures else 0)

if __name__ == "__main__":
    main()
