/**
 * Dibuja un frame en el <canvas> de fondo replicando object-fit: cover.
 *
 * Solo redibuja cuando cambia el frame o el tamaño del canvas; repintar el mismo
 * frame en cada rAF es trabajo desperdiciado y calienta el dispositivo sin razón.
 */

/** Cap del devicePixelRatio: en pantallas 3x el fill-rate no compensa. */
const MAX_DPR = 2;

export function createCanvasRenderer(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });

  let cssWidth = 0;
  let cssHeight = 0;
  let lastImage = null;
  let dirty = true;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    cssWidth = canvas.clientWidth;
    cssHeight = canvas.clientHeight;

    const width = Math.round(cssWidth * dpr);
    const height = Math.round(cssHeight * dpr);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      dirty = true;
    }
  }

  function draw(image) {
    if (!image) return;
    if (image === lastImage && !dirty) return;

    lastImage = image;
    dirty = false;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = image.naturalWidth || image.width;
    const ih = image.naturalHeight || image.height;
    if (!iw || !ih || !cw || !ch) return;

    // cover: se escala al mayor factor y se recorta el excedente, centrado.
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.drawImage(image, dx, dy, dw, dh);
  }

  /** Fuerza el próximo draw aunque el frame no haya cambiado. */
  function invalidate() {
    dirty = true;
  }

  resize();

  return { resize, draw, invalidate, get size() { return { cssWidth, cssHeight }; } };
}
