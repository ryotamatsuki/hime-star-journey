/* global console, process */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const roots = ["public/assets/generated/prologue", "public/assets/generated/effects"];
let failed = false;
for (const root of roots) {
  for (const chromaName of (await fs.readdir(root)).filter((name) => /_chroma\.png$/i.test(name))) {
    const file = path.join(root, chromaName.replace(/_chroma(?=\.png$)/i, ""));
    try {
      const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let transparent = 0;
      let opaque = 0;
      let subject = 0;
      for (let i = 0; i < data.length; i += info.channels) {
        const alpha = data[i + 3];
        if (alpha < 16) transparent++;
        if (alpha > 239) opaque++;
        if (alpha > 32) subject++;
      }
      const total = info.width * info.height;
      const cornerPixels = [0, info.width - 1, (info.height - 1) * info.width, total - 1];
      const corners = cornerPixels.map((p) => data[p * info.channels + 3]);
      const ok = info.channels === 4 && transparent > total * 0.02 &&
        subject > total * 0.01 && opaque > 0 && corners.every((a) => a < 32);
      console.log(`${ok ? "OK" : "FAIL"} ${file}: RGBA ${info.width}x${info.height}, transparent=${transparent}, subject=${subject}, corners=${corners.join(",")}`);
      failed ||= !ok;
    } catch (error) {
      failed = true;
      console.error(`FAIL ${file}: ${error.message}`);
    }
  }
}
if (failed) process.exitCode = 1;
