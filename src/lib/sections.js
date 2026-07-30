/**
 * Animaciones de entrada por sección y sincronización del indicador de nivel.
 *
 * El contenido de las secciones ya viene en el HTML (lo genera el plugin de Vite
 * desde site.js), así que acá solo se anima lo que ya existe: si GSAP falla, el
 * texto sigue siendo legible.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initSections() {
  const sections = Array.from(document.querySelectorAll('.section'));

  sections.forEach((section) => {
    const content = section.querySelector('.section__content');
    if (!content) return;

    const targets = Array.from(content.children);

    gsap.set(targets, { opacity: 0, y: 26 });

    gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: 'power3.out',
      stagger: 0.07,
      scrollTrigger: {
        trigger: section,
        start: 'top 65%',
        // `once` evita que el bloque parpadee al hacer scroll hacia arriba.
        once: true,
      },
    });
  });
}

/** Marca la sección activa en el indicador lateral y actualiza el contador. */
export function initLevelIndicator() {
  const items = Array.from(document.querySelectorAll('.levels__item'));
  const counter = document.querySelector('[data-level-current]');
  const sections = Array.from(document.querySelectorAll('.section'));
  if (!items.length || !sections.length) return;

  let active = -1;

  const setActive = (index) => {
    if (index === active) return;
    active = index;
    items.forEach((item, i) => {
      if (i === index) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
    });
    if (counter) counter.textContent = String(index + 1);
  };

  sections.forEach((section, index) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        if (self.isActive) setActive(index);
      },
    });
  });

  setActive(0);
}

/** El hint de "desliza" desaparece apenas el usuario arranca. */
export function initScrollHint() {
  const hint = document.getElementById('scroll-hint');
  if (!hint) return;

  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: '+=200',
    onUpdate: (self) => {
      hint.style.opacity = String(1 - Math.min(1, self.progress * 1.6));
    },
  });
}

/** Los anchors deben pasar por Lenis, si no el salto ignora el scroll suave. */
export function initAnchors(lenis) {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target, { duration: 1.4 });
      // El scroll programático no mueve el foco: hay que llevarlo a mano.
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}
