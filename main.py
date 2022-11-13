import logging, ssl, certifi
from urllib.request import Request, urlopen
from base64 import b64encode

logging.basicConfig(filename="/tmp/decky-steamgriddb.log",
                    format='[SGDB] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues

class Plugin:
    async def download_as_base64(self, url=""):
        context = ssl.create_default_context(cafile=certifi.where())
        req = Request(url, headers={'User-Agent': "decky-steamgriddb backend"})
        content = urlopen(req, context=context).read()
        return b64encode(content).decode("utf-8")

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        logger.info("Hello World!")

    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        logger.info("Goodbye World!")
        pass
