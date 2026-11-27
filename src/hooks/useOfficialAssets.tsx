import { useMemo } from 'react';
import { showModal } from '@decky/ui';

import ApplyAllOfficialAssetsModal from '../modals/ApplyAllOfficialAssetsModal';
import canEditSteamIcon from '../utils/canEditSteamIcon';
import getOfficialAssetSources from '../utils/officialAssets';

import useAssetSearch from './useAssetSearch';
import useSGDB from './useSGDB';

type UseOfficialAssetsOptions = {
  onApplied?: () => void;
};

/**
 * Owns official-asset availability and the bulk apply-all modal wiring.
 */
const useOfficialAssets = ({ onApplied }: UseOfficialAssetsOptions = {}) => {
  const { appOverview, changeAssetFromUrl } = useSGDB();
  const { externalSgdbData } = useAssetSearch();

  const canEditIcon = canEditSteamIcon(appOverview);
  const sources = useMemo(
    () => getOfficialAssetSources(externalSgdbData, { allowIcon: canEditIcon }),
    [externalSgdbData, canEditIcon]
  );

  const openApplyAll = () => {
    if (sources.length === 0) return;

    showModal((
      <ApplyAllOfficialAssetsModal
        sources={sources}
        appName={appOverview.display_name}
        onApply={changeAssetFromUrl}
        onApplied={onApplied}
      />
    ), window);
  };

  return {
    sources,
    canEditIcon,
    openApplyAll,
  };
};

export default useOfficialAssets;
