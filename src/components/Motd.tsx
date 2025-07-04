import { ConfirmModal, DialogButton, Focusable, Navigation, showModal } from '@decky/ui';
import { FC, useCallback, useEffect, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';
import { fetchNoCors } from '@decky/api';

import t from '../utils/i18n';
import showQrModal from '../utils/showQrModal';
import useSettings from '../hooks/useSettings';
import { SGDB_API_BASE, SGDB_API_KEY } from '../hooks/useSGDB';
import log from '../utils/log';

export interface MotdApiResponse {
  id: string;
  url: string;
  text: string | null;
  text_sub: string | null;
  image_url: string;
  bg_type: 'image' | 'video';
  bg_url: string;
  bg_color: string;
  bg_position:
    'center center' |
    'left top' |
    'left center' |
    'left bottom' |
    'right top' |
    'right center' |
    'right bottom' |
    'center top' |
    'center center' |
    'center bottom';
  expires: number;
}

export interface Motd {
  disabled: boolean;
  noFocusRing?: boolean;
}

const Motd: FC<Motd> = ({
  disabled = false,
  noFocusRing,
}) => {
  const { set, get } = useSettings();
  const [motdCurrent, setMotdCurrent] = useState<MotdApiResponse | null>(null);

  const hideMotd = useCallback(() => {
    if (!motdCurrent?.id) return;
    showModal(
      <ConfirmModal
        strTitle={t('TITLE_MOTD_HIDE', 'Hide Announcement?')}
        strDescription={t('LABEL_SETTINGS_DISABLE_MOTD_DESC', 'Announcements are used sparingly to display important information or community events.')}
        strOKButtonText={t('LABEL_MOTD_THIS', 'This Announcement')}
        strMiddleButtonText={t('LABEL_MOTD_ALL', 'All Announcements')}
        onOK={() => {
          set('motd_hidden', motdCurrent.id);
          setMotdCurrent(null);
        }}
        onMiddleButton={() => {
          set('motd_hidden_global', true, true);
          setMotdCurrent(null);
        }}
      />
    );
  }, [set, motdCurrent]);

  const fetchMotd = useCallback(async () => {
    try {
      const res = await fetchNoCors(`${SGDB_API_BASE}/deckymotd`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${SGDB_API_KEY}`,
          'X-Motd-Version': '1',
        },
      });
      const jsonBody: MotdApiResponse = await res.json();
      set('motd_cached', jsonBody, true);
      return jsonBody;
    } catch (error) {
      // fail silently, try again in a week
    } finally {
      set('motd_last_fetched', Math.floor(new Date().getTime() / 1000), true);
    }
    return null;
  }, [set]);

  useEffect(() => {
    (async () => {
      // skip if motd is disabled globally
      const hiddenMotdGlobal = await get('motd_hidden_global', false);
      if (hiddenMotdGlobal) return;

      const hiddenMotd = await get('motd_hidden', null);
      const rn = Math.floor(new Date().getTime() / 1000);
      const yesterday = Math.floor(new Date(new Date().getTime() - 24 * 60 * 60 * 1000).getTime() / 1000);
      const lastCheck = parseInt(await get('motd_last_fetched', 0));

      let motd: MotdApiResponse | null;
      // only get new motd once a week
      if (yesterday >= lastCheck) {
        motd = await fetchMotd();
      } else {
        // get cached motd if not hidden
        motd = await get('motd_cached', null);
      }
      log('motd', motd);

      // Don't set if explicitly hidden by the user or already expired
      if (motd && (hiddenMotd !== motd.id)) {
        if (!(motd.expires < rn)) {
          setMotdCurrent(motd);
        }
      }
    })();
  }, [fetchMotd, get]);

  if (disabled || !motdCurrent) return null;
  return (
    <Focusable noFocusRing={noFocusRing} flow-children="row" className="motd-wrap">
      <Focusable
        noFocusRing={false}
        className="motd"
        style={{
          backgroundImage: motdCurrent.bg_type === 'image' ? `url(${motdCurrent.bg_url})` : 'none',
          backgroundPosition: `${motdCurrent.bg_position}`,
          backgroundColor: `${motdCurrent.bg_color}`,
        }}
        onSecondaryActionDescription={t('ACTION_SHOW_LINK_QR', 'Show Link QR')}
        onOKActionDescription={motdCurrent.text ? motdCurrent.text : t('Button_Go', 'Go', true)}
        onSecondaryButton={() => showQrModal(motdCurrent.url)}
        onActivate={() => {
          Navigation.NavigateToExternalWeb(motdCurrent.url);
        }}
      >
        <div className="motd-inner">
          {motdCurrent.image_url ? <img src={motdCurrent.image_url} alt="" /> : null}
          <div className="motd-text">
            {motdCurrent.text ? (
              <span className="motd-title">
                {motdCurrent.text}
              </span>
            ) : null}
            {motdCurrent.text_sub ? (
              <span className="motd-subtitle">
                {motdCurrent.text_sub}
              </span>
            ) : null}
          </div>
        </div>
        {motdCurrent.bg_type === 'video' ? (
          <video
            className="motd-video-bg"
            src={motdCurrent.bg_url}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : null}
      </Focusable>
      <DialogButton
        style={{ flex: 0 }}
        className="motd-hide"
        noFocusRing
        onOKActionDescription={t('Button_Hide', 'Hide', true)}
        onClick={hideMotd}
      >
        <HiXMark strokeWidth={1.5} />
      </DialogButton>
    </Focusable>
  );
};

export default Motd;
