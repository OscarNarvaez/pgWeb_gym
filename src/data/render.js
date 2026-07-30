/**
 * Convierte los datos de site.js en HTML estático.
 *
 * Se ejecuta en build time desde el plugin de vite.config.js, no en el navegador.
 * Así el contenido tiene una sola fuente de verdad (site.js) y aun así el HTML
 * servido ya trae todo el texto: los buscadores no dependen de ejecutar JS y la
 * página se lee aunque el JS falle.
 *
 * El lado (`data-side`) y la fuerza del scrim (`data-scrim`) de cada sección
 * salen de medir la luminancia del video por tercios en cada tramo.
 */

import {
  benefits,
  contact,
  facilities,
  faq,
  hours,
  philosophy,
  plans,
  programs,
  sectionLabels,
  site,
} from './site.js';

const esc = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Luma medida por tramo -> lado del texto y fuerza del scrim. */
const LAYOUT = [
  { id: 'inicio', side: 'left', scrim: 'medium' },
  { id: 'filosofia', side: 'right', scrim: 'soft' },
  { id: 'instalaciones', side: 'right', scrim: 'soft' },
  { id: 'programas', side: 'left', scrim: 'soft' },
  { id: 'beneficios', side: 'left', scrim: 'soft' },
  { id: 'planes', side: 'right', scrim: 'soft' },
  { id: 'preguntas', side: 'left', scrim: 'medium' },
  { id: 'horarios', side: 'right', scrim: 'strong' },
  { id: 'contacto', side: 'full', scrim: 'strong' },
];

const WA_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29Z"/></svg>';

// El scrim va dentro de .section__inner, que es sticky: si colgara de la sección
// (130vh) se despegaría del contenido y el texto terminaría sobre video crudo.
const shell = ({ index, id, side, scrim }, inner) => `
      <section class="section" id="${id}" data-index="${index}" data-side="${side}" data-scrim="${scrim}" aria-labelledby="${id}-title">
        <div class="section__inner">
          <div class="section__scrim" aria-hidden="true"></div>
          <div class="section__content">
${inner}
          </div>
        </div>
      </section>`;

const heading = (id, eyebrow, title) => `            <p class="eyebrow">${esc(eyebrow)}</p>
            <h2 class="section__title" id="${id}-title">${esc(title)}</h2>`;

function renderHero(layout) {
  return shell(
    layout,
    `            <h1 class="hero__title" id="inicio-title">Level<br />Up <em>Fitness-GYM</em></h1>
            <p class="hero__tagline">Gimnasio en ${esc(site.address.city)}, ${esc(site.address.region)}. Fuerza, funcional y cardio con acompañamiento real.</p>
            <p class="hero__meta"><span>${esc(site.address.city)}</span><span>${esc(site.address.region)}</span><span>Colombia</span></p>
            <div class="actions">
              <a class="btn btn--primary" href="${esc(site.whatsapp.href)}" target="_blank" rel="noopener">${WA_ICON}<span>Escríbenos por WhatsApp</span></a>
              <a class="btn btn--ghost" href="#planes">Ver planes</a>
            </div>`,
  );
}

function renderPhilosophy(layout) {
  const body = philosophy.body.map((p) => `              <p>${esc(p)}</p>`).join('\n');
  return shell(
    layout,
    `${heading('filosofia', philosophy.eyebrow, philosophy.title)}
            <div class="philosophy__body">
${body}
            </div>`,
  );
}

function renderFacilities(layout) {
  const items = facilities.items
    .map(
      (item) => `              <li class="blocks__item">
                <p class="blocks__name">${esc(item.name)}</p>
                <p class="blocks__detail">${esc(item.detail)}</p>
              </li>`,
    )
    .join('\n');
  return shell(
    layout,
    `${heading('instalaciones', facilities.eyebrow, facilities.title)}
            <ul class="blocks blocks--two">
${items}
            </ul>`,
  );
}

function renderPrograms(layout) {
  const items = programs.items
    .map(
      (item) => `              <li class="program">
                <h3 class="program__name">${esc(item.name)}</h3>
                <p class="program__detail">${esc(item.detail)}</p>
                <p class="program__for">${esc(item.forWho)}</p>
              </li>`,
    )
    .join('\n');
  return shell(
    layout,
    `${heading('programas', programs.eyebrow, programs.title)}
            <ul class="programs">
${items}
            </ul>`,
  );
}

