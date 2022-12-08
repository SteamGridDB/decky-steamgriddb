<div align="center">
<img src="thumb.png">

[![Crowdin](https://badges.crowdin.net/decky-steamgriddb/localized.svg)](https://crowdin.com/project/decky-steamgriddb) [![Discord](https://img.shields.io/discord/488621078302949377?color=5865F2\&label=discord)](https://discord.gg/bnSVJrz) [![License](https://img.shields.io/badge/license-GPL--3.0--or--later-007ec6)](LICENSE)
</div>

<h1 align="center">SteamGridDB plugin for Decky Loader</h1>

Easily browse and manage Steam artwork from SteamGridDB or your local files from within gaming mode.

<img src="docs/capsule.png" width="33.33%"><img src="docs/manage.png" width="33.33%"><img src="docs/filters.png" width="33.33%">

## Features
- Browse assets from SteamGridDB for the selected game.
- Support for non-Steam shortcuts.
- Manually select images from the local file system.
- Utility to apply invisible assets (to hide logos).
- Reset custom images back to default.

## Installation
1. Install [Decky Loader](https://deckbrew.xyz/en/user-guide/install)
2. Open the Quick Access menu
3. Open the Plugins Browser <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/store-light.svg">
    <source media="(prefers-color-scheme: light)" srcset="docs/store-dark.svg">
    <img height="16px" alt="Store" src="docs/store-dark.svg">
    </picture>
4. Find SteamGridDB and press "Install"

## Usage
Select "Change artwork..." from a game context menu.  
You can usually access the menu by focusing on a game and pressing <picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/start-light.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/start-dark.svg">
  <img height="16px" alt="Start" src="docs/start-dark.svg">
</picture> or if you're on a game page, by using the <picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/menucog-light.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/menucog-dark.svg">
  <img height="16px" alt="Start" src="docs/menucog-dark.svg">
</picture> button.  

<img src="docs/gamecontextmenu.png" height="300px">  

# Credits
Early testing: Emenesu & Mr. Mendelli  
Localisation credits can be found in [i18n.ts](src/utils/i18n.ts) and in the quick access menu while a language is in use.
