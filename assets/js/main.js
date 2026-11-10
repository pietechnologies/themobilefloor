/* ============================================================
   THE MOBILE FLOOR — Landing Page JS
   - Auto popup lead form (opens 5–7s after load)
   - Lead form submission (FormSubmit AJAX → mailto fallback)
   - Nav, scroll reveals, FAQ niceties
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- Config ---------------- */

  // Popup delay — sits inside the requested 5–7 second window.
  var POPUP_DELAY_MS = 5500;

  // After a successful submit, don't nag the visitor again for 7 days.
  var SUPPRESS_DAYS = 7;
  var SUBMITTED_KEY = "tmf_lead_submitted_at";

  // Lead delivery endpoint (FormSubmit — no account needed, works on GitHub Pages).
  // 1) First submission sends joseph@themobilefloor.com an activation email — click it once.
  // 2) To use another service (Formspree, your own API…), just replace this URL.
  // 3) If sending fails, the form falls back to opening the visitor's mail app.
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/mominaligmb@gmail.com";
  var FALLBACK_EMAIL = "mominaligmb@gmail.com";
  var FALLBACK_SUBJECT = "New Free Estimate Request — The Mobile Floor";

  /* ---------------- Small helpers ---------------- */

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function storeGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storeSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }

  function isRecentlySubmitted() {
    var ts = parseInt(storeGet(SUBMITTED_KEY) || "0", 10);
    if (!ts) return false;
    return (Date.now() - ts) < SUPPRESS_DAYS * 24 * 60 * 60 * 1000;
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }
  function isValidPhone(v) {
    var digits = v.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }

  /* ---------------- Header: shadow on scroll ---------------- */

  var header = $("#header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- Mobile nav ---------------- */

  var navToggle = $("#navToggle");
  var nav = $("#nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$("a", nav).forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------- Reveal on scroll ---------------- */

  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 6, 5) * 60 + "ms";
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------- FAQ: close others when one opens ---------------- */

  var faqItems = $$(".faq details");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------------- Auto popup lead form ---------------- */

  var modal = $("#leadModal");
  var lastFocused = null;

  function openModal() {
    if (!modal || modal.dataset.open === "true") return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    modal.dataset.open = "true";
    document.body.classList.add("modal-open");
    // Focus the first field once the entrance animation settles.
    window.setTimeout(function () {
      var firstInput = modal.querySelector("input[name='name']");
      if (firstInput) firstInput.focus({ preventScroll: true });
    }, 350);
  }

  function closeModal() {
    if (!modal || modal.dataset.open !== "true") return;
    modal.hidden = true;
    modal.dataset.open = "false";
    document.body.classList.remove("modal-open");
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus({ preventScroll: true });
    }
  }

  // Any element with data-open-lead opens the popup (header, hero, sections, mobile bar…).
  $$("[data-open-lead]").forEach(function (btn) {
    btn.addEventListener("click", openModal);
  });
  $$("[data-close-lead]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
    // Simple focus trap while the modal is open.
    if (e.key === "Tab" && modal && modal.dataset.open === "true") {
      var focusables = $$("a[href], button, input, select, textarea", modal)
        .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // AUTO-OPEN: fire once per page load, after 5.5 seconds (inside the 5–7s window).
  function scheduleAutoPopup() {
    if (!modal) return;
    if (isRecentlySubmitted()) return; // they already converted — don't nag

    window.setTimeout(function () {
      if (isRecentlySubmitted()) return;
      // If the tab is in the background, wait until it's visible again.
      if (document.hidden) {
        var onVisible = function () {
          if (!document.hidden) {
            document.removeEventListener("visibilitychange", onVisible);
            openModal();
          }
        };
        document.addEventListener("visibilitychange", onVisible);
      } else {
        openModal();
      }
    }, POPUP_DELAY_MS);
  }

  if (document.readyState === "complete") {
    scheduleAutoPopup();
  } else {
    window.addEventListener("load", scheduleAutoPopup);
  }

  /* ---------------- Lead forms (popup + contact section) ---------------- */

  function showError(form, msg) {
    var box = $("[data-form-error]", form);
    if (!box) return;
    box.textContent = msg;
    box.hidden = false;
  }
  function clearError(form) {
    var box = $("[data-form-error]", form);
    if (box) { box.hidden = true; box.textContent = ""; }
    $$(".is-invalid", form).forEach(function (el) { el.classList.remove("is-invalid"); });
  }

  function validate(form) {
    clearError(form);
    var ok = true;

    var name = form.querySelector("[name='name']");
    var phone = form.querySelector("[name='phone']");
    var service = form.querySelector("[name='service']");

    if (!name.value.trim()) { name.classList.add("is-invalid"); ok = false; }
    if (!phone.value.trim() || !isValidPhone(phone.value)) { phone.classList.add("is-invalid"); ok = false; }
    if (!service.value) { service.classList.add("is-invalid"); ok = false; }

    var email = form.querySelector("[name='email']");
    if (email && email.value.trim() && !isValidEmail(email.value.trim())) {
      email.classList.add("is-invalid");
      ok = false;
    }

    if (!ok) {
      showError(form, "Please fill in your name, a valid phone number (10+ digits) and a service.");
      var firstBad = form.querySelector(".is-invalid");
      if (firstBad) firstBad.focus();
    }
    return ok;
  }

  function formDataToBody(data) {
    var lines = [];
    data.forEach(function (val, key) {
      if (key === "_honey" || key === "_subject") return;
      if (!val) return;
      var label = key.charAt(0).toUpperCase() + key.slice(1);
      lines.push(label + ": " + val);
    });
    return lines.join("\n");
  }

  function openMailFallback(data) {
    var body = formDataToBody(data) + "\n\n— Sent from the landing page";
    var href = "mailto:" + FALLBACK_EMAIL +
      "?subject=" + encodeURIComponent(FALLBACK_SUBJECT) +
      "&body=" + encodeURIComponent(body);
    window.location.href = href;
  }

  function showSuccess(form) {
    var wrap = form.parentElement;
    var success = $("[data-lead-success]", wrap);
    form.hidden = true;
    if (success) success.hidden = false;

    // Suppress the auto-popup for a week — they already converted.
    storeSet(SUBMITTED_KEY, String(Date.now()));

    // Close the modal automatically after a beat so visitors can keep browsing.
    if (modal && wrap && modal.contains(wrap)) {
      window.setTimeout(closeModal, 3200);
    }
  }

  function handleSubmit(form, e) {
    e.preventDefault();
    if (!validate(form)) return;

    var btn = form.querySelector("[type='submit']");
    var data = new FormData(form);
    data.set("_subject", "New Free Estimate Request — The Mobile Floor");
    data.set("_template", "table");

    if (btn) btn.classList.add("is-loading");

    var payload = {};
    data.forEach(function (val, key) { payload[key] = val; });

    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: data
    })
      .then(function (res) {
        if (btn) btn.classList.remove("is-loading");
        if (res.ok) {
          showSuccess(form);
        } else {
          // Endpoint rejected it (e.g. FormSubmit not activated yet) —
          // fall back to the visitor's mail app so the lead is never lost.
          showError(form, "Opening your email app to send your request — or call us at (818) 259-9724.");
          openMailFallback(payload);
        }
      })
      .catch(function () {
        if (btn) btn.classList.remove("is-loading");
        showError(form, "Opening your email app to send your request — or call us at (818) 259-9724.");
        openMailFallback(payload);
      });
  }

  $$("[data-lead-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) { handleSubmit(form, e); });
    // Clear field errors as the visitor fixes them.
    $$("input, select, textarea", form).forEach(function (field) {
      field.addEventListener("input", function () {
        field.classList.remove("is-invalid");
        var err = $("[data-form-error]", form);
        if (err && !form.querySelector(".is-invalid")) err.hidden = true;
      });
    });
  });

  /* ---------------- Footer year ---------------- */

  $$("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
