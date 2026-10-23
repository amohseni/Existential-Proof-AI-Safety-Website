"""Render assets/og-card.png, the 1200 x 630 link-preview image.

Run from the repository root, with a local server running there:
    python3 -m http.server 8000
    python3 tools/og-card/render.py

The tree uses the generator and tidy layout from assets/search.js, at depth 14, with a
fixed seed. Change SEED for a different tree; the other parameters set the layout.
The cut parameter trims the dead branches so they stop that many levels before the end, leaving the
green witness path to cross the last stretch alone. rag (a seed), ragp and ragk clip
the tips of some dead branches after layout, so the branches end at different depths.
"""
from playwright.sync_api import sync_playwright

SEED = 208
PARAMS = ("v=x&D=14&N=150&br=1.6&st=0.7&side=1.5&ms=290&umax=40&ls=34"
          "&my=-62&ml=84&tx0=600&tx1=1240&gy=315&b0=40&b1=590"
          "&cut=4&rag=2&ragp=0.5&ragk=3")
URL = f"http://localhost:8000/tools/og-card/card.html?seed={SEED}&{PARAMS}"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 630})
    page.goto(URL)
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(400)
    page.screenshot(path="assets/og-card.png")
    browser.close()
print("wrote assets/og-card.png")
