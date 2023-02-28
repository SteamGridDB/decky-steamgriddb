import {
  SteamAppOverview,
  joinClassNames,
  Focusable,
  GamepadEvent,
  appDetailsHeaderClasses,
  LogoPinPositions,
  LogoPosition,
} from 'decky-frontend-lib';
import { FC, useState, useEffect, useRef } from 'react';

import LibraryImage from '../components/LibraryImage';
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

const LogoPositioner: FC<{ app: SteamAppOverview, logoPos: LogoPosition | null, border: boolean }> = ({ app, logoPos, border }) => {
  const positions = logoPos ? getStylePositions(logoPos.pinnedPosition, logoPos.nWidthPct, logoPos.nHeightPct) : null;

  if (!logoPos) return (
    <div className="logo-positioner spinnyboi">
      <img alt="Loading..." src="/images/steam_spinner.png" />
    </div>
  );

  return (
    <div
      className={joinClassNames(
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
          <span className="logo-anchor-guide-mid" />
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
    if (evt.detail.is_repeat) {
      if (resizeAmount.current !== 2) {
        resizeAmount.current = resizeAmount.current + .25;
      }
    } else {
      resizeAmount.current = .25;
    }

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
      if (newLogoPos.nWidthPct > 100) {
        newLogoPos.nWidthPct = newLogoPos.nWidthPct = 100;
      }
      if (newLogoPos.nWidthPct <= 0) {
        newLogoPos.nWidthPct = newLogoPos.nWidthPct = 0.01;
      }
      if (newLogoPos.nHeightPct > 100) {
        newLogoPos.nHeightPct = newLogoPos.nHeightPct = 100;
      }
      if (newLogoPos.nHeightPct <= 0) {
        newLogoPos.nHeightPct = newLogoPos.nHeightPct = 0.01;
      }
      return newLogoPos;
    });
  };

  const handlePinPos = () => {
    const anchorPos: LogoPinPositions[] = ['BottomLeft', 'UpperLeft', 'UpperCenter', 'CenterCenter', 'BottomCenter'];
    setLogoPos((logoPos) => {
      const newLogoPos = { ...logoPos };
      if (logoPos && anchorPos.indexOf(logoPos.pinnedPosition) === anchorPos.length - 1) {
        newLogoPos.pinnedPosition = anchorPos[0];
      } else {
        newLogoPos.pinnedPosition = anchorPos[anchorPos.indexOf(logoPos ? logoPos.pinnedPosition : 'BottomLeft') + 1];
      }
      return newLogoPos as LogoPosition;
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
        const logoPos = await getCustomLogoPosition(overview.appid) || appdetails?.libraryAssets?.logoPosition;
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
    >
      {overview && <LogoPositioner app={overview} logoPos={logoPos} border={showBorder} />}
      <ul className="logo-positioner-instructions">
        <li><img src={Dpad} /> {t('ACTION_ADJUST_POS_SIZE', 'Adjust Size')}</li>
        <li><FooterGlyph button={2} size={1} type={0} /> {t('ACTION_CHANGE_POS_LOGO_ANCHOR_POINT', 'Change Anchor Point')}</li>
        <li><FooterGlyph button={11} size={1} type={0} /> {t('CustomArt_ResetLogoPosition', 'Reset Logo Position', true)}</li>
      </ul>
    </Focusable>
  );
};

export default LogoPositionerModal;
