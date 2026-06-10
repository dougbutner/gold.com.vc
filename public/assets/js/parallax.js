(function () {
  "use strict";

  var mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mqMobile = window.matchMedia("(max-width: 768px)");

  if (mqMotion.matches || mqMobile.matches) return;

  var nodes = document.querySelectorAll("[data-parallax]");
  if (!nodes.length) return;

  var layers = [];
  nodes.forEach(function (el) {
    var speed = parseFloat(el.getAttribute("data-parallax"), 10);
    if (Number.isNaN(speed)) return;
    el.classList.add("has-parallax");
    layers.push({ el: el, speed: speed });
  });
  if (!layers.length) return;

  var pending = false;

  function active() {
    return !mqMotion.matches && !mqMobile.matches;
  }

  function frame() {
    pending = false;
    if (!active()) {
      layers.forEach(function (l) {
        l.el.style.transform = "";
      });
      return;
    }
    var y = window.scrollY;
    layers.forEach(function (l) {
      l.el.style.transform = "translate3d(0," + y * l.speed + "px,0)";
    });
  }

  function onScroll() {
    if (!pending) {
      pending = true;
      requestAnimationFrame(frame);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  mqMotion.addEventListener("change", onScroll);
  mqMobile.addEventListener("change", onScroll);
  frame();
})();
