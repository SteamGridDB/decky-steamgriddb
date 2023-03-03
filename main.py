from os.path import dirname
from os import W_OK, access
from urllib.request import Request, urlopen
from urllib.parse import urlparse
from base64 import b64encode
from pathlib import Path
from shutil import copyfile
from settings import SettingsManager # type: ignore
from helpers import get_ssl_context # type: ignore
import decky_plugin

from vdf import binary_dump, binary_load

STEAM_PATH = Path(decky_plugin.DECKY_USER_HOME) / '.local' / 'share' / 'Steam'
USERDATA_PATH = STEAM_PATH / 'userdata'
LIBCACHE = STEAM_PATH / 'appcache' / 'librarycache'

def get_userdata_config(steam32):
    return USERDATA_PATH / steam32 / 'config'

class Plugin:
    async def _main(self):
        self.settings = SettingsManager(name="steamgriddb", settings_directory=decky_plugin.DECKY_PLUGIN_SETTINGS_DIR)

    async def _unload(self):
        pass

    async def download_as_base64(self, url=''):
        req = Request(url, headers={'User-Agent': 'decky-steamgriddb backend'})
        content = urlopen(req, context=get_ssl_context()).read()
        return b64encode(content).decode('utf-8')

    async def read_file_as_base64(self, path=''):
        with open(path, 'rb') as image_file:
            return b64encode(image_file.read()).decode('utf-8')

    async def get_local_start(self):
        return decky_plugin.DECKY_USER_HOME

    async def download_file(self, url='', output_dir='', file_name=''):
        decky_plugin.logger.debug({url, output_dir, file_name})
        try:
            if access(dirname(output_dir), W_OK):
                req = Request(url, headers={'User-Agent': 'decky-steamgriddb backend'})
                res = urlopen(req, context=get_ssl_context())
                if res.status == 200:
                    with open(Path(output_dir) / file_name, mode='wb') as f:
                        f.write(res.read())
                    return str(Path(output_dir) / file_name)
                return False
        except:
            return False

        return False

    async def set_shortcut_icon_from_path(self, appid, owner_id, path):
        ext = Path(path).suffix
        iconname = "%s_icon%s" % (appid, ext)
        output_file = get_userdata_config(owner_id) / 'grid' / iconname
        saved_path = str(copyfile(path, output_file))
        return await self.set_shortcut_icon(self, appid, owner_id, path=saved_path)

    async def set_shortcut_icon_from_url(self, appid, owner_id, url):
        output_dir = get_userdata_config(owner_id) / 'grid'
        ext = Path(urlparse(url).path).suffix
        iconname = "%s_icon%s" % (appid, ext)
        saved_path = await self.download_file(self, url, output_dir, file_name=iconname)
        if saved_path:
            return await self.set_shortcut_icon(self, appid, owner_id, path=saved_path)
        else:
            raise Exception("Failed to download icon from %s" % url)

    async def set_shortcut_icon(self, appid, owner_id, path=None):
        shortcuts_vdf = get_userdata_config(owner_id) / 'shortcuts.vdf'

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
        await self.download_file(self, url, LIBCACHE, file_name=("%s_icon.jpg" % appid))

    async def set_steam_icon_from_path(self, appid, path):
        copyfile(path, LIBCACHE / str("%s_icon.jpg" % appid))

    async def set_setting(self, key, value):
        self.settings.setSetting(key, value)

    async def get_setting(self, key, default):
        return self.settings.getSetting(key, default)

    async def filepicker_new(self, path, include_files=True):
        path = Path(path).resolve()

        files = []

        for file in path.iterdir():
            is_dir = file.is_dir()
            # Windows and OSX have their own file attributes for hidden files and dirs.
            # Only doing Linux for now cause that's all Decky supports.
            is_hidden = file.name.startswith('.')
            if file.exists() and (is_dir or include_files):
                files.append({
                    "isdir": is_dir,
                    "ishidden": is_hidden,
                    "name": file.name.encode('utf-8', 'replace').decode('utf-8'),
                    "realpath": str(file.resolve()).encode('utf-8', 'replace').decode('utf-8'),
                    "size": file.stat().st_size,
                    "modified": file.stat().st_mtime,
                    "created": file.stat().st_ctime,
                })

        return {
            "realpath": str(path),
            "files": files
        }

    async def _migration(self):
        decky_plugin.migrate_settings(str(Path(decky_plugin.DECKY_HOME) / "settings" / "steamgriddb.json"))
