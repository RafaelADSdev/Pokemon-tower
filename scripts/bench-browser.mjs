import { mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { basename, dirname, extname, join, resolve, sep } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const [playwrightPath, chromePath] = process.argv.slice(2);
if (!playwrightPath || !chromePath) {
  throw new Error("Usage: node scripts/bench-browser.mjs <path to playwright-core> <path to Chrome>");
}

const require = createRequire(import.meta.url);
const { chromium, devices } = require(resolve(playwrightPath));
const vitestRequire = createRequire(require.resolve("vitest/package.json"));
const { build } = await import(pathToFileURL(vitestRequire.resolve("vite")).href);
const project = fileURLToPath(new URL("../", import.meta.url));
const temporaryRoot = await realpath(tmpdir());
const fixturePrefix = "critter-browser-bench-";
const output = await mkdtemp(join(temporaryRoot, fixturePrefix));
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".glb": "model/gltf-binary",
};
const fixture = createServer(async (request, response) => {
  const { pathname } = new URL(request.url, "http://127.0.0.1");
  const file = resolve(output, pathname === "/" ? "index.html" : `.${pathname}`);
  if (!file.startsWith(output + sep)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const bytes = await readFile(file);
    response.writeHead(200, { "content-type": contentTypes[extname(file)] ?? "application/octet-stream" });
    response.end(bytes);
  } catch {
    response.writeHead(404).end();
  }
});

let browser;
try {
  await build({
    configFile: false,
    root: join(project, "scripts", "bench-scene"),
    publicDir: join(project, "public"),
    resolve: { alias: { "@": join(project, "src") } },
    oxc: { jsx: { runtime: "automatic" } },
    build: { outDir: output, emptyOutDir: false, reportCompressedSize: false },
    logLevel: "error",
  });
  await new Promise((resolve) => fixture.listen(0, "127.0.0.1", resolve));
  const fixtureUrl = `http://127.0.0.1:${fixture.address().port}/`;
  const milliseconds = Number(process.env.CRITTER_BENCHMARK_MS ?? 8_000);
  if (!Number.isFinite(milliseconds) || milliseconds < 3_000 || milliseconds > 30_000) {
    throw new Error("CRITTER_BENCHMARK_MS must be between 3000 and 30000.");
  }
  browser = await chromium.launch({
    executablePath: resolve(chromePath),
    args: [
      "--enable-webgl",
      "--enable-unsafe-swiftshader",
      ...JSON.parse(process.env.CRITTER_CHROME_FLAGS ?? "[]"),
    ],
  });

  for (const [profile, options] of [
    ["desktop", { viewport: { width: 1440, height: 900 } }],
    ["pixel-7-emulation", devices["Pixel 7"]],
  ]) {
    const page = await browser.newPage(options);
    const throttle = Number(process.env.CRITTER_MOBILE_CPU_THROTTLE ?? 1);
    if (profile === "pixel-7-emulation" && throttle > 1) {
      const devtools = await page.context().newCDPSession(page);
      await devtools.send("Emulation.setCPUThrottlingRate", { rate: throttle });
    }
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (entry) => { if (entry.type() === "error") errors.push(entry.text()); });
    await page.goto(fixtureUrl, { waitUntil: "networkidle" });
    await page.locator("canvas").waitFor();
    await page.waitForTimeout(1_800);
    const result = await page.evaluate((duration) => window.measureCritterScene(duration), milliseconds);
    console.log(JSON.stringify({
      profile,
      milliseconds,
      cpuThrottle: profile === "pixel-7-emulation" ? throttle : 1,
      ...result,
      errors,
    }, null, 2));
    if (errors.length || result.minimumEnemies !== 300 || result.maximumEnemies !== 300) process.exitCode = 1;
    await page.close();
  }

  if (process.env.CRITTER_APP_URL) {
    for (const route of ["/", "/play/forest"]) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      const url = new URL(route, process.env.CRITTER_APP_URL);
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("response", (response) => {
        if (response.status() >= 400 && new URL(response.url()).pathname.endsWith(".js")) {
          errors.push(`${response.status()} ${response.url()}`);
        }
      });
      const response = await page.goto(url.href, { waitUntil: "domcontentloaded" });
      if (!response?.ok()) throw new Error(`Could not load ${url.href} for transfer measurement.`);
      if (route !== "/") await page.locator("canvas").waitFor({ timeout: 15_000 });
      await page.waitForLoadState("networkidle");
      const transfer = await page.evaluate(() => {
        const scripts = performance.getEntriesByType("resource").filter((entry) => (
          new URL(entry.name).origin === location.origin && new URL(entry.name).pathname.endsWith(".js")
        ));
        return {
          chunks: scripts.length,
          encodedBodyBytes: scripts.reduce((sum, entry) => sum + entry.encodedBodySize, 0),
          decodedBodyBytes: scripts.reduce((sum, entry) => sum + entry.decodedBodySize, 0),
        };
      });
      console.log(JSON.stringify({ auditedRoute: route, ...transfer, errors }, null, 2));
      if (errors.length) process.exitCode = 1;
      await page.close();
    }
  }
} finally {
  await browser?.close();
  if (fixture.listening) await new Promise((resolve) => fixture.close(resolve));
  if (dirname(output) === temporaryRoot && basename(output).startsWith(fixturePrefix)) {
    await rm(output, { recursive: true, force: true });
  }
}
