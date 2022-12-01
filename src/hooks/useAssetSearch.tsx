import { useState, createContext, FC, useContext, useCallback, useMemo } from 'react';
import { showModal } from 'decky-frontend-lib';
import isEqual from 'react-fast-compare';

import useSettings from '../hooks/useSettings';
import { useSGDB } from '../hooks/useSGDB';
import FiltersModal from '../Modals/FiltersModal';
import log from '../utils/log';

export type AssetSearchContextType = {
  loading: boolean;
  assets: any[];
  doSearchAndSetAssets: (assetType: SGDBAssetType) => Promise<void>;
  openFilters: (assetType: SGDBAssetType) => void;
}

export const SearchContext = createContext({});

export const AssetSearchContext: FC = ({ children }) => {
  const { set, get } = useSettings();
  const { doSearch } = useSGDB();
  const [assets, setAssets] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  const handleFiltersSave = useCallback(async (assetType: SGDBAssetType, filters) => {
    set(`filters_${assetType}`, filters);
    const currentFilters = await get(`filters_${assetType}`, null);
    if (!isEqual(filters, currentFilters)) {
      setLoading(true);
      setAssets([]);
      setAssets(await doSearch(assetType, filters));
      setLoading(false);
    }
  }, [doSearch, get, set]);

  const openFilters = useCallback(async (assetType: SGDBAssetType) => {
    log('Open Filters');
    const defaultFilters = await get(`filters_${assetType}`, null);
    showModal(<FiltersModal assetType={assetType} onSave={handleFiltersSave} defaultFilters={defaultFilters} />, window);
  }, [get, handleFiltersSave]);

  const doSearchAndSetAssets = useCallback(async (assetType: SGDBAssetType) => {
    setLoading(true);
    const filters = await get(`filters_${assetType}`, null);
    const results = await doSearch(assetType, filters);
    setLoading(false);
    setAssets(results);
  }, [doSearch, get]);

  const value = useMemo(() => ({
    loading,
    assets,
    doSearchAndSetAssets,
    openFilters
  }), [assets, doSearchAndSetAssets, loading, openFilters]);
  
  return <SearchContext.Provider value={value}>
    {children}
  </SearchContext.Provider>;
};

export const useAssetSearch = () => useContext(SearchContext) as AssetSearchContextType;

export default useAssetSearch;
