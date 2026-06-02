import { Buffer } from "node:buffer";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { stdout } from "node:process";
import { deflateSync } from "node:zlib";

const assets = "public/assets/generated";

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

const crcTable = makeCrcTable();

function crc32(bytes) {
  let c = 0xffffffff;
  for (const byte of bytes) {
    c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data = Buffer.alloc(0)) {
  const typeBytes = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([length, typeBytes, data, crc]);
}

function writePng(path, width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(pixels.buffer, y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }

  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND")
  ]));
}

function canvas(width, height, color = [0, 0, 0, 0]) {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = color[0];
    pixels[i + 1] = color[1];
    pixels[i + 2] = color[2];
    pixels[i + 3] = color[3];
  }
  return { width, height, pixels };
}

function blendPixel(target, x, y, color) {
  if (x < 0 || y < 0 || x >= target.width || y >= target.height) {
    return;
  }

  const i = (Math.floor(y) * target.width + Math.floor(x)) * 4;
  const srcA = color[3] / 255;
  const dstA = target.pixels[i + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);

  if (outA <= 0) {
    return;
  }

  target.pixels[i] = Math.round((color[0] * srcA + target.pixels[i] * dstA * (1 - srcA)) / outA);
  target.pixels[i + 1] = Math.round((color[1] * srcA + target.pixels[i + 1] * dstA * (1 - srcA)) / outA);
  target.pixels[i + 2] = Math.round((color[2] * srcA + target.pixels[i + 2] * dstA * (1 - srcA)) / outA);
  target.pixels[i + 3] = Math.round(outA * 255);
}

function rect(target, x, y, w, h, color) {
  for (let yy = Math.floor(y); yy < y + h; yy += 1) {
    for (let xx = Math.floor(x); xx < x + w; xx += 1) {
      blendPixel(target, xx, yy, color);
    }
  }
}

function ellipse(target, cx, cy, rx, ry, color) {
  const x0 = Math.floor(cx - rx);
  const x1 = Math.ceil(cx + rx);
  const y0 = Math.floor(cy - ry);
  const y1 = Math.ceil(cy + ry);
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) {
        blendPixel(target, x, y, color);
      }
    }
  }
}

function line(target, x0, y0, x1, y1, color, thickness = 1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    ellipse(target, x0 + dx * t, y0 + dy * t, thickness, thickness, color);
  }
}

function polygon(target, points, color) {
  const minY = Math.floor(Math.min(...points.map((p) => p[1])));
  const maxY = Math.ceil(Math.max(...points.map((p) => p[1])));
  for (let y = minY; y <= maxY; y += 1) {
    const nodes = [];
    for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
      const [xi, yi] = points[i];
      const [xj, yj] = points[j];
      if ((yi < y && yj >= y) || (yj < y && yi >= y)) {
        nodes.push(xi + ((y - yi) / (yj - yi)) * (xj - xi));
      }
    }
    nodes.sort((a, b) => a - b);
    for (let i = 0; i < nodes.length; i += 2) {
      for (let x = Math.floor(nodes[i]); x <= Math.ceil(nodes[i + 1]); x += 1) {
        blendPixel(target, x, y, color);
      }
    }
  }
}

function star(target, cx, cy, outer, inner, color, points = 5) {
  const vertices = [];
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / points;
    vertices.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  polygon(target, vertices, color);
}

function border(target, color, thickness = 4) {
  rect(target, 0, 0, target.width, thickness, color);
  rect(target, 0, target.height - thickness, target.width, thickness, color);
  rect(target, 0, 0, thickness, target.height, color);
  rect(target, target.width - thickness, 0, thickness, target.height, color);
}

function texture(target, seed, opacity = 20) {
  let state = seed;
  for (let i = 0; i < 3000; i += 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const x = state % target.width;
    state = (state * 1664525 + 1013904223) >>> 0;
    const y = state % target.height;
    blendPixel(target, x, y, [100, 70, 40, opacity]);
  }
}

function drawCard(target, accent) {
  rect(target, 0, 0, target.width, target.height, [248, 232, 190, 255]);
  rect(target, 12, 12, target.width - 24, target.height - 24, [255, 244, 210, 255]);
  border(target, [120, 82, 28, 210], 8);
  rect(target, 18, 18, target.width - 36, 10, accent);
  rect(target, 18, target.height - 28, target.width - 36, 10, accent);
  texture(target, 18, 14);
}

