import {
  useState,
  createContext,
  FC,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import { call } from '@decky/api';
import debounce from 'just-debounce';

import log from '../utils/log';

export const SettingsContext = createContext({});

type SettingsContextType = {
  set: (key: any, value: any, immediate?: boolean) => void;
  get: (key: any, fallback: any) => Promise<any>;
  settings: any;
};

export const SettingsProvider: FC = ({ children }) => {
  const [setting, setSetting] = useState<{key: any, value: any}>();

  const save = useMemo(() => async (setting: {key: any, value: any}) => {
    log('writing setting', setting);
    await call('set_setting', setting.key, setting.value);
  }, []);

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
    return await call('get_setting', key, fallback);
  }, []);

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