function renderBenefits(layout) {
  const items = benefits.items
    .map(
      (item) => `              <li class="blocks__item">
                <p class="blocks__name">${esc(item.title)}</p>
                <p class="blocks__detail">${esc(item.detail)}</p>
              </li>`,
    )
    .join('\n');
  return shell(
    layout,
    `${heading('beneficios', benefits.eyebrow, benefits.title)}
            <ul class="blocks blocks--two">
${items}
            </ul>`,
  );
}

/*
 * Los planes son una matriz plazo x tamaño de grupo: diez plazos por tres
 * columnas. Como tarjetas no cabrían en la pantalla, y además son datos
 * tabulares de verdad, va como <table>: el lector de pantalla anuncia a qué
 * plazo y a qué columna pertenece cada precio.
 */
function renderPlans(layout) {
  const head = plans.columns
    .map((c) => `                  <th scope="col">${esc(c)}</th>`)
    .join('\n');

  const rows = plans.rows
    .map((row) => {
      const cells = row.prices
        .map((price) =>
          price
            ? `                  <td>${esc(price)}</td>`
            : '                  <td class="pricing__na"><span class="visually-hidden">No aplica</span><span aria-hidden="true">—</span></td>',
        )
        .join('\n');
      return `                <tr${row.featured ? ' data-featured="true"' : ''}>
                  <th scope="row">${esc(row.name)}</th>
${cells}
                </tr>`;
    })
    .join('\n');

  return shell(
    layout,
    `${heading('planes', plans.eyebrow, plans.title)}
            <div class="pricing">
              <table>
                <caption class="visually-hidden">Tarifas por plazo y por tamaño de grupo</caption>
                <thead>
                  <tr>
                    <th scope="col">Plan</th>
${head}
                  </tr>
                </thead>
                <tbody>
${rows}
                </tbody>
              </table>
            </div>
            <p class="pricing__legend">${esc(plans.currencyNote)}</p>
            <p class="section__note">${esc(plans.note)}</p>
            <div class="actions">
              <a class="btn btn--primary" href="${esc(site.whatsapp.href)}" target="_blank" rel="noopener">${WA_ICON}<span>Cotizar por WhatsApp</span></a>
            </div>`,
  );
}

function renderFaq(layout) {
  const items = faq.items
    .map(
      (item) => `              <details class="faq__item">
                <summary class="faq__q">${esc(item.q)}</summary>
                <p class="faq__a">${esc(item.a)}</p>
              </details>`,
    )
    .join('\n');
  return shell(
    layout,
    `${heading('preguntas', faq.eyebrow, faq.title)}
            <div class="faq">
${items}
            </div>`,
  );
}

function renderHours(layout) {
  const rows = hours.items
    .map((row) => {
      const time = row.closed
        ? '<span class="hours__closed">Cerrado</span>'
        : `<span class="hours__time">${esc(row.opens)} – ${esc(row.closes)}</span>`;
      const detail = row.detail
        ? `<span class="hours__detail">${esc(row.detail)}</span>`
        : '';
      return `              <div class="hours__row"${row.closed ? ' data-closed="true"' : ''}>
                <span class="hours__day">${esc(row.label)}${detail}</span>
                ${time}
              </div>`;
    })
    .join('\n');

  const classes = hours.classes
    .map(
      (c) => `              <li class="classes__row">
                <span class="classes__name">${esc(c.name)}</span>
                <span class="classes__when">${esc(c.when)}</span>
                <span class="classes__time">${esc(c.time)}</span>
              </li>`,
    )
    .join('\n');

  return shell(
    layout,
    `${heading('horarios', hours.eyebrow, hours.title)}
            <div class="hours">
${rows}
            </div>
            <h3 class="classes__title">${esc(hours.classesTitle)}</h3>
            <ul class="classes">
${classes}
            </ul>`,
  );
}

