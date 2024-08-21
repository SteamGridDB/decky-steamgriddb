import {
  SteamAppOverview,
  joinClassNames,
  Focusable,
  GamepadEvent,
  appDetailsHeaderClasses,
  LogoPinPositions,
  LogoPosition,
} from '@decky/ui';
import { FC, useState, useEffect, useRef, useCallback } from 'react';

import LibraryImage from '../components/asset/LibraryImage';
import getCustomLogoPosition from '../utils/getCustomLogoPosition';
import log from '../utils/log';
import { ASSET_TYPE } from '../constants';
import t from '../utils/i18n';
import Dpad from '../../assets/dpad.svg';
import FooterGlyph from '../components/FooterGlyph';
import getAppOverview from '../utils/getAppOverview';
import getAppDetails from '../utils/getAppDetails';

const getStylePositions = (pos: LogoPinPositions, widthPct: number, heightPct: number) => {
  const positions = {
    BottomLeft: {
      bottom: 0,
      top: 100 - heightPct,
      left: 0,
      right: 100 - widthPct,
    },
    UpperLeft: {
      bottom: 100 - heightPct,
      top: 0,
      left: 0,
      right: 100 - widthPct,
    },
    CenterCenter: {
      bottom: (100 - heightPct) / 2,
      top: (100 - heightPct) / 2,
      left: (100 - widthPct) / 2,
      right: (100 - widthPct) / 2,
    },
    UpperCenter: {
      bottom: 100 - heightPct,
      top: 0,
      left: (100 - widthPct) / 2,
      right: (100 - widthPct) / 2,
    },
    BottomCenter: {
      bottom: 0,
      top: 100 - heightPct,
      left: (100 - widthPct) / 2,
      right: (100 - widthPct) / 2,
    },
  };
  return positions[pos];
};

