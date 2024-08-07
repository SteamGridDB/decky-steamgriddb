import { FileSelectionType, openFilePicker } from '@decky/api';

export type FilePickerFilter = RegExp | ((file: File) => boolean) | undefined;

export default (
  startPath: string,
  includeFiles?: boolean,
  filter?: FilePickerFilter,
  filePickerSettings?: {
    validFileExtensions?: string[];
    defaultHidden?: boolean;
  }
): Promise<{ path: string; realpath: string }> => {
  return new Promise((resolve, reject) => {
    openFilePicker(
      FileSelectionType.FILE,
      startPath,
      includeFiles,
      true,
      filter,
      filePickerSettings?.validFileExtensions,
      filePickerSettings?.defaultHidden,
      false
    ).then(resolve, () => reject('User Canceled'));
  });
};