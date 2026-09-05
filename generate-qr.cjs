const qrcode = require('qrcode-generator');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Target URL
const TARGET_URL = 'https://tabassum.hashlay.in/results';

// Encode with Error Correction Level M (Standard, clean, 29x29 matrix)
const qr = qrcode(0, 'M');
qr.addData(TARGET_URL);
qr.make();

const moduleCount = qr.getModuleCount(); // 29 modules
const margin = 3; // 3 modules quiet zone
const totalModules = moduleCount + margin * 2; // 35 modules

// Check if cell is in finder pattern or separator
function isFinder(r, c) {
  if (r <= 7 && c <= 7) return true;
  if (r <= 7 && c >= moduleCount - 8) return true;
  if (r >= moduleCount - 8 && c <= 7) return true;
  return false;
}

function isDark(r, c) {
  if (r < 0 || r >= moduleCount || c < 0 || c >= moduleCount) return false;
  if (isFinder(r, c)) return false;
  return qr.isDark(r, c);
}

// -------------------------------------------------------------
// 1. GENERATE VECTOR SVG WITH CONNECTED SMOOTH PILLS
// -------------------------------------------------------------
function buildSvg(cellSize = 32) {
  const totalSize = totalModules * cellSize;
  const outerR = 1.8 * cellSize;
  const midR = 1.2 * cellSize;
  const innerR = 0.85 * cellSize;
  const cornerR = cellSize * 0.48; // Smooth pill rounding

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${totalSize}" height="${totalSize}">
  <defs>
    <style>
      .bg { fill: #ffffff; }
      .fg { fill: #000000; }
    </style>
  </defs>
  <!-- Background -->
  <rect width="100%" height="100%" class="bg" rx="${cellSize * 0.8}" ry="${cellSize * 0.8}" />

`;

  // Draw finder pattern
  const drawFinder = (startCol, startRow) => {
    const x = (startCol + margin) * cellSize;
    const y = (startRow + margin) * cellSize;
    const outerSize = 7 * cellSize;
    const midOffset = 1 * cellSize;
    const midSize = 5 * cellSize;
    const innerOffset = 2 * cellSize;
    const innerSize = 3 * cellSize;

    return `  <!-- Finder Eye at (${startCol}, ${startRow}) -->
  <rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" rx="${outerR}" ry="${outerR}" class="fg" />
  <rect x="${x + midOffset}" y="${y + midOffset}" width="${midSize}" height="${midSize}" rx="${midR}" ry="${midR}" class="bg" />
  <rect x="${x + innerOffset}" y="${y + innerOffset}" width="${innerSize}" height="${innerSize}" rx="${innerR}" ry="${innerR}" class="fg" />
`;
  };

  svg += drawFinder(0, 0);
  svg += drawFinder(moduleCount - 7, 0);
  svg += drawFinder(0, moduleCount - 7);

  // SVG cell path with per-corner radii
  function cellPath(x, y, s, rTL, rTR, rBR, rBL) {
    let d = `M ${x + rTL} ${y} `;
    d += `H ${x + s - rTR} `;
    if (rTR > 0) d += `A ${rTR} ${rTR} 0 0 1 ${x + s} ${y + rTR} `;
    d += `V ${y + s - rBR} `;
    if (rBR > 0) d += `A ${rBR} ${rBR} 0 0 1 ${x + s - rBR} ${y + s} `;
    d += `H ${x + rBL} `;
    if (rBL > 0) d += `A ${rBL} ${rBL} 0 0 1 ${x} ${y + s - rBL} `;
    d += `V ${y + rTL} `;
    if (rTL > 0) d += `A ${rTL} ${rTL} 0 0 1 ${x + rTL} ${y} `;
    d += 'Z';
    return d;
  }

  // Data modules path
  let pathData = '';
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (isFinder(r, c) || !qr.isDark(r, c)) continue;

      const top = isDark(r - 1, c);
      const bottom = isDark(r + 1, c);
      const left = isDark(r, c - 1);
      const right = isDark(r, c + 1);

      // Only round external corners
      const rTL = (!top && !left) ? cornerR : 0;
      const rTR = (!top && !right) ? cornerR : 0;
      const rBR = (!bottom && !right) ? cornerR : 0;
      const rBL = (!bottom && !left) ? cornerR : 0;

      const x = (c + margin) * cellSize;
      const y = (r + margin) * cellSize;
      pathData += cellPath(x, y, cellSize, rTL, rTR, rBR, rBL) + ' ';
    }
  }

  svg += `  <!-- Connected Rounded Data Modules -->\n  <path d="${pathData.trim()}" class="fg" />\n`;
  svg += '</svg>';
  return svg;
}

// -------------------------------------------------------------
// 2. GENERATE HIGH-RES RASTER PNG (2100x2100px, Anti-Aliased)
// -------------------------------------------------------------
function buildPng(targetSize = 2100) {
  const cellSize = Math.floor(targetSize / totalModules); // 60px per cell
  const width = cellSize * totalModules; // 2100px
  const height = width;
  const cornerR = cellSize * 0.48;

  // Signed distance to rectangle with custom corner radii
  function sdCustomRect(px, py, rx, ry, s, rTL, rTR, rBR, rBL) {
    // Determine which quadrant
    const midX = rx + s / 2;
    const midY = ry + s / 2;
    const isRight = px >= midX;
    const isBottom = py >= midY;

    let rad = rTL;
    let cx = rx + rad;
    let cy = ry + rad;

    if (isRight && !isBottom) {
      rad = rTR;
      cx = rx + s - rad;
      cy = ry + rad;
    } else if (isRight && isBottom) {
      rad = rBR;
      cx = rx + s - rad;
      cy = ry + s - rad;
    } else if (!isRight && isBottom) {
      rad = rBL;
      cx = rx + rad;
      cy = ry + s - rad;
    }

    if (rad <= 0) {
      // Sharp corner
      const dx = Math.abs(px - midX) - s / 2;
      const dy = Math.abs(py - midY) - s / 2;
      return Math.max(dx, dy);
    }

    // Corner with radius
    const inCornerX = isRight ? px > cx : px < cx;
    const inCornerY = isBottom ? py > cy : py < cy;

    if (inCornerX && inCornerY) {
      return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2) - rad;
    }

    // Edge
    const dx = Math.abs(px - midX) - s / 2;
    const dy = Math.abs(py - midY) - s / 2;
    return Math.max(dx, dy);
  }

  // Pre-calculate finder patterns
  const finders = [
    { c: 0, r: 0 },
    { c: moduleCount - 7, r: 0 },
    { c: 0, r: moduleCount - 7 }
  ].map(f => {
    const x = (f.c + margin) * cellSize;
    const y = (f.r + margin) * cellSize;
    return {
      outer: { x, y, size: 7 * cellSize, rad: 1.8 * cellSize },
      mid: { x: x + cellSize, y: y + cellSize, size: 5 * cellSize, rad: 1.2 * cellSize },
      inner: { x: x + 2 * cellSize, y: y + 2 * cellSize, size: 3 * cellSize, rad: 0.85 * cellSize }
    };
  });

  // Signed distance function to a standard rounded rectangle
  function sdRoundedRect(px, py, rx, ry, rw, rh, rad) {
    const cx = rx + rw / 2;
    const cy = ry + rh / 2;
    const halfW = rw / 2;
    const halfH = rh / 2;

    const dx = Math.abs(px - cx) - halfW + rad;
    const dy = Math.abs(py - cy) - halfH + rad;

    const ax = Math.max(dx, 0);
    const ay = Math.max(dy, 0);
    const outsideDist = Math.sqrt(ax * ax + ay * ay);
    const insideDist = Math.min(Math.max(dx, dy), 0);

    return outsideDist + insideDist - rad;
  }

  // Precompute data module corner settings
  const modulesGrid = [];
  for (let r = 0; r < moduleCount; r++) {
    modulesGrid[r] = [];
    for (let c = 0; c < moduleCount; c++) {
      if (isFinder(r, c) || !qr.isDark(r, c)) {
        modulesGrid[r][c] = null;
        continue;
      }
      const top = isDark(r - 1, c);
      const bottom = isDark(r + 1, c);
      const left = isDark(r, c - 1);
      const right = isDark(r, c + 1);

      modulesGrid[r][c] = {
        rTL: (!top && !left) ? cornerR : 0,
        rTR: (!top && !right) ? cornerR : 0,
        rBR: (!bottom && !right) ? cornerR : 0,
        rBL: (!bottom && !left) ? cornerR : 0
      };
    }
  }

  const rgbaBuffer = Buffer.alloc(width * height * 4);
  let ptr = 0;

  for (let y = 0; y < height; y++) {
    const modY = Math.floor(y / cellSize) - margin;
    for (let x = 0; x < width; x++) {
      const modX = Math.floor(x / cellSize) - margin;

      let alpha = 0;

      // Check finders
      let inFinderArea = false;
      for (const f of finders) {
        if (x >= f.outer.x - cellSize && x <= f.outer.x + f.outer.size + cellSize &&
            y >= f.outer.y - cellSize && y <= f.outer.y + f.outer.size + cellSize) {
          inFinderArea = true;

          // Inner solid
          const dInner = sdRoundedRect(x, y, f.inner.x, f.inner.y, f.inner.size, f.inner.size, f.inner.rad);
          if (dInner <= 1) {
            const aInner = Math.max(0, Math.min(1, 0.5 - dInner));
            alpha = Math.max(alpha, aInner);
          }

          // Outer frame
          const dOuter = sdRoundedRect(x, y, f.outer.x, f.outer.y, f.outer.size, f.outer.size, f.outer.rad);
          const dMid = sdRoundedRect(x, y, f.mid.x, f.mid.y, f.mid.size, f.mid.size, f.mid.rad);

          if (dOuter <= 1 && dMid >= -1) {
            const aOuter = Math.max(0, Math.min(1, 0.5 - dOuter));
            const aMidHole = Math.max(0, Math.min(1, dMid + 0.5));
            const aFrame = Math.min(aOuter, aMidHole);
            alpha = Math.max(alpha, aFrame);
          }
          break;
        }
      }

      // Check data modules
      if (!inFinderArea) {
        for (let dy = -1; dy <= 1; dy++) {
          const r = modY + dy;
          if (r < 0 || r >= moduleCount) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const c = modX + dx;
            if (c < 0 || c >= moduleCount) continue;
            const m = modulesGrid[r][c];
            if (m) {
              const cellX = (c + margin) * cellSize;
              const cellY = (r + margin) * cellSize;
              const dist = sdCustomRect(x, y, cellX, cellY, cellSize, m.rTL, m.rTR, m.rBR, m.rBL);
              if (dist <= 1) {
                const a = Math.max(0, Math.min(1, 0.5 - dist));
                if (a > alpha) alpha = a;
              }
            }
          }
        }
      }

      // Grayscale pixel
      const colorVal = Math.round(255 * (1 - alpha));
      rgbaBuffer[ptr++] = colorVal;
      rgbaBuffer[ptr++] = colorVal;
      rgbaBuffer[ptr++] = colorVal;
      rgbaBuffer[ptr++] = 255;
    }
  }

  return encodePng(width, height, rgbaBuffer);
}

// PNG Encoder
function encodePng(width, height, rgbaBuffer) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);
    const crc = zlib.crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);

  const raw = Buffer.alloc(height * (1 + width * 4));
  let srcOffset = 0;
  let dstOffset = 0;
  for (let y = 0; y < height; y++) {
    raw[dstOffset++] = 0;
    rgbaBuffer.copy(raw, dstOffset, srcOffset, srcOffset + width * 4);
    dstOffset += width * 4;
    srcOffset += width * 4;
  }

  const idatData = zlib.deflateSync(raw, { level: 9 });
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// -------------------------------------------------------------
// EXECUTE GENERATION
// -------------------------------------------------------------
console.log('Generating connected-smooth QR code for:', TARGET_URL);

// 1. SVG
const svgContent = buildSvg(32);

// 2. High-res PNG (2100x2100)
console.log('Rendering 2100x2100 anti-aliased PNG...');
const pngContent = buildPng(2100);

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

const artifactDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\ef1db68c-5175-4946-aa26-c82d8d275daa';

// Save SVG
fs.writeFileSync(path.join(publicDir, 'tabassum-results-qr.svg'), svgContent, 'utf8');
// Save PNG
fs.writeFileSync(path.join(publicDir, 'tabassum-results-qr.png'), pngContent);

if (fs.existsSync(artifactDir)) {
  fs.writeFileSync(path.join(artifactDir, 'tabassum-results-qr.svg'), svgContent, 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'tabassum-results-qr.png'), pngContent);
}

console.log('Successfully generated SVG and PNG!');
