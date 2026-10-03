import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";

const origin = "http://127.0.0.1:5173";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const errors = [];
const checks = [];
await mkdir("coverage/phase3", { recursive: true });
async function prepare(options = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    serviceWorkers: "block",
    ...options,
  });
  await context.route("**/*", (route) =>
    /supabase\.(co|in)/.test(route.request().url()) ||
    !["GET", "HEAD"].includes(route.request().method())
      ? route.abort()
      : route.continue(),
  );
  await context.routeWebSocket(/supabase\.(co|in)/, (socket) => socket.close());
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  page.setDefaultNavigationTimeout(120000);
  page.on("pageerror", (error) => errors.push(error.message));
  return { context, page };
}
try {
  for (const width of [320, 390, 768, 1440]) {
    const { context, page } = await prepare({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    await page.goto(origin, { waitUntil: "domcontentloaded" });
    await page.locator(".home-sermons .home-data-state:not(.home-data-state--loading)").waitFor();
    assert.equal(await page.locator(".home-hero h1").count(), 1);
    assert.equal(
      await page.locator(".home-hero video, .home-slide-controls, .home-slide-button").count(),
      0,
    );
    assert.equal(await page.locator(".site-intro[open]").count(), 0);
    assert.equal(await page.getByRole("button", { name: /animation/ }).count(), 0);
    await page.waitForFunction(() => {
      const img = document.querySelector(".home-hero-slide img");
      return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0;
    });
    assert.equal(
      await page.locator(".home-hero-slide").nth(2).locator("img").getAttribute("src"),
      "/images/home/clouds.jpg",
    );
    const heroBox = await page.locator(".home-hero").boundingBox();
    const imageBox = await page.locator(".home-hero-media").boundingBox();
    assert.equal(imageBox.x, heroBox.x);
    assert.equal(imageBox.width, heroBox.width);
    assert.ok(imageBox.height >= heroBox.height, "Image covers hero height");
    const portrait = await page.locator(".home-portrait-media").boundingBox();
    const caption = await page.locator(".home-welcome-portrait figcaption").boundingBox();
    assert.ok(
      caption.y >= portrait.y + portrait.height - 1,
      "Pastor caption sits below photograph",
    );
    assert.equal(
      await page.locator(".site-footer nav, .site-footer address, .site-footer dl").count(),
      0,
    );
    assert.equal(await page.locator(".site-footer img").count(), 1);
    assert.equal(await page.locator(".site-footer p").count(), 1);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
      `overflow at ${width}`,
    );
    await page.clock.install();
    await page.clock.fastForward(10000);
    await expect(page.locator(".home-hero-slide").first()).toHaveAttribute("data-active", "true");
    await page
      .locator(".home-hero")
      .getByRole("link", { name: "Plan your visit", exact: true })
      .click();
    await expect(page.locator(".site-header")).toHaveAttribute("data-scrolled", "true");
    if (width < 1280) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page.getByRole("navigation", { name: "Mobile navigation" }).waitFor();
      assert.equal(
        await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link").count(),
        9,
      );
      await page.keyboard.press("Escape");
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .waitFor({ state: "hidden" });
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `coverage/phase3/hero-${width}.png`, animations: "disabled" });
    await page.screenshot({
      path: `coverage/phase3/home-${width}.png`,
      fullPage: true,
      animations: "disabled",
    });
    if (width === 1440) {
      for (const path of [
        "/about",
        "/sermons",
        "/live",
        "/events",
        "/gallery",
        "/testimonies",
        "/blog",
        "/contact",
        "/church-admin-secure",
        "/reset-password",
      ]) {
        const response = await page.goto(origin + path, { waitUntil: "domcontentloaded" });
        assert.equal(response.status(), 200, path);
        assert.equal(await page.locator(".rpgm-home").count(), 0);
        if (!["/church-admin-secure", "/reset-password"].includes(path)) {
          const glass = await page.locator(".site-header").evaluate((el) => ({
            background: getComputedStyle(el).backgroundColor,
            blur: getComputedStyle(el).backdropFilter,
          }));
          assert.match(glass.background, /rgba\(255, 255, 255,/);
          assert.notEqual(glass.blur, "none");
          assert.equal(await page.locator(".site-footer p").count(), 1);
        } else assert.equal(await page.locator(".site-header, .site-footer").count(), 0);
      }
    }
    checks.push(
      `${width}px: full-cover image, no overflow, caption below portrait, minimal footer, reduced motion and navigation`,
    );
    await context.close();
  }
  const { context, page } = await prepare();
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  await page.locator(".site-intro[open]").waitFor();
  await page.getByRole("button", { name: /skip intro/i }).click();
  await page.locator(".site-intro[open]").waitFor({ state: "hidden" });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Pause animation", exact: true }).click();
  assert.equal(await page.locator(".site-intro[open]").count(), 0);
  assert.equal(await page.locator(".home-slideshow-toggle svg").count(), 0);
  const start =
    Number(
      await page
        .locator(".home-hero-slide[data-active=true]")
        .getAttribute("aria-label")
        .then((label) => label.split(" ")[0]),
    ) - 1;
  await page.clock.install();
  await page.getByRole("button", { name: "Resume animation", exact: true }).click();
  await page.clock.runFor(100);
  await page.clock.fastForward(2500);
  await expect(page.locator(".home-hero-slide").nth(start)).toHaveAttribute("data-active", "true");
  await page.clock.fastForward(500);
  await expect(page.locator(".home-hero-slide").nth((start + 1) % 3)).toHaveAttribute(
    "data-active",
    "true",
  );
  await page.clock.fastForward(3000);
  await expect(page.locator(".home-hero-slide").nth((start + 2) % 3)).toHaveAttribute(
    "data-active",
    "true",
  );
  await page.getByRole("button", { name: "Pause animation", exact: true }).click();
  await page.clock.fastForward(10000);
  await expect(page.locator(".home-hero-slide").nth((start + 2) % 3)).toHaveAttribute(
    "data-active",
    "true",
  );
  await page.screenshot({ path: "coverage/phase3/clouds-desktop.png", animations: "disabled" });
  checks.push(
    "Three-second rotation, text-only pause, intro/session behavior; white public headers and untouched account shell",
  );
  await context.close();
  assert.deepEqual(errors, [], "Browser runtime errors");
  console.log(JSON.stringify({ checks, runtimeErrors: errors }, null, 2));
} finally {
  if (errors.length) console.log(JSON.stringify({ runtimeErrors: errors }));
  await browser.close();
}
