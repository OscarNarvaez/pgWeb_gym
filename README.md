# Level Up – Fitness-GYM

Landing de una sola página para el gimnasio **Level Up – Fitness-GYM** (Piedecuesta, Santander).
El scroll avanza el video cuadro a cuadro a lo largo de 9 secciones.

## Antes de publicar

Precios, horarios y clases ya son los reales del gimnasio. Queda pendiente
confirmar lo de abajo. Todo vive en un solo archivo, `src/data/site.js`, marcado
con `TODO`:

```bash
grep -rn "TODO" src/
```

| Qué | Dónde | Estado |
|---|---|---|
| **Coordenadas del local** | `site.address.coordinates` | **El mapa apunta mal hoy** — ver abajo |
| Tres lecturas de la lista de precios | `plans` | Resueltas por coherencia — ver abajo |
| Sesiones que incluye la tiquetera | `plans.rows` | El dato no venía |
| Horario de festivos | `hours.items` | El original decía "8-12 pm" |
| Equipamiento de cada zona | `facilities.items` | Por confirmar |
| Beneficios de membresía | `benefits.items` | Por confirmar |
| Matrícula y congelamiento | `faq.items` | Por confirmar |

### Tres lecturas de la lista de precios

La lista original tenía ambigüedades. Se resolvieron así, y conviene confirmarlas:

1. **"plan duo trimestre: 135.000 c/u" y "Trimestre duo: 135.000"** son la misma
   tarifa escrita dos veces. Se tomó **por persona**: como total darían 22.500 por
   persona al mes, contra 57.000 del dúo mensual.
2. **"trío bimestre: 90.000"** no decía "c/u", pero "trío trimestre: 130.000 c/u"
   sí. Se tomó **por persona**; así el precio por persona/mes baja de forma pareja
   de individual a dúo a trío en los tres plazos.
3. **Semestre (260.000) y anualidad (520.000)** dan la misma tarifa mensual exacta:
   43.333. El plan anual no descuenta nada frente a comprar dos semestres.

También se quitó la tarjeta de "Cardio" de la sección de programas: el gimnasio
confirmó pesas y funcional, nadie confirmó cardio. En su lugar van las clases
dirigidas, que sí tienen horario publicado.

### El mapa apunta a la dirección equivocada

Buscando `Cra 3A # 7N-64, Edificio Diana Sofía` por texto, Google no encuentra el
punto y deja el pin en `Cra. 3a # 15-7`, que es otra ubicación. Para arreglarlo:

1. Abre Google Maps y haz click derecho justo sobre la entrada del gimnasio.
2. El primer renglón del menú son las coordenadas. Cópialas.
3. Pégalas en `src/data/site.js`:

```js
coordinates: { lat: 6.9876543, lng: -73.0512345 },
```

Eso corrige a la vez el mapa embebido, el enlace "Ver en Google Maps" y el zoom.

## Comandos

```bash
npm install       # dependencias
npm run frames    # extrae los frames del video (solo la primera vez)
npm run dev       # servidor de desarrollo
npm run build     # build de producción en dist/
npm run preview   # sirve el build para revisarlo
```

`npm run frames` no reprocesa si los frames ya existen. Para regenerarlos:
`npm run frames -- --force`. **Si cambias el video, corre eso** — el nombre del
archivo no cambia, así que nada detecta el reemplazo solo.

Si falla con "No se pudo leer la duración del video", el binario de `ffmpeg-static`
no se descargó (pasa cuando npm rehace el árbol de dependencias sin correr los
postinstall). Se recupera con `node node_modules/ffmpeg-static/install.js`.

## Por qué no se usa `<video>`

El video fuente es 2560×1440 y trae **30 keyframes en 26 segundos**, uno cada ~0.9 s.
Atar el scroll a `video.currentTime` obliga al navegador a redecodificar desde el
keyframe anterior en cada seek: el scrub se traba una vez por segundo de video, y a
1440p cada una de esas decodificaciones es cara.

