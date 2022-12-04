import isEqual from 'react-fast-compare';
import { MIMES, STYLES, DIMENSIONS } from '../constants';

const compareFilterWithDefaults = (assetType: SGDBAssetType, filters: any) => {
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
};

export default compareFilterWithDefaults;
