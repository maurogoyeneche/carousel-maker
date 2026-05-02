const imagesCache = {};

function preloadImage(carrusel) {
  return new Promise(resolve => {
    if (imagesCache[carrusel.img]) return resolve();
    const img = new Image();
    img.onload = () => { imagesCache[carrusel.img] = img; resolve(); };
    img.src = IMGS[carrusel.img];
  });
}

function getFontSize(text, scale) {
  scale = scale || 1;
  if (text.length > 40) return Math.round(18 * scale);
  if (text.length > 28) return Math.round(21 * scale);
  if (text.length > 18) return Math.round(24 * scale);
  return Math.round(27 * scale);
}

function wrapText(ctx, text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawHalf(ctx, opts) {
  const { img, text, isNeg, isColor, yOffset, W, HALF } = opts;
  const scale = Math.max(W / img.naturalWidth, HALF / img.naturalHeight);
  const sw = W / scale, sh = HALF / scale;
  const sx = (img.naturalWidth  - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, yOffset, W, HALF);
  ctx.clip();

  if (!isColor) {
    const tmp = document.createElement('canvas');
    tmp.width = W; tmp.height = HALF;
    const tc = tmp.getContext('2d');
    tc.drawImage(img, sx, sy, sw, sh, 0, 0, W, HALF);
    const d = tc.getImageData(0, 0, W, HALF);
    for (let i = 0; i < d.data.length; i += 4) {
      const g = d.data[i] * 0.299 + d.data[i+1] * 0.587 + d.data[i+2] * 0.114;
      d.data[i] = d.data[i+1] = d.data[i+2] = g;
    }
    tc.putImageData(d, 0, 0);
    ctx.drawImage(tmp, 0, yOffset);
  } else {
    ctx.drawImage(img, sx, sy, sw, sh, 0, yOffset, W, HALF);
  }

  const grad = ctx.createLinearGradient(0, yOffset, 0, yOffset + HALF);
  grad.addColorStop(0,   'rgba(0,0,0,0.55)');
  grad.addColorStop(0.5, 'rgba(0,0,0,0.3)');
  grad.addColorStop(1,   'rgba(0,0,0,0.55)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, yOffset, W, HALF);

  const fontScale = W / 405;
  const fontSize = getFontSize(text, fontScale);
  ctx.font = isNeg
    ? `300 italic ${fontSize}px 'Josefin Sans', sans-serif`
    : `700 italic ${fontSize}px 'Josefin Sans', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const padding = W > 500 ? 100 : 40;
  const lines = wrapText(ctx, text, W - padding);
  const lineH = fontSize * 1.35;
  const totalH = lines.length * lineH;
  const startY = yOffset + HALF / 2 - totalH / 2 + lineH / 2;

  lines.forEach((line, i) => {
    const y = startY + i * lineH;
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur  = W > 500 ? 20 : 12;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = isNeg ? 'rgba(255,255,255,0.75)' : '#ffffff';
    ctx.fillText(line, W / 2, y);
  });

  ctx.shadowColor = 'transparent';
  ctx.restore();
}

function renderCanvas(canvas, carrusel, slideIdx) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, HALF = canvas.height / 2;
  const img = imagesCache[carrusel.img];
  if (!img) return;
  const slide = carrusel.slides[slideIdx];
  ctx.clearRect(0, 0, W, canvas.height);
  drawHalf(ctx, { img, text: slide[0], isNeg: true,  isColor: false, yOffset: 0,    W, HALF });
  drawHalf(ctx, { img, text: slide[1], isNeg: false, isColor: true,  yOffset: HALF, W, HALF });
}

function exportSlideJpg(carrusel, slideIdx) {
  const off = document.createElement('canvas');
  off.width = 1080; off.height = 1350;
  const ctx = off.getContext('2d');
  const slide = carrusel.slides[slideIdx];
  const img = imagesCache[carrusel.img];
  drawHalf(ctx, { img, text: slide[0], isNeg: true,  isColor: false, yOffset: 0,   W: 1080, HALF: 675 });
  drawHalf(ctx, { img, text: slide[1], isNeg: false, isColor: true,  yOffset: 675, W: 1080, HALF: 675 });
  return off.toDataURL('image/jpeg', 0.95);
}

function triggerDownload(dataUrl, filename) {
  const parts = dataUrl.split(',');
  const mime  = parts[0].match(/:(.*?);/)[1];
  const bytes = atob(parts[1]);
  const arr   = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  const blob = new Blob([arr], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadSlide(carrusel, slideIdx) {
  triggerDownload(exportSlideJpg(carrusel, slideIdx), carrusel.id + '_slide' + (slideIdx + 1) + '.jpg');
}

async function downloadAll(carrusel) {
  for (let i = 0; i < carrusel.slides.length; i++) {
    triggerDownload(exportSlideJpg(carrusel, i), carrusel.id + '_slide' + (i + 1) + '.jpg');
    await new Promise(r => setTimeout(r, 300));
  }
}
