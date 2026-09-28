import assert from "node:assert/strict";
import { mkdir, readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { chromium, expect as baseExpect } from "@playwright/test";

const expect = baseExpect.configure({ timeout: 20000 });

const root = fileURLToPath(new URL("../", import.meta.url));
const assets = join(root, ".vercel/output/static/assets");
const output = join(root, "coverage/phase2");
const origin = "http://127.0.0.1:4175";

const gsapFiles = [];

for (const name of await readdir(assets)) {
  if (name.endsWith(".js") && /GSAP|GreenSock/.test(await readFile(join(assets, name), "utf8"))) {
    gsapFiles.push(`/assets/${name}`);
  }
}

assert.equal(gsapFiles.length, 1, "GSAP must remain a separate lazy-loaded chunk");

await mkdir(output, { recursive: true });

// Start the preview server before running these tests.
// npm run preview -- --host 127.0.0.1 --port 4175 --strictPort

const browser = await chromium.launch({
  channel: process.env.PHASE2_BROWSER_CHANNEL || "msedge",
  headless: true,
});

let passed = 0;
const hydrationErrors = [];

async function context(options = {}) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    ...options,
    serviceWorkers: "block",
  });

  ctx.setDefaultNavigationTimeout(60000);

  // Prevent requests to external services.
  await ctx.route("**/*", (route) => {
    const url = new URL(route.request().url());

    return url.origin === origin ? route.continue() : route.abort();
  });

  await ctx.routeWebSocket("**/*", (socket) => {
    socket.close();
  });

  ctx.on("page", (page) => {
    page.on("pageerror", (error) => {
      hydrationErrors.push(error.message);
    });

    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        /hydration|hydrating|Minified React error/i.test(message.text())
      ) {
        hydrationErrors.push(message.text());
      }
    });
  });

  return ctx;
}

async function check(name, fn) {
  const filter = process.env.PHASE2_TEST_FILTER;

  if (filter && !name.includes(filter)) {
    return;
  }

  console.log(`RUN ${name}`);

  const previousErrors = hydrationErrors.length;

  await fn();

  assert.deepEqual(
    hydrationErrors.slice(previousErrors),
    [],
    `${name}: browser runtime or hydration errors`,
  );

  passed++;

  console.log(`PASS ${name}`);
}

