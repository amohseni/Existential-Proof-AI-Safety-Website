// Background: a search for a path to safe AI.
//
// Each cycle generates a hidden binary tree that grows from the left edge toward the right.
// With probability exactly 1/3 the tree contains one path that reaches the right edge
// (depth D); otherwise every branch ends before depth D, so no path exists.
// A white light searches the tree by depth-first search with a heuristic child order.
// The heuristic sees only geometry, never which branch is the solution.
// Explored edges stay visible in gray. If the light reaches depth D, the path from the root
// turns green. If the search exhausts the tree, it stops. Either way the tree fades and a
// new one is generated.
(function () {
  var canvas = document.getElementById("search-field");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var reduceQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  var P_SOLVABLE = 1 / 3;
  var COLOR = { explored: "122,122,118", node: "150,150,146", light: "255,255,255", success: "31,164,99" };
  var T = { pause: 150, successSweep: 520, successHold: 1300, failHold: 850, fade: 1200, gap: 700 };

  var W, H, dpr, scrim = { x0: 0, x1: 0 }, tree, plan, state, raf;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function ease(t) { return 0.5 - 0.5 * Math.cos(Math.PI * t); }

  // Lower opacity under the text column, full opacity in the empty margins.
  function maskAt(x) {
    var ramp = 70, inside = 0.32;
    if (x <= scrim.x0 - ramp || x >= scrim.x1 + ramp) return 1;
    if (x >= scrim.x0 && x <= scrim.x1) return inside;
    var d = x < scrim.x0 ? (scrim.x0 - x) / ramp : (x - scrim.x1) / ramp;
    return inside + (1 - inside) * d;
  }

  function measure() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var col = document.querySelector("[data-scrim]");
    if (col) { var r = col.getBoundingClientRect(); scrim.x0 = r.left; scrim.x1 = r.right; }
    else { scrim.x0 = scrim.x1 = -1e4; }
  }

  // ---------- Tree generation ----------
  function build() {
    var D = Math.max(7, Math.min(11, Math.round(W / 125)));
    var m = Math.max(20, W * 0.035);
    var dx = (W - 2 * m) / D;
    var solvable = Math.random() < P_SOLVABLE;
    var nodes = [];
    var root = { d: 0, x: m, y: H * rand(0.4, 0.6), kids: [], parent: null, dir: 0 };
    nodes.push(root);

    function dyAt(k) { return H * 0.17 * Math.pow(0.82, k) * rand(0.85, 1.15); }
    function add(p, dir) {
      var y = p.y + dir * dyAt(p.d);
      y = Math.max(H * 0.06, Math.min(H * 0.94, y));
      var n = { d: p.d + 1, x: m + (p.d + 1) * dx + rand(-0.04, 0.04) * dx, y: y, kids: [], parent: p, dir: dir };
      p.kids.push(n); nodes.push(n); return n;
    }
    // Off-spine growth never goes deeper than `limit` (always below D).
    function grow(p, limit, pBranch) {
      if (p.d >= limit) return;
      [-1, 1].forEach(function (dir) {
        if (Math.random() < pBranch) grow(add(p, dir), limit, pBranch * 0.72);
      });
    }

    // The spine is the one candidate route. It reaches depth D only when solvable.
    var spineLen = solvable ? D : D - 1 - (Math.random() < 0.5 ? 1 : 0);
    var cur = root;
    for (var k = 0; k < spineLen; k++) {
      var dir = Math.random() < 0.5 ? -1 : 1;
      var on = add(cur, dir);
      if (cur.d + 1 < D && Math.random() < 0.72) {
        var s = add(cur, -dir);
        grow(s, Math.min(D - 1, s.d + Math.floor(rand(0, 3.2))), 0.62);
      }
      cur = on;
    }
    if (!solvable) grow(cur, D - 1, 0.75);
    // Shuffle child order so the spine is not always the first child.
    nodes.forEach(function (n) { if (n.kids.length === 2 && Math.random() < 0.5) n.kids.reverse(); });
    return { nodes: nodes, root: root, D: D, dx: dx, solvable: solvable };
  }

  // ---------- Search plan: heuristic depth-first search ----------
  // Prefer the child that continues the current direction and stays near the vertical
  // center (more room to grow). Small random tiebreak. No knowledge of the solution.
  function score(parent, c) {
    var smooth = parent.dir === 0 ? 0 : (c.dir === parent.dir ? 1 : 0);
    var center = 1 - Math.abs(c.y - H / 2) / (H / 2);
    return 0.6 * smooth + 0.8 * center + Math.random() * 0.5;
  }
  function makePlan(t) {
    var moves = [], found = null;
    function dfs(n) {
      if (n.d === t.D) { found = n; return true; }
      if (!n.kids.length) { moves.push({ pause: true }); return false; }
      var kids = n.kids.slice().sort(function (a, b) { return score(n, b) - score(n, a); });
      for (var i = 0; i < kids.length; i++) {
        moves.push({ from: n, to: kids[i], fwd: true });
        if (dfs(kids[i])) return true;
        moves.push({ from: kids[i], to: n, fwd: false });
      }
      return false;
    }
    dfs(t.root);
    moves.forEach(function (mv) {
      if (mv.pause) { mv.dur = T.pause; return; }
      var len = Math.hypot(mv.to.x - mv.from.x, mv.to.y - mv.from.y);
      var base = Math.max(240, Math.min(520, 330 * len / t.dx)) * rand(0.92, 1.08);
      mv.dur = mv.fwd ? base : base * 0.62;
    });
    return { moves: moves, found: found };
  }

  // ---------- Drawing ----------
  function line(a, b, rgb, alpha, width) {
    var mx = (a.x + b.x) / 2;
    ctx.strokeStyle = "rgba(" + rgb + "," + (alpha * maskAt(mx)).toFixed(3) + ")";
    ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  function dot(p, rgb, alpha, r) {
    ctx.fillStyle = "rgba(" + rgb + "," + (alpha * maskAt(p.x)).toFixed(3) + ")";
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
  }
  function light(p, alpha) {
    var k = maskAt(p.x) * alpha;
    var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 16);
    g.addColorStop(0, "rgba(255,255,255," + (0.32 * k).toFixed(3) + ")");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(" + COLOR.light + "," + (0.95 * Math.max(k, 0.5 * alpha)).toFixed(3) + ")";
    ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill();
  }

  function draw(fadeK) {
    ctx.clearRect(0, 0, W, H);
    var a = 0.55 * fadeK;
    state.revealed.forEach(function (n) { line(n.parent, n, COLOR.explored, a, 1); });
    state.revealed.forEach(function (n) { if (!n.kids.length || n.d === tree.D) dot(n, COLOR.node, a, 1.4); });
    dot(tree.root, COLOR.node, a, 1.6);
    if (state.partial) {
      var mv = state.partial.mv, q = state.partial.q;
      var p = { x: mv.from.x + (mv.to.x - mv.from.x) * q, y: mv.from.y + (mv.to.y - mv.from.y) * q };
      if (mv.fwd) line(mv.from, p, COLOR.explored, a, 1);
    }
    if (state.success) {
      var path = state.success.path, q2 = state.success.q, nSeg = path.length - 1;
      var upto = q2 * nSeg;
      for (var i = 0; i < nSeg; i++) {
        if (i >= upto) break;
        var f = Math.min(1, upto - i);
        var b = { x: path[i].x + (path[i + 1].x - path[i].x) * f, y: path[i].y + (path[i + 1].y - path[i].y) * f };
        line(path[i], b, COLOR.success, 0.9 * fadeK, 1.6);
      }
    }
    if (state.lightAt) light(state.lightAt, fadeK);
  }

  // ---------- Cycle ----------
  function newCycle() {
    tree = build(); plan = makePlan(tree);
    state = { phase: "search", i: 0, t0: performance.now(), revealed: [], partial: null, lightAt: tree.root, success: null };
  }

  function step(now) {
    var dt = now - state.t0;
    if (state.phase === "search") {
      var mv = plan.moves[state.i];
      if (!mv) {
        state.partial = null;
        if (plan.found) {
          var path = [], n = plan.found; while (n) { path.unshift(n); n = n.parent; }
          state.success = { path: path, q: 0 };
          state.phase = "sweep";
        } else { state.phase = "hold"; state.hold = T.failHold; }
        state.t0 = now; draw(1); return;
      }
      if (mv.pause) {
        if (dt >= mv.dur) { state.i++; state.t0 = now; }
        draw(1); return;
      }
      var q = Math.min(1, dt / mv.dur), e = ease(q);
      state.partial = { mv: mv, q: e };
      state.lightAt = { x: mv.from.x + (mv.to.x - mv.from.x) * e, y: mv.from.y + (mv.to.y - mv.from.y) * e };
      if (q >= 1) {
        if (mv.fwd && state.revealed.indexOf(mv.to) < 0) state.revealed.push(mv.to);
        state.partial = null; state.lightAt = mv.to; state.i++; state.t0 = now;
      }
      draw(1); return;
    }
    if (state.phase === "sweep") {
      state.success.q = ease(Math.min(1, dt / T.successSweep));
      if (dt >= T.successSweep) { state.phase = "hold"; state.hold = T.successHold; state.t0 = now; }
      draw(1); return;
    }
    if (state.phase === "hold") {
      if (dt >= state.hold) { state.phase = "fade"; state.t0 = now; }
      draw(1); return;
    }
    if (state.phase === "fade") {
      var k = 1 - ease(Math.min(1, dt / T.fade));
      draw(k);
      if (dt >= T.fade) { state.phase = "gap"; state.t0 = now; ctx.clearRect(0, 0, W, H); }
      return;
    }
    if (state.phase === "gap" && dt >= T.gap * rand(0.8, 1.2)) newCycle();
  }

  function loop(now) { step(now); raf = requestAnimationFrame(loop); }

  // Reduced motion: one still tree, fully revealed in gray, no light.
  function still() {
    tree = build();
    state = { revealed: tree.nodes.filter(function (n) { return n.parent; }), partial: null, lightAt: null, success: null };
    draw(0.7);
  }

  function start() {
    cancelAnimationFrame(raf);
    measure();
    if (reduceQuery.matches) { still(); return; }
    newCycle(); raf = requestAnimationFrame(loop);
  }

  var resizeTimer;
  window.addEventListener("resize", function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(start, 250); });
  if (reduceQuery.addEventListener) reduceQuery.addEventListener("change", start);
  start();

  // Exposed for testing: window.__searchField.sample(n) returns the share of solvable trees.
  window.__searchField = {
    sample: function (n) {
      var s = 0, ok = true, ms = 0, nodes = 0;
      for (var i = 0; i < n; i++) {
        var t = build(), deep = t.nodes.filter(function (x) { return x.d === t.D; }).length;
        if (t.solvable) s++;
        if ((t.solvable && deep !== 1) || (!t.solvable && deep !== 0)) ok = false;
        var p = makePlan(t);
        if (!!p.found !== t.solvable) ok = false;
        nodes += t.nodes.length;
        p.moves.forEach(function (mv) { ms += mv.dur; });
      }
      return { solvableShare: s / n, invariantsHold: ok, meanSearchSeconds: ms / n / 1000, meanNodes: nodes / n };
    }
  };
})();
