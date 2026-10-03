#!/usr/bin/env bash
# Build the plugin and produce a zip that can be sideloaded into Decky Loader
# (~/homebrew/plugins/SteamGridDB on the device, then: sudo systemctl restart plugin_loader).
set -euo pipefail
# pnpm 8 matches lockfileVersion 6.0; newer pnpm refuses the lockfile.
cd "$(dirname "$0")/.."

rm -rf dist && node_modules/.bin/rollup -c --environment ROLLUP_ENV:production

OUT=bundle
rm -rf "$OUT" bundle.zip
mkdir -p "$OUT/SteamGridDB/dist"
cp plugin.json package.json main.py README.md LICENSE "$OUT/SteamGridDB/"
cp -r dist/. "$OUT/SteamGridDB/dist/"
cp -r defaults/. "$OUT/SteamGridDB/"

( cd "$OUT" && zip -qr ../bundle.zip SteamGridDB )
echo "Created bundle.zip ($(du -h bundle.zip | cut -f1))"
echo "On the device: unzip into ~/homebrew/plugins/ and run: sudo systemctl restart plugin_loader"
