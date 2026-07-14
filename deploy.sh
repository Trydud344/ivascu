#!/usr/bin/env bash
set -euo pipefail

SITE_DIR="$(cd "$(dirname "$0")" && pwd)"
WEBROOT="/var/www/ivascu"

echo "── Pulling latest code ──"
git fetch --prune
git pull --ff-only

echo "── Building site ──"
npm ci
npm run build

echo "── Deploying to $WEBROOT ──"
sudo rm -rf "$WEBROOT/assets" "$WEBROOT/index.html" "$WEBROOT/navbar.js"
sudo cp -r "$SITE_DIR/dist/"* "$WEBROOT/"
sudo cp "$SITE_DIR/navbar.js" "$WEBROOT/"

echo "── Done ──"
