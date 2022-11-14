import { useState, createContext, FC, useEffect, useContext, useCallback, useMemo } from 'react';
import { ServerAPI } from 'decky-frontend-lib';
import debounce from 'just-debounce';

import log from '../utils/log';

export const SettingsContext = createContext({});

type SettingsContextType = {
  set: (key: any, value: any) => void;
  get: (key: any, fallback: any) => any;
  settings: any;
};

export const SettingsProvider: FC<{ serverApi: ServerAPI }> = ({ serverApi, children }) => {
  const [settings, setSettings] = useState({});

  const save = useMemo(() => async (settings: any) => {
    log('writing settings', settings);
    await serverApi.callPluginMethod('save_settings', { settings: JSON.stringify(settings) });
  }, [serverApi]);

  const load = useCallback(async () => {
    try {
      const settingsStr = await serverApi.callPluginMethod('load_settings', {});
      if (!settingsStr.success) return;
      log('loaded settings', settingsStr.result);
      setSettings(JSON.parse(settingsStr.result as string) ?? {});
      return settingsStr;
    } catch (error) {
      return;
    }
  }, [serverApi]);

  const set = useMemo(() => debounce(async (key, val) => {
    log('saving settings', key, val);
    setSettings((s) => {
      return { ...s, [key]: val };
    });
  }, 1500), []);

  const get: SettingsContextType['get'] = (key, fallback) => {
    log('getting', key, settings[key]);
    return settings[key] ?? fallback;
  };

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    save(settings);
  }, [save, settings]);

  return <SettingsContext.Provider value={{ set, get, settings }}>
    {children}
  </SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext) as SettingsContextType;

export default useSettings;
