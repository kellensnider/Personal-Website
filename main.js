// Small progressive enhancements only. The page works fully without this file.
(function () {
  "use strict";

  var root = document.documentElement;

  // ---- Theme toggle -------------------------------------------------------
  var toggle = document.querySelector("[data-theme-toggle]");
  var darkQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set === "light" || set === "dark") return set;
    return darkQuery && darkQuery.matches ? "dark" : "light";
  }
  function renderToggle() {
    toggle.textContent = currentTheme() === "dark" ? "Light mode" : "Dark mode";
  }
  if (toggle) {
    toggle.hidden = false;
    renderToggle();
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      renderToggle();
    });
    if (darkQuery && darkQuery.addEventListener) darkQuery.addEventListener("change", renderToggle);
  }

  // ---- Sign array: location sign for where you are, arrows toward the rest --
  // Like a real airport sign array: the section you're in shows as a black
  // location sign; every other sign points up or down toward its section.
  var signs = Array.prototype.slice.call(document.querySelectorAll(".signbar [data-section]"));
  var sections = signs.map(function (a) { return document.getElementById(a.getAttribute("data-section")); });
  if (signs.length && sections.every(Boolean)) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var line = window.innerHeight * 0.3;
      var current = -1;
      sections.forEach(function (el, i) {
        if (el.getBoundingClientRect().top <= line) current = i;
      });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = sections.length - 1;
      }
      signs.forEach(function (a, i) {
        var here = i === current;
        a.classList.toggle("here", here);
        a.setAttribute("data-dir", i < current ? "up" : "down");
        if (here) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  // ---- Copy email ---------------------------------------------------------
  if (navigator.clipboard && window.isSecureContext) {
    document.querySelectorAll("[data-copy]").forEach(function (btn) {
      var status = btn.parentElement.querySelector("[data-copy-status]");
      var idle = btn.textContent;
      var timer;
      btn.hidden = false;
      btn.addEventListener("click", function () {
        navigator.clipboard.writeText(btn.getAttribute("data-copy")).then(
          function () { report("Copied", "Email address copied"); },
          function () { report("Copy failed", "Could not copy the email address"); }
        );
      });
      function report(label, message) {
        btn.textContent = label;
        if (status) status.textContent = message;
        clearTimeout(timer);
        timer = setTimeout(function () {
          btn.textContent = idle;
          if (status) status.textContent = "";
        }, 2000);
      }
    });
  }

  // ---- Contact form: submit inline instead of leaving the page -------------
  // Without JS the form posts normally and Web3Forms shows its own confirmation.
  var form = document.querySelector("form[data-web3forms]");
  if (form && window.fetch && window.FormData) {
    var formStatus = form.querySelector("[data-form-status]");
    var submit = form.querySelector("button[type=submit]");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      submit.disabled = true;
      formStatus.textContent = "Sending…";
      fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && data.success) {
            form.reset();
            formStatus.textContent = "Sent. Thanks for reaching out.";
          } else {
            formStatus.textContent = "That didn't go through. Please email me directly.";
          }
        })
        .catch(function () {
          formStatus.textContent = "That didn't go through. Please email me directly.";
        })
        .then(function () { submit.disabled = false; });
    });
  }
})();