function drawLittleHime(target, cx, cy, scale = 1) {
  ellipse(target, cx, cy + 52 * scale, 44 * scale, 64 * scale, [42, 41, 39, 255]);
  ellipse(target, cx, cy - 12 * scale, 48 * scale, 44 * scale, [255, 206, 166, 255]);
  ellipse(target, cx, cy - 24 * scale, 56 * scale, 32 * scale, [218, 106, 34, 255]);
  ellipse(target, cx - 16 * scale, cy - 10 * scale, 5 * scale, 8 * scale, [28, 22, 18, 255]);
  ellipse(target, cx + 16 * scale, cy - 10 * scale, 5 * scale, 8 * scale, [28, 22, 18, 255]);
  ellipse(target, cx - 60 * scale, cy + 46 * scale, 10 * scale, 26 * scale, [255, 206, 166, 255]);
  ellipse(target, cx + 60 * scale, cy + 46 * scale, 10 * scale, 26 * scale, [255, 206, 166, 255]);
  rect(target, cx - 28 * scale, cy + 112 * scale, 18 * scale, 42 * scale, [255, 206, 166, 255]);
  rect(target, cx + 10 * scale, cy + 112 * scale, 18 * scale, 42 * scale, [255, 206, 166, 255]);
  ellipse(target, cx - 20 * scale, cy + 160 * scale, 24 * scale, 10 * scale, [45, 38, 36, 255]);
  ellipse(target, cx + 20 * scale, cy + 160 * scale, 24 * scale, 10 * scale, [45, 38, 36, 255]);
}

function drawShiro(target, cx, cy, scale = 1) {
  ellipse(target, cx, cy, 54 * scale, 44 * scale, [250, 246, 235, 255]);
  ellipse(target, cx - 52 * scale, cy + 2 * scale, 34 * scale, 18 * scale, [245, 238, 221, 235]);
  ellipse(target, cx + 52 * scale, cy + 2 * scale, 34 * scale, 18 * scale, [245, 238, 221, 235]);
  ellipse(target, cx - 16 * scale, cy - 6 * scale, 7 * scale, 9 * scale, [28, 24, 20, 255]);
  ellipse(target, cx + 16 * scale, cy - 6 * scale, 7 * scale, 9 * scale, [28, 24, 20, 255]);
  ellipse(target, cx, cy + 7 * scale, 10 * scale, 7 * scale, [232, 164, 52, 255]);
  line(target, cx, cy + 42 * scale, cx - 12 * scale, cy + 76 * scale, [136, 202, 230, 160], 3 * scale);
}

function drawEnemy(target, cx, cy, accent, shape = "oni") {
  ellipse(target, cx, cy + 18, 62, 54, accent);
  ellipse(target, cx, cy - 42, 46, 40, [70, 55, 70, 255]);
  ellipse(target, cx - 14, cy - 44, 6, 8, [255, 236, 128, 255]);
  ellipse(target, cx + 14, cy - 44, 6, 8, [255, 236, 128, 255]);
  if (shape === "lantern") {
    rect(target, cx - 38, cy - 46, 76, 90, [220, 92, 54, 230]);
    line(target, cx - 34, cy - 4, cx + 34, cy - 4, [255, 220, 128, 210], 3);
  }
  if (shape === "armor") {
    rect(target, cx - 42, cy - 12, 84, 70, [92, 86, 83, 245]);
    line(target, cx - 42, cy + 18, cx + 42, cy + 18, [205, 178, 108, 220], 3);
  }
  if (shape === "well") {
    ellipse(target, cx, cy + 22, 70, 48, [74, 68, 86, 245]);
    ellipse(target, cx, cy + 4, 52, 28, [32, 28, 42, 245]);
  }
  if (shape === "crow") {
    polygon(target, [[cx - 70, cy - 12], [cx, cy - 50], [cx + 70, cy - 12], [cx, cy + 28]], [42, 38, 50, 245]);
    ellipse(target, cx, cy - 16, 38, 30, [38, 34, 48, 255]);
  }
  star(target, cx + 46, cy - 60, 13, 5, [247, 207, 89, 180], 5);
  texture(target, 52, 18);
}

function write(path, target) {
  writePng(path, target.width, target.height, target.pixels);
}

function makePlaceholderBackground() {
  const c = canvas(960, 540, [229, 211, 174, 255]);
  for (let y = 0; y < c.height; y += 1) {
    const t = y / c.height;
    rect(c, 0, y, c.width, 1, [Math.round(238 - 34 * t), Math.round(225 - 42 * t), Math.round(192 - 34 * t), 255]);
  }
  ellipse(c, 720, 130, 120, 70, [244, 183, 84, 130]);
  ellipse(c, 470, 320, 230, 54, [115, 101, 78, 72]);
  star(c, 160, 110, 32, 12, [246, 210, 94, 210]);
  star(c, 820, 84, 24, 9, [250, 230, 140, 190]);
  texture(c, 7, 26);
  return c;
}

