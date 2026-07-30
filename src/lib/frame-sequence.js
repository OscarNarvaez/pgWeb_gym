/**
 * Carga la secuencia de frames que reemplaza al <video>.
 *
 * Nota de memoria: un frame de 1920x1080 descomprimido ocupa ~8.3 MB. Guardar los
 * 300 como ImageBitmap serian ~2.5 GB. Por eso se guardan HTMLImageElement, que
 * solo retienen los bytes comprimidos (~23 KB c/u, ~7 MB en total) y dejan que el
 * navegador administre y desaloje la cache de decodificados. Para que decodificar
 * no cause jank al dibujar, se llama img.decode() por adelantado sobre una ventana
 * deslizante alrededor del frame actual.
 */

/** Debe coincidir con FRAME_COUNT en scripts/extract-frames.mjs. */
export const FRAME_COUNT = 300;

const CONCURRENCY = 6;
const DECODE_WINDOW = 30;
/** Frames que deben estar listos antes de habilitar el scroll. */
const READY_THRESHOLD = 40;

const pad = (n) => String(n).padStart(4, '0');

export function createFrameSequence({ onProgress } = {}) {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const variant = isMobile ? 'mobile' : 'desktop';
  const basePath = `${import.meta.env.BASE_URL}frames/${variant}/`;

  const frames = new Array(FRAME_COUNT).fill(null);
  const loaded = new Uint8Array(FRAME_COUNT);
  const decoded = new Uint8Array(FRAME_COUNT);

  let loadedCount = 0;
  let readyResolve;
  const ready = new Promise((resolve) => {
    readyResolve = resolve;
  });

  /**
   * Orden de carga por prioridad:
   *  1. frame 0, para pintar algo de inmediato
   *  2. los 9 limites de sección, para que cualquier salto por anchor tenga imagen
   *  3. el arranque del scroll
   *  4. el resto
   */
  function buildQueue() {
    const seen = new Set();
    const queue = [];
    const push = (i) => {
      if (i >= 0 && i < FRAME_COUNT && !seen.has(i)) {
        seen.add(i);
        queue.push(i);
      }
    };

    push(0);
    for (let s = 0; s < 9; s += 1) push(Math.floor((s * FRAME_COUNT) / 9));
    for (let i = 1; i < READY_THRESHOLD; i += 1) push(i);
    for (let i = 0; i < FRAME_COUNT; i += 1) push(i);

    return queue;
  }

  function loadFrame(index) {
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = `${basePath}${pad(index + 1)}.webp`;

      const done = (ok) => {
        if (ok) {
          frames[index] = img;
          loaded[index] = 1;
        }
        loadedCount += 1;
        onProgress?.(loadedCount / FRAME_COUNT);
        if (loadedCount >= READY_THRESHOLD) readyResolve();
        resolve();
      };

      if (img.complete && img.naturalWidth > 0) {
        done(true);
        return;
      }
      img.addEventListener('load', () => done(true), { once: true });
      // Un frame que falla no debe bloquear la secuencia: getFrame() cae al vecino.
      img.addEventListener('error', () => done(false), { once: true });
    });
  }

  async function start() {
    const queue = buildQueue();
    let cursor = 0;

    const worker = async () => {
      while (cursor < queue.length) {
        const index = queue[cursor];
        cursor += 1;
        await loadFrame(index);
      }
    };

    await Promise.all(
      Array.from({ length: CONCURRENCY }, () => worker()),
    );
  }

  /**
   * Nunca devuelve null mientras haya al menos un frame cargado: si el pedido aún
   * no llega, busca hacia afuera el más cercano disponible. Así el canvas no
   * queda en blanco al saltar de sección durante la carga.
   */
  function getFrame(index) {
    const target = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(index)));
    if (loaded[target]) return frames[target];

    for (let offset = 1; offset < FRAME_COUNT; offset += 1) {
      const before = target - offset;
      if (before >= 0 && loaded[before]) return frames[before];
      const after = target + offset;
      if (after < FRAME_COUNT && loaded[after]) return frames[after];
    }
    return null;
  }

  /** Decodifica por adelantado alrededor del frame actual para evitar jank. */
  function prewarm(index) {
    const center = Math.round(index);
    const from = Math.max(0, center - DECODE_WINDOW);
    const to = Math.min(FRAME_COUNT - 1, center + DECODE_WINDOW);

    for (let i = from; i <= to; i += 1) {
      if (!loaded[i] || decoded[i]) continue;
      decoded[i] = 1;
      frames[i].decode?.().catch(() => {
        // Una decodificación fallida no es fatal: drawImage vuelve a intentarlo.
        decoded[i] = 0;
      });
    }
  }

  return { start, ready, getFrame, prewarm, variant, frameCount: FRAME_COUNT };
}
