document.documentElement.classList.add("js");

const meter = document.querySelector(".reading-meter span");
const navLinks = [...document.querySelectorAll(".chapter-nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wheel = document.querySelector(".alchemy-wheel");
const stageTargets = [...document.querySelectorAll("[data-stage]")];

function updateActiveStage() {
  if (!wheel || stageTargets.length === 0) {
    return;
  }

  const viewportMiddle = window.innerHeight * 0.46;
  let activeStage = wheel.dataset.activeStage || "lens";
  let closest = Number.POSITIVE_INFINITY;

  for (const target of stageTargets) {
    const rect = target.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height * 0.3 - viewportMiddle);
    const isNearViewport = rect.bottom > 0 && rect.top < window.innerHeight;
    if (isNearViewport && distance < closest) {
      closest = distance;
      activeStage = target.dataset.stage;
    }
  }

  wheel.dataset.activeStage = activeStage;
}

function updateReadingState() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? scrollTop / docHeight : 0;
  if (meter) {
    meter.style.width = `${Math.min(1, Math.max(0, progress)) * 100}%`;
  }

  let activeId = "";
  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 130) {
      activeId = section.id;
    }
  }

  for (const link of navLinks) {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
  }

  updateActiveStage();
}

function prepareRevealDelays() {
  for (const groupSelector of [
    ".tool-row",
    ".scorecard-grid",
    ".case-stack",
    ".skill-comparison",
    ".case-file-grid",
    ".stakes-ledger",
    ".objection-grid",
    ".practice-steps",
  ]) {
    for (const group of document.querySelectorAll(groupSelector)) {
      [...group.querySelectorAll("[data-reveal]")].forEach((item, index) => {
        item.style.transitionDelay = `${Math.min(index * 90, 360)}ms`;
      });
    }
  }
}

function revealVisibleNow() {
  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  const margin = window.innerHeight * 0.18;

  for (const item of revealItems) {
    const rect = item.getBoundingClientRect();
    if (rect.bottom >= -margin && rect.top <= window.innerHeight + margin) {
      item.classList.add("is-visible");
    }
  }
}

function setupScrollReveals() {
  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  const animatedGroups = [...document.querySelectorAll("[data-animate]")];

  if (reducedMotion || !("IntersectionObserver" in window)) {
    for (const item of revealItems) {
      item.classList.add("is-visible");
      item.style.transitionDelay = "0ms";
    }
    for (const group of animatedGroups) {
      group.classList.add("is-active");
    }
    return;
  }

  prepareRevealDelays();

  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px 10% 0px", threshold: 0.01 },
  );

  for (const item of revealItems) {
    revealObserver.observe(item);
  }

  const groupObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("is-active", entry.isIntersecting);
      }
    },
    { rootMargin: "-10% 0px -45% 0px", threshold: 0.2 },
  );

  for (const group of animatedGroups) {
    groupObserver.observe(group);
  }

  revealVisibleNow();
}

window.addEventListener("scroll", updateReadingState, { passive: true });
window.addEventListener("resize", updateReadingState);
window.addEventListener("hashchange", () => window.requestAnimationFrame(revealVisibleNow));
window.addEventListener("pageshow", revealVisibleNow);
updateReadingState();
setupScrollReveals();
updateActiveStage();
