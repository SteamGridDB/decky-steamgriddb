# Running on Armada OS (AYN Odin 3 and other ARM handhelds)

This fork hardens the plugin for Steam clients that are newer than the one
shipped with SteamOS. Armada OS uses Valve's ARM64 Steam client with built-in
FEX, which updates straight from Valve's Linux channel, so it is usually ahead
of the Steam Deck. The plugin finds Steam's internal UI components by matching
strings in minified code; when Steam changes, a lookup can return `undefined`
and React crashes (error #130, blank page).

## What this fork changes

- Steam UI lookups (`FooterGlyph`, `LibraryImage`, context menu, CSS class
  modules) are fail-soft: a missing module disables one feature and logs a
  warning instead of killing the whole plugin.
- `FooterGlyph` matcher supports the new Steam signature (upstream PRs #175/#180).
- The Python backend discovers the Steam directory (`~/.steam/steam`,
  `~/.local/share/Steam`, Flatpak, Snap, or `STEAM_PATH`) instead of assuming
  `~/.local/share/Steam`, and logs environment details on startup.
- Quick Access panel gets a **Troubleshooting** section: a debug-logging toggle
  and a **Show Diagnostics** button.

## Sideloading a build

```bash
npx -y pnpm@8 install --frozen-lockfile   # lockfile is v6, needs pnpm 8
./scripts/package.sh        # produces bundle.zip
```

On the device (Desktop mode or SSH):

```bash
unzip bundle.zip -d ~/homebrew/plugins/
sudo systemctl restart plugin_loader
```

## Diagnosing

1. Backend log: `~/homebrew/logs/SteamGridDB/`. The first lines after start
   show Decky version, user, home, CPU architecture and the Steam path chosen.
2. Frontend errors: Decky settings → Developer → enable *Allow Remote CEF
   Debugging*. On a PC open `chrome://inspect`, add `<device-ip>:8080`, pick
   the *SharedJSContext* target and reproduce the problem. Look for
   `[SGDB]` warnings and `Minified React error #130`.
3. Quick checks in that console:

```js
DFL.findModuleExport(e => typeof e === 'function' && e.toString().includes('.additionalClassName'))
DFL.findModuleByExport(e => e?.toString?.().includes('().LibraryContextMenu'))
```

`undefined` means Steam changed that component and the matcher needs updating.
