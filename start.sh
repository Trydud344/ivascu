#!/usr/bin/env bash
set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────
# Override via env vars or edit these defaults
APP_DIR="${APP_DIR:-/home/ivascu/site}"               # where this repo lives
PHOTO_DIR="${PHOTO_DIR:-/home/ivascu/photos}"          # your personal photo folder
NGINX_ROOT="${NGINX_ROOT:-/var/www/ivascu}"            # nginx webroot
NGINX_CONF="${NGINX_CONF:-/etc/nginx/sites-available/ivascu}"
BUILD_DIR="${APP_DIR}/dist"

# ── Colors ─────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
err()   { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ── Steps ──────────────────────────────────────────────────────────

step() {
  local msg=$1; shift
  echo ""
  echo "── ${msg} ──"
  "$@"
}

# ───────────────────────────────────────────────────────────────────

cd "$APP_DIR"

step "Install dependencies" \
  npm ci --omit=optional

step "Symlink photo folder" \
  ln -sfn "$PHOTO_DIR" "$APP_DIR/public/photos"

step "Generate optimised photos (WebP thumbs + full size)" \
  PHOTO_DIR="$PHOTO_DIR" node "$APP_DIR/scripts/generate-photos-json.js"

step "Build site" \
  npm run build

step "Copy to nginx webroot" {
  local timestamp
  timestamp=$(date +%s)
  if [ -d "$NGINX_ROOT" ]; then
    mv "$NGINX_ROOT" "${NGINX_ROOT}.bak.${timestamp}"
  fi
  mkdir -p "$NGINX_ROOT"
  cp -r "$BUILD_DIR"/* "$NGINX_ROOT/"
  if [ -f "$APP_DIR/public/photos.json" ]; then
    cp "$APP_DIR/public/photos.json" "$NGINX_ROOT/photos.json"
  fi
  info "Deployed to $NGINX_ROOT"
}

step "Symlink photos in webroot" \
  ln -sfn "$PHOTO_DIR" "$NGINX_ROOT/photos"

step "Enable nginx site" {
  if [ -f "$NGINX_CONF" ]; then
    if command -v nginx &> /dev/null; then
      nginx -t && systemctl reload nginx || nginx -s reload
      info "nginx reloaded"
    fi
  else
    warn "nginx config not found at $NGINX_CONF — copy nginx-site.conf manually"
  fi
}

echo ""
echo "── Done ──"
info "Site deployed to $NGINX_ROOT"
info "Photos from $PHOTO_DIR → $NGINX_ROOT/photos"
