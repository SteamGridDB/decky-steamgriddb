import { useState, useEffect, useRef } from 'react';
import debounce from 'just-debounce';

const useScrollDirection = (target: HTMLElement | null, debounceDelay = 300) => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const prevTop = useRef(0);

  useEffect(() => {
    if (!target) return;
    prevTop.current = target.scrollTop;

    const onScroll = debounce(() => {
      const scrollTop = target.scrollTop;
      const newScrollDirection = scrollTop > prevTop.current ? 'down' : 'up';
      setScrollDirection(newScrollDirection);
      prevTop.current = scrollTop;
    }, debounceDelay, true);

    target.addEventListener('scroll', onScroll);

    return () => target.removeEventListener('scroll', onScroll);
  }, [target]);

  return scrollDirection;
};

export default useScrollDirection;