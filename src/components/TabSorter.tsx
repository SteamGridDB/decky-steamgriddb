import {
  DialogButton,
  ReorderableList,
  Marquee,
  ReorderableEntry,
  Focusable,
} from '@decky/ui';
import {
  useEffect,
  useMemo,
  useState,
  FC,
  useCallback,
  useRef,
} from 'react';
import { HiEyeSlash, HiEye, HiHome } from 'react-icons/hi2';

import log from '../utils/log';
import { tabStrs, DEFAULT_TABS } from '../constants';
import useSettings from '../hooks/useSettings';
import t from '../utils/i18n';

type TabEntryData = {
  type: SGDBAssetType,
}

const buttonStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '10px',
  maxWidth: '40px',
  minWidth: 'auto',
  marginLeft: '.5em',
};

const Interactables: FC<{
  entry: ReorderableEntry<TabEntryData>,
  defaultTab: SGDBAssetType | null,
  hiddenTabs: (SGDBAssetType | undefined)[] | null,
  onDefaultClick: (entry: ReorderableEntry<TabEntryData>) => void,
  onHideClick: (entry: ReorderableEntry<TabEntryData>) => void,
}> = ({ entry, defaultTab, hiddenTabs, onDefaultClick, onHideClick }) => {
  const [shakeHidden, setShakeHidden] = useState(false);
  const isHidden = hiddenTabs?.includes(entry.data?.type);

  useEffect(() => {
    if (shakeHidden) {
      const timeout = setTimeout(() => {
        setShakeHidden(false);
      }, 400); // animation plays for 200ms and repeats twice, so 400ms is enough
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [shakeHidden]);

  if (!entry.data) return null;
  return (
    <>
      {(defaultTab !== entry.data.type) ? (
        <DialogButton
          onOKButton={() => onDefaultClick(entry)}
          style={buttonStyle}
        >
          <HiHome />
        </DialogButton>
      ) : (
        <div style={buttonStyle}>
          <HiHome fill="#008ada" />
        </div>
      )}
      <DialogButton
        onOKActionDescription={isHidden ? 'Show' : t('Button_Hide', 'Hide', true)}
        onOKButton={() => {
          if (!entry.data) return;

          if (
            hiddenTabs &&
            !isHidden &&
            hiddenTabs.length === DEFAULT_TABS.length - 1
          ) {
            setShakeHidden(true);
          } else {
            onHideClick(entry);
          }
        }}
        style={shakeHidden ? {
          ...buttonStyle,
          ...{ animation: '200ms sgdb-button-shake 2' },
        } : buttonStyle}
      >
        {isHidden ? <HiEye /> : <HiEyeSlash />}
      </DialogButton>
    </>
  );
};

const TabSorter = () => {
  const { set, get } = useSettings();
  const [defaultTab, setDefaultTab] = useState<SGDBAssetType | null>(null);
  const [hiddenTabs, setHiddenTabs] = useState<SGDBAssetType[] | null>(null);
  const [tabPositions, setTabPositions] = useState<SGDBAssetType[] | null>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const once = useRef(false);

  const tabEntries: ReorderableEntry<TabEntryData>[] = useMemo(() => {
    if (tabPositions === null || hiddenTabs === null) return [];
    return tabPositions.map((type, i) => ({
      label: (
        <Marquee
          style={{
            maxWidth: '340px',
            opacity: hiddenTabs.includes(type) ? .5 : 1,
          }}
        >
          {tabStrs[type]}
        </Marquee>
      ) as unknown as string,
      data: { type },
      position: i,
    }));
  }, [tabPositions, hiddenTabs]);

  const handleSave = (entries: ReorderableEntry<TabEntryData>[]) => {
    log('tab list', entries);
    const sortedTabs = entries.map((entry: ReorderableEntry<TabEntryData>) => entry.data?.type);
    set('tabs_order', sortedTabs, true);
    setTabPositions(sortedTabs as SGDBAssetType[]);
  };

  const handleHideClick = useCallback((entry: ReorderableEntry<TabEntryData>) => {
    setHiddenTabs((x) => {
      if (entry.data && x) {
        const v = [...x];
        if (v.includes(entry.data.type)){
          v.splice(v.indexOf(entry.data.type), 1);
        } else {
          v.push(entry.data.type);
        }
        set('tabs_hidden', v, true);
        return v;
      }
      return null;
    });
  }, [set]);

  const handleDefaultClick = useCallback((entry: ReorderableEntry<TabEntryData>) => {
    if (entry.data) {
      set('tab_default', entry.data.type, true);
      setDefaultTab(entry.data.type);
    }
  }, [set]);

  useEffect(() => {
    (async () => {
      const positions: SGDBAssetType[] = await get('tabs_order', DEFAULT_TABS);
      const hidden: SGDBAssetType[] = await get('tabs_hidden', []);
      let tabDefault = await get('tab_default', 'grid_p');
      const filtered = positions.filter((x) => !hidden.includes(x));
      setTabPositions(positions);
      setHiddenTabs(hidden);
      // Set first tab as default if default is hidden
      if (!filtered.includes(tabDefault)) {
        tabDefault = filtered[0];
      }
      setDefaultTab(tabDefault);
    })();
  }, [get]);

  useEffect(() => {
    // hack to auto focus first element after render
    if (tabEntries.length > 0 && defaultTab && !once.current) {
      fieldRef.current?.querySelector('button')?.focus();
      once.current = true;
    }
  }, [tabEntries, defaultTab]);

  return (
    <>
      <style>{`
        @keyframes sgdb-button-shake {
          0% { transform: translateX(0) }
          25% { transform: translateX(3px) }
          50% { transform: translateX(-3px) }
          75% { transform: translateX(3px) }
          100% { transform: translateX(0) }
        }
      `}</style>
      <Focusable ref={fieldRef}>
        <ReorderableList
          animate
          entries={tabEntries}
          onSave={handleSave}
          interactables={(props) => (
            <Interactables
              {...props}
              defaultTab={defaultTab}
              hiddenTabs={hiddenTabs}
              onDefaultClick={handleDefaultClick}
              onHideClick={handleHideClick}
            />
          )}
        />
      </Focusable>
    </>
  );
};

TabSorter.displayName = 'TabSorter';

export default TabSorter;