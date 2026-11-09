/* Hand-drawn button outlines (rough.js). Progressive enhancement: if rough.js
   is unavailable the buttons still read as clean outlined/solid controls. */
(function () {
  "use strict";
  function fit(svg) {
    var b = svg.getBoundingClientRect();
    var w = Math.max(1, Math.round(b.width)), h = Math.max(1, Math.round(b.height));
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("width", w); svg.setAttribute("height", h);
    svg.setAttribute("preserveAspectRatio", "none");
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    return { w: w, h: h, rc: window.rough.svg(svg) };
  }
  function drawBtn(el) {
    var svg = el.querySelector(".ov");
    if (!svg || !window.rough) return;
    var type = el.getAttribute("data-sketch");
    try {
      var f = fit(svg), w = f.w, h = f.h, rc = f.rc;
      if (type === "double") {
        svg.appendChild(rc.rectangle(5, 5, w - 9, h - 9, { roughness: 1.4, stroke: "#6f1d35", strokeWidth: 2.2 }));
        svg.appendChild(rc.rectangle(2, 8, w - 9, h - 9, { roughness: 1.6, stroke: "#e2622e", strokeWidth: 1.8 }));
      } else {
        svg.appendChild(rc.rectangle(3, 3, w - 6, h - 6, { roughness: 1.5, stroke: "#6f1d35", strokeWidth: 2.4, bowing: 1.2 }));
      }
    } catch (e) {}
  }
  function run() {
    var els = document.querySelectorAll(".sk[data-sketch]");
    for (var i = 0; i < els.length; i++) drawBtn(els[i]);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
  window.addEventListener("load", run);
  var t;
  window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(run, 160); });
  run();
})();
