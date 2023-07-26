import { ServerAPI, FileSelectionType } from 'decky-frontend-lib';

/*
  Modified file picker from decky-loader
  Will eventually be submitted to main decky-loader. (and passing "serverApi" won't be necessary)

  - Backwards compatible.
  - More sorting options.
  - Overhauled UX.
  - Allows use of a filter function instead of just RegEx.
  - Added a filter override to only show certain file types.
  - Changed sort to show directories first.
  - Fixed bug where some files and dirs are not shown.
  - Fixed but where you couldn't navigate or start at the root directory.
  - Fixed bug where files from previous dir would appear when navigating due to duplicate keys.
*/

export type FilePickerFilter = RegExp | ((file: File) => boolean) | undefined;

export default (
  startPath: string,
  includeFiles?: boolean,
  filter?: FilePickerFilter,
  filePickerSettings?: {
    validFileExtensions?: string[];
    defaultHidden?: boolean;
  },
  serverApi?: ServerAPI
): Promise<{ path: string; realpath: string }> => {
  return new Promise((resolve, reject) => {
    if (!serverApi) return reject('No server API');

    serverApi.openFilePickerV2(FileSelectionType.FILE, startPath, includeFiles, true, filter, filePickerSettings?.validFileExtensions, filePickerSettings?.defaultHidden, false).then(resolve, () => reject('User Canceled'));
  });
};