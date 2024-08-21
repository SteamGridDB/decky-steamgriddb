import { findSP } from 'decky-frontend-lib';

export const addStyle = (id: string, css: string) => {
  // inject css if it isn't there already
  const existingStyleEl = findSP().window.document.getElementById(id);
  if (!existingStyleEl) {
    const styleEl = findSP().window.document.createElement('style');
    styleEl.id = id;
    styleEl.textContent = css;
    findSP().window.document.head.append(styleEl);
  }
};

export const removeStyle = (id: string) => {
  const existingStyleEl = findSP().window.document.getElementById(id);
  existingStyleEl?.remove();
};

export const removeStyles = (...ids: string[]) => {
  for (let i = 0; i < ids.length; i++) {
    const elId = ids[i];
    removeStyle(elId);
  }
};
