const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const SIZE = 256;
const OUT_DIR = path.join(__dirname, "..", "assets", "bunny");
const ICON_PATH = path.join(__dirname, "..", "icon.png");

function crc32(buffer) {
  let crc = 0xffffffff;

  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function createPng(width, height, pixels) {
  const rows = [];

  for (let y = 0; y < height; y += 1) {
    const start = y * width * 4;
    rows.push(Buffer.from([0]));
    rows.push(pixels.subarray(start, start + width * 4));
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(Buffer.concat(rows))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function makeCanvas(size) {
  return {
    width: size,
    height: size,
    pixels: Buffer.alloc(size * size * 4),
  };
}

function blendPixel(canvas, x, y, color) {
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;

  const index = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
  const srcA = color[3] / 255;
  const dstA = canvas.pixels[index + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);

  if (outA <= 0) return;

  canvas.pixels[index] = Math.round((color[0] * srcA + canvas.pixels[index] * dstA * (1 - srcA)) / outA);
  canvas.pixels[index + 1] = Math.round((color[1] * srcA + canvas.pixels[index + 1] * dstA * (1 - srcA)) / outA);
  canvas.pixels[index + 2] = Math.round((color[2] * srcA + canvas.pixels[index + 2] * dstA * (1 - srcA)) / outA);
  canvas.pixels[index + 3] = Math.round(outA * 255);
}

function ellipse(canvas, cx, cy, rx, ry, color) {
  const minX = Math.floor(cx - rx);
  const maxX = Math.ceil(cx + rx);
  const minY = Math.floor(cy - ry);
  const maxY = Math.ceil(cy + ry);

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      const distance = dx * dx + dy * dy;

      if (distance <= 1) {
        const edge = Math.min(1, (1 - distance) * 10);
        blendPixel(canvas, x, y, [color[0], color[1], color[2], Math.round(color[3] * edge)]);
      }
    }
  }
}

function line(canvas, x1, y1, x2, y2, width, color) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 2;

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    ellipse(canvas, x, y, width / 2, width / 2, color);
  }
}

function drawBunny(expression) {
  const canvas = makeCanvas(SIZE);
  const white = [248, 247, 242, 255];
  const cream = [238, 232, 218, 255];
  const pink = [245, 167, 184, 255];
  const blush = [246, 141, 166, 155];
  const ink = [47, 52, 65, 255];
  const happy = expression === "happy";
  const shy = expression === "shy";

  ellipse(canvas, 128, 174, 64, 55, cream);
  ellipse(canvas, 88, 142, 28, 34, white);
  ellipse(canvas, 168, 142, 28, 34, white);
  ellipse(canvas, 92, 68, 23, 62, white);
  ellipse(canvas, 164, 68, 23, 62, white);
  ellipse(canvas, 92, 70, 11, 44, pink);
  ellipse(canvas, 164, 70, 11, 44, pink);
  ellipse(canvas, 128, 122, 69, 59, white);
  ellipse(canvas, 102, 133, 12, 9, blush);
  ellipse(canvas, 154, 133, 12, 9, blush);

  if (happy) {
    line(canvas, 94, 111, 111, 105, 5, ink);
    line(canvas, 145, 105, 162, 111, 5, ink);
  } else if (shy) {
    line(canvas, 96, 111, 112, 113, 5, ink);
    line(canvas, 144, 113, 160, 111, 5, ink);
    ellipse(canvas, 102, 142, 17, 10, blush);
    ellipse(canvas, 154, 142, 17, 10, blush);
  } else {
    ellipse(canvas, 104, 110, 7, 9, ink);
    ellipse(canvas, 152, 110, 7, 9, ink);
  }

  ellipse(canvas, 128, 122, 5, 4, [227, 125, 145, 255]);

  if (happy) {
    line(canvas, 116, 136, 128, 144, 4, ink);
    line(canvas, 128, 144, 140, 136, 4, ink);
  } else {
    line(canvas, 119, 135, 128, 140, 3, ink);
    line(canvas, 128, 140, 137, 135, 3, ink);
  }

  line(canvas, 76, 124, 38, 115, 3, ink);
  line(canvas, 78, 136, 38, 139, 3, ink);
  line(canvas, 180, 124, 218, 115, 3, ink);
  line(canvas, 178, 136, 218, 139, 3, ink);
  ellipse(canvas, 87, 201, 14, 10, white);
  ellipse(canvas, 169, 201, 14, 10, white);

  return canvas;
}

function writeBunny(name) {
  const canvas = drawBunny(name);
  fs.writeFileSync(path.join(OUT_DIR, `${name}.png`), createPng(canvas.width, canvas.height, canvas.pixels));
}

function writeIcon() {
  const canvas = makeCanvas(32);
  ellipse(canvas, 16, 19, 10, 8, [0, 0, 0, 255]);
  ellipse(canvas, 12, 9, 4, 8, [0, 0, 0, 255]);
  ellipse(canvas, 20, 9, 4, 8, [0, 0, 0, 255]);
  fs.writeFileSync(ICON_PATH, createPng(canvas.width, canvas.height, canvas.pixels));
}

fs.mkdirSync(OUT_DIR, { recursive: true });
writeBunny("normal");
writeBunny("shy");
writeBunny("happy");
writeIcon();
