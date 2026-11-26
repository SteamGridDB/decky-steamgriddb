"""Best-effort bridge for Steam UI context menus in the current Vite client.

Steam's game-action menu is a lexical component in the Steam UI bundle, so it is
not discoverable through Decky's module finder. This hook uses the same local
CEF debugger endpoint as CSS Loader to install a small, idempotent page hook.
"""

import asyncio
import json

import aiohttp

import decky  # type: ignore


CHANNEL_NAME = "steamgriddb-context-menu"
STEAM_CDP_ENDPOINT = "http://127.0.0.1:8080/json/list"
POLL_INTERVAL = 3


def describe_cdp_error(error, timeout_context):
    if isinstance(error, (TimeoutError, asyncio.TimeoutError)):
        return f"{type(error).__name__}: {timeout_context} timed out"
    details = str(error).strip()
    return f"{type(error).__name__}: {details or 'no additional details'}"


PAGE_HOOK = r'''(() => {
  if (location.hostname !== "steamloopback.host" || window.__sgdbContextMenuHook) return;

  const channel = typeof BroadcastChannel === "function"
    ? new BroadcastChannel("steamgriddb-context-menu")
    : null;
  if (!channel) return;

  let menuLabel = "Change Artwork...";
  let activeAppId = 0;
  let activeMenuComponent = null;
  let frontendToken = null;
  let insertionTimer = 0;
  let disposed = false;
  const retryTimers = new Set();
  const wrappedTileProps = new Map();
  const patchedClasses = new Map();

  const getReactProps = (node) => {
    const key = Object.keys(node || {}).find((name) => name.startsWith("__reactProps$"));
    return key ? node[key] : null;
  };

  const getAppId = (node) => {
    for (let element = node; element; element = element.parentElement) {
      const fiberKey = Object.keys(element).find((name) => name.startsWith("__reactFiber$"));
      let fiber = fiberKey ? element[fiberKey] : null;
      for (; fiber; fiber = fiber.return) {
        const props = fiber.memoizedProps || fiber.pendingProps || {};
        const appId = props.app?.appid ?? props.overview?.appid ??
          props.appOverview?.appid ?? props.item?.appid ?? props.appid;
        if (Number.isInteger(Number(appId)) && Number(appId) > 0) return Number(appId);
      }
    }
    return 0;
  };

  const isPropertiesElement = (element) => {
    const onSelected = element?.props?.onSelected;
    return typeof onSelected === "function" && onSelected.toString().includes("AppProperties");
  };

  const isArtworkElement = (element) => element?.key === "sgdb-change-artwork" ||
    element?.props?.className?.includes("sgdb-change-artwork");

  const makeArtworkElement = (propertiesElement, appId) => ({
    ...propertiesElement,
    key: "sgdb-change-artwork",
    ref: null,
    props: {
      ...propertiesElement.props,
      className: `${propertiesElement.props.className || ""} sgdb-change-artwork`.trim(),
      onSelected: () => {
        if (!disposed && frontendToken) {
          channel.postMessage({ type: "navigate", appId, token: frontendToken });
        }
      },
      children: menuLabel,
    },
  });

  const insertArtworkElement = (node, appId) => {
    if (Array.isArray(node)) {
      if (node.some(isArtworkElement)) return { changed: false, value: node };
      const propertiesIndex = node.findIndex(isPropertiesElement);
      if (propertiesIndex !== -1) {
        const updated = [...node];
        updated.splice(propertiesIndex, 0, makeArtworkElement(node[propertiesIndex], appId));
        return { changed: true, value: updated };
      }
      for (let index = 0; index < node.length; index += 1) {
        const result = insertArtworkElement(node[index], appId);
        if (result.changed) {
          const updated = [...node];
          updated[index] = result.value;
          return { changed: true, value: updated };
        }
      }
      return { changed: false, value: node };
    }

    if (!node || typeof node !== "object" || !node.props) return { changed: false, value: node };
    if (isArtworkElement(node)) return { changed: false, value: node };
    if (isPropertiesElement(node)) {
      return { changed: true, value: [makeArtworkElement(node, appId), node] };
    }

    const result = insertArtworkElement(node.props.children, appId);
    if (!result.changed) return { changed: false, value: node };
    return {
      changed: true,
      value: { ...node, props: { ...node.props, children: result.value } },
    };
  };

  const injectIntoGameActionRender = (rendered, appId) => insertArtworkElement(rendered, appId).value;

  const patchGameActionComponent = (menu) => {
    const row = menu?.querySelector('[role="menuitem"]');
    const fiberKey = row && Object.keys(row).find((name) => name.startsWith("__reactFiber$"));
    for (let fiber = fiberKey ? row[fiberKey] : null; fiber; fiber = fiber.return) {
      const props = fiber.memoizedProps || fiber.pendingProps || {};
      const component = fiber.type;
      if (typeof component !== "function" || typeof component.prototype?.render !== "function") continue;
      if (Number(props.overview?.appid) !== activeAppId || !("launchSource" in props) || !("bInGamepadUI" in props)) continue;
      if (patchedClasses.has(component)) {
        activeMenuComponent = fiber.stateNode;
        return true;
      }

      const originalRender = component.prototype.render;
      const wrappedRender = function (...args) {
        const result = originalRender.apply(this, args);
        const appId = this.props?.overview?.appid;
        if (!appId || !frontendToken) return result;
        try {
          return injectIntoGameActionRender(result, appId);
        } catch (error) {
          console.warn("[SteamGridDB] Could not add the artwork context-menu item.", error);
          return result;
        }
      };
      component.prototype.render = wrappedRender;
      patchedClasses.set(component, { originalRender, wrappedRender });
      activeMenuComponent = fiber.stateNode;
      activeMenuComponent?.forceUpdate?.();
      return true;
    }
    return false;
  };

  const tryPatchGameActionComponent = (appId, remaining = 60) => {
    if (disposed || remaining <= 0) return;
    activeAppId = appId;
    if (!frontendToken) {
      const timer = window.setTimeout(() => {
        retryTimers.delete(timer);
        tryPatchGameActionComponent(appId, remaining - 1);
      }, 50);
      retryTimers.add(timer);
      return;
    }
    const menu = [...document.querySelectorAll('[role="menu"]')].find((candidate) =>
      [...candidate.querySelectorAll('[role="menuitem"]')].some((item) =>
        typeof getReactProps(item)?.onClick === "function"
      )
    );
    if (menu && patchGameActionComponent(menu)) return;
    const timer = window.setTimeout(() => {
      retryTimers.delete(timer);
      tryPatchGameActionComponent(appId, remaining - 1);
    }, 50);
    retryTimers.add(timer);
  };

  const isGameArtworkHandler = (handler) => {
    if (typeof handler !== "function") return false;
    const source = handler.toString();
    return source.includes("GetAssetImage") && source.includes("ChangeArtwork") &&
      source.includes("launchSource");
  };

  const onContextMenuCapture = (event) => {
    const path = typeof event.composedPath === "function"
      ? event.composedPath()
      : (() => { const nodes = []; for (let node = event.target; node; node = node.parentElement) nodes.push(node); return nodes; })();

    for (const node of path) {
      if (!(node instanceof HTMLElement)) continue;
      const props = getReactProps(node);
      const handler = props?.onContextMenu;
      if (!isGameArtworkHandler(handler)) continue;
      const appId = getAppId(node);
      if (!appId) continue;

      if (!handler.__sgdbContextMenuWrapped) {
        const wrapped = function (...args) {
          if (disposed) return handler.apply(this, args);
          activeAppId = appId;
          for (const timer of retryTimers) window.clearTimeout(timer);
          retryTimers.clear();
          const result = handler.apply(this, args);
          window.clearTimeout(insertionTimer);
          insertionTimer = window.setTimeout(() => tryPatchGameActionComponent(appId), 0);
          return result;
        };
        wrapped.__sgdbContextMenuWrapped = true;
        const propsKey = Object.keys(node).find((name) => name.startsWith("__reactProps$"));
        if (propsKey) {
          const wrappedProps = { ...props, onContextMenu: wrapped };
          node[propsKey] = wrappedProps;
          wrappedTileProps.set(node, { propsKey, originalProps: props, wrappedProps });
        }
      }
      return;
    }
  };

  const onChannelMessage = (event) => {
    const message = event.data || {};
    if (message.type === "label" && typeof message.label === "string" && message.label.length < 100) {
      if (message.token !== frontendToken) return;
      menuLabel = message.label;
      activeMenuComponent?.forceUpdate?.();
    } else if (message.type === "register" && typeof message.token === "string" && message.token.length < 100) {
      frontendToken = message.token;
      channel.postMessage({ type: "registered", token: frontendToken });
      activeMenuComponent?.forceUpdate?.();
    } else if (message.type === "unregister" && message.token === frontendToken) {
      frontendToken = null;
      activeMenuComponent?.forceUpdate?.();
      requestRegistration();
    }
  };

  const requestRegistration = () => {
    if (disposed || frontendToken) return;
    channel.postMessage({ type: "request-register" });
    registrationTimer = window.setTimeout(requestRegistration, 1000);
  };
  let registrationTimer = 0;

  channel.addEventListener("message", onChannelMessage);
  document.addEventListener("contextmenu", onContextMenuCapture, true);
  window.__sgdbContextMenuHook = {
    cleanup() {
      disposed = true;
      document.removeEventListener("contextmenu", onContextMenuCapture, true);
      channel.removeEventListener("message", onChannelMessage);
      window.clearTimeout(insertionTimer);
      window.clearTimeout(registrationTimer);
      for (const timer of retryTimers) window.clearTimeout(timer);
      retryTimers.clear();
      for (const [node, patch] of wrappedTileProps) {
        if (node[patch.propsKey] === patch.wrappedProps) node[patch.propsKey] = patch.originalProps;
      }
      wrappedTileProps.clear();
      for (const [component, patch] of patchedClasses) {
        if (component.prototype.render === patch.wrappedRender) {
          component.prototype.render = patch.originalRender;
        }
      }
      patchedClasses.clear();
      activeMenuComponent?.forceUpdate?.();
      activeMenuComponent = null;
      channel.close();
      delete window.__sgdbContextMenuHook;
    },
  };
  requestRegistration();
})()'''


