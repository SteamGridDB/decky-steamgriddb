import { FC, useEffect, useState, useRef, SVGAttributes } from 'react';
import { Spinner, IconsModule } from 'decky-frontend-lib';

// @todo: find a better way to get this
const ErrorIcon = Object.values(IconsModule).find((mod) => mod?.toString().includes('M27.7974 10L26.6274 2H33.3674L32.2374 10H27.7974Z')) as FC<SVGAttributes<SVGElement>>;

export const LazyImage: FC<{
  isVideo?: boolean,
  unloadWhenOutside?: boolean,
  marginOffset?: IntersectionObserverInit['rootMargin'];
  scrollContainer?: IntersectionObserverInit['root'];
  src: string,
  wrapperProps?: any,
}> = ({isVideo = false, unloadWhenOutside = false, marginOffset, scrollContainer, src, wrapperProps, ...props}) => {
  const [inViewport, setInViewport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLElement>(null);
  const intersectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const onLoad = () => {
      if (isVideo) {
        (img as HTMLVideoElement).play();
      }
      setLoading(false);
    };
    const onError = () => setError(true);

    if (isVideo) {
      img.addEventListener('canplaythrough', onLoad);
    } else {
      img.addEventListener('load', onLoad);
    }
    img.addEventListener('error', onError);
    return () => {
      if (isVideo) {
        img.removeEventListener('canplaythrough', onLoad);
      } else {
        img.removeEventListener('load', onLoad);
      }
      img.removeEventListener('error', onError);
    };
  }, [src, isVideo, inViewport]);

  useEffect(() => {
    if (!intersectRef.current) return;

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= .5) {
          setInViewport(true);
          if (!unloadWhenOutside) {
            observer.unobserve(entry.target);
          }
        } else if (unloadWhenOutside && !loading && entry.intersectionRatio === 0) {
          /* If completely out of view and already loaded, reset state.
             images/videos should be cached by CEF so when back to view they will load instantly */
          setInViewport(false);
          setLoading(true);
        }
      });
    }, { threshold: [.5, 0], rootMargin: marginOffset, root: scrollContainer });

    observer.observe(intersectRef.current);
    return () => {
      observer.disconnect();
    };
  }, [loading, marginOffset, unloadWhenOutside, scrollContainer]);

  return <div
    ref={intersectRef}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
    {...wrapperProps}
  >
    {error ?
      <ErrorIcon style={{ height: '2em' }} /> :
      <Spinner
        className="preload-spinner"
        data-loaded={loading ? 'false' : 'true'}
      />
    }

    {(inViewport && !isVideo) && <img
      ref={imgRef as React.RefObject<HTMLImageElement>}
      data-loaded={loading ? 'false' : 'true'}
      src={src}
      {...props}
    />}

    {(inViewport && isVideo) && <video
      ref={imgRef as React.RefObject<HTMLVideoElement>}
      data-loaded={loading ? 'false' : 'true'}
      src={src}
      autoPlay={false}
      muted
      loop
      playsInline
      {...props}
    />}
  </div>;
};
