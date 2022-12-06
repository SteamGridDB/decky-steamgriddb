import logging, ssl, certifi
from urllib.request import Request, urlopen
from base64 import b64encode
from pathlib import Path
from settings import SettingsManager
from helpers import get_ssl_context, get_user, set_user

logging.basicConfig(filename="/tmp/decky-steamgriddb.log",
                    format='[SGDB] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues

set_user()
USER = get_user()
HOME_PATH = "/home/"+USER

class Plugin:
    async def _main(self):
        self.settings = SettingsManager("steamgriddb")

    async def download_as_base64(self, url=""):
        req = Request(url, headers={'User-Agent': "decky-steamgriddb backend"})
        content = urlopen(req, context=get_ssl_context()).read()
        return b64encode(content).decode("utf-8")

    async def get_local_start(self):
        return HOME_PATH

    async def set_setting(self, key, value):
        self.settings.setSetting(key, value)

    async def get_setting(self, key, default):
        return self.settings.getSetting(key, default)
