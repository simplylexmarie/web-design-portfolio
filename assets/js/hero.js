/* Interactive laptop hero: composites the "about me" screen onto the laptop
   image (CSS matrix3d homography), GSAP zoom-out intro, subtle mouse parallax.
   Button sketch outlines are handled by sketch.js. Progressive enhancement:
   without GSAP the hero shows instantly; without JS the markup still reads. */
(function () {
  "use strict";
  var device = document.getElementById("device");
  if (!device) return;

  var SCREEN_Q = [[0.1488, 0.1239], [0.848, 0.1229], [0.848, 0.7423], [0.1488, 0.7423]];
  function solve(A, b) {
    var n = b.length;
    for (var i = 0; i < n; i++) {
      var mx = i;
      for (var r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[mx][i])) mx = r;
      var tA = A[i]; A[i] = A[mx]; A[mx] = tA; var tb = b[i]; b[i] = b[mx]; b[mx] = tb;
      for (var r2 = i + 1; r2 < n; r2++) { var f = A[r2][i] / A[i][i]; for (var c = i; c < n; c++) A[r2][c] -= f * A[i][c]; b[r2] -= f * b[i]; }
    }
    var x = new Array(n).fill(0);
    for (var i2 = n - 1; i2 >= 0; i2--) { var s = b[i2]; for (var c2 = i2 + 1; c2 < n; c2++) s -= A[i2][c2] * x[c2]; x[i2] = s / A[i2][i2]; }
    return x;
  }
  function matrixFor(w, h, dst) {
    var src = [[0, 0], [w, 0], [w, h], [0, h]], A = [], b = [];
    for (var i = 0; i < 4; i++) { var sx = src[i][0], sy = src[i][1], dx = dst[i][0], dy = dst[i][1];
      A.push([sx, sy, 1, 0, 0, 0, -sx * dx, -sy * dx]); b.push(dx);
      A.push([0, 0, 0, sx, sy, 1, -sx * dy, -sy * dy]); b.push(dy); }
    var hh = solve(A, b);
    return [hh[0], hh[3], 0, hh[6], hh[1], hh[4], 0, hh[7], 0, 0, 1, 0, hh[2], hh[5], 0, 1];
  }

  var lap = document.getElementById("lap"), screen = document.getElementById("screen"), scrclick = document.getElementById("scrclick");
  function placeScreen() {
    var w = device.clientWidth, h = lap.clientHeight || device.clientHeight; if (!w || !h) return;
    var dst = SCREEN_Q.map(function (p) { return [p[0] * w, p[1] * h]; });
    var m = matrixFor(w, h, dst);
    screen.style.width = w + "px"; screen.style.height = h + "px"; screen.style.setProperty("--sw", w + "px");
    screen.style.transform = "translateZ(2px) matrix3d(" + m.join(",") + ")";
    var xs = dst.map(function (p) { return p[0]; }), ys = dst.map(function (p) { return p[1]; });
    scrclick.style.left = Math.min.apply(0, xs) + "px"; scrclick.style.top = Math.min.apply(0, ys) + "px";
    scrclick.style.width = (Math.max.apply(0, xs) - Math.min.apply(0, xs)) + "px";
    scrclick.style.height = (Math.max.apply(0, ys) - Math.min.apply(0, ys)) + "px";
  }
  function placeCircle() {
    var circle = document.querySelector(".circle"), inner = document.getElementById("circleInner"), stage = document.getElementById("stageEl");
    if (!circle || !inner || !stage) return;
    inner.style.left = (-circle.offsetLeft) + "px"; inner.style.top = (-circle.offsetTop) + "px";
    inner.style.width = stage.clientWidth + "px"; inner.style.height = stage.clientHeight + "px";
  }
  function placeBtns() {
    var btns = document.querySelector(".lhero .btns"); if (!btns) return;
    if (window.innerWidth <= 860) { btns.style.left = ""; return; } // mobile: centered via CSS
    var bw = document.querySelector(".bgword.z1"), stage = document.getElementById("stageEl");
    if (!bw || !stage) return;
    var b = bw.getBoundingClientRect(), s = stage.getBoundingClientRect(); var left = b.left - s.left; if (left < 0) left = 0;
    btns.style.left = left + "px";
  }
  function placeAll() { placeScreen(); placeCircle(); placeBtns(); }
  if (lap.complete) placeAll();
  lap.addEventListener("load", placeAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeAll);
  window.addEventListener("load", placeAll);
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(placeAll, 140); });

  // ---- about-me slides (click only) ----
  var slides = [].slice.call(document.querySelectorAll(".lhero .mini .slide")), introslide = document.getElementById("introslide"), cur = 0;
  function show(i) { cur = (i + slides.length) % slides.length; slides.forEach(function (s, k) { s.classList.toggle("on", k === cur); }); }
  function toAboutMe() { if (introslide) introslide.classList.remove("on"); show(0); }
  var autoTimer = null;
  function scheduleAuto() { clearTimeout(autoTimer); autoTimer = setTimeout(function () { show(cur + 1); scheduleAuto(); }, 10000); }

  // ---- GSAP intro + parallax ----
  var G = window.gsap, hero = document.getElementById("hero"), nav = document.querySelector(".nav");
  var active = false, done = false, introTL = null;
  var HIDE = [".nav", ".eyebrow-top", ".bgword", ".circle", ".side-right", ".lhero .btns", ".devstage"];
  if (G) G.set(HIDE, { opacity: 0 });

  var qx, qy, qtx, qty;
  function initParallax() {
    if (!G) return;
    qx = G.quickTo(device, "rotationY", { duration: .6, ease: "power3" });
    qy = G.quickTo(device, "rotationX", { duration: .6, ease: "power3" });
    qtx = G.quickTo(device, "x", { duration: .6, ease: "power3" });
    qty = G.quickTo(device, "y", { duration: .6, ease: "power3" });
    hero.addEventListener("pointermove", function (e) {
      if (!active) return; var r = hero.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      qx(px * 5); qy(-py * 3.5); qtx(px * 9); qty(py * 6);
    });
    hero.addEventListener("pointerleave", function () { if (!active) return; qx(0); qy(0); qtx(0); qty(0); });
  }
  function finishIntro() { if (done) return; done = true; active = true; initParallax(); scheduleAuto(); }

  function showHero() {
    if (G) { G.set(".device", { clearProps: "transform" }); G.set(HIDE, { opacity: 1, clearProps: "transform" }); }
    else { if (nav) nav.style.opacity = 1; document.querySelectorAll(".eyebrow-top,.bgword,.circle,.side-right,.lhero .btns,.devstage").forEach(function (e) { e.style.opacity = 1; }); }
    toAboutMe();
  }

  function runIntro() {
    if (!G) { showHero(); finishIntro(); return; }
    var scr = scrclick.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    if (!scr.width) { showHero(); finishIntro(); return; }
    var S = Math.max(vw / scr.width, vh / scr.height) * 1.06;
    var dx = vw / 2 - (scr.left + scr.width / 2), dy = vh / 2 - (scr.top + scr.height / 2);
    G.set(".device", { transformOrigin: "49.84% 43.31%", x: dx, y: dy, scale: S });
    G.set(".devstage", { opacity: 1 });
    introTL = G.timeline({ delay: .45, onComplete: function () { toAboutMe(); finishIntro(); } });
    introTL
      .to(".device", { x: 0, y: 0, scale: 1, duration: 1.55, ease: "power3.inOut" }, 0)
      .to(".circle", { opacity: 1, duration: .6, ease: "power2.out" }, 0.8)
      .to(".bgword", { opacity: 1, duration: .6 }, 1.0).from(".bgword", { yPercent: 14, duration: .7, ease: "power3.out" }, 1.0)
      .to([".nav", ".eyebrow-top", ".side-right", ".lhero .btns"], { opacity: 1, duration: .5, stagger: .08, ease: "power2.out" }, 1.1)
      .from([".side-right", ".lhero .btns"], { y: 14, duration: .6, stagger: .08 }, 1.1);
  }
  function skip() { if (introTL) introTL.progress(1); showHero(); finishIntro(); }

  scrclick.addEventListener("click", function () { if (active) { show(cur + 1); scheduleAuto(); } });
  window.addEventListener("load", function () { runIntro(); setTimeout(function () { if (!done) skip(); }, 6000); });
  window.addEventListener("wheel", function () { if (!done) skip(); }, { passive: true });
  window.addEventListener("touchmove", function () { if (!done) skip(); }, { passive: true });
})();
