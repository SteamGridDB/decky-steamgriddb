import { SteamAppOverview, joinClassNames, Focusable, GamepadEvent } from 'decky-frontend-lib';
import { FC, useCallback, useState, useEffect, useRef } from 'react';

import LibraryImage from '../components/LibraryImage';
import getCustomLogoPosition from '../utils/getCustomLogoPosition';
import log from '../utils/log';
import { ASSET_TYPE } from '../constants';
import t from '../utils/i18n';
import Dpad from '../../assets/dpad.svg';
import FooterGlyph from '../components/FooterGlyph';

const getStylePositions = (pos: string, widthPct: number, heightPct: number) => {
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

const LogoPositioner: FC<{ app: SteamAppOverview, logoPos: any, border: boolean }> = ({ app, logoPos, border }) => {
  const positions = logoPos ? getStylePositions(logoPos.pinnedPosition, logoPos.nWidthPct, logoPos.nHeightPct) : null;

  if (!logoPos) return null;

  return (
    <div
      className="logo-positioner"
      style={{
        ['--logo-width' as string]: `${logoPos.nWidthPct}%`,
        ['--logo-height' as string]: `${logoPos.nHeightPct}%`,
        ['--logo-left' as string]: positions ? `${positions.left}%` : undefined,
        ['--logo-top' as string]: positions ? `${positions.top}%` : undefined,
      }}
    >
      <div className="logo-wrap">
        <div className="logo-wrap-pos">
          <LibraryImage
            app={app}
            eAssetType={ASSET_TYPE.logo}
            allowCustomization={false}
            className={joinClassNames('logo-positioner-logo', border ? 'logo-border' : '')}
            imageClassName={joinClassNames('logo-positioner-logo-img', `pos-${logoPos.pinnedPosition}`)}
            backgroundType="transparent"
          />
        </div>
      </div>
      <LibraryImage
        app={app}
        eAssetType={ASSET_TYPE.hero}
        allowCustomization={false}
      />
    </div>
  );
};

const LogoPositionerModal: FC<{ closeModal?: () => void, overview: SteamAppOverview }> = ({ closeModal, overview }) => {
  const [logoPos, setLogoPos] = useState<any>(null);
  const [showBorder, setShowBorder] = useState<boolean>(true);
  const resizeAmount = useRef(.25);

  const getLogoPos = useCallback(async () => {
    const logoPos = await getCustomLogoPosition(overview.appid);
    log(logoPos);
    setLogoPos(logoPos);
  }, [overview.appid]);

  const handleCancel = () => {
    closeModal?.();
  };

  const handleSave = async () => {
    await SteamClient.Apps.SetCustomLogoPositionForApp(overview.appid, JSON.stringify({
      nVersion: 1,
      logoPosition: logoPos,
    }));
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
      if (newLogoPos.nWidthPct < 0) {
        newLogoPos.nWidthPct = newLogoPos.nWidthPct = 0;
      }
      if (newLogoPos.nHeightPct > 100) {
        newLogoPos.nHeightPct = newLogoPos.nHeightPct = 100;
      }
      if (newLogoPos.nHeightPct < 0) {
        newLogoPos.nHeightPct = newLogoPos.nHeightPct = 0;
      }
      return newLogoPos;
    });
  };

  const handlePinPos = () => {
    const anchorPos = [
      'BottomLeft',
      'UpperLeft',
      'CenterCenter',
      'UpperCenter',
      'BottomCenter',
    ];
    setLogoPos((logoPos: any) => {
      const newLogoPos = { ...logoPos };
      if (anchorPos.indexOf(logoPos.pinnedPosition) === anchorPos.length - 1) {
        newLogoPos.pinnedPosition = anchorPos[0];
      } else {
        newLogoPos.pinnedPosition = anchorPos[anchorPos.indexOf(logoPos.pinnedPosition) + 1];
      }
      return newLogoPos;
    });
  };

  useEffect(() => {
    getLogoPos();
  }, [getLogoPos]);

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
      onSecondaryActionDescription={t('ACTION_CHANGE_LOGO_ANCHOR_POINT', 'Change Anchor Point')}
      onOptionsButton={() => setShowBorder((x) => !x)}
      onOptionsActionDescription={showBorder ? t('ACTION_HIDE_OUTLINE', 'Hide Outline') : t('ACTION_SHOW_OUTLINE', 'Show Outline')}
    >
      <LogoPositioner app={overview} logoPos={logoPos} border={showBorder} />
      <ul className="logo-positioner-instructions">
        <li><img src={Dpad} /> {t('ACTION_ADJUST_SIZE', 'Adjust Size')}</li>
        <li><FooterGlyph button={2} size={1} type={0} /> {t('ACTION_CHANGE_LOGO_ANCHOR_POINT', 'Change Anchor Point')}</li>
      </ul>
    </Focusable>
  );
};

export default LogoPositionerModal;
