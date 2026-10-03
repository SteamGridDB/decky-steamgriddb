import sys
import platform
from platform import system
from os import W_OK, access, environ
from os.path import dirname
from urllib.request import Request, urlopen
from urllib.parse import urlparse
from base64 import b64encode
from pathlib import Path
from shutil import copyfile
from settings import SettingsManager # type: ignore
from helpers import get_ssl_context # type: ignore
import decky # type: ignore

WINDOWS = system() == "Windows"

if WINDOWS:
    from winreg import QueryValueEx, OpenKey, HKEY_CURRENT_USER

    # workaound for py_modules not being added to path on windoge
    sys.path.append(decky.DECKY_PLUGIN_DIR)
    from py_modules.vdf import binary_dump, binary_load
else:
    from vdf import binary_dump, binary_load

# Cached result of Steam install discovery (non-Windows only).
_STEAM_PATH_CACHE = None

def _looks_like_steam_dir(path):
    try:
        return path.is_dir() and ((path / 'userdata').is_dir() or (path / 'config').is_dir())
    except OSError:
        return False

def _steam_path_candidates():
    home = Path(decky.DECKY_USER_HOME)
    candidates = []

    override = environ.get('STEAM_PATH')
    if override:
        candidates.append(('STEAM_PATH env', Path(override)))

    candidates.append(('~/.steam/steam', home / '.steam' / 'steam'))
    candidates.append(('~/.steam/root', home / '.steam' / 'root'))
    candidates.append(('~/.local/share/Steam', home / '.local' / 'share' / 'Steam'))
    candidates.append(('flatpak', home / '.var' / 'app' / 'com.valvesoftware.Steam' / '.local' / 'share' / 'Steam'))
    candidates.append(('snap', home / 'snap' / 'steam' / 'common' / '.local' / 'share' / 'Steam'))
    return candidates

def _discover_steam_path():
    home = Path(decky.DECKY_USER_HOME)
    for label, candidate in _steam_path_candidates():
        try:
            resolved = candidate.resolve()
        except (OSError, RuntimeError) as e:
            decky.logger.debug("Steam path candidate %s (%s) could not be resolved: %s", label, candidate, e)
            continue
        if _looks_like_steam_dir(resolved):
            decky.logger.info("Using Steam path %s (from %s: %s)", resolved, label, candidate)
            return resolved
        decky.logger.debug("Steam path candidate %s (%s -> %s) does not exist or has no userdata/config", label, candidate, resolved)

    fallback = home / '.local' / 'share' / 'Steam'
    decky.logger.info("No Steam install found among candidates; falling back to %s", fallback)
    return fallback

def get_steam_path():
    global _STEAM_PATH_CACHE
    if WINDOWS:
        return Path(QueryValueEx(OpenKey(HKEY_CURRENT_USER, r"Software\Valve\Steam"), "SteamPath")[0])
    if _STEAM_PATH_CACHE is None:
        _STEAM_PATH_CACHE = _discover_steam_path()
    return _STEAM_PATH_CACHE

def get_steam_userdata():
    return get_steam_path() / 'userdata'

def get_steam_libcache():
    return get_steam_path() / 'appcache' / 'librarycache'

def get_userdata_config(steam32):
    return get_steam_userdata() / steam32 / 'config'

def _collect_debug_info():
    steam_path = get_steam_path()
    return {
        'decky_version': getattr(decky, 'DECKY_VERSION', None),
        'decky_user': getattr(decky, 'DECKY_USER', None),
        'decky_user_home': getattr(decky, 'DECKY_USER_HOME', None),
        'machine': platform.machine(),
        'python_version': sys.version,
        'steam_path': str(steam_path),
        'userdata_exists': get_steam_userdata().is_dir(),
        'librarycache_exists': get_steam_libcache().is_dir(),
    }

