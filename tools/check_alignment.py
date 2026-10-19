"""Check cap-line alignment on every page.

For each section (and each page header), the tops of the capitals in the rail label must line up
with the tops of the capitals in the first line beside it (or the top of a photo). On the
Publications page, the year (or kind) in each entry's left column must line up with the title.
Measured in Chromium at three widths with the site's own fonts. Reports anything off by more
than 1.25px, which is the limit of pixel rounding.

Usage: python3 -m http.server 8765 (from the repo root), then python3 tools/check_alignment.py
"""
import asyncio, sys
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8765"
PAGES = ["index", "research", "adaptations", "naturalizing-agency", "measuring-attitudes",
         "value-uncertainty", "delegation", "publications", "people", "about", "work-with-us", "404"]
WIDTHS = [1024, 1280, 1600]   # below 860px the label sits above its section, so there is nothing to align
TOL = 1.25
JS = r"""() => {
  const cv = document.createElement('canvas').getContext('2d');
  function capTopOfText(node) {
    const t = node.textContent; const i = t.search(/\S/); if (i < 0) return null;
    const r = document.createRange(); r.setStart(node, i); r.setEnd(node, i + 1);
    const rect = r.getBoundingClientRect(); if (!rect.height) return null;
    const cs = getComputedStyle(node.parentElement);
    cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const m = cv.measureText('H');
    return rect.top + m.fontBoundingBoxAscent - m.actualBoundingBoxAscent;
  }
  function firstTop(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const el = n.nodeType === 1 ? n : n.parentElement;
        if (!el.checkVisibility({ visibilityProperty: true })) return n.nodeType === 1 ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP;
        if (el.closest('.sidenote,.marginnote,.margin-toggle,.brand .exists,.brand .x')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }});
    let n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 1 && n.tagName === 'IMG') return { top: n.getBoundingClientRect().top, what: 'img' };
      if (n.nodeType === 3) { const c = capTopOfText(n); if (c !== null) return { top: c, what: n.parentElement.tagName.toLowerCase() + '.' + (n.parentElement.className || '') + ' "' + n.textContent.trim().slice(0, 18) + '"' }; }
    }
    return null;
  }
  const out = [];
  document.querySelectorAll('main > .section, main > .hero').forEach(sec => {
    const lab = sec.querySelector(':scope > .label, :scope > .eyebrow'); if (!lab) return;
    const body = sec.classList.contains('hero') ? sec.querySelector('h1') : sec.querySelector(':scope > .body');
    const a = firstTop(lab), b = firstTop(body);
    if (a && b) out.push({ sec: (sec.id || sec.className).slice(0, 20), label: lab.textContent.trim().slice(0, 16), d: +(b.top - a.top).toFixed(1), first: b.what });
  });
  const rows = [];
  document.querySelectorAll('.work').forEach(w => {
    const a = firstTop(w.querySelector('.work-meta')), b = firstTop(w.querySelector('.work-title'));
    if (a && b) rows.push(+(b.top - a.top).toFixed(1));
  });
  return { sections: out, workRows: rows.length ? [Math.min(...rows), Math.max(...rows)] : null };
}
"""

async def main():
    bad = 0
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w in WIDTHS:
            pg = await b.new_page(viewport={"width": w, "height": 900})
            for name in PAGES:
                await pg.goto(f"{BASE}/{name}.html")
                await pg.evaluate("document.fonts.ready")
                r = await pg.evaluate(JS)
                for s in r["sections"]:
                    if abs(s["d"]) > TOL:
                        bad += 1; print(f"{w}px {name}: label '{s['label']}' is {s['d']}px off from {s['first']}")
                if r["workRows"] and max(abs(x) for x in r["workRows"]) > TOL:
                    bad += 1; print(f"{w}px {name}: entry rows off by up to {r['workRows']}px")
        await b.close()
    print("Alignment check passed." if not bad else f"{bad} alignment problem(s).")
    sys.exit(1 if bad else 0)

asyncio.run(main())
