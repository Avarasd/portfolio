// ============================================================
// Tóth Avar — Portfolio
// Interactions: theme toggle, scroll reveal, section-title reveal,
// footer year. All motion respects prefers-reduced-motion.
// ============================================================

(function () {
  "use strict";

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // --- Theme (light / dark) ---
  // The initial theme is set by an inline script in <head> to avoid a
  // flash. Here we wire up the toggle and keep aria state in sync.
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");

  var syncToggle = function (theme) {
    if (toggle) {
      toggle.setAttribute("aria-checked", theme === "dark" ? "true" : "false");
    }
  };

  var applyTheme = function (theme, animate) {
    if (animate) {
      // Enable the one-shot color crossfade, then remove it after the
      // fade so normal hover transitions stay crisp.
      root.classList.add("theme-transition");
      window.setTimeout(function () {
        root.classList.remove("theme-transition");
      }, 650);
    }
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      /* storage unavailable — ignore */
    }
    syncToggle(theme);
  };

  // Reflect whatever the inline script already set.
  syncToggle(root.getAttribute("data-theme") || "light");

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next =
        root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next, true);
    });
  }

  // Follow the OS theme if the user hasn't made an explicit choice.
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  var onSchemeChange = function (e) {
    var saved = null;
    try {
      saved = localStorage.getItem("theme");
    } catch (err) {
      /* ignore */
    }
    if (!saved) {
      applyTheme(e.matches ? "dark" : "light", true);
    }
  };
  // addEventListener is modern; addListener is the fallback for older
  // Safari (<=13) where the modern form throws / is unavailable.
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", onSchemeChange);
  } else if (typeof media.addListener === "function") {
    media.addListener(onSchemeChange);
  }

  // --- Mobile menu (hamburger) ---
  // The slide-down panel is markup-present but [hidden] so a no-JS load
  // keeps it collapsed. Here we take over: drop [hidden] once, then
  // toggle an .is-open class (CSS animates the height) and keep
  // aria-expanded in sync. Closes on link tap, Escape, outside click,
  // and when the viewport grows back to the desktop layout.
  var navToggle = document.getElementById("nav-toggle");
  var mobileMenu = document.getElementById("mobile-menu");

  if (navToggle && mobileMenu) {
    // Managed by class from now on; remove the attribute so CSS controls it.
    mobileMenu.removeAttribute("hidden");

    var openMenu = function () {
      mobileMenu.classList.add("is-open");
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Close menu");
    };

    var closeMenu = function () {
      mobileMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    };

    navToggle.addEventListener("click", function () {
      if (mobileMenu.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Tapping a page link navigates; close the panel so it isn't left
    // open behind the new page / after an in-page jump.
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Escape closes and returns focus to the toggle.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) {
        closeMenu();
        navToggle.focus();
      }
    });

    // Tap outside the header/menu closes it.
    document.addEventListener("click", function (e) {
      if (!mobileMenu.classList.contains("is-open")) return;
      if (mobileMenu.contains(e.target) || navToggle.contains(e.target)) {
        return;
      }
      closeMenu();
    });

    // If the viewport grows past the mobile breakpoint, make sure the
    // panel is closed so returning to mobile doesn't start half-open.
    var desktopQuery = window.matchMedia("(min-width: 621px)");
    var onDesktopChange = function (e) {
      if (e.matches) closeMenu();
    };
    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", onDesktopChange);
    } else if (typeof desktopQuery.addListener === "function") {
      desktopQuery.addListener(onDesktopChange);
    }
  }

  // --- Auto-tag section headings so they animate in too ---
  document.querySelectorAll(".section-head").forEach(function (el) {
    el.classList.add("reveal");
  });

  // --- Scroll reveal via IntersectionObserver ---
  var revealEls = document.querySelectorAll(".reveal");

  if (prefersReduced || !("IntersectionObserver" in window)) {
    // No animation: just show everything.
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealEls.forEach(function (el, i) {
      // Small stagger so grouped elements don't pop in all at once.
      el.style.transitionDelay = (i % 4) * 60 + "ms";
      observer.observe(el);
    });
  }

  // --- Floating bubbles inside each project card ---
  // Injected here so the HTML stays clean and new cards get them too.
  // Skipped entirely under reduced-motion.
  if (!prefersReduced) {
    document.querySelectorAll(".project").forEach(function (card) {
      var layer = document.createElement("div");
      layer.className = "project-bubbles";
      layer.setAttribute("aria-hidden", "true");
      var bubbles = [];
      for (var i = 0; i < 7; i++) {
        var b = document.createElement("span");
        b.className = "bubble";
        layer.appendChild(b);
        bubbles.push(b);
      }
      // Insert as first child so it sits behind the content.
      card.insertBefore(layer, card.firstChild);

      // Restart each bubble's animation from 0% on every hover, so they
      // always rise fresh from the bottom (invisible -> up) rather than
      // resuming wherever the paused clock happened to be.
      card.addEventListener("mouseenter", function () {
        bubbles.forEach(function (b) {
          b.style.animation = "none";
          // Force reflow so the browser registers the reset...
          void b.offsetWidth;
          b.style.animation = "";
        });
        card.classList.add("is-hovering");
      });
      card.addEventListener("mouseleave", function () {
        card.classList.remove("is-hovering");
        // Clear the animation so bubbles snap back to the invisible idle
        // state instead of freezing mid-float where they'd stay visible.
        bubbles.forEach(function (b) {
          b.style.animation = "none";
        });
      });
    });
  }

  // --- Smooth-scroll for in-page nav (with focus handoff for a11y) ---
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start",
      });
      // Move focus for keyboard/screen-reader users, then drop the
      // temporary tabindex once focus leaves so it doesn't linger in the
      // DOM or affect later focus traversal.
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.addEventListener(
        "blur",
        function () {
          target.removeAttribute("tabindex");
        },
        { once: true }
      );
    });
  });

  // --- Copy email to clipboard (with a palette-matched confirmation) ---
  // The email icon keeps its mailto: link; this is the separate little
  // copy button next to it. Falls back to a hidden-textarea + execCommand
  // when the async Clipboard API isn't available (e.g. file:// or non-
  // HTTPS contexts) so it still works outside a secure context.
  var copyButtons = document.querySelectorAll(".copy-email");
  var toast = document.getElementById("copy-toast");
  var toastTimer = null;

  var copyText = function (text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Legacy fallback.
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        // Keep it out of view and prevent scroll jumps / zoom.
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error("execCommand failed"));
      } catch (err) {
        reject(err);
      }
    });
  };

  var showToast = function (message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }
    // Short-lived — just a quick confirmation, gone before it nags.
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 1100);
  };

  copyButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var email = btn.getAttribute("data-email") || "";
      if (!email) return;
      copyText(email).then(
        function () {
          btn.classList.add("copied");
          window.setTimeout(function () {
            btn.classList.remove("copied");
          }, 900);
          showToast("Copied");
        },
        function () {
          // If copying genuinely fails, surface the address to copy manually.
          showToast(email);
        }
      );
    });
  });

  // --- Click-to-zoom lightbox for project media ---
  // Each .project-media that actually has an image becomes a button that
  // opens the image enlarged in an overlay. Closes on backdrop click, the
  // close button, or Escape; focus is moved into the lightbox and restored
  // to the trigger afterwards.
  var mediaBoxes = Array.prototype.slice.call(
    document.querySelectorAll(".project-media")
  ).filter(function (box) {
    return box.querySelector("img");
  });

  if (mediaBoxes.length) {
    // Build one reusable overlay.
    var lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Close">\u2715</button>' +
      '<figure class="lightbox-figure">' +
      '<img class="lightbox-img" alt="" />' +
      '<figcaption class="lightbox-caption"></figcaption>' +
      "</figure>";
    document.body.appendChild(lightbox);

    var lightboxImg = lightbox.querySelector(".lightbox-img");
    var lightboxCaption = lightbox.querySelector(".lightbox-caption");
    var lightboxClose = lightbox.querySelector(".lightbox-close");
    var lastTrigger = null;

    var openLightbox = function (box) {
      var img = box.querySelector("img");
      if (!img) return;
      lastTrigger = box;
      // currentSrc handles any responsive source; falls back to src.
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt || "";
      lightboxCaption.textContent = img.alt || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      // Lock background scroll while open.
      document.body.style.overflow = "hidden";
      lightboxClose.focus();
    };

    var closeLightbox = function () {
      if (!lightbox.classList.contains("is-open")) return;
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      // Clear the src after the fade so a large GIF stops decoding.
      window.setTimeout(function () {
        if (!lightbox.classList.contains("is-open")) lightboxImg.src = "";
      }, 320);
      if (lastTrigger) {
        lastTrigger.focus();
        lastTrigger = null;
      }
    };

    var makeZoomable = function (box) {
      box.classList.add("is-zoomable");
      box.setAttribute("role", "button");
      box.setAttribute("tabindex", "0");
      var img = box.querySelector("img");
      box.setAttribute(
        "aria-label",
        "Enlarge image" + (img && img.alt ? ": " + img.alt : "")
      );
    };

    var unmakeZoomable = function (box) {
      box.classList.remove("is-zoomable");
      box.removeAttribute("role");
      box.removeAttribute("tabindex");
      box.removeAttribute("aria-label");
    };

    mediaBoxes.forEach(function (box) {
      makeZoomable(box);
      var img = box.querySelector("img");
      // If the image later fails to load (onerror removes it), strip the
      // zoom affordance so there's nothing to click into.
      if (img) {
        img.addEventListener("error", function () {
          unmakeZoomable(box);
        });
      }
      box.addEventListener("click", function () {
        openLightbox(box);
      });
      box.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          openLightbox(box);
        }
      });
    });

    lightboxClose.addEventListener("click", closeLightbox);
    // Click on the backdrop (but not the figure) closes.
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  }
})();
