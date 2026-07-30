/**
 * Extrae videos/videoFasesGym.mp4 a dos secuencias de WebP + un poster JPEG.
 *
 * El video fuente (2560x1440, 16.2 MB) tiene 30 keyframes en 26 s: uno cada ~0.9 s.
 * Atar el scroll a video.currentTime obliga a redecodificar desde el keyframe
 * anterior en cada seek, y el scrub se traba una vez por segundo de video. La
 * landing dibuja frames sueltos en un <canvas> para evitarlo; este script los genera.
 *
 * Uso:  npm run frames            (omite lo que ya existe)
 *       npm run frames -- --force (regenera todo)
 */

import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import ffmpegPath from 'ffmpeg-static';

const execFileAsync = promisify(execFile);

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'videos', 'videoFasesGym.mp4');
const PUBLIC_DIR = join(ROOT, 'public');
const FRAMES_ROOT = join(PUBLIC_DIR, 'frames');

/**
 * 300 frames sobre 26 s son ~11.5 fps efectivos. Alcanza porque la sensacion de
 * fluidez la da la interpolacion del scroll, no el framerate del video.
 * Debe coincidir con FRAME_COUNT en src/lib/frame-sequence.js.
 */
const FRAME_COUNT = 300;

/*
 * El fuente es 2560x1440. No se extrae a esa resolución: el canvas limita el DPR
 * a 2 y la mayoría de escritorios son DPR 1, así que 1440p solo sumaría peso.
 * 1920x1080 llega sin escalar hacia arriba en pantallas anchas a DPR 1, y 1024x576
 * cubre un móvil de 390 px a DPR ~2.6. Ambas son 16:9 exacto, como el fuente.
 */
const VARIANTS = [
  { name: 'desktop', width: 1920, height: 1080, quality: 74 },
  { name: 'mobile', width: 1024, height: 576, quality: 68 },
];

const force = process.argv.includes('--force');

const log = (msg) => process.stdout.write(`${msg}\n`);

const countWebp = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.webp')).length : 0;

/** ffmpeg escribe la metadata del input en stderr y sale con codigo != 0 sin -o. */
async function probeDurationSeconds() {
  let stderr = '';
  try {
    await execFileAsync(ffmpegPath, ['-hide_banner', '-i', SOURCE]);
  } catch (err) {
    stderr = err.stderr ?? '';
  }

  const match = stderr.match(/Duration:\s*(\d+):(\d{2}):(\d{2}(?:\.\d+)?)/);
  if (!match) {
    throw new Error('No se pudo leer la duracion del video desde la salida de ffmpeg.');
  }
  const [, h, m, s] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

/**
 * Se pide a ffmpeg una tasa constante y se corta con -frames:v para obtener
 * exactamente FRAME_COUNT salidas equiespaciadas. La tasa lleva un margen del
 * 1% para que el redondeo de timestamps nunca produzca menos de los pedidos;
 * el sobrante lo descarta -frames:v.
 */
async function extractVariant({ name, width, height, quality }, durationSeconds) {
  const outDir = join(FRAMES_ROOT, name);

  if (!force && countWebp(outDir) === FRAME_COUNT) {
    log(`  ${name}: ya tiene ${FRAME_COUNT} frames, se omite (usa --force para regenerar)`);
    return;
  }

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const fps = ((FRAME_COUNT * 1.01) / durationSeconds).toFixed(6);

  await execFileAsync(
    ffmpegPath,
    [
      '-hide_banner',
      '-loglevel', 'error',
      '-i', SOURCE,
      '-vf', `fps=${fps},scale=${width}:${height}:flags=lanczos`,
      '-frames:v', String(FRAME_COUNT),
      '-c:v', 'libwebp',
      '-quality', String(quality),
      '-compression_level', '6',
      '-preset', 'photo',
      '-an',
      join(outDir, '%04d.webp'),
    ],
    { maxBuffer: 1024 * 1024 * 32 },
  );

  const produced = countWebp(outDir);
  if (produced !== FRAME_COUNT) {
    throw new Error(
      `${name}: se esperaban ${FRAME_COUNT} frames pero se generaron ${produced}.`,
    );
  }
  log(`  ${name}: ${produced} frames a ${width}x${height} (q${quality})`);
}

async function extractPoster() {
  const poster = join(PUBLIC_DIR, 'poster.jpg');
  if (!force && existsSync(poster)) {
    log('  poster.jpg: ya existe, se omite');
    return;
  }
  await execFileAsync(ffmpegPath, [
    '-hide_banner',
    '-loglevel', 'error',
    '-y',
    '-i', SOURCE,
    '-frames:v', '1',
    '-vf', 'scale=1920:1080:flags=lanczos',
    '-q:v', '4',
    poster,
  ]);
  log('  poster.jpg: generado');
}

async function main() {
  if (!existsSync(SOURCE)) {
    throw new Error(`No se encontro el video fuente: ${SOURCE}`);
  }
  if (!ffmpegPath) {
    throw new Error('ffmpeg-static no expuso una ruta de binario. Corre `npm install`.');
  }

  const durationSeconds = await probeDurationSeconds();
  log(`Video: ${durationSeconds.toFixed(3)} s -> ${FRAME_COUNT} frames por variante`);

  mkdirSync(FRAMES_ROOT, { recursive: true });

  for (const variant of VARIANTS) {
    await extractVariant(variant, durationSeconds);
  }
  await extractPoster();

  log('Listo.');
}

main().catch((err) => {
  process.stderr.write(`\nFallo la extraccion: ${err.message}\n`);
  process.exit(1);
});