const LogoPositioner = ({ app, logoPos, border, onAnchorClick, setLogoPos }: {
  app: SteamAppOverview,
  logoPos: LogoPosition | null,
  border: boolean,
  onAnchorClick: (position: LogoPinPositions) => void,
  setLogoPos: React.Dispatch<React.SetStateAction<LogoPosition | null>>
}) => {
  const [dragging, setDragging] = useState(false);
  // Calculations when using cursor to resize are all refs for speed
  const positionerRef = useRef<HTMLDivElement | null>(null);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const heroBoundryRect = useRef<DOMRect>();
  const logoSizerWidth = useRef(0);
  const logoSizerHeight = useRef(0);

  const positions = logoPos ? getStylePositions(logoPos.pinnedPosition, logoPos.nWidthPct, logoPos.nHeightPct) : null;
  const handleMove = useCallback((evt: MouseEvent) => {
    const heroRect = heroBoundryRect.current;
    if (!dragging || !logoPos || !heroRect) return;

    let pctX = 0;
    let pctY = 0;
    const deltaX = evt.pageX - lastX.current;
    const deltaY = evt.pageY - lastY.current;

    if (['CenterCenter', 'UpperCenter', 'BottomCenter'].includes(logoPos.pinnedPosition)) {
      if (lastX.current < heroRect.width / 2 + heroRect.x) {
        pctX = (deltaX * -2 + logoSizerWidth.current) / heroRect.width;
      } else {
        pctX = (deltaX * 2 + logoSizerWidth.current) / heroRect.width;
      }
    } else {
      pctX = (deltaX + logoSizerWidth.current) / heroRect.width;
    }

    if (['UpperLeft', 'UpperCenter'].includes(logoPos.pinnedPosition)) {
      pctY = (deltaY + logoSizerHeight.current) / heroRect.height;
    } else if (logoPos.pinnedPosition === 'CenterCenter') {
      if (lastY.current > heroRect.height / 2 + heroRect.y) {
        pctY = (deltaY * 2 + logoSizerHeight.current) / heroRect.height;
      } else {
        pctY = (logoSizerHeight.current - deltaY * 2) / heroRect.height;
      }
    } else {
      pctY = (logoSizerHeight.current - deltaY) / heroRect.height;
    }

    setLogoPos((logoPos: any) => {
      const newLogoPos = { ...logoPos };
      newLogoPos.nWidthPct = pctX * 100;
      newLogoPos.nHeightPct = pctY * 100;
      newLogoPos.nWidthPct = Math.min(Math.max(newLogoPos.nWidthPct, 10), 100);
      newLogoPos.nHeightPct = Math.min(Math.max(newLogoPos.nHeightPct, 10), 100);
      return newLogoPos;
    });
  }, [dragging, logoPos, setLogoPos]);

  const handleMouseDown = (evt: MouseEvent) => {
    lastX.current = evt.pageX;
    lastY.current = evt.pageY;

    const heroRect = (evt.currentTarget as HTMLDivElement)?.closest('.logo-wrap')?.getBoundingClientRect();
    const logoRect = (evt.currentTarget as HTMLDivElement)?.querySelector('.logo-positioner-logo')?.getBoundingClientRect();
    if (logoRect && heroRect) {
      heroBoundryRect.current = heroRect;
      logoSizerWidth.current = logoRect.width;
      logoSizerHeight.current = logoRect.height;
    }
    setDragging(true);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    const positionerEl = positionerRef.current;
    if (!positionerEl) return;

    const draggyEl = positionerEl.querySelector('.logo-wrap-pos') as HTMLDivElement;
    const modalOverlayEl = positionerEl.closest('.ModalOverlayContent.active') as HTMLDivElement;
    draggyEl?.addEventListener('mousedown', handleMouseDown);
    modalOverlayEl?.addEventListener('mousemove', handleMove);
    modalOverlayEl?.addEventListener('mouseup', handleMouseUp);

    return () => {
      draggyEl?.removeEventListener('mousedown', handleMouseDown);
      modalOverlayEl?.removeEventListener('mousemove', handleMove);
      modalOverlayEl?.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMove, dragging]);

  if (!logoPos) return (
    <div className="logo-positioner spinnyboi">
      <img alt="Loading..." src="/images/steam_spinner.png" />
    </div>
  );

  return (
    <div
      ref={positionerRef}
      className={joinClassNames(
        dragging ? 'is-mouse-resizing' : '',
        appDetailsHeaderClasses.TopCapsule,
        app.BIsModOrShortcut() ? appDetailsHeaderClasses.FallbackArt : '',
        'logo-positioner',
        border ? 'logo-border' : '',
        `pos-${logoPos.pinnedPosition}`
      )}
      style={{
        ['--logo-width' as string]: `${logoPos.nWidthPct}%`,
        ['--logo-height' as string]: `${logoPos.nHeightPct}%`,
        ['--logo-left' as string]: positions ? `${positions.left}%` : undefined,
        ['--logo-top' as string]: positions ? `${positions.top}%` : undefined,
      }}
    >
      <div className="logo-outer-region">
        <div className="logo-wrap">
          <span className="logo-anchor-guide guide-upperleft" onClick={() => onAnchorClick('UpperLeft')} />
          <span className="logo-anchor-guide guide-bottomleft" onClick={() => onAnchorClick('BottomLeft')} />
          <span className="guide-middlecontainer">
            <span className="logo-anchor-guide guide-top" onClick={() => onAnchorClick('UpperCenter')} />
            <span className="logo-anchor-guide guide-mid" onClick={() => onAnchorClick('CenterCenter')} />
            <span className="logo-anchor-guide guide-bottom" onClick={() => onAnchorClick('BottomCenter')} />
          </span>
          <div className="logo-wrap-pos">
            <LibraryImage
              app={app}
              eAssetType={ASSET_TYPE.logo}
              allowCustomization={false}
              className="logo-positioner-logo"
              imageClassName="logo-positioner-logo-img"
              backgroundType="transparent"
            />
          </div>
        </div>
      </div>
      <LibraryImage
        app={app}
        eAssetType={ASSET_TYPE.hero}
        allowCustomization={false}
        neverShowTitle
        backgroundType="transparent"
        className="logo-positioner-hero"
      />
    </div>
  );
};

