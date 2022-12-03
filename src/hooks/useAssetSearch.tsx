import {
  useState,
  createContext,
  FC,
  useContext,
  useCallback,
  useMemo
} from 'react';
import { showModal } from 'decky-frontend-lib';
import isEqual from 'react-fast-compare';
import debounce from 'just-debounce';

import useSettings from '../hooks/useSettings';
import { useSGDB } from '../hooks/useSGDB';
import FiltersModal from '../Modals/FiltersModal';
import log from '../utils/log';
import { MIMES, STYLES, DIMENSIONS } from '../constants';

export type AssetSearchContextType = {
  loading: boolean;
  assets: any[];
  doSearchAndSetAssets: (assetType: SGDBAssetType, filters: any, onSuccess?: () => void) => Promise<void>;
  openFilters: (assetType: SGDBAssetType) => void;
  isFilterActive: boolean;
}

export const SearchContext = createContext({});

let abortCont: AbortController | null = null;

export const AssetSearchContext: FC = ({ children }) => {
  const { set, get } = useSettings();
  const { doSearch } = useSGDB();
  const [assets, setAssets] = useState<Array<any>>([]);
  const [currentFilters, setCurrentFilters] = useState();
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const isFilterChanged = useCallback((assetType, filters) => {
    if (!filters) return false;
    // simply cannot be fucked to do this in a better way
    return (
      (filters?.styles ? !isEqual([...filters.styles].sort(), [...STYLES[assetType].default].sort()) : false) ||
      (filters?.dimensions ? !isEqual([...filters.dimensions].sort(), [...DIMENSIONS[assetType].default].sort()) : false) ||
      (filters?.mimes ? !isEqual([...filters.mimes].sort(), [...MIMES[assetType].default].sort()) : false) ||
      filters?.animated !== true ||
      filters?._static !== true ||
      filters?.humor !== true ||
      filters?.epilepsy !== true ||
      filters?.untagged !== true
    );
  }, []);

  const doSearchAndSetAssets = useMemo(() => debounce(async (assetType, filters, onSuccess) => {
    if (abortCont) abortCont?.abort();
    abortCont = new AbortController();

    try {
      setCurrentFilters(filters);
      setIsFilterActive(isFilterChanged(assetType, filters));
      const resp = await doSearch(assetType, filters, abortCont.signal);
      log('search resp', assetType, resp);
      setAssets(resp);
      onSuccess?.();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        log('Search Aborted');
      }
    }
    return () => {
      if (abortCont) abortCont?.abort();
    };
  }, 500), [isFilterChanged, doSearch]) as AssetSearchContextType['doSearchAndSetAssets'];

  const handleFiltersSave = useCallback(async (
    assetType: SGDBAssetType,
    filters
  ) => {
    if (!isEqual(filters, currentFilters)) {
      setLoading(true);
      doSearchAndSetAssets(assetType, filters, () => {
        setLoading(false);
      });
      set(`filters_${assetType}`, filters, true);
      setCurrentFilters(filters);
    }
    setIsFilterActive(isFilterChanged(assetType, filters));
  }, [currentFilters, isFilterChanged, doSearchAndSetAssets, set]);

  const openFilters = useCallback(async (assetType: SGDBAssetType) => {
    log('Open Filters');
    const defaultFilters = await get(`filters_${assetType}`, null);
    showModal(<FiltersModal
      assetType={assetType}
      onSave={handleFiltersSave}
      defaultFilters={defaultFilters}
    />, window);
  }, [get, handleFiltersSave]);

  const value = useMemo(() => ({
    loading,
    assets,
    doSearchAndSetAssets,
    openFilters,
    isFilterActive
  }), [loading, assets, doSearchAndSetAssets, openFilters, isFilterActive]);
  
  return <SearchContext.Provider value={value}>
    {children}
  </SearchContext.Provider>;
};

export const useAssetSearch = () => useContext(SearchContext) as AssetSearchContextType;

export default useAssetSearch;
