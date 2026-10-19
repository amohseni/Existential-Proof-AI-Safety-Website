// Background: a search for a proof that a path to safe AI exists.
//
// Each cycle generates a hidden tree that grows from 5% to 95% of the viewport width.
// With probability exactly 1/3 the tree contains one planted witness path that reaches the
// terminal depth D; otherwise no branch reaches D. Non-witness branches die out by a
// depth-dependent extinction process, so dead ends are spread through the tree instead of
// piling up one step before D.
//
// A white light searches the tree by heuristic depth-first search. The heuristic sees only
// geometry; it never reads which branch is the witness. Edges appear only as the light
// traverses them and stay gray. Nodes are never drawn. If the light reaches depth D, the
// root-to-goal path sweeps green. If the search exhausts the tree, the light rests and the
// tree fades. The layout is a tidy tree, so no two edges cross.
(function () {
  var svg = document.getElementById("exproof-search-background");
  if (!svg || !svg.createSVGPoint) return;
  var NS = "http://www.w3.org/2000/svg";
  var reduceQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  var CFG = {
    pSolvable: 1 / 3,
    minDepth: 26, maxDepth: 34, maxNodes: 320,
    edgeColor: "#91918b", edgeWidth: 1.2, edgeOpacity: 0.44,
    green: "#1fa463", greenBright: "#4fdc95",
    scrimInside: 0.55,     // edge opacity multiplier under the text column
    pxPerMs: 0.95,         // forward travel speed through the middle of a run
    runBase: 150,          // fixed part of each run's duration (ms)
    backFactor: 0.6,      // backtracking takes this fraction of the forward time
    deadEndPause: 220, decisionPause: 40,
    success: { pause: 380, toGreen: 520, sweep: 1100, settle: 350, brighten: 650, hold: 1300 },
    failure: { rest: 650, subside: 1000, hold: 600 },
    dissolve: 1700, gap: 1000
  };

  var W, H, scrim = { x0: -1e4, x1: -1e4 }, tree, runs, state, raf, layers = {};

  function rand(a, b) { return a + Math.random() * (b - a); }
  function smootherstep(t) { t = Math.max(0, Math.min(1, t)); return t * t * t * (t * (t * 6 - 15) + 10); }
  function deadEndEase(t) { return smootherstep(1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 1.6)); }
  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function maskAt(x) {
    var ramp = 80, inside = CFG.scrimInside;
    if (x <= scrim.x0 - ramp || x >= scrim.x1 + ramp) return 1;
    if (x >= scrim.x0 && x <= scrim.x1) return inside;
    var d = x < scrim.x0 ? (scrim.x0 - x) / ramp : (x - scrim.x1) / ramp;
    return inside + (1 - inside) * d;
  }

  // ---------- Generation ----------
  function stopProbability(depth, D, pressure) {
    var u = depth / D;
    var p = 0.035 + 0.60 * Math.pow(u, 1.70);
    var budget = 0.35 * Math.pow(Math.max(0, (pressure - 0.72) / 0.28), 2);
    return Math.min(0.98, p + budget);
  }
  function twoChildProbability(depth, D, pressure) {
    var u = depth / D;
    return Math.max(0.10, 0.40 - 0.24 * u) * (1 - Math.pow(Math.min(1, pressure), 1.6));
  }
  function witnessSideBranchProbability(depth, D) {
    if (depth === 0) return 0.92;
    return 0.06 + 0.34 * (1 - depth / D);
  }

  function generate(D, solvable) {
    var nodes = [];
    function make(parent, depth, win) {
      var n = { depth: depth, parent: parent, children: [], win: win };
      nodes.push(n); return n;
    }
    var root = make(null, 0, solvable);
    var queue = [root];
    while (queue.length) {
      var n = queue.shift();
      var pressure = nodes.length / CFG.maxNodes;
      var kids = [];
      if (n.win) {
        if (n.depth < D) {
          kids.push({ win: true });
          if (Math.random() < witnessSideBranchProbability(n.depth, D) && n.depth + 1 < D) kids.push({ win: false });
        }
      } else {
        if (n.depth >= D - 1) { kids = []; }                                  // hard boundary only
        else if (n.depth >= 2 && Math.random() < stopProbability(n.depth, D, pressure)) { kids = []; }
        else {
          var count = (n.depth === 0 || Math.random() < twoChildProbability(n.depth, D, pressure)) ? 2 : 1;
          if (pressure >= 1) count = 0;
          for (var i = 0; i < count; i++) kids.push({ win: false });
        }
      }
      if (kids.length === 2 && Math.random() < 0.5) kids.reverse();
      kids.forEach(function (k) { var c = make(n, n.depth + 1, k.win); n.children.push(c); queue.push(c); });
    }
    return { nodes: nodes, root: root, D: D, solvable: solvable };
  }

  // Tidy layout with contour packing (Reingold–Tilford style). Children keep a fixed order;
  // each sibling subtree is shifted just far enough that, at every depth, it sits at least one
  // unit below the subtrees before it. Each parent sits at the average of its children.
  // Sibling subtrees therefore occupy disjoint vertical intervals at every depth, so no two
  // edges cross, and unbalanced subtrees pack tightly instead of leaving tall empty gaps.
  function layout(t) {
    (function place(n) {
      if (!n.children.length) { n.top = [0]; n.bot = [0]; return; }
      n.children.forEach(place);
      var offs = [], bot = [];
      n.children.forEach(function (c, i) {
        var off = 0;
        if (i > 0) {
          off = -Infinity;
          for (var k = 0; k < c.top.length && k < bot.length; k++) off = Math.max(off, bot[k] - c.top[k] + 1);
        }
        offs.push(off);
        for (var k2 = 0; k2 < c.bot.length; k2++) bot[k2] = Math.max(bot[k2] === undefined ? -Infinity : bot[k2], off + c.bot[k2]);
      });
      var mid = offs.reduce(function (a, b) { return a + b; }, 0) / offs.length;
      n.top = [0]; n.bot = [0];
      n.children.forEach(function (c, i) {
        c.rel = offs[i] - mid;
        for (var k = 0; k < c.top.length; k++) {
          var tk = c.rel + c.top[k], bk = c.rel + c.bot[k];
          n.top[k + 1] = n.top[k + 1] === undefined ? tk : Math.min(n.top[k + 1], tk);
          n.bot[k + 1] = n.bot[k + 1] === undefined ? bk : Math.max(n.bot[k + 1], bk);
        }
      });
    })(t.root);
    var lo = Math.min.apply(null, t.root.top), hi = Math.max.apply(null, t.root.bot);
    var unit = Math.min(H * 0.8 / Math.max(1, hi - lo), H * 0.045);
    var mid = H / 2 - unit * (lo + hi) / 2;
    var left = W * 0.05, dx = (W * 0.90) / t.D;
    (function assign(n, y) {
      n.x = left + n.depth * dx; n.y = mid + unit * y;
      n.children.forEach(function (c) { assign(c, y + c.rel); });
    })(t.root, 0);
    t.dx = dx;
  }

  function build() {
    var span = Math.max(0, Math.min(1, (W - 400) / 1200));
    var D = Math.round(CFG.minDepth + (CFG.maxDepth - CFG.minDepth) * span);
    var solvable = window.__exproofForce !== undefined ? window.__exproofForce : Math.random() < CFG.pSolvable;
    var t = generate(D, solvable);
    layout(t);
    return t;
  }

  // ---------- Search: heuristic depth-first search ----------
  // Prefers continuing the current vertical direction, mildly prefers the center,
  // tiny random tiebreak. Never reads the `win` flag.
  function score(n, c) {
    var incoming = n.parent ? Math.sign(n.y - n.parent.y) : 0;
    var out = Math.sign(c.y - n.y);
    var continuity = incoming !== 0 && out === incoming ? 1 : (out === 0 ? 0.6 : 0);
    var center = 1 - Math.abs(c.y - H / 2) / (H / 2);
    return 0.55 * continuity + 0.35 * center + 0.08 * Math.random();
  }
  function plan(t) {
    var moves = [], found = null;
    (function dfs(n) {
      if (n.depth === t.D) { found = n; return true; }
      var kids = n.children.slice().sort(function (a, b) { return score(n, b) - score(n, a); });
      for (var i = 0; i < kids.length; i++) {
        moves.push({ from: n, to: kids[i], fwd: true });
        if (dfs(kids[i])) return true;
        moves.push({ from: kids[i], to: n, fwd: false });
      }
      return false;
    })(t.root);
    // Group moves into runs between decision points, so motion accelerates and settles
    // once per decision rather than once per edge.
    var out = [], cur = null;
    moves.forEach(function (m) {
      var breakHere = !cur || cur.fwd !== m.fwd || (m.fwd && m.from.children.length > 1);
      if (breakHere) { cur = { fwd: m.fwd, moves: [] }; out.push(cur); }
      cur.moves.push(m);
    });
    out.forEach(function (r) {
      r.pts = [r.moves[0].from].concat(r.moves.map(function (m) { return m.to; }));
      r.cum = [0];
      for (var i = 1; i < r.pts.length; i++) r.cum.push(r.cum[i - 1] + Math.hypot(r.pts[i].x - r.pts[i - 1].x, r.pts[i].y - r.pts[i - 1].y));
      r.len = r.cum[r.cum.length - 1];
      var end = r.pts[r.pts.length - 1];
      r.deadEnd = r.fwd && !end.children.length && end.depth !== t.D;
      r.goal = r.fwd && end.depth === t.D;
      var base = CFG.runBase + r.len / CFG.pxPerMs;
      r.dur = (r.fwd ? base : base * CFG.backFactor) * rand(0.94, 1.06);
      r.after = r.deadEnd ? CFG.deadEndPause : (r.goal ? 0 : CFG.decisionPause);
    });
    return { runs: out, found: found };
  }

  // ---------- SVG scene ----------
  function setupScene() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("width", W); svg.setAttribute("height", H);
    var defs = el("defs", {}, svg);
    // The light: a faint pool, a soft glow, and a small core. Gradients fall off smoothly
    // (several stops) so the light reads as an area, not a disc with a rim.
    function radial(id, peak, falloff) {
      var g = el("radialGradient", { id: id }, defs), stops = [];
      [0, 0.25, 0.5, 0.75, 1].forEach(function (o) {
        var a = peak * Math.pow(1 - o, falloff);
        stops.push(el("stop", { offset: String(o), "stop-color": "#ffffff", "stop-opacity": a.toFixed(4) }, g));
      });
      return stops;
    }
    layers.stops = [].concat(radial("xp-pool", 0.075, 2.2), radial("xp-glow-grad", 0.34, 1.8), radial("xp-core-grad", 1, 0.9));
    // Mask for the illuminated copy of the explored edges: bright at the light, fading outward.
    var lf = el("radialGradient", { id: "xp-lightfall" }, defs);
    [[0, 255], [0.35, 150], [0.7, 40], [1, 0]].forEach(function (st) {
      el("stop", { offset: String(st[0]), "stop-color": "rgb(" + st[1] + "," + st[1] + "," + st[1] + ")" }, lf);
    });
    var lm = el("mask", { id: "xp-lightmask", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: W, height: H }, defs);
    layers.lightMask = el("circle", { cx: -999, cy: -999, r: 120, fill: "url(#xp-lightfall)" }, lm);
    // Mask that dims the proof path under the text column, matching the per-edge dimming.
    var lg = el("linearGradient", { id: "xp-scrim-grad", gradientUnits: "userSpaceOnUse", x1: 0, y1: 0, x2: W, y2: 0 }, defs);
    var ramp = 80, inside = CFG.scrimInside;
    var stops = scrim.x1 > 0 ? [[scrim.x0 - ramp, 1], [scrim.x0, inside], [scrim.x1, inside], [scrim.x1 + ramp, 1]] : [[0, 1], [W, 1]];
    stops.forEach(function (st) {
      var g = Math.round(255 * st[1]);
      el("stop", { offset: Math.max(0, Math.min(1, st[0] / W)).toFixed(4), "stop-color": "rgb(" + g + "," + g + "," + g + ")" }, lg);
    });
    var mk = el("mask", { id: "xp-scrim", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: W, height: H }, defs);
    el("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#xp-scrim-grad)" }, mk);
    layers.root = el("g", {}, svg);
    layers.edges = el("g", { fill: "none", stroke: CFG.edgeColor, "stroke-width": CFG.edgeWidth, "stroke-linecap": "round" }, layers.root);
    layers.lit = el("g", { fill: "none", stroke: "#f5f5f2", "stroke-width": CFG.edgeWidth, "stroke-linecap": "round", mask: "url(#xp-lightmask)" }, layers.root);
    var blur = el("filter", { id: "xp-glow", x: "-5%", y: "-50%", width: "110%", height: "200%" }, defs);
    el("feGaussianBlur", { stdDeviation: "3.2" }, blur);
    layers.proofGroup = el("g", { mask: "url(#xp-scrim)" }, null);
    layers.glow = el("polyline", { fill: "none", stroke: CFG.greenBright, "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round", filter: "url(#xp-glow)", opacity: 0 }, layers.proofGroup);
    layers.proof = el("polyline", { fill: "none", stroke: CFG.green, "stroke-width": 1.6, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, layers.proofGroup);
    layers.root.appendChild(layers.proofGroup);
    layers.light = el("g", { opacity: 0 }, layers.root);
    layers.pool = el("ellipse", { rx: 48, ry: 48, fill: "url(#xp-pool)" }, layers.light);
    layers.glowE = el("ellipse", { rx: 11, ry: 11, fill: "url(#xp-glow-grad)" }, layers.light);
    layers.core = el("ellipse", { rx: 2.6, ry: 2.6, fill: "url(#xp-core-grad)" }, layers.light);
    L.color = null;
  }

  function edgeEl(child) {
    if (child.edge) return child.edge;
    var p = child.parent;
    var len = Math.hypot(child.x - p.x, child.y - p.y);
    var e = el("line", {
      x1: p.x, y1: p.y, x2: child.x, y2: child.y,
      "stroke-dasharray": len + " " + (len + 1), "stroke-dashoffset": len,
      opacity: (CFG.edgeOpacity * maskAt((p.x + child.x) / 2)).toFixed(3)
    }, layers.edges);
    child.lit = el("line", {
      x1: p.x, y1: p.y, x2: child.x, y2: child.y,
      "stroke-dasharray": len + " " + (len + 1), "stroke-dashoffset": len,
      opacity: (0.75 * maskAt((p.x + child.x) / 2)).toFixed(3)
    }, layers.lit);
    child.edge = e; child.edgeLen = len; child.revealed = 0;
    return e;
  }
  function reveal(child, frac) {
    var e = edgeEl(child);
    if (frac <= child.revealed) return;
    child.revealed = frac;
    var off = (child.edgeLen * (1 - frac)).toFixed(2);
    e.setAttribute("stroke-dashoffset", off);
    child.lit.setAttribute("stroke-dashoffset", off);
  }
  // Light state. Position comes from the search; everything else is derived per frame:
  // velocity (smoothed), the direction of travel, how stretched the light is, its intensity
  // (eased toward a target set by what the search is doing), and its color.
  var L = { x: 0, y: 0, px: null, py: null, vx: 0, vy: 0, angle: 0, I: 0, target: 1, green: 0, bright: 0, last: 0, color: null };
  function placeLight(x, y) { L.x = x; L.y = y; }
  function renderLight(now) {
    var dt = L.last ? Math.min(64, now - L.last) : 16; L.last = now;
    if (L.px === null) { L.px = L.x; L.py = L.y; }
    var rvx = (L.x - L.px) / dt, rvy = (L.y - L.py) / dt;
    L.px = L.x; L.py = L.y;
    var a = 1 - Math.exp(-dt / 90);                       // velocity smoothing
    L.vx += (rvx - L.vx) * a; L.vy += (rvy - L.vy) * a;
    var speed = Math.hypot(L.vx, L.vy);
    if (speed > 0.02) {
      var target = Math.atan2(L.vy, L.vx), d = target - L.angle;
      d = Math.atan2(Math.sin(d), Math.cos(d));            // shortest turn
      L.angle += d * (1 - Math.exp(-dt / 70));
    }
    L.I += (L.target - L.I) * (1 - Math.exp(-dt / 220));   // intensity eases
    var s = Math.min(1, speed / 1.1);                      // 0 at rest, 1 at full travel speed
    var breathe = 1 + 0.05 * (1 - s) * Math.sin(now / 640);
    var I = Math.max(0, L.I), k = Math.max(0.7, maskAt(L.x));
    var deg = (L.angle * 180 / Math.PI).toFixed(2);
    layers.light.setAttribute("transform", "translate(" + L.x.toFixed(2) + "," + L.y.toFixed(2) + ") rotate(" + deg + ")");
    // Moving light stretches along its path and its glow trails slightly behind the core.
    layers.core.setAttribute("rx", (2.6 * (1 + 2.0 * s) * breathe).toFixed(2));
    layers.core.setAttribute("ry", (2.6 * (1 - 0.22 * s) * breathe).toFixed(2));
    layers.glowE.setAttribute("rx", (11 * (1 + 1.0 * s) * breathe).toFixed(2));
    layers.glowE.setAttribute("ry", (11 * (1 - 0.25 * s) * breathe).toFixed(2));
    layers.glowE.setAttribute("cx", (-7 * s).toFixed(2));
    layers.pool.setAttribute("rx", (48 * (1 + 0.35 * s) * (0.85 + 0.15 * I)).toFixed(2));
    layers.pool.setAttribute("ry", (48 * (0.85 + 0.15 * I)).toFixed(2));
    layers.pool.setAttribute("cx", (-12 * s).toFixed(2));
    layers.core.setAttribute("opacity", (Math.min(1, 0.35 + 0.65 * I)).toFixed(3));
    layers.glowE.setAttribute("opacity", (k * I).toFixed(3));
    layers.pool.setAttribute("opacity", (k * I).toFixed(3));
    // The light shows what has been explored near it.
    layers.lightMask.setAttribute("cx", L.x.toFixed(1));
    layers.lightMask.setAttribute("cy", L.y.toFixed(1));
    layers.lightMask.setAttribute("r", (70 + 70 * I).toFixed(1));
    layers.lit.setAttribute("opacity", Math.min(1, I).toFixed(3));
    // Color: white, then green on success, then brighter green.
    var c = L.bright > 0 ? mix(CFG.green, CFG.greenBright, L.bright) : (L.green > 0 ? mix("#ffffff", CFG.green, L.green) : "#ffffff");
    if (c !== L.color) {
      layers.stops.forEach(function (st) { st.setAttribute("stop-color", c); });
      layers.lit.setAttribute("stroke", L.green > 0 ? mix("#f5f5f2", CFG.green, L.green * 0.5) : "#f5f5f2");
      L.color = c;
    }
  }
  function mix(a, b, t) {
    var pa = [1, 3, 5].map(function (i) { return parseInt(a.substr(i, 2), 16); });
    var pb = [1, 3, 5].map(function (i) { return parseInt(b.substr(i, 2), 16); });
    return "rgb(" + pa.map(function (v, i) { return Math.round(v + (pb[i] - v) * t); }).join(",") + ")";
  }

  // ---------- Cycle ----------
  function newCycle(now) {
    tree = build();
    var p = plan(tree);
    runs = p.runs;
    setupScene();
    placeLight(tree.root.x, tree.root.y);
    L.px = null; L.vx = 0; L.vy = 0; L.I = 0.2; L.target = 1; L.green = 0; L.bright = 0; L.color = null;
    state = { phase: "appear", t0: now, run: 0, found: p.found };
  }

  function pointAt(r, s) {
    var i = 1;
    while (i < r.cum.length - 1 && r.cum[i] < s) i++;
    var a = r.pts[i - 1], b = r.pts[i], seg = r.cum[i] - r.cum[i - 1];
    var f = seg > 0 ? (s - r.cum[i - 1]) / seg : 1;
    if (r.fwd) {
      for (var j = 1; j < i; j++) reveal(r.moves[j - 1].to, 1);
      reveal(r.moves[i - 1].to, f);
    }
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }

  function step(now) {
    var dt = now - state.t0, S = state;
    switch (S.phase) {
      case "appear":
        layers.light.setAttribute("opacity", smootherstep(dt / 500).toFixed(3));
        if (dt >= 500) { S.phase = runs.length ? "run" : "exhausted"; S.t0 = now; }
        return;
      case "run": {
        var r = runs[S.run];
        var t = dt / r.dur;
        var e = r.deadEnd ? deadEndEase(t) : smootherstep(t);
        var p = pointAt(r, e * r.len);
        placeLight(p.x, p.y);
        L.target = r.fwd ? 1 : 0.72;                       // retreating light is dimmer
        if (t >= 1) { S.phase = "settle"; S.t0 = now; }
        return;
      }
      case "settle": {
        var rr = runs[S.run];
        L.target = rr.deadEnd ? 0.5 : 0.9;                 // a dead end dims the light briefly
        if (dt < rr.after) return;
        S.run++; S.t0 = now;
        if (rr.goal) S.phase = "found";
        else if (S.run >= runs.length) S.phase = "exhausted";
        else S.phase = "run";
        return;
      }
      case "found": {
        var c = CFG.success;
        if (dt > c.pause) {
          L.green = smootherstep((dt - c.pause) / c.toGreen);
          L.target = 1.05;
        }
        if (dt >= c.pause + c.toGreen * 0.6) {
          if (!S.path) {
            S.path = []; var n = S.found; while (n) { S.path.unshift(n); n = n.parent; }
            layers.proof.setAttribute("points", S.path.map(function (q) { return q.x.toFixed(1) + "," + q.y.toFixed(1); }).join(" "));
            var len = 0; for (var i = 1; i < S.path.length; i++) len += Math.hypot(S.path[i].x - S.path[i - 1].x, S.path[i].y - S.path[i - 1].y);
            S.pathLen = len;
            layers.proof.setAttribute("stroke-dasharray", len + " " + (len + 1));
            layers.proof.setAttribute("stroke-dashoffset", len);
            layers.proof.setAttribute("opacity", 0.9);
            S.sweep0 = now;
          }
          var since = now - S.sweep0;
          var q = smootherstep(since / c.sweep);
          layers.proof.setAttribute("stroke-dashoffset", (S.pathLen * (1 - q)).toFixed(2));
          // Once the proof path is complete, it brightens once: a brighter green, a slightly
          // heavier stroke, and a soft glow. It holds at that brightness, then dissolves.
          var b = smootherstep((since - c.sweep - c.settle) / c.brighten);
          if (b > 0) {
            if (!S.glowSet) { layers.glow.setAttribute("points", layers.proof.getAttribute("points")); S.glowSet = true; }
            layers.proof.setAttribute("stroke", mix(CFG.green, CFG.greenBright, b));
            layers.proof.setAttribute("stroke-width", (1.6 + 0.6 * b).toFixed(2));
            layers.proof.setAttribute("opacity", (0.9 + 0.1 * b).toFixed(3));
            layers.glow.setAttribute("opacity", (0.45 * b).toFixed(3));
            L.bright = b;
          }
          if (since >= c.sweep + c.settle + c.brighten + c.hold) { S.phase = "dissolve"; S.t0 = now; }
        }
        return;
      }
      case "exhausted": {
        var f = CFG.failure;
        if (dt > f.rest) {
          L.target = 0.12;                                 // the light subsides
        }
        if (dt >= f.rest + f.subside + f.hold) { S.phase = "dissolve"; S.t0 = now; }
        return;
      }
      case "dissolve":
        layers.root.setAttribute("opacity", (1 - smootherstep(dt / CFG.dissolve)).toFixed(3));
        if (dt >= CFG.dissolve) { S.phase = "gap"; S.t0 = now; S.gap = CFG.gap; }
        return;
      case "gap":
        if (dt >= S.gap) newCycle(now);
        return;
    }
  }

  function loop(now) { step(now); if (layers.light) renderLight(now); raf = requestAnimationFrame(loop); }

  function measure() {
    W = window.innerWidth; H = window.innerHeight;
    var col = document.querySelector("[data-scrim]");
    if (col) { var r = col.getBoundingClientRect(); scrim.x0 = r.left; scrim.x1 = r.right; }
  }

  // Reduced motion: one quiet, partly explored tree, no light.
  function still() {
    tree = build();
    var p = plan(tree);
    setupScene();
    var fwd = [];
    p.runs.forEach(function (r) { if (r.fwd) r.moves.forEach(function (m) { fwd.push(m.to); }); });
    fwd.slice(0, Math.ceil(fwd.length * 0.6)).forEach(function (n) { reveal(n, 1); });
    layers.root.setAttribute("opacity", 0.8);
  }

  function start() {
    cancelAnimationFrame(raf);
    measure();
    if (reduceQuery.matches) { still(); return; }
    newCycle(performance.now());
    raf = requestAnimationFrame(loop);
  }

  var resizeTimer, lastW = window.innerWidth;
  window.addEventListener("resize", function () {
    // Ignore height-only changes (mobile address bars) to avoid restarting while scrolling.
    if (Math.abs(window.innerWidth - lastW) < 2) { measure(); return; }
    lastW = window.innerWidth;
    clearTimeout(resizeTimer); resizeTimer = setTimeout(start, 250);
  });
  if (reduceQuery.addEventListener) reduceQuery.addEventListener("change", start);
  start();

  // Testing hook: window.__exproof.sample(n) checks the 1/3 rate and the tree invariants.
  window.__exproof = {
    phase: function () { return state && state.phase; },
    light: function () { return { x: L.x, y: L.y, I: L.I }; },
    glow: function () { return layers.glow && +layers.glow.getAttribute('opacity'); },
    sample: function (n) {
      var solv = 0, ok = true, ms = 0, nodes = 0, leafDepth = {}, leaves = 0, crossings = 0;
      for (var i = 0; i < n; i++) {
        var t = build(), p = plan(t);
        if (t.solvable) solv++;
        var deep = t.nodes.filter(function (x) { return x.depth === t.D; });
        if (t.solvable ? (deep.length !== 1 || !deep[0].win) : deep.length !== 0) ok = false;
        if (!!p.found !== t.solvable) ok = false;
        nodes += t.nodes.length;
        p.runs.forEach(function (r) { ms += r.dur + r.after; });
        t.nodes.forEach(function (x) {
          if (!x.children.length && !x.win) { leaves++; leafDepth[x.depth] = (leafDepth[x.depth] || 0) + 1; }
          if (x.children.length === 2 && x.children[0].y > x.children[1].y) crossings++;
        });
        if (i < 150) {
          // Exact check: no two edges that do not share an endpoint may intersect.
          var E = t.nodes.filter(function (x) { return x.parent; });
          for (var a = 0; a < E.length; a++) for (var b = a + 1; b < E.length; b++) {
            var e1 = E[a], e2 = E[b];
            if (e1.depth !== e2.depth) continue;              // edges only overlap in x within one layer
            if (e1.parent === e2.parent) continue;            // shared endpoint
            var dA = (e1.parent.y - e2.parent.y), dB = (e1.y - e2.y);
            if (dA * dB < 0 || dA === 0 || dB === 0) crossings++;
          }
        }
      }
      var hist = {};
      Object.keys(leafDepth).forEach(function (d) { hist[d] = +(leafDepth[d] / leaves).toFixed(3); });
      return { solvableShare: solv / n, invariantsHold: ok, crossings: crossings,
               meanNodes: nodes / n, meanSearchSeconds: ms / n / 1000, deadEndDepthShare: hist };
    }
  };
})();