function renderContact(layout) {
  return shell(
    layout,
    `${heading('contacto', contact.eyebrow, contact.title)}
            <div class="contact">
              <div class="contact__details">
                <div class="contact__group">
                  <p class="contact__label">Dirección</p>
                  <a class="contact__value" href="${esc(site.address.mapsLink)}" target="_blank" rel="noopener">${esc(site.address.street)}<br />${esc(site.address.building)}<br />${esc(site.address.city)}, ${esc(site.address.region)}</a>
                </div>
                <div class="contact__group">
                  <p class="contact__label">WhatsApp</p>
                  <a class="contact__value" href="${esc(site.whatsapp.href)}" target="_blank" rel="noopener">${esc(site.whatsapp.displayIntl)}</a>
                </div>
                <div class="contact__group">
                  <p class="contact__label">Instagram</p>
                  <a class="contact__value" href="${esc(site.instagram.url)}" target="_blank" rel="noopener">${esc(site.instagram.handle)}</a>
                </div>
                <div class="actions">
                  <a class="btn btn--primary" href="${esc(site.whatsapp.href)}" target="_blank" rel="noopener">${WA_ICON}<span>Agenda tu visita</span></a>
                </div>
              </div>
              <div class="contact__map">
                <iframe
                  src="${esc(site.address.mapsEmbed)}"
                  title="Mapa de ${esc(site.nameFull)} en ${esc(site.address.city)}"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  allowfullscreen></iframe>
              </div>
              <div class="footer">
                <p>© <span data-year>2026</span> ${esc(site.nameFull)} · ${esc(site.address.city)}, ${esc(site.address.region)}</p>
                <p><a href="${esc(site.instagram.url)}" target="_blank" rel="noopener">Instagram</a> · <a href="${esc(site.whatsapp.href)}" target="_blank" rel="noopener">WhatsApp</a></p>
              </div>
            </div>`,
  );
}

const RENDERERS = [
  renderHero,
  renderPhilosophy,
  renderFacilities,
  renderPrograms,
  renderBenefits,
  renderPlans,
  renderFaq,
  renderHours,
  renderContact,
];

export function renderSections() {
  return RENDERERS.map((fn, i) => fn({ ...LAYOUT[i], index: i })).join('\n');
}

export function renderLevelNav() {
  const items = LAYOUT.map(
    (layout, i) => `        <li class="levels__item" data-level="${i}"${i === 0 ? ' aria-current="true"' : ''}>
          <a class="levels__link" href="#${layout.id}">
            <span class="levels__label">${esc(sectionLabels[i])}</span>
            <span class="levels__dash"></span>
          </a>
        </li>`,
  ).join('\n');

  return `      <ul class="levels" aria-label="Secciones de la página">
${items}
      </ul>
      <p class="levels__counter" aria-hidden="true">Nivel <b data-level-current>1</b> / ${LAYOUT.length}</p>`;
}

export function renderJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HealthClub',
    name: site.nameFull,
    description: site.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${site.address.street}, ${site.address.building}`,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    telephone: `+${site.whatsapp.e164}`,
    sameAs: [site.instagram.url],
    // Los días cerrados simplemente no se declaran: en schema.org, omitir un día
    // ya significa que no se abre.
    openingHoursSpecification: hours.items
      .filter((row) => !row.closed && row.days)
      .map((row) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: row.days.map((d) => `https://schema.org/${d}`),
        opens: row.opens,
        closes: row.closes,
      })),
    priceRange: 'COP 9.000 - 520.000',
  };
  // </script> dentro del JSON cerraría la etiqueta antes de tiempo.
  return JSON.stringify(data, null, 2).replace(/</g, '\\u003c');
}

export function renderNoscript() {
  const rows = hours.items
    .map((row) =>
      row.closed
        ? `${esc(row.label)}: cerrado`
        : `${esc(row.label)}: ${esc(row.opens)}–${esc(row.closes)}`,
    )
    .join(' · ');
  return `${esc(site.nameFull)} — ${esc(site.address.full)}. WhatsApp ${esc(site.whatsapp.displayIntl)}. ${rows}.`;
}

export const meta = {
  title: `${site.nameFull} — Gimnasio en ${site.address.city}, ${site.address.region}`,
  description: site.description,
  siteName: site.nameFull,
};
