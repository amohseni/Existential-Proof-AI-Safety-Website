// Review mode: add #review to the URL to highlight every claim marked data-verify.
(function () {
  var root = document.documentElement;
  function sync() {
    var on = location.hash === "#review";
    root.classList.toggle("review", on);
    var n = document.querySelectorAll("[data-verify]").length;
    var count = document.getElementById("review-count");
    if (count) count.textContent = n === 1 ? "1 claim to confirm" : n + " claims to confirm";
  }
  window.addEventListener("hashchange", sync);
  sync();

  // Show each claim's note on hover in review mode.
  document.querySelectorAll("[data-verify]").forEach(function (el) {
    var note = el.getAttribute("data-verify");
    if (note && !el.title) el.title = "To confirm: " + note;
  });

  // Filter the publications list by type.
  var filters = document.querySelectorAll(".filters button");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var type = btn.getAttribute("data-filter");
      filters.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      document.querySelectorAll(".works .work").forEach(function (li) {
        li.hidden = type !== "all" && li.getAttribute("data-type") !== type;
      });
    });
  });

  // Copy a citation.
  document.querySelectorAll(".copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var pre = btn.parentNode.querySelector("pre");
      var text = pre.textContent;
      function done(label) { btn.textContent = label; setTimeout(function () { btn.textContent = "Copy"; }, 1600); }
      function fallback() {
        var r = document.createRange(); r.selectNodeContents(pre);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        done("Selected");
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done("Copied"); }, fallback);
      } else { fallback(); }
    });
  });
})();
