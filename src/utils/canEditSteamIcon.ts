/**
 * Steam icons can only be edited for local games and shortcuts. Mods would
 * require rewriting liblist.gam/gameinfo.txt, and non-local shortcuts cannot
 * update shortcuts.vdf remotely.
 */
const canEditSteamIcon = (app: AppStoreAppOverview | null | undefined) => Boolean(
  app && !app.third_party_mod && !(app.BIsShortcut() && app.selected_clientid != '0')
);

export default canEditSteamIcon;