class Plugin:
    async def _main(self):
        self.settings = SettingsManager(name="steamgriddb", settings_directory=decky.DECKY_PLUGIN_SETTINGS_DIR)
        try:
            info = _collect_debug_info()
            decky.logger.info("decky version: %s", info['decky_version'])
            decky.logger.info("decky user: %s (home: %s)", info['decky_user'], info['decky_user_home'])
            decky.logger.info("machine: %s", info['machine'])
            decky.logger.info("python: %s", info['python_version'])
            decky.logger.info("steam path: %s (userdata: %s, librarycache: %s)",
                              info['steam_path'], info['userdata_exists'], info['librarycache_exists'])
        except Exception:
            decky.logger.exception("Failed to collect startup debug info")

    async def _unload(self):
        pass

    async def get_debug_info(self):
        return _collect_debug_info()

    async def download_as_base64(self, url=''):
        req = Request(url, headers={'User-Agent': 'decky-steamgriddb backend'})
        content = urlopen(req, context=get_ssl_context()).read()
        return b64encode(content).decode('utf-8')

    async def read_file_as_base64(self, path=''):
        with open(path, 'rb') as image_file:
            return b64encode(image_file.read()).decode('utf-8')

    async def get_local_start(self):
        return decky.DECKY_USER_HOME

    async def download_file(self, url='', output_dir='', file_name=''):
        decky.logger.debug({url, output_dir, file_name})
        try:
            if access(dirname(output_dir), W_OK):
                req = Request(url, headers={'User-Agent': 'decky-steamgriddb backend'})
                res = urlopen(req, context=get_ssl_context())
                if res.status == 200:
                    with open(Path(output_dir) / file_name, mode='wb') as f:
                        f.write(res.read())
                    return str(Path(output_dir) / file_name)
                decky.logger.error("download_file: unexpected HTTP status %s for %s", res.status, url)
                return False
            decky.logger.error("download_file: parent of output dir is not writable: %s", dirname(output_dir))
        except Exception:
            decky.logger.exception("download_file failed: url=%s output_dir=%s file_name=%s", url, output_dir, file_name)
            return False

        return False

    async def set_shortcut_icon_from_path(self, appid, owner_id, path):
        ext = Path(path).suffix
        iconname = "%s_icon%s" % (appid, ext)
        output_file = get_userdata_config(owner_id) / 'grid' / iconname
        saved_path = str(copyfile(path, output_file))
        return await self.set_shortcut_icon(appid, owner_id, path=saved_path)

    async def set_shortcut_icon_from_url(self, appid, owner_id, url):
        output_dir = get_userdata_config(owner_id) / 'grid'
        ext = Path(urlparse(url).path).suffix
        iconname = "%s_icon%s" % (appid, ext)
        saved_path = await self.download_file(url, output_dir, file_name=iconname)
        if saved_path:
            return await self.set_shortcut_icon(appid, owner_id, path=saved_path)
        else:
            raise Exception("Failed to download icon from %s" % url)

    async def set_shortcut_icon(self, appid, owner_id, path=None):
        shortcuts_vdf = get_userdata_config(owner_id) / 'shortcuts.vdf'

        if not shortcuts_vdf.is_file():
            decky.logger.error("shortcuts.vdf not found at %s (steam path: %s, owner_id: %s)",
                               shortcuts_vdf, get_steam_path(), owner_id)
            raise Exception("shortcuts.vdf not found at %s" % shortcuts_vdf)

        d = binary_load(open(shortcuts_vdf, "rb"))
        for shortcut in d['shortcuts'].values():
            shortcut_appid = (shortcut['appid'] & 0xffffffff) | 0x80000000
            if shortcut_appid == appid:
                if shortcut['icon'] == path:
                    return 'icon_is_same_path'

                # Clear icon
                if path is None:
                    shortcut['icon'] = ''
                else:
                    shortcut['icon'] = path
                binary_dump(d, open(shortcuts_vdf, 'wb'))
                return True
        raise Exception('Could not find shortcut to edit')

    async def set_steam_icon_from_url(self, appid, url):
        await self.download_file(url, get_steam_libcache(), file_name=("%s_icon.jpg" % appid))

    async def set_steam_icon_from_path(self, appid, path):
        copyfile(path, get_steam_libcache() / str("%s_icon.jpg" % appid))

    async def set_setting(self, key, value):
        self.settings.setSetting(key, value)

    async def get_setting(self, key, fallback):
        return self.settings.getSetting(key, fallback)

    async def _migration(self):
        decky.migrate_settings(str(Path(decky.DECKY_HOME) / "settings" / "steamgriddb.json"))
