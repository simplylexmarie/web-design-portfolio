/* Homepage hero: a cursor drags each word tile into place to build
   "Let's build your site." Plus scroll reveals + footer year.
   Progressive enhancement: without JS/GSAP the words simply read in order. */
(function () {
  "use strict";
  var G = window.gsap;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function reveal() { document.documentElement.classList.remove("pre"); }

  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  var canvas = document.querySelector(".screen__canvas");
  var words = [].slice.call(document.querySelectorAll(".headline .w"));
  var cursor = document.querySelector(".hero__cursor");

  function fadeStickers(tl) {
    tl.to(".sticker", { opacity: 1, duration: 0.4, stagger: 0.06 }, "-=0.2");
  }

  function heroIntro() {
    reveal();
    if (reduce || !G || !words.length || !canvas) {
      if (G) G.set(".sticker", { opacity: 1 });
      return;
    }

    var cr = canvas.getBoundingClientRect();
    var nat = words.map(function (w) {
      var r = w.getBoundingClientRect();
      return { x: r.left + r.width / 2 - cr.left, y: r.top + r.height / 2 - cr.top };
    });
    var cw = cr.width, ch = cr.height;
    var off = [
      { x: -cw * 0.34, y: -ch * 0.30, r: -10 },
      { x:  cw * 0.33, y: -ch * 0.26, r:  9 },
      { x: -cw * 0.28, y:  ch * 0.30, r:  7 },
      { x:  cw * 0.31, y:  ch * 0.33, r: -8 }
    ];

    G.set(".screen", { opacity: 0, y: 20 });
    G.set(".sticker", { opacity: 0 });
    G.set([".screen__sub", ".hero__cta", ".hero__trust"], { opacity: 0, y: 16 });
    G.set(cursor, { opacity: 0 });
    words.forEach(function (w, i) {
      var o = off[i] || { x: 0, y: 0, r: 0 };
      G.set(w, { x: o.x, y: o.y, rotation: o.r, opacity: 1 });
    });

    var done = false;
    var tl = G.timeline({ delay: 0.2, onComplete: function () { done = true; } });
    tl.to(".screen", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });

    words.forEach(function (w, i) {
      var o = off[i] || { x: 0, y: 0, r: 0 };
      var sx = nat[i].x + o.x, sy = nat[i].y + o.y;
      if (i === 0) { tl.set(cursor, { left: sx, top: sy }); tl.to(cursor, { opacity: 1, duration: 0.18 }); }
      else { tl.to(cursor, { left: sx, top: sy, duration: 0.34, ease: "power2.inOut" }); }
      tl.add(function () { w.classList.add("grab"); if (cursor) cursor.classList.add("grab"); });
      tl.to(w, { x: 0, y: 0, rotation: 0, duration: 0.46, ease: "power2.inOut" }, "<0.02");
      tl.to(cursor, { left: nat[i].x, top: nat[i].y, duration: 0.46, ease: "power2.inOut" }, "<");
      tl.add(function () { w.classList.remove("grab"); if (cursor) cursor.classList.remove("grab"); });
    });

    tl.to(cursor, { opacity: 0, duration: 0.25 });
    fadeStickers(tl);
    tl.to([".screen__sub", ".hero__cta", ".hero__trust"], { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, "-=0.3");

    // Failsafe: if the tab loaded in the background, rAF is paused and the
    // timeline never advances. Snap to the final state so content always shows.
    setTimeout(function () { if (!done) tl.progress(1); }, 4200);
  }

  if (document.readyState !== "loading") heroIntro();
  else document.addEventListener("DOMContentLoaded", heroIntro);
  setTimeout(reveal, 2800);

  // ---------- scroll reveals ----------
  var items = [].slice.call(document.querySelectorAll(".reveal"));
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var el = e.target, d = el.getAttribute("data-delay");
          if (d) el.style.transitionDelay = d;
          el.classList.add("in"); io.unobserve(el);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }
})();
