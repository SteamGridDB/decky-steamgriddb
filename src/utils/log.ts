let debugEnabled = false;

export const setDebugLogging = (v: boolean) => {
  debugEnabled = v;
};

export default (...params: any[]) => {
  if (process.env.ROLLUP_ENV !== 'production' || debugEnabled) window.console['log']('%c ·SGDB· ', 'background: #000; color: #4e9ac6; font-weight: 600', ...params);
};
