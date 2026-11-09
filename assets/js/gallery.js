/* ==========================================================================
   Case-study gallery v2 — side-by-side, single-viewport, FIXED frame.
   The stage keeps one constant size across all 5 features (no bouncing).
   "Fit" features render at a desktop design width and scale to fit the frame;
   genuinely scroll-driven features adapt + scroll inside the same fixed frame.
   Selected feature + project scroll position are preserved for back-nav.
   ========================================================================== */
(function () {
  "use strict";
  var stage = document.querySelector(".g-stage");
  var frame = document.getElementById("g-frame");
  var thumbs = Array.prototype.slice.call(document.querySelectorAll(".g-thumb"));
  if (!stage || !frame || !thumbs.length) return;

  var numEl = document.querySelector(".g-num");
  var titleEl = document.querySelector(".g-ftitle");
  var explainEl = document.querySelector(".g-explain");
  var prevBtns = Array.prototype.slice.call(document.querySelectorAll("[data-nav='prev']"));
  var nextBtns = Array.prototype.slice.call(document.querySelectorAll("[data-nav='next']"));
  var substep = document.querySelector(".g-substep");
  var project = document.body.getAttribute("data-project") || "project";
  var DESIGN_W = 1040;
  var FILL = 1.06; // slight overscale so the feature hugs the frame (stage clips the sliver)
  var current = -1;
  var autoHeights = {}; // reported heights for auto features

  function fileOf(src) { return (src || "").split("/").pop().split("?")[0]; }
  function featureAt(i) {
    var t = thumbs[i];
    return {
      src: t.getAttribute("data-src"),
      scroll: t.getAttribute("data-scroll") === "1",
      seqnav: t.getAttribute("data-seqnav") === "1",
      h: parseInt(t.getAttribute("data-h"), 10) || 600,
      num: t.getAttribute("data-num") || (i + 1 < 10 ? "0" : "") + (i + 1),
      kicker: t.getAttribute("data-kicker") || "",
      title: t.getAttribute("data-title") || "",
      explain: t.getAttribute("data-explain") || ""
    };
  }

  // ---- fit the frame content to the fixed stage ----
  function fitFrame() {
    var f = featureAt(current); if (!f) return;
    var W = stage.clientWidth, H = stage.clientHeight;
    if (f.scroll) {
      // adapt: fill the fixed frame, scroll inside it
      frame.style.transform = "translate(-50%,-50%) scale(1)";
      frame.style.width = W + "px";
      frame.style.height = H + "px";
      frame.setAttribute("scrolling", "yes");
    } else {
      // scale to fit: render at desktop width, scale down to the frame
      var contentH = autoHeights[fileOf(frame.src)] || f.h;
      frame.style.width = DESIGN_W + "px";
      frame.style.height = contentH + "px";
      frame.setAttribute("scrolling", "no");
      var s = Math.min(W / DESIGN_W, H / contentH) * FILL;
      frame.style.transform = "translate(-50%,-50%) scale(" + s + ")";
    }
  }

  function select(i, opts) {
    opts = opts || {};
    if (i < 0 || i >= thumbs.length) return;
    if (i === current && !opts.force) return;
    current = i;
    var f = featureAt(i);

    thumbs.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute("aria-current", on ? "true" : "false");
      t.setAttribute("tabindex", on ? "0" : "-1");
    });

    if (numEl) numEl.textContent = f.num;
    if (titleEl) titleEl.textContent = f.title;
    if (explainEl) explainEl.textContent = f.explain;

    stage.classList.add("loading");
    stage.classList.toggle("is-scroll", !!f.scroll);
    frame.title = f.title + " — live interactive feature";
    frame.src = f.src;
    fitFrame();

    if (substep) {
      substep.classList.toggle("on", !!f.seqnav);
      if (f.seqnav) resetSubstep();
    }
    prevBtns.forEach(function (b) { b.disabled = i === 0; });
    nextBtns.forEach(function (b) { b.disabled = i === thumbs.length - 1; });

    try { sessionStorage.setItem("feat:" + project, String(i)); } catch (e) {}
    if (opts.focus) { try { frame.focus(); } catch (e) {} }
  }

  frame.addEventListener("load", function () { stage.classList.remove("loading"); fitFrame(); });

  // auto-height features report their height; refit
  window.addEventListener("message", function (e) {
    var d = e.data || {};
    if (!d.shFrame || typeof d.shHeight !== "number") return;
    autoHeights[d.shFrame] = Math.max(220, d.shHeight);
    if (fileOf(frame.src) === d.shFrame) fitFrame();
  });
  window.addEventListener("resize", fitFrame);

  prevBtns.forEach(function (b) { b.addEventListener("click", function () { select(current - 1, { focus: true }); }); });
  nextBtns.forEach(function (b) { b.addEventListener("click", function () { select(current + 1, { focus: true }); }); });

  thumbs.forEach(function (t, k) {
    t.addEventListener("click", function () { select(k); });
    t.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowDown" || ev.key === "ArrowRight") { ev.preventDefault(); var n = Math.min(thumbs.length - 1, k + 1); thumbs[n].focus(); select(n); }
      else if (ev.key === "ArrowUp" || ev.key === "ArrowLeft") { ev.preventDefault(); var p = Math.max(0, k - 1); thumbs[p].focus(); select(p); }
      else if (ev.key === "Home") { ev.preventDefault(); thumbs[0].focus(); select(0); }
      else if (ev.key === "End") { ev.preventDefault(); thumbs[thumbs.length - 1].focus(); select(thumbs.length - 1); }
    });
  });

  // ---- within-feature stepper (grazing cow) ----
  var subCur = 0, subDots = [];
  function resetSubstep() { subCur = 0; subDots = Array.prototype.slice.call(substep.querySelectorAll(".dot")); paintSubstep(); }
  function paintSubstep() { subDots.forEach(function (d, k) { d.setAttribute("aria-current", k === subCur ? "true" : "false"); }); }
  function goSub(i) {
    subCur = Math.max(0, Math.min(subDots.length - 1, i)); paintSubstep();
    if (frame.contentWindow) { try { frame.contentWindow.postMessage({ seqGoto: subCur }, "*"); } catch (e) {} }
  }
  if (substep) {
    var sp = substep.querySelector(".prev"), sn = substep.querySelector(".next");
    if (sp) sp.addEventListener("click", function () { goSub(subCur - 1); });
    if (sn) sn.addEventListener("click", function () { goSub(subCur + 1); });
    substep.querySelectorAll(".dot").forEach(function (d) { d.addEventListener("click", function () { goSub(+d.getAttribute("data-i")); }); });
  }

  // ---- in-portfolio project viewer (Stonebrook "See our latest work") ----
  var viewer = document.getElementById("csViewer");
  if (viewer) {
    var vFrame = document.getElementById("csViewerFrame");
    var vTitle = document.getElementById("csViewerTitle");
    var vClose = document.getElementById("csViewerClose");
    function openViewer(url, title) {
      if (!vFrame) return;
      vFrame.src = url;
      if (vTitle) vTitle.textContent = title || "Project";
      viewer.classList.add("open");
      viewer.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (vClose) try { vClose.focus(); } catch (e) {}
    }
    function closeViewer() {
      viewer.classList.remove("open");
      viewer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      setTimeout(function () { if (vFrame) vFrame.src = "about:blank"; }, 300);
    }
    if (vClose) vClose.addEventListener("click", closeViewer);
    viewer.addEventListener("click", function (e) { if (e.target === viewer) closeViewer(); });
    window.addEventListener("keydown", function (e) { if (e.key === "Escape" && viewer.classList.contains("open")) closeViewer(); });
    window.addEventListener("message", function (e) {
      var d = e.data || {};
      if (d && d.csOpenGallery) openViewer(d.csOpenGallery, d.csTitle);
    });
  }

  // ---- initial feature (hash > saved > first), without scrolling the page ----
  function startIndex() {
    var h = (location.hash || "").replace(/^#/, "");
    if (h) {
      var byNum = h.match(/^feature-(\d+)$/);
      if (byNum) { var n = parseInt(byNum[1], 10) - 1; if (n >= 0 && n < thumbs.length) return n; }
      for (var i = 0; i < thumbs.length; i++) { if (fileOf(thumbs[i].getAttribute("data-src")) === (h.indexOf(".html") > -1 ? h : h + ".html")) return i; }
    }
    try { var s = sessionStorage.getItem("feat:" + project); if (s !== null) { var si = parseInt(s, 10); if (si >= 0 && si < thumbs.length) return si; } } catch (e) {}
    return 0;
  }
  select(startIndex(), { force: true });
})();
