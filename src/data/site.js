/**
 * Fuente única de verdad de todo el contenido del sitio.
 *
 * Los bloques marcados con TODO son datos que hay que confirmar con el negocio
 * antes de publicar. Buscar "TODO" en el proyecto devuelve exactamente esa lista.
 */

const WHATSAPP_E164 = '573015247218';

export const site = {
  name: 'Level Up',
  nameFull: 'Level Up – Fitness-GYM',
  tagline: 'Sube de nivel',
  description:
    'Gimnasio en Piedecuesta, Santander. Entrenamiento funcional, fuerza y cardio con acompañamiento real.',

  address: {
    street: 'Cra 3A # 7N-64',
    building: 'Edificio Diana Sofía',
    city: 'Piedecuesta',
    region: 'Santander',
    postalCode: '688011',
    country: 'CO',
    countryName: 'Colombia',

    /*
     * TODO: poner las coordenadas exactas del local.
     *
     * Importante: buscando la dirección por texto, Google no la encuentra y deja
     * el pin en "Cra. 3a # 15-7", que es otra ubicación. Mientras esto quede en
     * null el mapa muestra un punto equivocado.
     *
     * Cómo obtenerlas: abre Google Maps, click derecho sobre la puerta del gym,
     * y el primer renglón del menú son las coordenadas. Pégalas así:
     *   coordinates: { lat: 6.9876543, lng: -73.0512345 },
     */
    coordinates: null,
  },

  whatsapp: {
    e164: WHATSAPP_E164,
    display: '301 524 7218',
    displayIntl: '+57 301 524 7218',
    href: `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(
      'Hola Level Up, quiero información sobre los planes del gimnasio.',
    )}`,
  },

  instagram: {
    url: 'https://www.instagram.com/levelup_gym_/',
    handle: '@levelup_gym_',
  },

  /** Firma de quien diseñó el sitio, en el pie. */
  author: {
    name: 'ZOKY',
    url: 'https://www.linkedin.com/in/oscar-julian-narvaez-5b144120b/',
  },
};

site.address.full = `${site.address.street}, ${site.address.building}, ${site.address.city}, ${site.address.region}`;
site.address.mapsQuery = encodeURIComponent(
  `${site.address.street}, ${site.address.building}, ${site.address.city}, ${site.address.region}, ${site.address.countryName}`,
);
// Con coordenadas el pin cae exacto; sin ellas se busca por texto, que es lo que
// hoy deja el marcador en la dirección equivocada (ver el TODO de coordinates).
const point = site.address.coordinates;
const mapsTarget = point ? `${point.lat},${point.lng}` : site.address.mapsQuery;

site.address.mapsLink = `https://www.google.com/maps/search/?api=1&query=${mapsTarget}`;
site.address.mapsEmbed = `https://www.google.com/maps?q=${mapsTarget}${point ? '&z=17' : ''}&output=embed`;
site.address.hasExactPin = Boolean(point);

/** Sección 2 — Filosofía */
export const philosophy = {
  eyebrow: 'Filosofía',
  title: 'Cada día es un nivel',
  body: [
    'No creemos en transformaciones de 30 días. Creemos en la suma: una sesión más, un kilo más, una semana sin fallar.',
    'Acá no compites contra el de al lado. Compites contra la versión tuya de la semana pasada. Ese es el único marcador que importa.',
  ],
};

/** Sección 3 — Instalaciones */
export const facilities = {
  eyebrow: 'Instalaciones',
  title: 'Un espacio para entrenar en serio',
  // Confirmado: se entrena pesas y funcional, guiado y planificado.
  // TODO: confirmar el equipamiento concreto de cada zona y si hay vestieres.
  items: [
    { name: 'Zona de pesas', detail: 'Peso libre y máquinas' },
    { name: 'Zona funcional', detail: 'Espacio abierto para circuitos' },
    { name: 'Clases dirigidas', detail: 'Grupales y rumba, con horario fijo' },
    { name: 'Vestieres', detail: 'Área de cambio' },
  ],
};

