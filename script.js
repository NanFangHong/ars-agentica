const meter = document.querySelector(".reading-meter span");
const navLinks = [...document.querySelectorAll(".chapter-nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function updateReadingState() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? scrollTop / docHeight : 0;
  meter.style.width = `${Math.min(1, Math.max(0, progress)) * 100}%`;

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
}

window.addEventListener("scroll", updateReadingState, { passive: true });
window.addEventListener("resize", updateReadingState);
updateReadingState();
