/* Case-study page polish: hand-drawn hero underline (rough.js) + GSAP reveals.
   The interactive gallery itself is driven by gallery.js. Progressive: without
   these libraries the page is fully readable and functional. */
(function () {
  "use strict";
  function drawUnderline() {
    if (!window.rough) return;
    var svg = document.querySelector(".cs-title .u .ov");
    if (!svg) return;
    var b = svg.getBoundingClientRect();
    var w = Math.max(1, Math.round(b.width)), h = Math.max(1, Math.round(b.height));
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("width", w); svg.setAttribute("height", h);
    svg.setAttribute("preserveAspectRatio", "none");
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var stroke = getComputedStyle(svg).color || "#e2622e";
    try {
      var rc = rough.svg(svg);
      svg.appendChild(rc.line(2, h - 5, w - 2, h - 7, { roughness: 1.9, stroke: stroke, strokeWidth: 5, bowing: 3 }));
    } catch (e) {}
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawUnderline);
  window.addEventListener("load", drawUnderline);
  var t; window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(drawUnderline, 150); });

  var G = window.gsap;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (G && !reduce) {
    G.from(".cs-hero [data-cs]", { opacity: 0, y: 22, duration: .7, stagger: .1, ease: "power3.out", delay: .1 });
    G.from(".cs .g-stage-wrap", { opacity: 0, y: 26, duration: .8, ease: "power3.out", delay: .35 });
    G.from(".cs .g-thumb", { opacity: 0, y: 20, duration: .6, stagger: .07, ease: "power3.out", delay: .55 });
  }
})();
