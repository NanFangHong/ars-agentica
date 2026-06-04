import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const targetUrl = process.argv[2] || "http://127.0.0.1:4178/";
const outDir = path.resolve("qa-output");
const report = {
  targetUrl,
  generatedAt: new Date().toISOString(),
  screenshots: [],
  checks: [],
  issues: [],
};

const viewports = [
  {
    name: "desktop",
    viewport: { width: 1440, height: 1100 },
    shots: [
      ["hero", ".hero"],
      ["studio", "#thesis"],
      ["civilizational-claim", "#civilizational-claim"],
      ["attention", "#attention"],
      ["ignorance", "#ignorance"],
      ["cases", "#cases"],
      ["public-assay", "#public-assay"],
      ["scorecard", "#scorecard"],
      ["field-lab", "#field-lab"],
      ["checklist", "#checklist"],
    ],
  },
  {
    name: "mobile",
    viewport: { width: 390, height: 844 },
    shots: [
      ["hero", ".hero"],
      ["studio", "#thesis"],
      ["civilizational-claim", "#civilizational-claim"],
      ["attention", "#attention"],
      ["ignorance", "#ignorance"],
      ["cases", "#cases"],
      ["public-assay", "#public-assay"],
      ["scorecard", "#scorecard"],
      ["field-lab", "#field-lab"],
      ["checklist", "#checklist"],
    ],
  },
];

const anchorIds = [
  "thesis",
  "civilizational-claim",
  "attention",
  "ignorance",
  "cases",
  "public-assay",
  "scorecard",
  "field-lab",
  "checklist",
];

async function stabilizePage(page) {
  await page.waitForLoadState("load");
  await page.waitForTimeout(350);
  await page.evaluate(() => {
    document.querySelectorAll("[data-reveal]").forEach((element) => element.classList.add("is-visible"));
    document.querySelectorAll("[data-animate]").forEach((element) => element.classList.add("is-active"));
    if (!document.querySelector("[data-qa-style]")) {
      const style = document.createElement("style");
      style.dataset.qaStyle = "true";
      style.textContent = "html{scroll-behavior:auto!important}.reading-meter{display:none!important}";
      document.head.appendChild(style);
    }
  });
}

async function scanLayout(page, label) {
  const result = await page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const revealOpacityIssues = [...document.querySelectorAll("[data-reveal]")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0 && rect.height > 0;
        return visible && Number.parseFloat(getComputedStyle(element).opacity) < 0.98;
      })
      .map((element) => ({
        tag: element.tagName,
        className: String(element.className),
        text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
        opacity: getComputedStyle(element).opacity,
      }));

    const textElements = [...document.querySelectorAll("h1,h2,h3,p,li,dt,dd")]
      .map((element) => ({ element, rect: element.getBoundingClientRect() }))
      .filter(({ element, rect }) => {
        const text = (element.textContent || "").trim();
        return text && rect.width > 2 && rect.height > 2 && rect.bottom > 0 && rect.top < window.innerHeight;
      });

    const overlaps = [];
    for (let i = 0; i < textElements.length; i += 1) {
      for (let j = i + 1; j < textElements.length; j += 1) {
        const a = textElements[i];
        const b = textElements[j];
        if (a.element.contains(b.element) || b.element.contains(a.element)) {
          continue;
        }
        const xOverlap = Math.max(0, Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left));
        const yOverlap = Math.max(0, Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top));
        if (xOverlap > 8 && yOverlap > 8) {
          overlaps.push({
            a: (a.element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60),
            b: (b.element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60),
          });
        }
      }
    }

    const visibleText = [...document.querySelectorAll("body *")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 2 && rect.height > 2;
      })
      .map((element) => element.textContent || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return {
      overflow,
      revealOpacityIssues,
      overlaps: overlaps.slice(0, 8),
      visibleTextLength: visibleText.length,
    };
  });

  report.checks.push({ label, ...result });
  if (result.overflow > 0) {
    report.issues.push(`${label}: horizontal overflow ${result.overflow}px`);
  }
  if (result.revealOpacityIssues.length > 0) {
    report.issues.push(`${label}: visible reveal elements below opacity 0.98`);
  }
  if (result.overlaps.length > 0) {
    report.issues.push(`${label}: possible text overlap`);
  }
  if (result.visibleTextLength < 80) {
    report.issues.push(`${label}: viewport appears mostly blank`);
  }
}

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

for (const config of viewports) {
  const page = await browser.newPage({ viewport: config.viewport, deviceScaleFactor: 1 });
  await page.goto(targetUrl, { waitUntil: "load", timeout: 45000 });
  await stabilizePage(page);
  await scanLayout(page, `${config.name}:initial`);

  for (const [name, selector] of config.shots) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await scanLayout(page, `${config.name}:${name}`);
    const screenshotPath = path.join(outDir, `${config.name}-${name}.png`);
    await page.locator(selector).screenshot({ path: screenshotPath, animations: "disabled" });
    report.screenshots.push(screenshotPath);
  }

  for (const anchorId of anchorIds) {
    await page.goto(targetUrl, { waitUntil: "load", timeout: 45000 });
    await stabilizePage(page);
    const navLink = page.locator(`.chapter-nav a[href="#${anchorId}"]`);
    if ((await navLink.count()) === 1 && (await navLink.isVisible())) {
      await navLink.click();
    } else {
      await page.evaluate((id) => {
        window.location.hash = id;
        document.getElementById(id)?.scrollIntoView({ block: "start" });
      }, anchorId);
    }
    await page.waitForTimeout(600);
    const anchorResult = await page.evaluate((id) => {
      const target = document.getElementById(id);
      if (!target) {
        return { id, exists: false };
      }
      const rect = target.getBoundingClientRect();
      const visibleText = target.innerText.trim().replace(/\s+/g, " ");
      return {
        id,
        exists: true,
        top: Math.round(rect.top),
        visibleTextLength: visibleText.length,
      };
    }, anchorId);
    report.checks.push({ label: `${config.name}:anchor:${anchorId}`, ...anchorResult });
    if (!anchorResult.exists) {
      report.issues.push(`${config.name}: anchor #${anchorId} missing`);
    } else if (Math.abs(anchorResult.top) > 180) {
      report.issues.push(`${config.name}: anchor #${anchorId} landed at ${anchorResult.top}px`);
    } else if (anchorResult.visibleTextLength < 80) {
      report.issues.push(`${config.name}: anchor #${anchorId} has little text`);
    }
  }

  await page.close();
}

await browser.close();
await writeFile(path.join(outDir, "visual-qa-report.json"), `${JSON.stringify(report, null, 2)}\n`);

if (report.issues.length > 0) {
  console.error(report.issues.join("\n"));
  process.exit(1);
}

console.log(`Visual QA passed. ${report.screenshots.length} screenshots written to ${outDir}.`);
