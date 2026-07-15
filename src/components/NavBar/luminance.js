import { IMAGE_SAMPLE_SIZE } from './constants.js';

const MIN_OPACITY_FOR_SAMPLE = 0.1;
const RGBA_PATTERN = /rgba?\((\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)(?:\s*,?\s*([\d.]+))?\)/;

const imageCanvasCache = new WeakMap();

function getOrCreateCanvasForImage(image) {
  if (imageCanvasCache.has(image)) {
    return imageCanvasCache.get(image);
  }

  const canvas = document.createElement('canvas');
  canvas.width = IMAGE_SAMPLE_SIZE;
  canvas.height = IMAGE_SAMPLE_SIZE;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, IMAGE_SAMPLE_SIZE, IMAGE_SAMPLE_SIZE);

  const cached = { context, size: IMAGE_SAMPLE_SIZE };
  imageCanvasCache.set(image, cached);
  return cached;
}

/**
 * Converts pixel RGB to relative luminance (0 = black, 1 = white)
 * using the ITU-R BT.601 luma formula.
 */
export function calculateRelativeLuminance(red, green, blue) {
  return (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
}

/**
 * Maps a viewport coordinate onto an image's natural pixel space,
 * accounting for CSS `object-fit: cover` cropping.
 */
export function mapViewportToNormalizedImageCoords(image, viewportX, viewportY) {
  const imageRect = image.getBoundingClientRect();
  const objectFit = getComputedStyle(image).objectFit || 'fill';

  if (objectFit !== 'cover') {
    return {
      normalizedX: (viewportX - imageRect.left) / imageRect.width,
      normalizedY: (viewportY - imageRect.top) / imageRect.height,
    };
  }

  const elementAspect = imageRect.width / imageRect.height;
  const imageAspect = image.naturalWidth / image.naturalHeight;

  let renderedWidth, renderedHeight, offsetX, offsetY;
  if (imageAspect > elementAspect) {
    renderedHeight = imageRect.height;
    renderedWidth = imageRect.height * imageAspect;
    offsetX = (imageRect.width - renderedWidth) / 2;
    offsetY = 0;
  } else {
    renderedWidth = imageRect.width;
    renderedHeight = imageRect.width / imageAspect;
    offsetX = 0;
    offsetY = (imageRect.height - renderedHeight) / 2;
  }

  return {
    normalizedX: (viewportX - imageRect.left - offsetX) / renderedWidth,
    normalizedY: (viewportY - imageRect.top - offsetY) / renderedHeight,
  };
}

export function sampleImageLuminance(image, viewportX, viewportY) {
  if (!image.complete || !image.naturalWidth) return null;

  let { normalizedX, normalizedY } = mapViewportToNormalizedImageCoords(image, viewportX, viewportY);
  normalizedX = Math.max(0, Math.min(1, normalizedX));
  normalizedY = Math.max(0, Math.min(1, normalizedY));

  try {
    const { context, size } = getOrCreateCanvasForImage(image);
    const pixelData = context.getImageData(
      Math.round(normalizedX * (size - 1)),
      Math.round(normalizedY * (size - 1)),
      1,
      1
    ).data;
    return calculateRelativeLuminance(pixelData[0], pixelData[1], pixelData[2]);
  } catch {
    return null;
  }
}

export function parseRGBA(colorString) {
  const match = colorString.match(RGBA_PATTERN);
  if (!match) return null;
  return {
    red: +match[1],
    green: +match[2],
    blue: +match[3],
    alpha: match[4] ? +match[4] : 1,
  };
}

/**
 * Walks the DOM element stack at a viewport point, returning the
 * luminance of the first opaque-enough surface it finds (image or
 * background color).
 */
export function sampleLuminanceAtPoint(viewportX, viewportY) {
  const elementsAtPoint = document.elementsFromPoint(viewportX, viewportY);

  for (const element of elementsAtPoint) {
    if (element.tagName === 'BODY' || element.tagName === 'HTML') continue;

    if (element.tagName === 'IMG') {
      const luminance = sampleImageLuminance(element, viewportX, viewportY);
      if (luminance !== null) return luminance;
      continue;
    }

    const backgroundColor = getComputedStyle(element).backgroundColor;
    const rgba = parseRGBA(backgroundColor);
    if (rgba && rgba.alpha > MIN_OPACITY_FOR_SAMPLE) {
      return calculateRelativeLuminance(rgba.red, rgba.green, rgba.blue);
    }
  }

  return null;
}

export function clearImageCache(image) {
  imageCanvasCache.delete(image);
}
