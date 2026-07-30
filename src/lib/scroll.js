/**
 * Ata el scroll de la página al avance de la secuencia de frames.
 *
 * Lenis aporta la inercia (el "scroll fluido") y GSAP ScrollTrigger mapea el
 * progreso del documento al índice de frame. Ambos comparten el ticker de GSAP
 * para tener un solo bucle de animación en toda la página.
 */

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScroll({ track, sequence, renderer, onProgress }) {
  const lenis = new Lenis({
    duration: 1.15,
    // Curva exponencial: arranque rápido y frenado largo. Da la sensación de peso.
    easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    smoothWheel: true,
    // El scroll táctil nativo ya tiene inercia propia; duplicarla se siente flotante.
    syncTouch: false,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const lastIndex = sequence.frameCount - 1;
  let currentIndex = -1;
  let pendingIndex = 0;
  let rafQueued = false;

  function paint() {
    rafQueued = false;
    const image = sequence.getFrame(pendingIndex);
    if (image) renderer.draw(image);
  }

  function setProgress(progress) {
    const index = Math.round(progress * lastIndex);
    if (index === currentIndex) return;

    currentIndex = index;
    pendingIndex = index;
    sequence.prewarm(index);

    if (!rafQueued) {
      rafQueued = true;
      requestAnimationFrame(paint);
    }
  }

  ScrollTrigger.create({
    trigger: track,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      setProgress(self.progress);
      onProgress?.(self.progress);
    },
  });

  // El resize cambia el tamaño del canvas: hay que recalcular y forzar un repintado.
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderer.resize();
      renderer.invalidate();
      const image = sequence.getFrame(currentIndex < 0 ? 0 : currentIndex);
      if (image) renderer.draw(image);
      ScrollTrigger.refresh();
    }, 150);
  });

  return {
    lenis,
    scrollTo: (target) => lenis.scrollTo(target, { offset: 0 }),
    /** Repinta con el frame más cercano ya cargado (se usa al llegar nuevos frames). */
    refreshFrame: () => {
      renderer.invalidate();
      const image = sequence.getFrame(currentIndex < 0 ? 0 : currentIndex);
      if (image) renderer.draw(image);
    },
  };
}