/**
 * Sección 4 — Programas
 *
 * El gimnasio confirmó entrenamiento funcional y de pesas, guiados y planificados
 * según el objetivo de cada persona, más clases grupales con horario fijo. Antes
 * había una tarjeta de "Cardio" que nadie confirmó; se reemplazó por las clases
 * grupales, que sí existen y tienen horario publicado.
 */
export const programs = {
  eyebrow: 'Programas',
  title: 'Elige cómo quieres subir de nivel',
  items: [
    {
      name: 'Funcional',
      detail:
        'Circuitos de cuerpo completo que mejoran fuerza, movilidad y resistencia al mismo tiempo.',
      forWho: 'Para quien quiere moverse mejor y quemar más.',
    },
    {
      name: 'Pesas',
      detail:
        'Trabajo progresivo con peso libre y máquinas, con técnica revisada sesión a sesión.',
      forWho: 'Para quien busca músculo y fuerza medible.',
    },
    {
      name: 'Clases grupales',
      detail:
        'Sesiones dirigidas con horario fijo, incluida la clase de rumba de los jueves.',
      forWho: 'Para quien rinde más entrenando en grupo.',
    },
  ],
};

/** Sección 5 — Beneficios de ser socio */
export const benefits = {
  eyebrow: 'Beneficios',
  title: 'Lo que incluye tu membresía',
  // TODO: confirmar cuáles de estos beneficios aplican realmente hoy.
  items: [
    { title: 'Plan personalizado', detail: 'Rutina armada según tu nivel y tu objetivo.' },
    { title: 'Acompañamiento en piso', detail: 'Corrección de técnica mientras entrenas.' },
    { title: 'Seguimiento de progreso', detail: 'Medimos y ajustamos, no adivinamos.' },
    { title: 'Horario amplio', detail: 'Entrena antes del trabajo o después.' },
    { title: 'Comunidad', detail: 'Gente que entrena en serio y te empuja.' },
    { title: 'Sin permanencia forzada', detail: 'Te quedas porque funciona, no por contrato.' },
  ],
};

/**
 * Sección 6 — Planes
 *
 * Tarifas reales entregadas por el gimnasio. Los valores de dúo y trío son
 * POR PERSONA, no el total del grupo.
 *
 * Tres lecturas que hubo que resolver porque la lista original era ambigua:
 *
 *  1. "plan duo trimestre: 135.000 c/u" y "Trimestre duo: 135.000" son la misma
 *     tarifa escrita dos veces. Se toma 135.000 por persona: como total darían
 *     22.500 por persona al mes, contra 57.000 del dúo mensual.
 *  2. "trío bimestre: 90.000" no decía "c/u", pero "trío trimestre: 130.000 c/u"
 *     sí. Se toma por persona; así el precio por persona/mes baja de forma pareja
 *     de individual a dúo a trío en los tres plazos.
 *  3. Semestre (260.000) y anualidad (520.000) dan exactamente la misma tarifa
 *     mensual: 43.333. El plan anual no descuenta frente a dos semestres.
 *
 * TODO: confirmar esas tres lecturas con el gimnasio.
 */
export const plans = {
  eyebrow: 'Planes',
  title: 'Escoge tu plan',
  currencyNote: 'Valores en pesos colombianos. Dúo y trío son por persona.',
  note: 'Confirma la tarifa vigente por WhatsApp antes de venir.',
  columns: ['Individual', 'Dúo', 'Trío o más'],
  rows: [
    { name: 'Clase o día', prices: ['9.000', null, null] },
    { name: 'Semana', prices: ['30.000', null, null] },
    { name: 'Quincena', prices: ['50.000', null, null] },
    // TODO: confirmar cuántas sesiones incluye la tiquetera.
    { name: 'Tiquetera', prices: ['78.000', null, null] },
    { name: 'Mensualidad', prices: ['75.000', '57.000', '50.000'], featured: true },
    { name: 'Bimestre', prices: ['114.000', '100.000', '90.000'] },
    { name: 'Trimestre', prices: ['155.000', '135.000', '130.000'] },
    { name: 'Cuatrimestre', prices: ['190.000', null, null] },
    { name: 'Semestre', prices: ['260.000', null, null] },
    { name: 'Anualidad', prices: ['520.000', null, null] },
  ],
};

