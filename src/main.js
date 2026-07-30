/**
 * Bootstrap de la landing.
 *
 * Dos caminos posibles:
 *  - Normal: se carga la secuencia de frames, se enciende Lenis y el scroll queda
 *    atado al avance del video.
 *  - prefers-reduced-motion: no se descarga ningún frame, el fondo es el poster
 *    estático y la página se lee con el scroll nativo del navegador.
 */

import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';

import { createFrameSequence } from './lib/frame-sequence.js';
import { createCanvasRenderer } from './lib/canvas-renderer.js';
import { initScroll } from './lib/scroll.js';
import { initAnchors, initLevelIndicator, initScrollHint, initSections } from './lib/sections.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loader-fill');
const loaderPct = document.getElementById('loader-pct');
const canvas = document.getElementById('stage-canvas');
const track = document.getElementById('track');

function unlock() {
  document.body.dataset.locked = 'false';
  loader?.setAttribute('hidden', '');
}

function setLoaderProgress(ratio) {
  const pct = Math.round(ratio * 100);
  if (loaderFill) loaderFill.style.width = `${pct}%`;
  if (loaderPct) loaderPct.textContent = String(pct);
}

/** El año del footer se pone en runtime para que no envejezca solo. */
function stampYear() {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

async function boot() {
  stampYear();

  if (prefersReducedMotion) {
    // Sin scrub no tiene sentido bajar 300 imágenes: el CSS muestra el poster.
    unlock();
    return;
  }

  const renderer = createCanvasRenderer(canvas);
  const sequence = createFrameSequence({ onProgress: setLoaderProgress });

  const controls = initScroll({ track, sequence, renderer });

  initSections();
  initLevelIndicator();
  initScrollHint();
  initAnchors(controls.lenis);

  // La carga sigue en background; cada tanto se repinta para que el frame que se
  // está mostrando mejore a medida que llegan los que faltaban.
  sequence.start().then(() => controls.refreshFrame());

  const refreshTimer = setInterval(() => controls.refreshFrame(), 400);
  setTimeout(() => clearInterval(refreshTimer), 30000);

  await sequence.ready;
  renderer.resize();
  controls.refreshFrame();
  unlock();
}

boot().catch((error) => {
  // Si algo del scrub falla, la página debe seguir siendo usable.
  console.error('[Level Up] Fallo el arranque del scroll ligado al video:', error);
  document.body.dataset.locked = 'false';
  loader?.setAttribute('hidden', '');
  document.querySelector('.stage__poster')?.style.setProperty('display', 'block');
});
