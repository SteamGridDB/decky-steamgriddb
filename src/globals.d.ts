import { SteamAppOverview } from 'decky-frontend-lib';

declare global {
  interface Window {
    LocalizationManager: {
      m_mapTokens: Map<string, string>;
      m_mapFallbackTokens: Map<string, string>;
      m_rgLocalesToUse: string[];
    };
    App: {
      m_CurrentUser: {
        bIsLimited: boolean;
        bIsOfflineMode: boolean;
        bSupportAlertActive: boolean;
        bCanInviteFriends: boolean;
        NotificationCounts: {
          comments: number;
          inventory_items: number;
          invites: number;
          gifts: number;
          offline_messages: number;
          trade_offers: number;
          async_game_updates: number;
          moderator_messages: number;
          help_request_replies: number;
        };
        strAccountBalance: string;
        strAccountName: string;
        strSteamID: string;
      };
    };
    appStore: {
      GetAppOverviewByAppID: (appId: number) => SteamAppOverview | null;
      GetCustomVerticalCapsuleURLs: (app: SteamAppOverview) => string[];
      GetCustomLandcapeImageURLs: (app: SteamAppOverview) => string[];
      GetCustomHeroImageURLs: (app: SteamAppOverview) => string[];
      GetCustomLogoImageURLs: (app: SteamAppOverview) => string[];
      GetLandscapeImageURLForApp: (app: SteamAppOverview) => string;
      GetVerticalCapsuleURLForApp: (app: SteamAppOverview) => string;
      GetCachedLandscapeImageURLForApp: (app: SteamAppOverview) => string;
      GetCachedVerticalImageURLForApp: (app: SteamAppOverview) => string;
      GetPregeneratedVerticalCapsuleForApp: (app: SteamAppOverview) => string;
      GetIconURLForApp: (app: SteamAppOverview) => string;
    };
    appDetailsStore: {
      GetCustomLogoPosition: (app: SteamAppOverview) => any;
    }
  }
}