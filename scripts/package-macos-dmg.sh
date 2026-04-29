#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGE_JSON="$ROOT_DIR/package.json"
TAURI_CONFIG="$ROOT_DIR/src-tauri/tauri.conf.json"
DMG_ASSET_DIR="$ROOT_DIR/src-tauri/dmg"
APP_NAME="$(node -e "const fs=require('fs'); const config=JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); process.stdout.write(config.productName || 'AI for Talent');" "$TAURI_CONFIG")"
APP_VERSION="$(node -e "const fs=require('fs'); const pkg=JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); process.stdout.write(pkg.version);" "$PACKAGE_JSON")"
APP_ARCH="$(uname -m)"
APP_BUNDLE_DIR="$ROOT_DIR/src-tauri/target/release/bundle/macos"
APP_PATH="$APP_BUNDLE_DIR/$APP_NAME.app"
DMG_OUTPUT_DIR="$ROOT_DIR/src-tauri/target/release/bundle/dmg"
DMG_OUTPUT_PATH="$DMG_OUTPUT_DIR/${APP_NAME}_${APP_VERSION}_${APP_ARCH}.dmg"
APPDMG_BIN="$ROOT_DIR/node_modules/.bin/appdmg"
DMG_ICON_PNG="$ROOT_DIR/src-tauri/icons/128x128.png"
DMG_BACKGROUND_PATH="$DMG_ASSET_DIR/background.png"
DMG_BACKGROUND_2X_PATH="$DMG_ASSET_DIR/background@2x.png"
DMG_RENDER_BACKGROUND_PATH="$DMG_OUTPUT_DIR/.background-render.png"
DMG_RENDER_BACKGROUND_2X_PATH="$DMG_OUTPUT_DIR/.background-render@2x.png"
DMG_TITLE="${APP_NAME}"
FORCE_REBUILD_BACKGROUND="${DMG_FORCE_REBUILD_BACKGROUND:-0}"

if [[ ! -d "$APP_PATH" ]]; then
  echo "Expected app bundle not found: $APP_PATH" >&2
  echo "Run 'npm run desktop:build' before packaging the dmg." >&2
  exit 1
fi

if [[ ! -x "$APPDMG_BIN" ]]; then
  echo "appdmg is not installed. Run 'npm install' first." >&2
  exit 1
fi

mkdir -p "$DMG_ASSET_DIR" "$DMG_OUTPUT_DIR"

if [[ "$FORCE_REBUILD_BACKGROUND" == "1" ]]; then
  echo "Forcing DMG background regeneration..."
  rm -f "$DMG_BACKGROUND_PATH" "$DMG_BACKGROUND_2X_PATH"
fi

if [[ ! -f "$DMG_BACKGROUND_PATH" || ! -f "$DMG_BACKGROUND_2X_PATH" ]]; then
  echo "Generating DMG background assets..."
  node "$ROOT_DIR/scripts/render-macos-dmg-background.mjs" "$DMG_BACKGROUND_PATH" 660 420 "$DMG_ICON_PNG"
  node "$ROOT_DIR/scripts/render-macos-dmg-background.mjs" "$DMG_BACKGROUND_2X_PATH" 1320 840 "$DMG_ICON_PNG"
else
  echo "Using existing DMG background assets from src-tauri/dmg/."
  echo "Delete them or run 'DMG_FORCE_REBUILD_BACKGROUND=1 npm run desktop:package:dmg' to regenerate."
fi

sips -s format png -z 420 660 "$DMG_BACKGROUND_PATH" --out "$DMG_RENDER_BACKGROUND_PATH" >/dev/null
sips -s format png -z 840 1320 "$DMG_BACKGROUND_2X_PATH" --out "$DMG_RENDER_BACKGROUND_2X_PATH" >/dev/null

STAGING_DIR="$(mktemp -d "${TMPDIR:-/tmp}/talentai-appdmg.XXXXXX")"
cleanup() {
  rm -rf "$STAGING_DIR"
}
trap cleanup EXIT

SPEC_PATH="$STAGING_DIR/appdmg.json"

cat >"$SPEC_PATH" <<EOF
{
  "title": "$DMG_TITLE",
  "icon": "$ROOT_DIR/src-tauri/icons/icon.icns",
  "background": "$DMG_RENDER_BACKGROUND_PATH",
  "icon-size": 138,
  "window": {
    "size": {
      "width": 660,
      "height": 420
    }
  },
  "format": "UDZO",
  "filesystem": "HFS+",
  "contents": [
    { "x": 180, "y": 214, "type": "file", "path": "$APP_PATH" },
    { "x": 484, "y": 214, "type": "link", "path": "/Applications" }
  ]
}
EOF

rm -f "$DMG_OUTPUT_PATH"
"$APPDMG_BIN" "$SPEC_PATH" "$DMG_OUTPUT_PATH"

echo "Created styled DMG: $DMG_OUTPUT_PATH"
