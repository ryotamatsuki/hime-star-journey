/* global console */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const roots = ["public/assets/generated/prologue", "public/assets/generated/effects"];
const colorDistance = (r, g, b, bg) => Math.hypot(r - bg[0], g - bg[1], b - bg[2]);

async function processFile(inputPath) {
  const { data, info } = await sharp(inputPath, { failOn: "error" })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const samples = [];
  const size = Math.max(4, Math.round(Math.min(width, height) * 0.025));
  const corners = [[0, 0], [width - size, 0], [0, height - size], [width - size, height - size]];
  for (const [ox, oy] of corners) {
    for (let y = oy; y < oy + size; y += 2) {
      for (let x = ox; x < ox + size; x += 2) {
        const i = (y * width + x) * channels;
        samples.push([data[i], data[i + 1], data[i + 2]]);
      }
    }
  }
  const median = (c) => samples.map((p) => p[c]).sort((a, b) => a - b)[Math.floor(samples.length / 2)];
  const bg = [median(0), median(1), median(2)];
  const low = 24;
  const high = 112;
  const connected = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;
  const enqueue = (x, y) => {
    const p = y * width + x;
    if (connected[p]) return;
    const i = p * channels;
    if (colorDistance(data[i], data[i + 1], data[i + 2], bg) > high) return;
    connected[p] = 1;
    queue[tail++] = p;
  };
  for (let x = 0; x < width; x++) { enqueue(x, 0); enqueue(x, height - 1); }
  for (let y = 0; y < height; y++) { enqueue(0, y); enqueue(width - 1, y); }
  while (head < tail) {
    const p = queue[head++];
    const x = p % width;
    const y = Math.floor(p / width);
    if (x > 0) enqueue(x - 1, y);
    if (x + 1 < width) enqueue(x + 1, y);
    if (y > 0) enqueue(x, y - 1);
    if (y + 1 < height) enqueue(x, y + 1);
  }
  // Remove enclosed chroma pockets (between hair, arms, or legs) while preserving
  // small intentional green details such as leaves.
  const visited = new Uint8Array(width * height);
  for (let start = 0; start < width * height; start++) {
    if (connected[start] || visited[start]) continue;
    const i = start * channels;
    if (colorDistance(data[i], data[i + 1], data[i + 2], bg) > high) continue;
    const component = [];
    const componentQueue = [start];
    visited[start] = 1;
    while (componentQueue.length) {
      const p = componentQueue.pop();
      component.push(p);
      const x = p % width;
      const y = Math.floor(p / width);
      for (const n of [x > 0 ? p - 1 : -1, x + 1 < width ? p + 1 : -1, y > 0 ? p - width : -1, y + 1 < height ? p + width : -1]) {
        if (n < 0 || connected[n] || visited[n]) continue;
        const ni = n * channels;
        if (colorDistance(data[ni], data[ni + 1], data[ni + 2], bg) <= high) {
          visited[n] = 1;
          componentQueue.push(n);
        }
      }
    }
    if (component.length >= 500) {
      for (const p of component) connected[p] = 1;
    }
  }
  for (let p = 0; p < width * height; p++) {
    if (!connected[p]) continue;
    const i = p * channels;
    const d = colorDistance(data[i], data[i + 1], data[i + 2], bg);
    const alpha = Math.max(0, Math.min(255, Math.round(((d - low) / (high - low)) * 255)));
    data[i + 3] = Math.min(data[i + 3], alpha);
    if (alpha > 0 && alpha < 255) {
      const green = bg[1] > bg[0] + 20 && bg[1] > bg[2] + 20;
      const magenta = bg[0] > bg[1] + 20 && bg[2] > bg[1] + 20;
      if (green) data[i + 1] = Math.min(data[i + 1], Math.max(data[i], data[i + 2]) + 18);
      if (magenta) data[i] = Math.min(data[i], Math.max(data[i + 1], data[i + 2]) + 18);
    }
  }
  const outputPath = inputPath.replace(/_chroma(?=\.png$)/i, "");
  await sharp(data, { raw: { width, height, channels } }).png({ compressionLevel: 9 }).toFile(outputPath);
  return { inputPath, outputPath, width, height, bg };
}

for (const root of roots) {
  for (const name of await fs.readdir(root)) {
    if (!/_chroma\.png$/i.test(name)) continue;
    const result = await processFile(path.join(root, name));
    console.log(`${result.inputPath} -> ${result.outputPath} (${result.width}x${result.height}, bg=${result.bg.join(",")})`);
  }
}