class CDPTab:
    def __init__(self, target_id, websocket):
        self.target_id = target_id
        self.websocket = websocket
        self.next_id = 0
        self.pending = {}
        self.reader_task = asyncio.create_task(self._read_messages())
        self.script_id = None

    async def command(self, method, params=None, timeout=5):
        self.next_id += 1
        command_id = self.next_id
        loop = asyncio.get_running_loop()
        future = loop.create_future()
        self.pending[command_id] = future
        try:
            await self.websocket.send_json({"id": command_id, "method": method, "params": params or {}})
            response = await asyncio.wait_for(future, timeout=timeout)
        except BaseException:
            if not future.done():
                future.cancel()
            raise
        finally:
            self.pending.pop(command_id, None)
        if "error" in response:
            raise RuntimeError(response["error"].get("message", method))
        return response.get("result", {})

    async def _read_messages(self):
        try:
            async for message in self.websocket:
                if message.type != aiohttp.WSMsgType.TEXT:
                    continue
                data = json.loads(message.data)
                future = self.pending.get(data.get("id"))
                if future and not future.done():
                    future.set_result(data)
        except asyncio.CancelledError:
            raise
        except Exception as error:
            decky.logger.debug(f"SteamGridDB CDP reader stopped: {error}")
        finally:
            for future in self.pending.values():
                if not future.done():
                    future.set_exception(ConnectionError("Steam UI CDP connection closed"))

    async def install(self):
        await self.command("Page.enable")
        await self.command("Runtime.enable")
        result = await self.command("Page.addScriptToEvaluateOnNewDocument", {"source": PAGE_HOOK})
        self.script_id = result.get("identifier")
        await self.command("Runtime.evaluate", {"expression": PAGE_HOOK, "returnByValue": True})

    async def close(self):
        try:
            await self.command("Runtime.evaluate", {
                "expression": "window.__sgdbContextMenuHook?.cleanup()",
                "returnByValue": True,
            }, timeout=1)
            if self.script_id:
                await self.command("Page.removeScriptToEvaluateOnNewDocument", {"identifier": self.script_id}, timeout=1)
        except Exception:
            pass
        self.reader_task.cancel()
        try:
            await self.reader_task
        except asyncio.CancelledError:
            pass
        await self.websocket.close()


