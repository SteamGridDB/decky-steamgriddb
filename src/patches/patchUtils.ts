import { Navigation } from 'decky-frontend-lib';

export function rerenderAfterPatchUpdate(): void {
  if (window.location.pathname.startsWith('/routes/library/home')) {
    Navigation.Navigate('/library/home');
    // ? We need to navigate back to not clog up the nav.
    Navigation.NavigateBack();
  } else if (window.location.pathname.startsWith('/routes/library')) {
    Navigation.Navigate('/library');
    // ? We need to navigate back to not clog up the nav.
    Navigation.NavigateBack();
  }
}