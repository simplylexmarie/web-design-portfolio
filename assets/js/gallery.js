/* ==========================================================================
   Interactive project gallery — one large stage, selectable features.
   Selecting a feature swaps the stage iframe (the real, live component) and
   updates the caption. Prev/next + keyboard + a within-feature stepper for
   the grazing-cow sequence. Progressive enhancement over plain links.
   ========================================================================== */
(function () {
  "use strict";

  var stageWrap = document.querySelector(".g-stage-wrap");
  var stage = document.querySelector(".g-stage");
  var frame = document.getElementById("g-frame");
  var thumbs = Array.prototype.slice.call(document.querySelectorAll(".g-thumb"));
  if (!stage || !frame || !thumbs.length) return;

  var capK = document.querySelector(".g-cap-text .k");
  var capH = document.querySelector(".g-cap-text h2");
  var capP = document.querySelector(".g-cap-text p:not(.k)");
  var prevBtns = Array.prototype.slice.call(document.querySelectorAll("[data-nav='prev']"));
  var nextBtns = Array.prototype.slice.call(document.querySelectorAll("[data-nav='next']"));
  var substep = document.querySelector(".g-substep");

  var mobileMQ = window.matchMedia("(max-width:640px)");
  var current = -1;

  function fileOf(src) { return (src || "").split("/").pop().split("?")[0]; }

  function featureAt(i) {
    var t = thumbs[i];
    return {
      src: t.getAttribute("data-src"),
      mode: t.getAttribute("data-mode") || "fixed",   // fixed | auto | scroll
      h: parseInt(t.getAttribute("data-h"), 10) || 560,
      hm: parseInt(t.getAttribute("data-hm"), 10) || 480,
      scroll: t.getAttribute("data-scroll") === "1",
      seqnav: t.getAttribute("data-seqnav") === "1",
      kicker: t.getAttribute("data-kicker") || "",
      title: t.getAttribute("data-title") || "",
      desc: t.getAttribute("data-desc") || ""
    };
  }

  function provisionalHeight(f) {
    return (mobileMQ.matches ? f.hm : f.h) + "px";
  }

  function select(i, focusFrame) {
    if (i < 0 || i >= thumbs.length || i === current) {
      if (i === current) return;
    }
    current = i;
    var f = featureAt(i);

    // thumbs active state + scroll active thumb into view
    thumbs.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute("aria-current", on ? "true" : "false");
      t.setAttribute("tabindex", on ? "0" : "-1");
    });
    try {
      thumbs[i].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    } catch (e) {
      thumbs[i].scrollIntoView();
    }

    // caption
    if (capK) capK.textContent = (i + 1 < 10 ? "0" : "") + (i + 1) + " · " + f.kicker;
    if (capH) capH.textContent = f.title;
    if (capP) capP.textContent = f.desc;

    // stage swap
    stage.classList.add("loading");
    stage.classList.toggle("is-scroll", !!f.scroll);
    if (stageWrap) stageWrap.classList.toggle("show-hint", !!f.scroll);
    frame.setAttribute("scrolling", f.scroll ? "yes" : "no");
    frame.style.height = provisionalHeight(f);
    frame.title = f.title + " — live interactive feature";
    frame.src = f.src;

    // within-feature stepper (grazing cow)
    if (substep) {
      substep.classList.toggle("on", !!f.seqnav);
      if (f.seqnav) resetSubstep();
    }

    // nav disabled states
    prevBtns.forEach(function (b) { b.disabled = i === 0; });
    nextBtns.forEach(function (b) { b.disabled = i === thumbs.length - 1; });

    if (focusFrame) { try { frame.focus(); } catch (e) {} }
  }

  frame.addEventListener("load", function () {
    stage.classList.remove("loading");
  });

  // auto-size iframes that report their own height (same-origin fragments)
  window.addEventListener("message", function (e) {
    var d = e.data || {};
    if (!d.shFrame || typeof d.shHeight !== "number") return;
    var f = featureAt(current);
    if (f && f.mode === "auto" && fileOf(frame.src) === d.shFrame) {
      frame.style.height = Math.max(220, d.shHeight) + "px";
    }
  });

  // keep fixed/scroll heights responsive
  function applyResponsiveHeight() {
    var f = featureAt(current);
    if (f && f.mode !== "auto") frame.style.height = provisionalHeight(f);
  }
  window.addEventListener("resize", applyResponsiveHeight);

  // prev / next
  prevBtns.forEach(function (b) { b.addEventListener("click", function () { select(current - 1, true); }); });
  nextBtns.forEach(function (b) { b.addEventListener("click", function () { select(current + 1, true); }); });

  // thumb clicks + roving arrow keys
  thumbs.forEach(function (t, k) {
    t.addEventListener("click", function () { select(k, false); });
    t.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowRight" || ev.key === "ArrowDown") {
        ev.preventDefault(); var n = Math.min(thumbs.length - 1, k + 1); thumbs[n].focus(); select(n, false);
      } else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") {
        ev.preventDefault(); var p = Math.max(0, k - 1); thumbs[p].focus(); select(p, false);
      } else if (ev.key === "Home") {
        ev.preventDefault(); thumbs[0].focus(); select(0, false);
      } else if (ev.key === "End") {
        ev.preventDefault(); thumbs[thumbs.length - 1].focus(); select(thumbs.length - 1, false);
      }
    });
  });

  // ---- within-feature stepper (grazing-cow four topics) -------------------
  var subCur = 0, subDots = [];
  function resetSubstep() {
    subCur = 0;
    subDots = Array.prototype.slice.call(substep.querySelectorAll(".dot"));
    paintSubstep();
  }
  function paintSubstep() {
    subDots.forEach(function (d, k) { d.setAttribute("aria-current", k === subCur ? "true" : "false"); });
  }
  function goSub(i) {
    subCur = Math.max(0, Math.min(subDots.length - 1, i));
    paintSubstep();
    if (frame.contentWindow) {
      try { frame.contentWindow.postMessage({ seqGoto: subCur }, "*"); } catch (e) {}
    }
  }
  if (substep) {
    var sp = substep.querySelector(".prev"), sn = substep.querySelector(".next");
    if (sp) sp.addEventListener("click", function () { goSub(subCur - 1); });
    if (sn) sn.addEventListener("click", function () { goSub(subCur + 1); });
    substep.querySelectorAll(".dot").forEach(function (d) {
      d.addEventListener("click", function () { goSub(+d.getAttribute("data-i")); });
    });
  }

  // deep link: #feature-N or #<fragment-name>
  function startIndex() {
    var h = (location.hash || "").replace(/^#/, "");
    if (!h) return 0;
    var byNum = h.match(/^feature-(\d+)$/);
    if (byNum) { var n = parseInt(byNum[1], 10) - 1; if (n >= 0 && n < thumbs.length) return n; }
    for (var i = 0; i < thumbs.length; i++) {
      if (fileOf(thumbs[i].getAttribute("data-src")) === (h.indexOf(".html") > -1 ? h : h + ".html")) return i;
    }
    return 0;
  }

  select(startIndex(), false);
})();