class SteamBrowserHook:
    """Poll Steam's local CEF targets and install the page hook in Big Picture."""

    def __init__(self):
        self._task = None
        self._session = None
        self._tabs = {}
        self._running = False
        self._reported_unavailable = False
        self._reported_multiple_targets = False

    async def start(self):
        if self._task is None:
            self._running = True
            self._task = asyncio.create_task(self._monitor())

    async def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None
        for tab in list(self._tabs.values()):
            await tab.close()
        self._tabs.clear()
        if self._session:
            await self._session.close()
            self._session = None

    async def _monitor(self):
        self._session = aiohttp.ClientSession()
        try:
            while self._running:
                try:
                    async with self._session.get(STEAM_CDP_ENDPOINT, timeout=3) as response:
                        targets = await response.json()
                    page_targets = {target["id"]: target for target in targets if target.get("type") == "page"}

                    steam_targets = {
                        target_id: target for target_id, target in page_targets.items()
                        if target.get("title") == "Steam Big Picture Mode" or
                        "/routes/steamweb" in target.get("url", "")
                    }
                    if len(steam_targets) > 1:
                        desired_targets = {}
                        if not self._reported_multiple_targets:
                            decky.logger.warning(
                                "SteamGridDB context-menu bridge disabled: multiple Steam Big Picture windows are open."
                            )
                            self._reported_multiple_targets = True
                    else:
                        desired_targets = steam_targets
                        self._reported_multiple_targets = False

                    for target_id, tab in list(self._tabs.items()):
                        if target_id not in desired_targets or tab.reader_task.done():
                            await self._tabs.pop(target_id).close()

                    for target_id, target in desired_targets.items():
                        if target_id in self._tabs:
                            continue
                        await self._attach(target)
                except asyncio.CancelledError:
                    raise
                except Exception as error:
                    if not self._reported_unavailable:
                        decky.logger.info(
                            "SteamGridDB context-menu bridge waiting for Steam UI CDP "
                            f"at {STEAM_CDP_ENDPOINT}: "
                            f"{describe_cdp_error(error, 'HTTP request')}"
                        )
                        self._reported_unavailable = True
                await asyncio.sleep(POLL_INTERVAL)
        finally:
            for tab in list(self._tabs.values()):
                await tab.close()
            self._tabs.clear()
            if self._session:
                await self._session.close()
                self._session = None
            self._task = None

    async def _attach(self, target):
        websocket = None
        tab = None
        try:
            websocket = await self._session.ws_connect(target["webSocketDebuggerUrl"], heartbeat=20)
            tab = CDPTab(target["id"], websocket)
            self._tabs[target["id"]] = tab
            location = await tab.command("Runtime.evaluate", {
                "expression": "location.href",
                "returnByValue": True,
            })
            href = location.get("result", {}).get("value", "")
            if "steamloopback.host" not in href and target.get("title") != "Steam Big Picture Mode":
                await self._tabs.pop(target["id"]).close()
                return
            await tab.install()
            self._reported_unavailable = False
            decky.logger.debug(f"SteamGridDB context-menu hook installed in {target.get('title')}")
        except asyncio.CancelledError:
            tab = self._tabs.pop(target["id"], None) or tab
            if tab:
                await tab.close()
            elif websocket:
                await websocket.close()
            raise
        except Exception as error:
            tab = self._tabs.pop(target["id"], None)
            if tab:
                await tab.close()
            if not self._reported_unavailable:
                endpoint = target.get("webSocketDebuggerUrl", STEAM_CDP_ENDPOINT)
                decky.logger.info(
                    "SteamGridDB context-menu hook could not attach to Steam UI CDP "
                    f"at {endpoint}: "
                    f"{describe_cdp_error(error, 'WebSocket attachment')}"
                )
                self._reported_unavailable = True
