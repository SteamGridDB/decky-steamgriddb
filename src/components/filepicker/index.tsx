import {
  ControlsList,
  DialogButton,
  Focusable,
  SteamSpinner,
  TextField,
  DialogBody,
  DialogControlsSection,
  DialogFooter,
  Dropdown,
  ToggleField,
  ServerAPI,
  Marquee,
} from 'decky-frontend-lib';
import { FunctionComponent, useState, useEffect, useMemo, useCallback } from 'react';
import { FileIcon, defaultStyles } from 'react-file-icon';
import { FaArrowUp, FaFolder } from 'react-icons/fa';
import { filesize } from 'filesize';

import DropdownMultiselect from '../DropdownMultiselect';

import { styleDefObj } from './iconCustomizations';

export interface FilePickerProps {
  serverApi: ServerAPI;
  startPath: string;
  includeFiles?: boolean;
  filter?: RegExp | ((file: File) => boolean);
  validFileExtensions?: string[];
  defaultHidden?: boolean;
  onSubmit: (val: { path: string; realpath: string }) => void;
  closeModal?: () => void;
}

export interface File {
  isdir: boolean;
  ishidden: boolean;
  name: string;
  realpath: string;
  size: number;
  modified: number;
  created: number;
}

interface FileListing {
  realpath: string;
  files: File[];
}

type SortOption = 'name_desc' | 'name_asc' | 'modified_desc' | 'modified_asc' | 'created_desc' | 'created_asc' | 'size_desc' | 'size_asc';

function getList(
  serverApi: ServerAPI,
  path: string,
  includeFiles = true
): Promise<{ result: FileListing | string; success: boolean }> {
  return serverApi.callPluginMethod('filepicker_new', { path, include_files: includeFiles });
}

const sortOptions = [
  {
    data: 'name_desc',
    label: 'A-Z',
  },
  {
    data: 'name_asc',
    label: 'Z-A',
  },
  {
    data: 'modified_desc',
    label: 'Modified (Newest)',
  },
  {
    data: 'modified_asc',
    label: 'Modified (Oldest)',
  },
  {
    data: 'created_desc',
    label: 'Created (Newest)',
  },
  {
    data: 'created_asc',
    label: 'Created (Oldest)',
  },
  {
    data: 'size_desc',
    label: 'Size (Largest)',
  },
  {
    data: 'size_asc',
    label: 'Size (Smallest)',
  },
];

const iconStyles = {
  paddingRight: '10px',
  width: '1em',
};