try {
  await check("intro displays original logo and closes within five seconds", async () => {
    const ctx = await context();

    try {
      const page = await ctx.newPage();

      await page.goto(origin, {
        waitUntil: "domcontentloaded",
      });

      const intro = page.locator("dialog.site-intro");

      await expect(intro).toHaveAttribute("open", "");

      const started = Date.now();

      await expect(
        intro.getByRole("button", {
          name: "Skip Intro",
        }),
      ).toBeVisible();

      await expect(intro.locator("img")).toHaveJSProperty("naturalWidth", 1254);

      await expect(intro.locator(".site-intro-emblem")).toHaveCSS("opacity", "1", {
        timeout: 4000,
      });

      await expect(intro.locator(".site-intro-word").last()).toHaveCSS("opacity", "1", {
        timeout: 2000,
      });

      await page.screenshot({
        path: join(output, "intro.png"),
      });

      await expect(intro).not.toHaveAttribute("open", "", { timeout: 5000 });

      assert.ok(
        Date.now() - started < 7000,
        "Intro exceeded the test deadline, including browser overhead",
      );

      await page.screenshot({
        path: join(output, "desktop.png"),
      });

      await page.locator("footer").scrollIntoViewIfNeeded();

      await page.screenshot({
        path: join(output, "footer.png"),
      });
    } finally {
      await ctx.close();
    }
  });

  await check("skip, navigation, and reload retain the session claim", async () => {
    const ctx = await context();

    try {
      const page = await ctx.newPage();

      await page.goto(origin, {
        waitUntil: "domcontentloaded",
      });

      await page
        .getByRole("button", {
          name: "Skip Intro",
        })
        .click();

      await expect(page.locator("dialog.site-intro")).not.toHaveAttribute("open", "");

      const nav = page.getByRole("navigation", {
        name: "Main navigation",
        exact: true,
      });

      await nav
        .getByRole("link", {
          name: "About",
          exact: true,
        })
        .click();

      await expect(page).toHaveURL(`${origin}/about`);

      await nav
        .getByRole("link", {
          name: "Home",
          exact: true,
        })
        .click();

      await expect(page).toHaveURL(`${origin}/`);

      await expect(page.locator("dialog.site-intro")).not.toHaveAttribute("open", "");

      await page.reload({
        waitUntil: "load",
      });

      await expect(page.locator("dialog.site-intro")).not.toHaveAttribute("open", "");
    } finally {
      await ctx.close();
    }
  });

  await check("Escape dismisses intro and restores usable page", async () => {
    const ctx = await context();

    try {
      const page = await ctx.newPage();

      await page.goto(origin, {
        waitUntil: "domcontentloaded",
      });

      await expect(page.locator("dialog.site-intro")).toHaveAttribute("open", "");

      await page.keyboard.press("Escape");

      await expect(page.locator("dialog.site-intro")).not.toHaveAttribute("open", "");

      await page
        .getByRole("navigation", {
          name: "Main navigation",
          exact: true,
        })
        .getByRole("link", {
          name: "Contact",
          exact: true,
        })
        .click();

      await expect(page).toHaveURL(`${origin}/contact`);
    } finally {
      await ctx.close();
    }
  });

  await check("reduced motion skips intro and live preference changes dismiss it", async () => {
    const ctx = await context({
      reducedMotion: "reduce",
    });

    try {
      const page = await ctx.newPage();

      await page.goto(origin, {
        waitUntil: "load",
      });

      await expect(page.locator("dialog.site-intro")).not.toHaveAttribute("open", "");
    } finally {
      await ctx.close();
    }

    const other = await context();

    try {
      const next = await other.newPage();

      await next.goto(origin, {
        waitUntil: "domcontentloaded",
      });

      await expect(next.locator("dialog.site-intro")).toHaveAttribute("open", "");

      await next.emulateMedia({
        reducedMotion: "reduce",
      });

      await expect(next.locator("dialog.site-intro")).not.toHaveAttribute("open", "");
    } finally {
      await other.close();
    }
  });

  await check("failed GSAP download cannot block the homepage", async () => {
    const ctx = await context();

    try {
      let blocked = 0;

      await ctx.route(
        (url) => gsapFiles.includes(url.pathname),
        (route) => {
          blocked++;
          return route.abort();
        },
      );

      const page = await ctx.newPage();

      await page.goto(origin, {
        waitUntil: "load",
      });

      await expect(page.locator("dialog.site-intro")).not.toHaveAttribute("open", "", {
        timeout: 5000,
      });

      await expect(page.locator("main")).toBeVisible();

      assert.equal(blocked, 1, "Expected one blocked GSAP download");
    } finally {
      await ctx.close();
    }
  });

  await check("blocked session storage still permits skip and ordinary navigation", async () => {
    const ctx = await context();

    try {
      await ctx.addInitScript(() => {
        Object.defineProperty(window, "sessionStorage", {
          configurable: true,
          get() {
            throw new DOMException("Blocked", "SecurityError");
          },
        });
      });

      const page = await ctx.newPage();

      await page.goto(origin, {
        waitUntil: "domcontentloaded",
      });

      await page
        .getByRole("button", {
          name: "Skip Intro",
        })
        .click();

      const nav = page.getByRole("navigation", {
        name: "Main navigation",
        exact: true,
      });

      await nav
        .getByRole("link", {
          name: "About",
          exact: true,
        })
        .click();

      await nav
        .getByRole("link", {
          name: "Home",
          exact: true,
        })
        .click();

      await expect(page.locator("dialog.site-intro")).not.toHaveAttribute("open", "");
    } finally {
      await ctx.close();
    }
  });

  for (const width of [320, 390, 768, 1440]) {
    await check(`responsive navigation at ${width}px`, async () => {
      const ctx = await context({
        viewport: {
          width,
          height: 900,
        },
        reducedMotion: "reduce",
      });

      try {
        const page = await ctx.newPage();

        await page.goto(`${origin}/about`, {
          waitUntil: "load",
        });

        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
          `Horizontal overflow at ${width}px`,
        );

        const mobile = page.getByRole("button", {
          name: "Open navigation",
        });

        if (width < 1280) {
          await mobile.click();

          const dialog = page.getByRole("dialog", {
            name: "Navigation",
            exact: true,
          });

          await expect(dialog).toBeVisible();

          await expect(dialog.getByRole("navigation").getByRole("link")).toHaveCount(9);

          for (let i = 0; i < 15; i++) {
            await page.keyboard.press("Tab");

            assert.ok(
              await dialog.evaluate((element) => element.contains(document.activeElement)),
              "Keyboard focus escaped the navigation dialog",
            );
          }

          await page.keyboard.press("Escape");

          await expect(dialog).not.toBeVisible();

          await expect(mobile).toBeFocused();

          await mobile.click();

          if (width === 390) {
            await page.screenshot({
              path: join(output, "mobile-menu.png"),
            });
          }

          await dialog
            .getByRole("navigation")
            .getByRole("link", {
              name: "Sermons",
              exact: true,
            })
            .click();

          await expect(page).toHaveURL(`${origin}/sermons`);

          await expect(dialog).not.toBeVisible();
        } else {
          await expect(mobile).not.toBeVisible();

          await expect(page.locator('.site-desktop-nav a[aria-current="page"]')).toHaveText(
            "About",
          );
        }

        if (width === 390) {
          await page.screenshot({
            path: join(output, "mobile-page.png"),
          });
        }
      } finally {
        await ctx.close();
      }
    });
  }

  await check("direct public/account routes and refreshes preserve access", async () => {
    const ctx = await context({
      reducedMotion: "reduce",
    });

    try {
      const page = await ctx.newPage();

      const paths = [
        "/",
        "/about",
        "/sermons",
        "/live",
        "/events",
        "/gallery",
        "/testimonies",
        "/blog",
        "/contact",
        "/church-admin-secure",
        "/Church-admin-secure",
        "/reset-password",
      ];

      for (const path of paths) {
        const response = await page.goto(`${origin}${path}`, {
          waitUntil: "load",
        });

        assert.ok(response, `${path}: no navigation response`);

        assert.equal(response.status(), 200, path);

        const refresh = await page.reload({
          waitUntil: "load",
        });

        assert.ok(refresh, `${path}: no refresh response`);

        assert.equal(refresh.status(), 200, `${path} refresh`);

        await expect(page.locator("main")).toBeVisible();

        await expect(page.locator("dialog.site-intro[open]")).toHaveCount(0);

        if (/admin|password/i.test(path)) {
          await expect(page.locator(".site-header, .site-footer, .site-intro")).toHaveCount(0);
        }
      }

      const missing = await page.goto(`${origin}/phase2-missing-page`);

      assert.ok(missing, "404 navigation returned no response");

      assert.equal(missing.status(), 404);

      await expect(
        page.getByRole("heading", {
          name: "404",
          exact: true,
        }),
      ).toBeVisible();

      const sitemap = await ctx.request.get(`${origin}/sitemap.xml`);

      assert.equal(sitemap.status(), 200);

      const sitemapText = await sitemap.text();

      assert.equal((sitemapText.match(/<loc>/g) ?? []).length, 9);
    } finally {
      await ctx.close();
    }
  });

  await check("SSR remains readable with JavaScript disabled", async () => {
    const ctx = await context({
      javaScriptEnabled: false,
    });

    try {
      const page = await ctx.newPage();

      await page.goto(origin, {
        waitUntil: "domcontentloaded",
      });

      await expect(page.locator("main")).toBeVisible();

      assert.equal(
        await page.locator("main").evaluate((element) => getComputedStyle(element).opacity),
        "1",
      );

      await expect(page.locator("dialog.site-intro")).not.toBeVisible();

      await page
        .getByRole("navigation", {
          name: "Main navigation",
          exact: true,
        })
        .getByRole("link", {
          name: "About",
          exact: true,
        })
        .click();

      await expect(page).toHaveURL(`${origin}/about`);

      await expect(
        page.getByRole("heading", {
          level: 1,
        }),
      ).toBeVisible();
    } finally {
      await ctx.close();
    }
  });

  assert.deepEqual(hydrationErrors, [], "Browser runtime/hydration errors");

  assert.ok(passed > 0, "PHASE2_TEST_FILTER did not match any scenarios");

  console.log(`${passed} browser scenarios passed; no runtime or hydration errors.`);
} finally {
  await browser.close();
}
