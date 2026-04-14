(function initMobileNav() {
  var navs = document.querySelectorAll("[data-mobile-nav]");
  if (!navs.length) {
    return;
  }

  navs.forEach(function setup(nav) {
    var toggle = nav.querySelector(".nav-toggle");
    var links = nav.querySelector(".nav-links");
    if (!toggle || !links) {
      return;
    }

    function closeMenu() {
      nav.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    links.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        closeMenu();
      }
    });

    document.addEventListener("click", function (event) {
      if (!nav.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  });
})();