/** Sección 7 — Preguntas frecuentes */
export const faq = {
  eyebrow: 'Preguntas frecuentes',
  title: 'Lo que todos preguntan',
  // TODO: validar matrícula y congelamiento; son las dos que siguen sin confirmar.
  items: [
    {
      q: '¿Puedo venir solo un día?',
      a: 'Sí. La clase suelta cuesta $9.000. También hay planes por semana ($30.000) y quincena ($50.000) si quieres probar sin comprometerte a un mes.',
    },
    {
      q: '¿Cómo funciona el plan dúo y el grupal?',
      a: 'Entrenando de a dos pagas $57.000 al mes cada uno en vez de $75.000. De tres personas en adelante son $50.000 al mes cada uno. Los precios de dúo y trío son por persona.',
    },
    {
      q: '¿Nunca he entrenado, puedo empezar acá?',
      a: 'Sí. El entrenamiento de pesas y funcional es guiado y planificado según tus objetivos, así que la rutina se arma para tu nivel. Nadie empieza levantando lo que no puede.',
    },
    {
      q: '¿Necesito llevar algo el primer día?',
      a: 'Ropa deportiva, tenis y una toalla pequeña. El resto lo pones tú.',
    },
    {
      q: '¿Hay matrícula o costo de inscripción?',
      a: 'Escríbenos por WhatsApp y te confirmamos las condiciones vigentes del plan que te interese.',
    },
    {
      q: '¿Dónde quedan exactamente?',
      a: `En ${site.address.street}, ${site.address.building}, ${site.address.city}, ${site.address.region}.`,
    },
  ],
};

/**
 * Sección 8 — Horarios
 *
 * Horarios reales entregados por el gimnasio. `days` usa los identificadores de
 * schema.org para armar el JSON-LD; las filas con `closed` no entran ahí, y en
 * schema.org omitir un día ya significa cerrado.
 *
 * El original decía "Festivos de 8-12 pm", que no puede ser: se lee como 8:00 am
 * a 12:00 del mediodía, igual que "Sábados de 5- 2pm" son 5:00 am a 2:00 pm.
 * TODO: confirmar el horario de festivos.
 */
export const hours = {
  eyebrow: 'Horarios',
  title: 'Cuándo puedes venir',
  note: 'Los domingos no hay servicio.',
  items: [
    {
      label: 'Lunes a viernes',
      opens: '05:00',
      closes: '22:00',
      detail: 'Jornada continua',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    { label: 'Sábados', opens: '05:00', closes: '14:00', days: ['Saturday'] },
    { label: 'Domingos', closed: true },
    { label: 'Festivos', opens: '08:00', closes: '12:00', days: ['PublicHolidays'] },
  ],
  classesTitle: 'Clases dirigidas',
  classes: [
    { name: 'Clase grupal', when: 'Martes y jueves', time: '7:00 – 8:00 pm' },
    { name: 'Clase grupal', when: 'Miércoles', time: '5:15 – 6:15 am' },
    { name: 'Rumba', when: 'Jueves', time: '8:00 – 9:00 pm' },
  ],
};

/** Sección 9 — Contacto */
export const contact = {
  eyebrow: 'Contacto',
  title: 'Te esperamos',
};

/** Etiquetas del indicador lateral de progreso. */
export const sectionLabels = [
  'Inicio',
  'Filosofía',
  'Instalaciones',
  'Programas',
  'Beneficios',
  'Planes',
  'Preguntas',
  'Horarios',
  'Contacto',
];
