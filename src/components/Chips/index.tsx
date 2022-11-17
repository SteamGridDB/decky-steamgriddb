import {  FC, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { joinClassNames, findSP } from 'decky-frontend-lib';
import debounce from 'just-debounce';

const Chips: FC = ({ children }) => {
  const chipsRef = useRef<HTMLDivElement>(null);
  const [leftAlign, setLeftAlign] = useState(false);

  const isCutOff = useCallback(() => {
    const el = chipsRef.current;
    if (!el) return false;
    const sizeEl = el.parentElement?.querySelector('.image-wrap'); // element we cah check size aginst
    if (sizeEl) {
      return sizeEl.getBoundingClientRect().right + el.clientWidth + 10 > findSP().innerWidth;
    }
    return false;
  }, []);

  // Check if should switch to left aligned every time size is changed
  useLayoutEffect(() => {
    const el = chipsRef.current;
    if (!el) return;
    const observer = new MutationObserver(debounce((mutations) => {
      if (mutations[0].attributeName === 'style') {
        if (el.parentElement) {
          setLeftAlign(isCutOff());
        }
      }
    }, 500));

    const assetContainer = el.closest('#images-container');
    if (assetContainer) {
      observer.observe(assetContainer, { attributes: true });
    }
    // Inital
    setLeftAlign(isCutOff());
    return () => {
      observer.disconnect();
    };
  }, [isCutOff]);

  return <div ref={chipsRef} className={joinClassNames('chips', leftAlign ? 'chips-left' : '')}>{children}</div>;
};

export default Chips;