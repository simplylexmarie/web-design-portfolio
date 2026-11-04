/* Homepage behaviour: reveal-on-scroll + footer year. Progressive enhancement. */
(function () {
  "use strict";

  // current year
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  // reveal on scroll (respects reduced motion via CSS fallback)
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if (!items.length) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var el = e.target;
        var d = el.style.getPropertyValue("--reveal-delay");
        if (d) el.style.transitionDelay = d;
        el.classList.add("in");
        io.unobserve(el);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

  items.forEach(function (el) { io.observe(el); });
})();
