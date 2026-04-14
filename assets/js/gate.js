(function initPasswordGate() {
  var PASSWORD = "table";
  var modal = null;
  var passwordInput = null;
  var errorNode = null;
  var activeTarget = "";
  var previouslyFocused = null;

  function createModal() {
    if (modal) {
      return;
    }

    modal = document.createElement("div");
    modal.className = "gate-backdrop";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML =
      '<div class="gate-dialog" role="dialog" aria-modal="true" aria-labelledby="gate-title">' +
      '  <div class="gate-header">' +
      '    <div class="gate-title-group">' +
      '      <div class="gate-lock" aria-hidden="true">LOCK</div>' +
      '      <h2 id="gate-title" class="gate-title">Protected link</h2>' +
      "    </div>" +
      '    <button type="button" class="gate-close" aria-label="Close password dialog">&times;</button>' +
      "  </div>" +
      '  <p class="gate-copy">Enter password to continue.</p>' +
      '  <form class="gate-form">' +
      '    <label class="sr-only" for="gate-password">Password</label>' +
      '    <input id="gate-password" class="gate-input" type="password" autocomplete="off" />' +
      '    <p class="gate-error" aria-live="polite"></p>' +
      '    <div class="gate-actions">' +
      '      <button type="button" class="gate-btn gate-cancel">Cancel</button>' +
      '      <button type="submit" class="gate-btn gate-btn-primary">Unlock</button>' +
      "    </div>" +
      '    <p class="gate-request">' +
      '      <a class="gate-access-link" href="mailto:douglas@laguna.partners">Request access</a>' +
      "    </p>" +
      "  </form>" +
      "</div>";

    document.body.appendChild(modal);

    passwordInput = modal.querySelector("#gate-password");
    errorNode = modal.querySelector(".gate-error");
    var closeButton = modal.querySelector(".gate-close");
    var cancelButton = modal.querySelector(".gate-cancel");
    var form = modal.querySelector(".gate-form");

    closeButton.addEventListener("click", closeModal);
    cancelButton.addEventListener("click", closeModal);

    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!passwordInput) {
        return;
      }

      if (passwordInput.value.trim() === PASSWORD) {
        var nextTarget = activeTarget;
        closeModal();
        window.location.href = nextTarget;
        return;
      }

      errorNode.textContent = "Incorrect password. Try again.";
      passwordInput.focus();
      passwordInput.select();
    });

    passwordInput.addEventListener("input", function () {
      errorNode.textContent = "";
    });

    modal.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      var focusable = modal.querySelectorAll(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      if (!focusable.length) {
        return;
      }

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function openModal(target) {
    createModal();
    activeTarget = target;
    previouslyFocused = document.activeElement;
    modal.setAttribute("data-open", "true");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    errorNode.textContent = "";
    passwordInput.value = "";
    passwordInput.focus();
  }

  function closeModal() {
    if (!modal) {
      return;
    }
    modal.removeAttribute("data-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (previouslyFocused && previouslyFocused.focus) {
      previouslyFocused.focus();
    }
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest("[data-gated-target]");
    if (!link) {
      return;
    }

    if (event.defaultPrevented || event.button !== 0) {
      return;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    var target = link.getAttribute("data-gated-target");
    if (!target) {
      return;
    }

    event.preventDefault();
    openModal(target);
  });
})();
