/**
 * Generates minimal branded PNG assets for EAS builds.
 * Replace with professional 1024x1024 icons before store release.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ORANGE = { r: 255, g: 122, b: 51 };

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
    }
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function createPng(size, draw) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const i = y * (size * 4 + 1) + 1 + x * 4;
      const [r, g, b, a] = draw(x, y, size);
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(raw);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function iconDraw(x, y, size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = Math.hypot(x - cx, y - cy);
  if (r < size * 0.38) {
    return [255, 255, 255, 255];
  }
  return [ORANGE.r, ORANGE.g, ORANGE.b, 255];
}

function splashDraw(x, y, size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = Math.hypot(x - cx, y - cy);
  if (r < size * 0.12) {
    return [255, 255, 255, 255];
  }
  return [ORANGE.r, ORANGE.g, ORANGE.b, 255];
}

const assetsDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

fs.writeFileSync(path.join(assetsDir, 'icon.png'), createPng(1024, iconDraw));
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), createPng(1024, iconDraw));
fs.writeFileSync(path.join(assetsDir, 'splash.png'), createPng(1284, splashDraw));

console.log('Generated assets/icon.png, adaptive-icon.png, splash.png');