function makePlaceholderCharacter() {
  const c = canvas(256, 256);
  ellipse(c, 128, 212, 70, 18, [54, 42, 36, 55]);
  drawLittleHime(c, 128, 78, 0.7);
  return c;
}

function makePlaceholderEnemy(shape, accent) {
  const c = canvas(256, 256);
  ellipse(c, 128, 214, 72, 18, [54, 42, 36, 55]);
  drawEnemy(c, 128, 122, accent, shape);
  return c;
}

function makePlaceholderUiFrame() {
  const c = canvas(512, 512);
  rect(c, 32, 32, 448, 448, [250, 236, 198, 240]);
  rect(c, 52, 52, 408, 408, [255, 247, 222, 230]);
  border(c, [133, 87, 34, 220], 12);
  star(c, 256, 42, 30, 11, [230, 178, 48, 220]);
  ellipse(c, 420, 78, 26, 22, [232, 139, 45, 210]);
  texture(c, 81, 16);
  return c;
}

function makeCard(kind) {
  const c = canvas(320, 448);
  drawCard(c, kind.accent);
  if (kind.icon === "mikan") {
    ellipse(c, 160, 196, 72, 62, [234, 132, 36, 240]);
    line(c, 160, 132, 160, 252, [255, 214, 110, 170], 3);
  } else if (kind.icon === "feather") {
    ellipse(c, 160, 194, 92, 34, [250, 248, 238, 240]);
    line(c, 94, 224, 226, 158, [210, 184, 120, 230], 5);
  } else if (kind.icon === "drop") {
    polygon(c, [[160, 92], [214, 204], [160, 270], [106, 204]], [112, 188, 226, 230]);
    ellipse(c, 160, 210, 56, 62, [134, 208, 235, 190]);
  } else if (kind.icon === "mist") {
    ellipse(c, 126, 178, 62, 24, [255, 255, 255, 165]);
    ellipse(c, 184, 210, 72, 28, [230, 248, 250, 150]);
    line(c, 82, 244, 230, 176, [180, 224, 232, 180], 4);
  } else if (kind.icon === "stone") {
    rect(c, 90, 152, 140, 46, [120, 112, 100, 230]);
    rect(c, 104, 206, 116, 44, [112, 104, 92, 230]);
    rect(c, 126, 114, 88, 38, [132, 122, 108, 230]);
  } else {
    star(c, 160, 194, 86, 34, [248, 214, 82, 240], 6);
    ellipse(c, 160, 194, 34, 34, [255, 247, 181, 220]);
  }
  return c;
}

function makeStarIcon(state) {
  const c = canvas(128, 128);
  const fill = state === "locked" ? [124, 116, 122, 225] : state === "cleared" ? [250, 225, 88, 245] : [126, 191, 226, 235];
  ellipse(c, 64, 70, 46, 42, [255, 248, 210, 72]);
  star(c, 64, 62, 44, 18, fill, 5);
  if (state === "locked") {
    line(c, 42, 42, 86, 86, [76, 66, 70, 210], 5);
  }
  if (state === "cleared") {
    star(c, 91, 31, 12, 5, [255, 255, 240, 220], 5);
  }
  return c;
}

function makeSheet(drawFrame, width = 1024, height = 256) {
  const c = canvas(width, height);
  for (let frame = 0; frame < 4; frame += 1) {
    const x = frame * 256;
    ellipse(c, x + 128, 218, 74, 18, [54, 42, 36, 45]);
    drawFrame(c, x + 128, 84 + (frame % 2) * 8, frame);
  }
  return c;
}

function makeEffect(kind) {
  const c = canvas(256, 256);
  if (kind === "star") {
    for (let i = 0; i < 9; i += 1) {
      const angle = (Math.PI * 2 * i) / 9;
      star(c, 128 + Math.cos(angle) * 58, 128 + Math.sin(angle) * 46, 18, 7, [247, 199, 64, 210], 5);
      line(c, 128, 128, 128 + Math.cos(angle) * 90, 128 + Math.sin(angle) * 70, [255, 233, 132, 96], 3);
    }
  } else if (kind === "mist") {
    ellipse(c, 96, 116, 62, 26, [235, 250, 255, 130]);
    ellipse(c, 154, 150, 78, 30, [255, 255, 255, 145]);
    line(c, 70, 178, 204, 84, [180, 225, 235, 140], 4);
  } else if (kind === "bird") {
    ellipse(c, 112, 118, 74, 24, [255, 255, 246, 150]);
    ellipse(c, 166, 106, 54, 18, [255, 255, 255, 125]);
    line(c, 48, 174, 210, 82, [255, 252, 220, 170], 5);
  } else {
    star(c, 128, 128, 74, 28, [255, 226, 102, 180], 6);
    ellipse(c, 128, 128, 96, 28, [255, 255, 255, 82]);
    ellipse(c, 128, 128, 28, 96, [255, 255, 255, 82]);
  }
  return c;
}

