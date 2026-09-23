/* ============================================================
   VELOCE — interactions
   Preloader · custom cursor · nav · scroll reveal · counters
   configurator · slider · tilt · mobile menu
   ============================================================ */

(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader — curtain reveal ---------- */
  const rootEl = document.documentElement;
  const preloader = $("#preloader");

  if (preloader) {
    if (prefersReduced) {
      // No theatrics: drop the curtain immediately.
      preloader.remove();
      rootEl.classList.remove("is-loading");
    } else {
      const fill = $("#preloaderFill");
      const pct = $("#preloaderPct");
      const MIN_MS = 1500;   // floor, so the sequence reads as intentional
      const start = performance.now();
      let ready = false;
      let shown = 0;
      let settled = false;
      let timer = null;

      const markReady = () => { ready = true; };

      if (document.readyState === "complete") markReady();
      else window.addEventListener("load", markReady, { once: true });

      // Don't hold the curtain for slow third-party media (hero video, poster,
      // web fonts). For a static page a short grace after DOM is plenty.
      const graceAfterDom = () => setTimeout(markReady, 2000);
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", graceAfterDom, { once: true });
      } else {
        graceAfterDom();
      }

      // Absolute cap — a stalled subresource must never trap the visitor.
      setTimeout(markReady, 5000);

      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

      const paint = (value) => {
        shown = Math.max(shown, value);
        if (fill) fill.style.width = shown + "%";
        if (pct) pct.textContent = Math.round(shown) + "%";
      };

      const reveal = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        paint(100);
        // Beat of stillness at 100%, then lift the curtain.
        setTimeout(() => {
          preloader.classList.add("is-done");
          // Releasing this resumes the hero entrance and unlocks scrolling.
          rootEl.classList.remove("is-loading");
          setTimeout(() => preloader.remove(), 1500);
        }, 320);
      };

      // Driven by a timer, not rAF: progress must still advance when the tab
      // is backgrounded or the page is not being composited.
      const step = () => {
        if (settled) return;
        const t = Math.min((performance.now() - start) / MIN_MS, 1);
        // Stall at 92% until the page is actually ready to be seen.
        paint(easeOutCubic(t) * (ready ? 100 : 92));

        if (t >= 1 && ready) return reveal();
        timer = setTimeout(step, 50);
      };

      step();
    }
  }

  /* ---------- Custom cursor ---------- */
  const dot = $("#cursorDot");
  const ring = $("#cursorRing");
  if (dot && ring && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let x = -100, y = -100, rx = -100, ry = -100;
    window.addEventListener("mousemove", (e) => {
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    });
    (function loop() {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
    $$("a, button, .swatch, .model-card").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
    });
  }

  /* ---------- Navbar scroll state ---------- */
  const nav = $("#navbar");
  const onScroll = () => nav && nav.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger");
  const mobileMenu = $("#mobileMenu");
  if (burger && mobileMenu) {
    const isOpen = () => mobileMenu.classList.contains("is-open");
    const toggle = (open) => {
      burger.classList.toggle("is-open", open);
      mobileMenu.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
      // Move focus with the menu so keyboard and screen-reader users follow it.
      // Safe to do synchronously: the panel's visibility flips immediately on
      // open (see .mobile-menu in styles.css).
      if (open) $$("a", mobileMenu)[0]?.focus();
      else if (mobileMenu.contains(document.activeElement)) burger.focus();
    };
    burger.addEventListener("click", () => toggle(!isOpen()));
    $$("a", mobileMenu).forEach((a) => a.addEventListener("click", () => toggle(false)));

    // Escape closes it, and it must not linger open past the responsive breakpoint.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) toggle(false);
    });
    window.addEventListener("resize", () => {
      if (isOpen() && window.innerWidth > 768) toggle(false);
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealObs = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-visible"); revealObs.unobserve(en.target); }
    }),
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => revealObs.observe(el));

  /* ---------- Animated counters ---------- */
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const dur = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
      el.textContent = (target * eased).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const countObs = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { animateCount(en.target); countObs.unobserve(en.target); }
    }),
    { threshold: 0.6 }
  );
  $$("[data-count]").forEach((el) => countObs.observe(el));

  /* ---------- Color configurator (SVG paint) ---------- */
  const car = $("#configCar");
  const halo = $("#configHalo");
  const nameEl = $("#configName");
  const stage = $(".configurator__stage");
  if (car && halo && nameEl) {
    const applySwatch = (sw) => {
      if (!sw) return;
      $(".swatch.is-active")?.classList.remove("is-active");
      sw.classList.add("is-active");
      // The swatches are colour-only, so expose the choice to assistive tech.
      $$(".swatch").forEach((b) => b.setAttribute("aria-pressed", String(b === sw)));
      const c = sw.dataset.color.replace("#", "");
      const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16));
      const lum = (r * 299 + g * 587 + b * 114) / 1000;
      // Pixel-perfect repaint: body panels + calipers read the --paint variable
      car.style.setProperty("--paint", sw.dataset.color);
      nameEl.textContent = sw.dataset.name;
      // Every finish except near-black tints the colour name and the CTA
      // gradient; Midnight Black keeps the default so text stays visible.
      const legible = lum > 25 ? sw.dataset.color : "";
      nameEl.style.color = legible;
      stage.closest(".configurator").style.setProperty("--paint-accent", legible);
      stage.style.setProperty("--halo", sw.dataset.color + "55");
      stage.classList.add("is-painted");
      // sheen sweep + subtle bounce on repaint
      car.classList.remove("is-sheen");
      void car.getBoundingClientRect(); // force reflow so the sweep restarts
      car.classList.add("is-sheen");
      car.style.transform = "scale(0.985)";
      setTimeout(() => (car.style.transform = ""), 180);
    };
    $$(".swatch").forEach((sw) => sw.addEventListener("click", () => applySwatch(sw)));
    applySwatch($(".swatch.is-active")); // initialize default paint
  }

  /* ---------- Reviews slider ---------- */
  const track = $("#sliderTrack");
  if (track) {
    const reviews = $$(".review", track);
    const dotsWrap = $("#sliderDots");
    let index = 0;
    let timer;
    let paused = false;

    reviews.forEach((_, i) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", `Go to review ${i + 1}`);
      b.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(b);
    });
    const dots = $$("button", dotsWrap);

    function goTo(i) {
      index = (i + reviews.length) % reviews.length;
      reviews.forEach((r, k) => {
        r.classList.toggle("is-active", k === index);
        // Reviews are stacked and only one is on screen, so keep the others
        // out of the accessibility tree instead of reading all three.
        r.setAttribute("aria-hidden", String(k !== index));
      });
      dots.forEach((d, k) => {
        d.classList.toggle("is-active", k === index);
        d.setAttribute("aria-current", String(k === index));
      });
      restart();
    }
    function restart() {
      clearInterval(timer);
      if (!prefersReduced && !paused) timer = setInterval(() => goTo(index + 1), 5500);
    }

    // Auto-rotation has to be interruptible (WCAG 2.2.2) — hold it while the
    // carousel is hovered or holds keyboard focus.
    const slider = $("#reviewSlider");
    if (slider) {
      const hold = (on) => { paused = on; restart(); };
      slider.addEventListener("mouseenter", () => hold(true));
      slider.addEventListener("mouseleave", () => hold(false));
      slider.addEventListener("focusin", () => hold(true));
      slider.addEventListener("focusout", (e) => {
        if (!slider.contains(e.relatedTarget)) hold(false);
      });
    }

    $("#prevReview").addEventListener("click", () => goTo(index - 1));
    $("#nextReview").addEventListener("click", () => goTo(index + 1));
    goTo(0);
  }

  /* ---------- 3D tilt on model cards ---------- */
  if (matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReduced) {
    $$("[data-tilt]").forEach((card) => {
      const strength = 8;
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * strength}deg) rotateX(${-py * strength}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => (card.style.transform = ""));
    });
  }

  /* ---------- Reserve form (demo) ---------- */
  const form = $("#reserveForm");
  const note = $("#formNote");
  if (form && note) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = $("input", form).value.trim();
      note.textContent = `⚡ Thanks! A confirmation is on its way to ${email}.`;
      form.reset();
      setTimeout(() => (note.textContent = ""), 5000);
    });
  }

  /* ---------- Parallax drift on hero content ---------- */
  if (!prefersReduced) {
    const heroContent = $(".hero__content");
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      if (y < window.innerHeight && heroContent) {
        heroContent.style.transform = `translateY(${y * 0.18}px)`;
        heroContent.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.7)));
      }
    }, { passive: true });
  }
})();
