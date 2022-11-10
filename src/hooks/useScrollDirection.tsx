import { useState, useEffect, useRef } from 'react';
import debounce from 'just-debounce';

const useScrollDirection = (target: HTMLElement, debounceDelay = 300, scroller?: HTMLElement) => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const prevTop = useRef(0);

  useEffect(() => {
    const targetListener = scroller || target;
    if (!target || !targetListener) return;
    prevTop.current = target.getBoundingClientRect().top;

    const onScroll = debounce(() => {
      const scrollY = target.getBoundingClientRect().top;
      const newScrollDirection = scrollY > prevTop.current ? 'up' : 'down';
      setScrollDirection(newScrollDirection);
      prevTop.current = scrollY;
    }, debounceDelay, true);

    targetListener.addEventListener('scroll', onScroll);

    return () => targetListener.removeEventListener('scroll', onScroll);
  }, [target, scroller]);

  return scrollDirection;
};

export default useScrollDirection;