const files = [
  [`${assets}/placeholders/placeholder_background.png`, makePlaceholderBackground()],
  [`${assets}/placeholders/placeholder_character.png`, makePlaceholderCharacter()],
  [`${assets}/placeholders/placeholder_enemy.png`, makePlaceholderEnemy("oni", [136, 91, 130, 230])],
  [`${assets}/placeholders/placeholder_card.png`, makeCard({ icon: "star", accent: [233, 184, 68, 220] })],
  [`${assets}/placeholders/placeholder_ui_frame.png`, makePlaceholderUiFrame()],
  [`${assets}/characters/hime_walk_sheet.png`, makeSheet((c, x, y) => drawLittleHime(c, x, y, 0.7))],
  [`${assets}/characters/hime_battle_sheet.png`, makeSheet((c, x, y, frame) => {
    drawLittleHime(c, x, y, 0.7);
    star(c, x + 58 + frame * 6, y + 20, 18, 7, [248, 211, 82, 210]);
  })],
  [`${assets}/characters/shiro_fly_sheet.png`, makeSheet((c, x, y) => drawShiro(c, x, y + 42, 0.78))],
  [`${assets}/bosses/boss_kagemasa_sheet.png`, makeSheet((c, x, y) => {
    drawEnemy(c, x, y + 66, [67, 47, 88, 245], "armor");
    star(c, x + 58, y + 16, 20, 7, [155, 102, 220, 190]);
  })],
  [`${assets}/enemies/dogo_oni.png`, makePlaceholderEnemy("oni", [164, 91, 119, 230])],
  [`${assets}/enemies/dogo_lantern.png`, makePlaceholderEnemy("lantern", [218, 116, 58, 230])],
  [`${assets}/enemies/dogo_armor.png`, makePlaceholderEnemy("armor", [106, 99, 92, 230])],
  [`${assets}/enemies/dogo_mouse.png`, makePlaceholderEnemy("oni", [134, 132, 116, 230])],
  [`${assets}/enemies/castle_soldier.png`, makePlaceholderEnemy("armor", [77, 76, 94, 230])],
  [`${assets}/enemies/castle_oni.png`, makePlaceholderEnemy("oni", [110, 90, 126, 230])],
  [`${assets}/enemies/castle_well.png`, makePlaceholderEnemy("well", [74, 74, 92, 230])],
  [`${assets}/enemies/castle_crow.png`, makePlaceholderEnemy("crow", [42, 39, 54, 240])],
  [`${assets}/cards/card_mikan_attack.png`, makeCard({ icon: "mikan", accent: [231, 136, 45, 220] })],
  [`${assets}/cards/card_shirasagi_ofuda.png`, makeCard({ icon: "feather", accent: [226, 222, 194, 220] })],
  [`${assets}/cards/card_dogo_drop.png`, makeCard({ icon: "drop", accent: [104, 184, 218, 220] })],
  [`${assets}/cards/card_yukemuri_veil.png`, makeCard({ icon: "mist", accent: [177, 219, 224, 220] })],
  [`${assets}/cards/card_castle_guard.png`, makeCard({ icon: "stone", accent: [128, 116, 95, 220] })],
  [`${assets}/cards/card_star_seal.png`, makeCard({ icon: "star", accent: [230, 186, 60, 220] })],
  [`${assets}/ui/quest_panel_frame.png`, makePlaceholderUiFrame()],
  [`${assets}/ui/star_icon_locked.png`, makeStarIcon("locked")],
  [`${assets}/ui/star_icon_unlocked.png`, makeStarIcon("unlocked")],
  [`${assets}/ui/star_icon_cleared.png`, makeStarIcon("cleared")],
  [`${assets}/effects/fx_star_hit.png`, makeEffect("star")],
  [`${assets}/effects/fx_yukemuri_heal.png`, makeEffect("mist")],
  [`${assets}/effects/fx_shirasagi_light.png`, makeEffect("bird")],
  [`${assets}/effects/fx_seal_light.png`, makeEffect("seal")]
];

for (const [path, target] of files) {
  write(path, target);
}

stdout.write(`generated ${files.length} runtime placeholder assets\n`);
