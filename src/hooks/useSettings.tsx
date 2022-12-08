import {
  useState,
  createContext,
  FC,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import { ServerAPI } from 'decky-frontend-lib';
import debounce from 'just-debounce';

import log from '../utils/log';

export const SettingsContext = createContext({});

type SettingsContextType = {
  set: (key: any, value: any, immediate?: boolean) => void;
  get: (key: any, fallback: any) => Promise<any>;
  settings: any;
};

export const SettingsProvider: FC<{ serverApi: ServerAPI }> = ({ serverApi, children }) => {
  const [setting, setSetting] = useState<{key: any, value: any}>();

  const save = useMemo(() => async (setting: any) => {
    log('writing setting', setting);
    await serverApi.callPluginMethod('set_setting', setting);
  }, [serverApi]);

  const saveDb = useMemo(() => debounce(async (key, value) => {
    log('set setting state', key, value);
    setSetting({ key, value });
  }, 1500), []);

  const set = useMemo(() => (key, value, immediate = false) => {
    if (immediate) {
      return setSetting({ key, value });
    }
    return saveDb(key, value);
  }, [saveDb]) as SettingsContextType['set'];

  const get: SettingsContextType['get'] = useMemo(() => async (key, fallback) => {
    return (await serverApi.callPluginMethod('get_setting', { key, default: fallback })).result;
  }, [serverApi]);

  useEffect(() => {
    if (setting) {
      save(setting);
    }
  }, [save, setting]);

  return (
    <SettingsContext.Provider value={{ set, get }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext) as SettingsContextType;

export default useSettings;
