import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../public/icons');
const SIZES = [16, 32, 48, 128];
const SS = 4;

const BG_TOP = [32, 32, 32];
const BG_BOTTOM = [15, 15, 15];
const NOTE_HEAD = [45, 212, 122];
const NOTE_BODY = [255, 255, 255];

let crcTable = null;
function crc32(buf) {
  if (!crcTable) {
    crcTable = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

function roundedRectSdf(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r);
  const qy = Math.abs(py - cy) - (hh - r);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
}

function segmentSdf(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const len2 = abx * abx + aby * aby;
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / len2));
  return Math.hypot(apx - abx * t, apy - aby * t);
}

function circleSdf(px, py, cx, cy, r) {
  return Math.hypot(px - cx, py - cy) - r;
}

function coverage(sdfNorm, scale) {
  return Math.max(0, Math.min(1, 0.5 - sdfNorm * scale));
}

function glyphScale(size) {
  if (size <= 16) return 1.5;
  if (size <= 32) return 1.25;
  if (size <= 48) return 1.1;
  return 1;
}

function blend(dst, r, g, b, cov) {
  const a0 = dst[3] / 255;
  const a1 = cov;
  const outA = a0 + a1 * (1 - a0);
  if (outA <= 1e-6) {
    dst[0] = dst[1] = dst[2] = dst[3] = 0;
    return;
  }
  dst[0] = Math.round((r * a1 + dst[0] * a0 * (1 - a1)) / outA);
  dst[1] = Math.round((g * a1 + dst[1] * a0 * (1 - a1)) / outA);
  dst[2] = Math.round((b * a1 + dst[2] * a0 * (1 - a1)) / outA);
  dst[3] = Math.round(outA * 255);
}

function drawIcon(size) {
  const S = size * SS;
  const buf = new Uint8Array(S * S * 4);
  const g = glyphScale(size);
  const gx = 0.4;
  const gy = 0.52;
  const at = (x, y) => [gx + (x - gx) * g, gy + (y - gy) * g];
  const [sx1, sy1] = at(0.43, 0.28);
  const [sx2, sy2] = at(0.43, 0.66);
  const [f1x1, f1y1] = at(0.44, 0.3);
  const [f1x2, f1y2] = at(0.65, 0.4);
  const [f2x1, f2y1] = at(0.45, 0.34);
  const [f2x2, f2y2] = at(0.6, 0.54);
  const [hx, hy] = at(0.37, 0.66);
  const hr = 0.14 * g;
  const stemR = 0.045 * g;
  const flagR1 = 0.055 * g;
  const flagR2 = 0.05 * g;

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const px = (x + 0.5) / S;
      const py = (y + 0.5) / S;
      const dst = buf.subarray((y * S + x) * 4, (y * S + x) * 4 + 4);

      const bgCov = coverage(roundedRectSdf(px, py, 0.5, 0.5, 0.48, 0.48, 0.2), S);
      const mix = py;
      blend(
        dst,
        BG_TOP[0] + (BG_BOTTOM[0] - BG_TOP[0]) * mix,
        BG_TOP[1] + (BG_BOTTOM[1] - BG_TOP[1]) * mix,
        BG_TOP[2] + (BG_BOTTOM[2] - BG_TOP[2]) * mix,
        bgCov
      );

      const stemCov = coverage(segmentSdf(px, py, sx1, sy1, sx2, sy2) - stemR, S);
      const flag1Cov = coverage(segmentSdf(px, py, f1x1, f1y1, f1x2, f1y2) - flagR1, S);
      const flag2Cov = coverage(segmentSdf(px, py, f2x1, f2y1, f2x2, f2y2) - flagR2, S);
      const bodyCov = Math.max(stemCov, flag1Cov, flag2Cov);
      if (bodyCov > 0) blend(dst, NOTE_BODY[0], NOTE_BODY[1], NOTE_BODY[2], bodyCov);

      const headCov = coverage(circleSdf(px, py, hx, hy, hr), S);
      if (headCov > 0) blend(dst, NOTE_HEAD[0], NOTE_HEAD[1], NOTE_HEAD[2], headCov);
    }
  }

  const out = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const i = ((y * SS + sy) * S + (x * SS + sx)) * 4;
          r += buf[i];
          g += buf[i + 1];
          b += buf[i + 2];
          a += buf[i + 3];
        }
      }
      const n = SS * SS;
      const o = (y * size + x) * 4;
      out[o] = Math.round(r / n);
      out[o + 1] = Math.round(g / n);
      out[o + 2] = Math.round(b / n);
      out[o + 3] = Math.round(a / n);
    }
  }
  return encodePng(size, size, out);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const size of SIZES) {
  const png = drawIcon(size);
  fs.writeFileSync(path.join(OUT_DIR, `icon${size}.png`), png);
  console.log(`icon${size}.png (${png.length} bytes)`);
}