En su lugar, `scripts/extract-frames.mjs` extrae 300 imágenes WebP y
`src/lib/frame-sequence.js` las dibuja en un `<canvas>`. El resultado pesa **menos**
que el MP4 original:

| | Peso |
|---|---|
| `videoFasesGym.mp4` (2560×1440) | 16.2 MB |
| 300 frames desktop (1920×1080) | 6.8 MB |
| 300 frames mobile (1024×576) | 3.3 MB |

Cada visitante baja una sola variante.

No se extrae a 1440p nativo: el canvas limita el `devicePixelRatio` a 2 y la mayoría
de escritorios son DPR 1, así que 1440p solo sumaría peso sin verse mejor. 1920×1080
llega sin escalar hacia arriba en pantallas anchas, y 1024×576 cubre un móvil de
390 px a DPR ~2.6.

## Cómo está armado

```
scripts/extract-frames.mjs   Genera public/frames/ y poster.jpg (ffmpeg-static)
src/data/site.js             Todo el contenido del negocio. Fuente única de verdad
src/data/render.js           Convierte site.js en HTML estático (corre en build time)
vite.config.js               Plugin que inyecta ese HTML en index.html
src/lib/frame-sequence.js    Carga por prioridad + prewarm de decode
src/lib/canvas-renderer.js   drawImage con cover-fit y DPR limitado a 2
src/lib/scroll.js            Lenis + ScrollTrigger, progreso -> índice de frame
src/lib/sections.js          Animaciones de entrada e indicador de nivel
```

El contenido se genera **en build time**, no en el navegador: hay una sola fuente
de verdad (`site.js`) y aun así el HTML servido ya trae todo el texto, así que los
buscadores no dependen de ejecutar JS y la página se lee aunque el JS falle.

### Decisiones que no son obvias

- **Los frames se guardan como `HTMLImageElement`, no como `ImageBitmap`.** Un frame
  de 1920×1080 descomprimido ocupa ~8.3 MB; los 300 como bitmaps serían ~2.5 GB de
  RAM. Como `Image` solo retienen los bytes comprimidos (~7 MB en total) y el
  navegador administra la caché de decodificados. Para que decodificar no cause
  jank, se llama `decode()` por adelantado en una ventana de ±30 frames.

- **El lado del texto en cada sección sale de medir el video.** Se analizó la
  luminancia por tercios en los 9 tramos; el texto siempre cae sobre la mitad más
  oscura del encuadre. El tramo 8 es el único claro (luma 54-62/255) y por eso
  lleva `data-scrim="strong"`.

- **El scrim cuelga de `.section__inner`, que es sticky.** Si colgara de la sección
  (130vh) se despegaría del texto al hacer scroll y el contenido terminaría sobre
  video crudo.

- **Los `<link rel="preload">` llevan `media`.** Sin eso, un móvil bajaba el frame
  de escritorio al pedo y con `prefers-reduced-motion` se bajaba un frame que nunca
  se dibuja.

## Accesibilidad

Con `prefers-reduced-motion: reduce` no se descarga ningún frame: el fondo pasa a
ser `poster.jpg` y las 9 secciones se leen como una página normal, con el scroll
nativo del navegador.

Además: enlace de "saltar al contenido", navegación por teclado con foco visible,
FAQ con `<details>`/`<summary>`, y el canvas expuesto como `role="img"` (el
contenido real está en el DOM, no dibujado).

## Despliegue

Es un sitio estático. `npm run build` y se sube `dist/` a Netlify, Vercel o GitHub
Pages. `base: './'` en `vite.config.js` hace que funcione también en subcarpetas.

`public/frames/` se versiona en git para que el hosting no tenga que correr ffmpeg.
Si prefieres no versionarlo, agrégalo a `.gitignore` y corre `npm run frames` como
parte del build del hosting.
