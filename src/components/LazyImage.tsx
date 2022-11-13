import { ImgHTMLAttributes, FC, useEffect, useState, useRef, SVGAttributes } from 'react';
import { Spinner, IconsModule } from 'decky-frontend-lib';

const ErrorIcon = Object.values(IconsModule).find((mod) => mod?.toString().includes('M27.7974 10L26.6274 2H33.3674L32.2374 10H27.7974Z')) as FC<SVGAttributes<SVGElement>>;

export const LazyImage: FC<ImgHTMLAttributes<HTMLImageElement>> = (props) => {
  const [inViewport, setInViewport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const intersectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const onLoad = () => setLoading(false);
    const onError = () => setError(true);

    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
    return () => {
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };
  }, [props.src, inViewport]);

  useEffect(() => {
    if (!intersectRef.current) return;

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setInViewport(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .5 });

    observer.observe(intersectRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  return <div
    ref={intersectRef}
    style={{
      background: 'url(/images/defaultappimage.png) center center',
      backgroundSize: 'cover',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {error ? <ErrorIcon style={{ height: '2em' }} /> : <Spinner style={{ height: '2em' }} />}
    {inViewport && <img ref={imgRef} data-loaded={loading ? undefined : 'true'} {...props} />}
  </div>;
};
