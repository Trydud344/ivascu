import { readdir, stat, mkdir } from 'fs/promises';
import { existsSync, createWriteStream } from 'fs';
import path from 'path';
import sharp from 'sharp';

const ALLOWED_INPUT = /\.(jpg|jpeg|png|webp|avif|heic|heif)$/i;
const ALLOWED_SERVE = /\.(jpg|jpeg|png|webp|avif)$/i;

const INPUT_DIR = path.resolve(process.env.PHOTO_DIR || './photos');
const GENERATED_DIR = path.resolve(process.env.GENERATED_DIR || './public/photos/generated');
const JSON_OUTPUT = path.resolve(process.env.JSON_OUTPUT || './public/photos.json');

const THUMB_WIDTH = 600;
const FULL_WIDTH = 1920;

async function ensureDir(dir) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  return dir;
}

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'generated') continue;
      yield* walk(fullPath);
    } else if (entry.isFile() && ALLOWED_INPUT.test(entry.name)) {
      yield fullPath;
    }
  }
}

async function processImage(inputPath, outputName) {
  const thumbPath = path.join(GENERATED_DIR, `${outputName}-thumb.webp`);
  const fullPath = path.join(GENERATED_DIR, `${outputName}-full.webp`);

  const thumbExists = existsSync(thumbPath);
  const fullExists = existsSync(fullPath);
  if (thumbExists && fullExists) {
    const { mtimeMs: inputMtime } = await stat(inputPath);
    const { mtimeMs: thumbMtime } = await stat(thumbPath);
    if (thumbMtime >= inputMtime) {
      return { thumbPath: `/photos/generated/${outputName}-thumb.webp`, fullPath: `/photos/generated/${outputName}-full.webp`, wasCached: true };
    }
  }

  const pipeline = sharp(inputPath).rotate();
  const metadata = await pipeline.metadata();

  const aspectRatio = metadata.width && metadata.height
    ? Math.round((metadata.width / metadata.height) * 100) / 100
    : 1;

  await Promise.all([
    pipeline.clone().resize(THUMB_WIDTH).webp({ quality: 75 }).toFile(thumbPath),
    pipeline.clone().resize(FULL_WIDTH).webp({ quality: 85 }).toFile(fullPath),
  ]);

  return { aspectRatio, thumbPath: `/photos/generated/${outputName}-thumb.webp`, fullPath: `/photos/generated/${outputName}-full.webp` };
}

async function main() {
  console.log('Photo directory:', INPUT_DIR);

  if (!existsSync(INPUT_DIR)) {
    console.error(`Input directory not found: ${INPUT_DIR}`);
    console.error('Set PHOTO_DIR env var or symlink your photos to ./photos');
    process.exit(1);
  }

  await ensureDir(GENERATED_DIR);

  const files = [];
  for await (const filePath of walk(INPUT_DIR)) {
    files.push(filePath);
  }

  files.sort((a, b) => {
    const aStat = stat(a);
    const bStat = stat(b);
    return aStat.mtimeMs - bStat.mtimeMs;
  });

  if (files.length === 0) {
    console.log('No images found.');
    process.exit(0);
  }

  console.log(`Found ${files.length} images. Processing...`);

  const photos = [];
  let processed = 0;
  let cached = 0;

  for (const filePath of files) {
    const parsed = path.parse(filePath);
    const outputName = parsed.name.replace(/[^a-zA-Z0-9_-]/g, '_');

    const result = await processImage(filePath, outputName);

    if (!result.aspectRatio && !result.wasCached) {
      console.warn(`  Skipped ${parsed.base}: could not read metadata`);
      continue;
    }

    photos.push({
      id: outputName,
      thumb: result.thumbPath,
      full: result.fullPath,
      aspectRatio: result.aspectRatio || 1,
    });

    if (result.wasCached) {
      cached++;
    } else {
      processed++;
    }
  }

  const jsonDir = path.dirname(JSON_OUTPUT);
  await ensureDir(jsonDir);

  const jsonContent = JSON.stringify(photos, null, 2);

  if (JSON_OUTPUT.endsWith('.json')) {
    const { writeFile } = await import('fs/promises');
    await writeFile(JSON_OUTPUT, jsonContent, 'utf-8');
    console.log(`\nDone. ${processed} processed, ${cached} cached.`);
    console.log(`Wrote ${photos.length} entries to ${JSON_OUTPUT}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
