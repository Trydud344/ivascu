# Camera Roll — Implementation

## Files Changed / Created

| File | Action |
|------|--------|
| `src/App.jsx` | Rewritten — wouter `useLocation` + AnimatePresence page transitions |
| `src/pages/Home.jsx` | Created — hero content extracted from App.jsx |
| `src/pages/CameraRoll.jsx` | Created — masonry grid, lazy loading, lightbox trigger |
| `src/components/Lightbox.jsx` | Created — fullscreen viewer with motion animations |
| `scripts/generate-photos-json.js` | Created — sharp-based image processor |
| `navbar.js` | Updated — `data-href` attributes, click → `history.pushState` |
| `nginx-site.conf` | Created — production nginx config |
| `.gitignore` | Updated — ignore `public/photos/` and `public/photos.json` |

## Routing (wouter)

- URL-based routing via wouter (`useLocation`)
- No hash — clean URLs like `/camera-roll`
- Server needs `try_files` fallback to `index.html` (in nginx config)
- Page transitions via `AnimatePresence` with fade-in/out (0.25s)
- Back/forward buttons work, deep-linking works

## Navbar

- Each nav item has a `data-href` attribute (e.g. `data-href="/camera-roll"`)
- Click handler: `history.pushState(null, '', href)` + dispatch `popstate`
- Active class updated based on pathname
- All GSAP hover/highlight behavior preserved

## Camera Roll

- Masonry via JS column split (round-robin: `idx % columnCount`)
  - 3 columns on desktop (≥1024px)
  - 2 columns on tablet (≥640px)
  - 1 column on mobile
- Reads chronological order left-to-right, top-to-bottom
- Aspect ratio containers prevent layout shift
- Images lazy-loaded (`loading="lazy"`)
- Hover scale effect (1.03x)

## Lightbox

- Fullscreen overlay (`z-index: 9999`)
- Backdrop fade-in + image scale-in via motion
- Keyboard: Escape (close), ArrowLeft/ArrowRight (navigate)
- Click backdrop to close
- Prev/Next buttons
- Counter: "3 / 14"
- Close button top-right

## Photo Processing Script

- Scans `PHOTO_DIR` (default: `./photos`) recursively
- Input formats: jpg, jpeg, png, webp, avif, heic, heif
- Generates WebP to `GENERATED_DIR` (default: `public/photos/generated/`):
  - `*-thumb.webp` — 600px wide, quality 75
  - `*-full.webp` — 1920px wide, quality 85
- Writes `photos.json` with aspect ratios
- Caches: skips reprocessing if output file is newer than input
- HEIC converted to WebP automatically (sharp handles it)
- Output structure:
  ```json
  [
    { "id": "photo-001", "thumb": "/photos/generated/photo-001-thumb.webp", "full": "/photos/generated/photo-001-full.webp", "aspectRatio": 1.33 }
  ]
  ```

## Usage

```sh
# 1. Set up symlink
ln -s /path/to/your/photos ./public/photos

# 2. Process images
PHOTO_DIR=./public/photos node scripts/generate-photos-json.js

# 3. Dev
npm run dev

# 4. Build
npm run build

# 5. Production (nginx)
# - Copy dist/ to /var/www/your-site/dist
# - Symlink photos to /var/www/your-site/photos
# - Copy photos.json to /var/www/your-site/photos.json
# - Use nginx-site.conf
```

## Security

- nginx only serves known image extensions from `/photos/`
- All other requests to `/photos/` are denied (`deny all`)
- No upload endpoint exists
- `photos.json` served with `no-cache` (ETag-based freshness)
- Images served with `public, no-transform` and 30d expiry
