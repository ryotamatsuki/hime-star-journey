import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const candidates = [
  process.env.P10_BROWSER_PATH,
  process.env.P9_BROWSER_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser"
].filter(Boolean);
const browserPath = candidates.find((candidate) => existsSync(candidate));
const verifierUrl = process.env.P10_VERIFIER_URL ?? "http://127.0.0.1:5173/hime-star-journey/p10-browser-verifier.html";
const port = Number(process.env.P10_CDP_PORT ?? 9352);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

if (!browserPath) throw new Error(`Chrome/Chromium not found. Tried: ${candidates.join(", ")}`);

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener("message", async (event) => {
      const text = typeof event.data === "string" ? event.data : await event.data.text();
      const payload = JSON.parse(text);
      const pending = this.pending.get(payload.id);
      if (!pending) return;
      this.pending.delete(payload.id);
      if (payload.error) pending.reject(new Error(payload.error.message));
      else pending.resolve(payload.result);
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }, 20000);
    });
  }
  async eval(expression) {
    const result = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text ?? "Runtime.evaluate failed");
    return result.result.value;
  }
}

const probe = await fetch(verifierUrl);
if (!probe.ok) throw new Error(`Verifier URL unavailable: ${probe.status}`);
console.log(`OK verifier URL returns ${probe.status}`);
console.log(`Using browser: ${browserPath}`);

const profile = await mkdtemp(path.join(tmpdir(), "hime-p10-cdp-"));
const browser = spawn(browserPath, [
  "--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu",
  "--disable-background-networking", "--no-first-run", "--remote-allow-origins=*",
  "--window-size=390,844", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"
], { stdio: "ignore" });

try {
  let version;
  for (let i = 0; i < 100; i += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) {
        version = await response.json();
        break;
      }
    } catch {
      await wait(25);
    }
    await wait(100);
  }
  if (!version) throw new Error("Chrome CDP did not start");

  const pageResponse = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" });
  const target = await pageResponse.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  const cdp = new Cdp(ws);
  await cdp.send("Runtime.enable");
  await cdp.send("Page.enable");
  await cdp.send("Emulation.setVisibleSize", { width: 390, height: 844 });
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    screenWidth: 390,
    screenHeight: 844,
    deviceScaleFactor: 1,
    mobile: true,
    viewport: { x: 0, y: 0, width: 390, height: 844, scale: 1 }
  });
  await cdp.send("Page.navigate", { url: verifierUrl });

  let text = "";
  let passed = false;
  for (let i = 0; i < 700; i += 1) {
    text = await cdp.eval("document.body?.innerText ?? ''");
    if (text.includes("P10_BROWSER_VERIFICATION:PASS")) {
      passed = true;
      break;
    }
    if (text.includes("P10_BROWSER_VERIFICATION:FAIL")) throw new Error(text);
    await wait(250);
  }
  if (!passed) throw new Error(`P10 browser verifier timed out. Last text:\n${text}`);
  for (const line of text.split(/\r?\n/)) if (line.startsWith("OK ")) console.log(line);
  console.log("P10 browser verification passed.");
} finally {
  if (!browser.killed) browser.kill();
  await wait(300);
  await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 }).catch(() => undefined);
}
