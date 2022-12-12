import logging
import sys
from os.path import dirname
from os import W_OK, access
from urllib.request import Request, urlopen
from urllib.parse import urlparse
from base64 import b64encode
from pathlib import Path
from settings import SettingsManager
from helpers import get_ssl_context, get_user, set_user, get_home_path, get_homebrew_path

logging.basicConfig(filename="/tmp/decky-steamgriddb.log",
                    format='[SGDB] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues

set_user()
HOME_PATH = get_home_path(get_user())

sys.path.insert(0, str(Path(get_homebrew_path(HOME_PATH)) / 'plugins' / 'decky-steamgriddb'))
from pylib.vdf import binary_dump, binary_load

USERDATA_PATH = Path(HOME_PATH) / '.local' / 'share' / 'Steam' / 'userdata'

def get_userdata_config(steam32):
    return USERDATA_PATH / steam32 / "config"

class Plugin:
    async def _main(self):
        self.settings = SettingsManager("steamgriddb")

    async def download_as_base64(self, url=""):
        req = Request(url, headers={"User-Agent": "decky-steamgriddb backend"})
        content = urlopen(req, context=get_ssl_context()).read()
        return b64encode(content).decode("utf-8")

    async def read_file_as_base64(self, path=""):
        with open(path, "rb") as image_file:
            return b64encode(image_file.read()).decode("utf-8")

    async def get_local_start(self):
        return HOME_PATH

    async def download_file(self, url="", output_dir="", file_name=""):
        logger.info({url, output_dir, file_name})
        try:
            if access(dirname(output_dir), W_OK):
                req = Request(url, headers={"User-Agent": "decky-steamgriddb backend"})
                res = urlopen(req, context=get_ssl_context())
                if res.status == 200:
                    with open(Path(output_dir) / file_name, mode="wb") as f:
                        f.write(res.read())
                    return str(Path(output_dir) / file_name)
                return False
        except:
            return False

        return False


    async def set_shortcut_icon(self, owner_id, url, appid):
        output_dir = get_userdata_config(owner_id) / "grid"
        shortcuts_vdf = get_userdata_config(owner_id) / "shortcuts.vdf"

        d = binary_load(open(shortcuts_vdf, "rb"))
        for shortcut in d['shortcuts'].values():
            shortcut_appid = (shortcut['appid'] & 0xffffffff) | 0x80000000
            if shortcut_appid == appid:
                ext = Path(urlparse(url).path).suffix
                iconname = "%s_icon%s" % (appid, ext)
                saved_path = await self.download_file(self, url, output_dir, file_name=iconname)
                if saved_path:
                    if shortcut['icon'] == saved_path:
                        return 'icon_is_same_path'

                    shortcut['icon'] = saved_path
                    binary_dump(d, open(shortcuts_vdf, 'wb'))
                    return True
                else:
                    raise Exception("Failed to download icon from %s" % url)
                break
        raise Exception("Could not find shortcut to edit")

    async def set_setting(self, key, value):
        self.settings.setSetting(key, value)

    async def get_setting(self, key, default):
        return self.settings.getSetting(key, default)
