import log from './log';
import { getOfficialAssetUrls, OfficialAssetSource } from './officialAssets';

export type ApplyOfficialAssetsResult = {
  applied: SGDBAssetType[];
  failed: SGDBAssetType[];
};

/**
 * Apply official assets sequentially. Sequential order matters because the icon
 * is last and may trigger a Steam restart.
 */
const applyOfficialAssets = async (
  sources: OfficialAssetSource[],
  apply: (url: string, assetType: SGDBAssetType) => Promise<void>,
  onProgress?: (current: number, source: OfficialAssetSource) => void
): Promise<ApplyOfficialAssetsResult> => {
  const applied: SGDBAssetType[] = [];
  const failed: SGDBAssetType[] = [];

  for (let index = 0; index < sources.length; index++) {
    const source = sources[index];
    onProgress?.(index + 1, source);

    try {
      let lastError: unknown;
      let success = false;

      // Some games don't have 2x images. Fall back to the standard asset if it fails.
      for (const url of getOfficialAssetUrls(source)) {
        try {
          await apply(url, source.assetType);
          success = true;
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!success) throw lastError;
      applied.push(source.assetType);
    } catch (err) {
      log('failed to apply official asset', source.assetType, err);
      failed.push(source.assetType);
    }
  }

  return { applied, failed };
};

export default applyOfficialAssets;
