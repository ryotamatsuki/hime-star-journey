import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const BROWSER_PATH =
  process.env.P7_BROWSER_PATH ??
  "C:\\Users\\Owner\\AppData\\Local\\ms-playwright\\chromium-1223\\chrome-win64\\chrome.exe";
const VERIFIER_URL = process.env.P7_VERIFIER_URL ?? "http://127.0.0.1:5173/hime-star-journey/p7-browser-verifier.html";
const PORT = Number(process.env.P7_CDP_PORT ?? 9347);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener("message", async (event) => {
      try {
        const text = typeof event.data === "string"
          ? event.data
          : event.data instanceof ArrayBuffer
            ? Buffer.from(event.data).toString("utf8")
            : typeof event.data?.text === "function"
              ? await event.data.text()
              : Buffer.from(event.data).toString("utf8");
        const payload = JSON.parse(text);
        if (payload.id && this.pending.has(payload.id)) {
          const { resolve, reject } = this.pending.get(payload.id);
          this.pending.delete(payload.id);
          if (payload.error) reject(new Error(payload.error.message));
          else resolve(payload.result);
        }
      } catch (error) {
        console.error("CDP message handling failed", error);
      }
    });
    ws.addEventListener("close", () => {
      for (const { reject } of this.pending.values()) reject(new Error("CDP WebSocket closed"));
      this.pending.clear();
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 15000);
    });
  }

  async eval(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text ?? "Runtime.evaluate failed");
    }
    return result.result.value;
  }
}

async function launchBrowser() {
  const profile = await mkdtemp(path.join(tmpdir(), "hime-p7-cdp-"));
  const browser = spawn(BROWSER_PATH, [
    "--headless",
    "--no-sandbox",
    "--single-process",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-gpu-compositing",
    "--disable-gpu-sandbox",
    "--disable-accelerated-2d-canvas",
    "--disable-accelerated-video-decode",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-sync",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-allow-origins=*",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "about:blank"
  ], { stdio: "ignore" });

  async function cleanup() {
    if (!browser.killed) browser.kill();
    await wait(500);
    await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 }).catch(() => undefined);
  }

  for (let i = 0; i < 100; i += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (response.ok) return { cleanup };
    } catch {
      await wait(100);
    }
  }

  await cleanup();
  throw new Error("Chromium CDP did not start");
}

async function createPage() {
  const response = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent("about:blank")}`, {
    method: "PUT"
  });
  if (!response.ok) throw new Error(`Failed to create page: ${response.status}`);
  const target = await response.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  const cdp = new Cdp(ws);
  await cdp.send("Runtime.enable");
  await cdp.send("Page.enable");
  await cdp.send("Page.navigate", { url: VERIFIER_URL });
  return cdp;
}

const response = await fetch(VERIFIER_URL);
if (!response.ok) {
  throw new Error(`Verifier URL is not available: ${response.status} ${VERIFIER_URL}`);
}
console.log(`OK verifier URL returns ${response.status}`);

const { cleanup } = await launchBrowser();
try {
  const cdp = await createPage();
  let text = "";
  let done = false;
  for (let i = 0; i < 240; i += 1) {
    text = await cdp.eval("document.body?.innerText ?? ''");
    if (text.includes("P7_BROWSER_VERIFICATION:PASS")) {
      done = true;
      break;
    }
    if (text.includes("P7_BROWSER_VERIFICATION:FAIL")) {
      throw new Error(text);
    }
    await wait(250);
  }
  if (!done) throw new Error(`P7 browser verifier timed out. Last text:\n${text}`);

  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith("OK ")) console.log(line);
  }
  console.log("P7 browser verification passed.");
} finally {
  await cleanup();
}
