(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hero loop: a random one each visit, never the same twice in a row ---------- */

  const LOOPS = 5;
  const heroVideo = document.querySelector(".hero-bg");

  if (heroVideo) {
    let last = 0;
    try { last = Number(localStorage.getItem("lastLoop")); } catch (_) { /* storage blocked */ }
    let pick;
    do { pick = 1 + Math.floor(Math.random() * LOOPS); } while (pick === last && LOOPS > 1);
    try { localStorage.setItem("lastLoop", pick); } catch (_) { /* storage blocked */ }

    const base = `assets/loops/loop-${pick}`;
    heroVideo.poster = `${base}.jpg`;
    heroVideo.style.backgroundImage = `url(${base}.jpg)`;

    const saveData = navigator.connection && navigator.connection.saveData;
    if (reducedMotion || saveData) {
      heroVideo.classList.add("is-ready");
    } else {
      heroVideo.src = `${base}.mp4`;
      heroVideo.addEventListener("canplay", () => heroVideo.classList.add("is-ready"), { once: true });
      heroVideo.play().catch(() => heroVideo.classList.add("is-ready"));
    }
  }

  /* ---------- Nav state, scroll playhead and timecode ---------- */

  const nav = document.querySelector(".nav");
  const playhead = document.querySelector(".playhead span");
  const timecode = document.querySelector(".timecode");
  const FPS = 24;
  const PAGE_SECONDS = 60; // the full scroll maps to one minute of "footage"

  const pad = (n) => String(n).padStart(2, "0");
  const toTimecode = (seconds) => {
    const frames = Math.floor(seconds * FPS);
    const f = frames % FPS;
    const s = Math.floor(frames / FPS) % 60;
    const m = Math.floor(frames / FPS / 60) % 60;
    return `00:${pad(m)}:${pad(s)}:${pad(f)}`;
  };

  let ticking = false;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    playhead.style.setProperty("--progress", progress);
    timecode.textContent = toTimecode(progress * PAGE_SECONDS);
    nav.classList.toggle("is-solid", window.scrollY > 40);
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- In-page links scroll without adding #section to the URL ---------- */

  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.hash);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      if (link.classList.contains("skip")) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);

  /* ---------- Highlight the nav link for the section in view ---------- */

  const navLinks = [...document.querySelectorAll(".nav nav a")];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-current", a.hash === `#${entry.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => sectionObserver.observe(s));

  /* ---------- Reveal on scroll ---------- */

  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- Work filters ---------- */

  const chips = [...document.querySelectorAll(".chip")];
  const cards = [...document.querySelectorAll(".card")];

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;
      chips.forEach((c) => {
        const active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-pressed", active);
      });
      cards.forEach((card, i) => {
        const show = filter === "all" || card.dataset.cat.split(" ").includes(filter);
        card.classList.toggle("is-hidden", !show);
        card.classList.remove("is-entering");
        if (show && !reducedMotion) {
          void card.offsetWidth; // restart the animation
          card.style.animationDelay = `${Math.min(i, 8) * 40}ms`;
          card.classList.add("is-entering");
        }
      });
    });
  });

  /* ---------- Video player ---------- */

  const player = document.querySelector(".player");
  const frame = player.querySelector(".player-frame");

  const openVideo = (id, title) => {
    const params = new URLSearchParams({ autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1 });
    frame.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${params}`;
    iframe.title = title;
    iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    iframe.allowFullscreen = true;
    frame.appendChild(iframe);
    player.showModal();
  };

  cards.forEach((card) => {
    card.querySelector("a").addEventListener("click", (e) => {
      // let cmd/ctrl/shift-click open YouTube in a new tab as normal
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      openVideo(card.dataset.id, card.querySelector("h3").textContent);
    });
  });

  player.querySelector(".player-close").addEventListener("click", () => player.close());
  player.addEventListener("click", (e) => { if (e.target === player) player.close(); });
  player.addEventListener("close", () => { frame.innerHTML = ""; });

  /* ---------- Footer year ---------- */

  document.getElementById("year").textContent = new Date().getFullYear();
})();
