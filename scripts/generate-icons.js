import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, getPixel) {
  // Scanlines: each row starts with filter byte 0
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  function createChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // Precomputed CRC32 table
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Brand icon generator
function novaIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background deep gradient #0f172a to #020617
  const t = (x + y) / (w + h);
  let r = Math.round(15 * (1 - t) + 2 * t);
  let g = Math.round(23 * (1 - t) + 6 * t);
  let b = Math.round(42 * (1 - t) + 23 * t);
  let a = 255;

  // Diamond shape: |dx| + |dy| <= radius
  const diamondR = w * 0.28;
  const diamondDist = Math.abs(dx) + Math.abs(dy);

  if (diamondDist < diamondR) {
    // Gradient accent for diamond: indigo/cyan
    const dt = diamondDist / diamondR;
    r = Math.round(99 * (1 - dt) + 6 * dt);
    g = Math.round(102 * (1 - dt) + 182 * dt);
    b = Math.round(241 * (1 - dt) + 212 * dt);

    // Inner dark core
    if (diamondDist < diamondR * 0.6) {
      r = 15;
      g = 23;
      b = 42;
    }
  }

  // Central glowing core circle
  if (dist < w * 0.05) {
    r = 56;
    g = 189;
    b = 248;
  }

  // 4 satellite dots
  const dotR = w * 0.02;
  const dotOffset = diamondR * 0.45;
  const satellites = [
    [-dotOffset, -dotOffset],
    [dotOffset, -dotOffset],
    [-dotOffset, dotOffset],
    [dotOffset, dotOffset]
  ];

  for (const [sx, sy] of satellites) {
    const sdist = Math.sqrt((dx - sx) ** 2 + (dy - sy) ** 2);
    if (sdist < dotR) {
      r = 129;
      g = 140;
      b = 248;
    }
  }

  return [r, g, b, a];
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate all standard PWA resolutions
console.log('Generating PWA icons...');

fs.writeFileSync(path.resolve(publicDir, 'pwa-512x512.png'), createPNG(512, 512, novaIcon));
fs.writeFileSync(path.resolve(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, novaIcon));
fs.writeFileSync(path.resolve(publicDir, 'pwa-192x192.png'), createPNG(192, 192, novaIcon));
fs.writeFileSync(path.resolve(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, novaIcon));
fs.writeFileSync(path.resolve(publicDir, 'favicon.ico'), createPNG(32, 32, novaIcon));

console.log('Successfully generated PWA icon assets in /public');
