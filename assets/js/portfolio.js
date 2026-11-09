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

/* Back-nav memory: remember homepage scroll when opening a project, and
   restore it (landing back in the Work section) when returning. */
(function () {
  "use strict";
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  // save position when heading into a project
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="projects/"]');
    if (!a) return;
    try { sessionStorage.setItem("homeScroll", String(window.scrollY)); } catch (err) {}
  });
  // restore on return from a project page
  window.addEventListener("load", function () {
    var fromProject = (document.referrer || "").indexOf("/projects/") > -1;
    var saved = null;
    try { saved = sessionStorage.getItem("homeScroll"); } catch (e) {}
    if (fromProject && saved !== null) {
      var y = parseInt(saved, 10);
      // override the #work anchor jump with the exact remembered position
      requestAnimationFrame(function () { window.scrollTo(0, y); setTimeout(function () { window.scrollTo(0, y); }, 60); });
    }
  });
})();