const FilePicker: FunctionComponent<FilePickerProps> = ({
  serverApi,
  startPath,
  includeFiles = true,
  filter,
  validFileExtensions = null,
  defaultHidden = false, // false by default makes sense for most users
  onSubmit,
  closeModal,
}) => {
  if (startPath !== '/' && startPath.endsWith('/')) startPath = startPath.substring(0, startPath.length - 1); // remove trailing path
  const [path, setPath] = useState<string>(startPath);
  const [listing, setListing] = useState<FileListing>({ files: [], realpath: path });
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showHidden, setShowHidden] = useState<boolean>(defaultHidden);
  const [sort, setSort] = useState<SortOption>('name_desc');
  const [selectedFiles, setSelectedFiles] = useState<any>(validFileExtensions);

  const validExtsOptions = useMemo(() => {
    if (!validFileExtensions) return [];
    return [{ label: 'All Files', value: 'all_files' }, ...validFileExtensions.map((x) => ({ label: x, value: x }))];
  }, [validFileExtensions]);

  const handleExtsSelect = useCallback((val: any) => {
    // unselect other options if "All Files" is checked
    if (val.includes('all_files')) {
      setSelectedFiles(['all_files']);
    } else {
      setSelectedFiles(val);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (error) setError(null);
      setLoading(true);
      const listing = await getList(serverApi, path, includeFiles);
      if (!listing.success) {
        setListing({ files: [], realpath: path });
        setLoading(false);
        setError(listing.result as string);
        return;
      } else {
        setFiles((listing.result as FileListing).files);
      }
      setLoading(false);
      setListing(listing.result as FileListing);
    })();
  }, [error, includeFiles, path, serverApi]);

  useEffect(() => {
    const files = [...listing.files]
      // Hidden files filter
      .filter((file) => {
        if (showHidden && file.ishidden) return true;
        if (!showHidden && file.ishidden) return false;
        return true;
      })
      // File extension filter
      .filter((file) => {
        if (!validFileExtensions || file.isdir || selectedFiles.includes('all_files')) return true;

        const extension = file.realpath.split('.').pop() as string;
        if (selectedFiles.includes(extension)) return true;
        return false;
      })
      // Custom filter
      .filter((file) => {
        if (filter instanceof RegExp) return filter.test(file.name);
        if (typeof filter === 'function') return filter(file);
        return true;
      })
      // Sort files
      .sort((a, b) => {
        const key = sort.split('_')[0];
        const order = sort.split('_')[1];
        if (key === 'name') {
          return (order === 'asc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name));
        }
        return order === 'asc' ?
          (a[key] > b[key] ? 1 : -1) :
          (b[key] > a[key] ? 1 : -1);
      })
      // Put directories before files
      .reduceRight((acc, file) => file.isdir ? [file, ...acc] : [...acc, file], [] as File[]);
    setFiles(files);
  }, [listing.files, filter, showHidden, sort, selectedFiles, validFileExtensions]);

  return (
    <>
      <DialogBody>
        <DialogControlsSection>
          <Focusable flow-children="right" style={{ display: 'flex', marginBottom: '1em' }}>
            <DialogButton
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 'unset',
                width: '40px',
                borderRadius: 'unset',
                margin: '0',
                padding: '10px',
              }}
              onClick={() => {
                const newPathArr = path.split('/');
                newPathArr.pop();
                let newPath = newPathArr.join('/');
                if (newPath == '') newPath = '/';
                setPath(newPath);
              }}
            >
              <FaArrowUp />
            </DialogButton>
            <div style={{ width: '100%' }}>
              <TextField
                value={path}
                onChange={(e) => {
                  e.target.value && setPath(e.target.value);
                }}
                style={{ height: '100%' }}
              />
            </div>
          </Focusable>
          <ControlsList alignItems="center" spacing="standard">
            <ToggleField
              highlightOnFocus={false}
              label="Show Hidden Files"
              bottomSeparator="none"
              checked={showHidden}
              onChange={() => setShowHidden((x) => !x)}
            />
            <Dropdown
              rgOptions={sortOptions}
              selectedOption={sort}
              onChange={(x) => setSort(x.data)}
            />
            {validFileExtensions && (
              <DropdownMultiselect
                label="File Type"
                items={validExtsOptions}
                selected={selectedFiles}
                onSelect={handleExtsSelect}
              />
            )}
          </ControlsList>
        </DialogControlsSection>
        <DialogControlsSection style={{ marginTop: '1em' }}>
          <Focusable style={{ display: 'flex', gap: '.25em', flexDirection: 'column', height: '60vh', overflow: 'scroll' }}>
            {loading && <SteamSpinner style={{ height: '100%' }} />}
            {!loading &&
            files
              .map((file) => {
                const extension = file.realpath.split('.').pop() as string;
                return (
                  <DialogButton
                    key={`${file.realpath}${file.name}`}
                    style={{ borderRadius: 'unset', margin: '0', padding: '10px' }}
                    onClick={() => {
                      const fullPath = `${path}${path.endsWith('/') ? '' : '/'}${file.name}`;
                      if (file.isdir) setPath(fullPath);
                      else {
                        onSubmit({ path: fullPath, realpath: file.realpath });
                        closeModal?.();
                      }
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                      {file.isdir ? (
                        <FaFolder style={iconStyles} />
                      ) : (
                        <div style={iconStyles}>
                          {file.realpath.includes('.') ? (
                            <FileIcon {...defaultStyles[extension]} {...styleDefObj[extension]} extension={''} />
                          ) : (
                            <FileIcon />
                          )}
                        </div>
                      )}
                      <Marquee>{file.name}</Marquee>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        opacity: .5,
                        fontSize: '.6em',
                        textAlign: 'left',
                        lineHeight: 1,
                        marginTop: '.5em',
                      }}
                    >
                      {file.isdir ? 'Folder' : filesize(file.size, { standard: 'iec' })}
                      <span style={{ marginLeft: 'auto' }}>{new Date(file.modified * 1000).toLocaleString()}</span>
                    </div>
                  </DialogButton>
                );
              })}
            {error}
          </Focusable>
        </DialogControlsSection>
      </DialogBody>
      {!loading && !error && !includeFiles && (
        <DialogFooter>
          <DialogButton
            className="Primary"
            style={{ marginTop: '10px', alignSelf: 'flex-end' }}
            onClick={() => {
              onSubmit({ path, realpath: listing.realpath });
              closeModal?.();
            }}
          >
          Use this folder
          </DialogButton>
        </DialogFooter>
      )}
    </>
  );
};

export default FilePicker;
