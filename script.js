// Beechclub Flying Club — shared site behavior

document.addEventListener("DOMContentLoaded", function () {
  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    links.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Contact form: friendly inline confirmation.
  // Works as-is with Netlify Forms (form has data-netlify="true").
  // If you deploy elsewhere, point the form's "action" at your own
  // form handler (e.g. Formspree) or a serverless function.
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      // Let Netlify (or another host's form handler) actually process
      // the submission — we just show a friendly message afterward if
      // JS handles the redirect. If you're testing locally, this will
      // prevent a real network error and simulate success instead.
      var isLocal = window.location.protocol === "file:";
      if (isLocal) {
        e.preventDefault();
        var success = document.querySelector("#form-success");
        if (success) {
          success.style.display = "block";
          form.reset();
          success.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });
  }

  // Highlight current nav link based on path
  var current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === current || (current === "" && href === "index.html")) {
      a.setAttribute("aria-current", "page");
    }
  });
});
