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

  /* ---------- Preloader ---------- */
  const preloader = $("#preloader");
  const hidePreloader = () => {
    if (!preloader) return;
    preloader.classList.add("is-done");
    setTimeout(() => preloader.remove(), 800);
  };
  window.addEventListener("load", () => setTimeout(hidePreloader, 900));
  setTimeout(hidePreloader, 4000); // safety net

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
    const toggle = (open) => {
      burger.classList.toggle("is-open", open);
      mobileMenu.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => toggle(!mobileMenu.classList.contains("is-open")));
    $$("a", mobileMenu).forEach((a) => a.addEventListener("click", () => toggle(false)));
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

  /* ---------- Color configurator ---------- */
  const car = $("#configCar");
  const halo = $("#configHalo");
  const nameEl = $("#configName");
  const stage = $(".configurator__stage");
  if (car && halo && nameEl) {
    const tint = $("#configTint");
    const applySwatch = (sw) => {
      $(".swatch.is-active")?.classList.remove("is-active");
      sw.classList.add("is-active");
      // Real "repaint": grayscale base image + color blend layer
      if (tint) {
        tint.style.setProperty("--paint", sw.dataset.color);
        tint.style.setProperty("--paint-strength", sw.dataset.strength || "0.9");
      }
      nameEl.textContent = sw.dataset.name;
      nameEl.style.color = sw.dataset.color;
      stage.style.setProperty("--halo", sw.dataset.color + "55");
      stage.classList.add("is-painted");
      // little bounce on the car
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

    reviews.forEach((_, i) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", `Go to review ${i + 1}`);
      b.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(b);
    });
    const dots = $$("button", dotsWrap);

    function goTo(i) {
      index = (i + reviews.length) % reviews.length;
      reviews.forEach((r, k) => r.classList.toggle("is-active", k === index));
      dots.forEach((d, k) => d.classList.toggle("is-active", k === index));
      restart();
    }
    function restart() {
      clearInterval(timer);
      if (!prefersReduced) timer = setInterval(() => goTo(index + 1), 5500);
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
