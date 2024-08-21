import {
  FC,
  useEffect,
  useState,
  useRef,
  SVGAttributes,
  ImgHTMLAttributes,
} from 'react';
import { IconsModule } from 'decky-frontend-lib';

// @todo: find a better way to get this
const ErrorIcon = Object.values(IconsModule).find((mod: any) => mod?.toString().includes('M27.7974 10L26.6274 2H33.3674L32.2374 10H27.7974Z')) as FC<SVGAttributes<SVGElement>>;

interface LazyImage extends ImgHTMLAttributes<HTMLImageElement | HTMLVideoElement> {
  isVideo?: boolean,
  unloadWhenOutside?: boolean,
  marginOffset?: IntersectionObserverInit['rootMargin'];
  scrollContainer?: IntersectionObserverInit['root'];
  src: string,
  wrapperProps?: any,
  blurBackground?: boolean,
}

export const LazyImage: FC<LazyImage> = ({
  isVideo = false,
  unloadWhenOutside = false,
  marginOffset,
  scrollContainer,
  src,
  wrapperProps,
  blurBackground = false,
  ...props
}) => {
  const [inViewport, setInViewport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLElement>(null);
  const intersectRef = useRef<HTMLDivElement>(null);

  // reset some state when src changes
  useEffect(() => {
    setInViewport(false);
    setError(false);
    setLoading(true);
  }, [src]);

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
  }, [loading, marginOffset, unloadWhenOutside, scrollContainer, src]);

  return (
    <div
      ref={intersectRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      {...wrapperProps}
    >
      {error && <ErrorIcon style={{ height: '2em' }} />}

      {(inViewport && !isVideo && error !== true) && (
        <>
          {blurBackground && (
            <img
              className="blur-bg"
              data-loaded={loading ? 'false' : 'true'}
              src={src}
              {...props}
            />
          )}
          <img
            ref={imgRef as React.RefObject<HTMLImageElement>}
            data-loaded={loading ? 'false' : 'true'}
            src={src}
            {...props}
          />
        </>
      )}

      {(inViewport && isVideo && error !== true) && (
        <video
          ref={imgRef as React.RefObject<HTMLVideoElement>}
          data-loaded={loading ? 'false' : 'true'}
          src={src}
          autoPlay={false}
          muted
          loop
          playsInline
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