const LogoPositionerModal: FC<{ closeModal?: () => void, appId: number }> = ({ closeModal, appId }) => {
  const [overview, setOverview] = useState<SteamAppOverview | null>(null);
  const [logoPos, setLogoPos] = useState<LogoPosition | null>(null);
  const [showBorder, setShowBorder] = useState<boolean>(true);
  const resizeAmount = useRef(.25);

  const handleCancel = () => {
    closeModal?.();
  };

  const handleSave = async () => {
    if (!overview || !logoPos) return;
    await window.appDetailsStore.SaveCustomLogoPosition(overview, logoPos);
    closeModal?.();
  };

  const handleReset = async () => {
    if (!overview || !logoPos) return;
    await (window.appDetailsStore as unknown as {
      ClearCustomLogoPosition: (app: SteamAppOverview) => any;
    }).ClearCustomLogoPosition(overview);
    closeModal?.();
  };

  const handleDirection = (evt: GamepadEvent) => {
    // Increase speed when held down
    resizeAmount.current = evt.detail.is_repeat ? Math.min(resizeAmount.current + 0.25, 2) : 0.25;

    setLogoPos((logoPos: any) => {
      const newLogoPos = { ...logoPos };
      switch (evt.detail.button) {
      case 9: // up
        newLogoPos.nHeightPct = newLogoPos.nHeightPct + resizeAmount.current;
        break;
      case 10: // down
        newLogoPos.nHeightPct = newLogoPos.nHeightPct - resizeAmount.current;
        break;
      case 11: // left
        newLogoPos.nWidthPct = newLogoPos.nWidthPct - resizeAmount.current;
        break;
      case 12: // right
        newLogoPos.nWidthPct = newLogoPos.nWidthPct + resizeAmount.current;
        break;
      }
      newLogoPos.nWidthPct = Math.min(Math.max(newLogoPos.nWidthPct, 0.01), 100);
      newLogoPos.nHeightPct = Math.min(Math.max(newLogoPos.nHeightPct, 0.01), 100);
      return newLogoPos;
    });
  };

  const handlePinPos = () => {
    const anchorPos: LogoPinPositions[] = ['BottomLeft', 'UpperLeft', 'UpperCenter', 'CenterCenter', 'BottomCenter'];
    setLogoPos((logoPos) => {
      const currentPosIndex = anchorPos.indexOf(logoPos?.pinnedPosition ?? 'BottomLeft');
      const nextPosIndex = (currentPosIndex + 1) % anchorPos.length;

      return {
        ...logoPos,
        pinnedPosition: anchorPos[nextPosIndex],
      } as LogoPosition;
    });
  };

  const handleAnchorClick = (position: LogoPinPositions) => {
    setLogoPos((logoPos) => {
      return {
        ...logoPos,
        pinnedPosition: position,
      } as LogoPosition;
    });
  };

  useEffect(() => {
    if (appId) {
      (async () => {
        setOverview(await getAppOverview(appId));
      })();
    }
  }, [appId]);

  useEffect(() => {
    if (overview) {
      (async () => {
        const appdetails = await getAppDetails(overview.appid);
        const logoPos = await getCustomLogoPosition(overview.appid) || // Loads from json
          appdetails?.libraryAssets?.logoPosition || // Loads from default Steam app details
          { pinnedPosition: 'BottomLeft', nWidthPct: 50, nHeightPct: 50 }; // Fallback when no data is available
        log(logoPos);
        if (logoPos) {
          setLogoPos(logoPos);
        }
      })();
    }
  }, [overview]);

  return (
    <Focusable
      noFocusRing={false}
      className="sgdb-modal sgdb-modal-logo-position"
      onGamepadDirection={handleDirection}
      onCancel={handleCancel}
      onCancelButton={handleCancel}
      onCancelActionDescription={t('Button_Cancel', 'Cancel', true)}
      onActivate={handleSave}
      onOKActionDescription={t('Button_Save', 'Save', true)}
      onSecondaryButton={handlePinPos}
      onSecondaryActionDescription={t('ACTION_CHANGE_POS_LOGO_ANCHOR_POINT', 'Change Anchor Point')}
      onOptionsButton={() => setShowBorder((x) => !x)}
      onOptionsActionDescription={showBorder ? t('ACTION_HIDE_POS_GUIDES', 'Hide Guides') : t('ACTION_SHOW_OUTLINE', 'Show Guides')}
      onMenuButton={handleReset}
      onMenuActionDescription={t('CustomArt_ResetLogoPosition', 'Reset Logo Position', true)}
      onClick={(evt) => evt.preventDefault()} // Prevent onActivate from triggering on actual mouse click
    >
      {overview && (
        <LogoPositioner
          app={overview}
          logoPos={logoPos}
          border={showBorder}
          onAnchorClick={handleAnchorClick}
          setLogoPos={setLogoPos}
        />
      )}
      <ul className="logo-positioner-instructions">
        <li><img src={Dpad} /> {t('ACTION_ADJUST_POS_SIZE', 'Adjust Size')}</li>
        <li onClick={handlePinPos}><FooterGlyph button={2} size={1} type={0} /> {t('ACTION_CHANGE_POS_LOGO_ANCHOR_POINT', 'Change Anchor Point')}</li>
      </ul>
    </Focusable>
  );
};

export default LogoPositionerModal;
