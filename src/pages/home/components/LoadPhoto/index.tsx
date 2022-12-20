import { FC, ImgHTMLAttributes, useState } from 'react';
import React, { useLayoutEffect, useRef, useEffect } from 'react';
import * as styles from './style.module.scss';

export interface Photo {
  id: string;
  url: string;
  name: string;
  width: number;
  height: number;
  created: number;
  tags: number[];
}

export const PHOTO_MARGIN = 10;

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  data: Photo;
  layoutCol: number;
  onLoadEnd?: Function;
}

const LoadPhoto: FC<Props> = ({ data, layoutCol, onLoadEnd, ...props }) => {
  const ref = useRef<HTMLImageElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const wrap = el.parentNode?.parentNode as HTMLDivElement | null;
    if (!wrap) return;
    const width = (wrap.offsetWidth - PHOTO_MARGIN) / layoutCol;
    el.style.width = `${width}px`;
    el.style.height = `${(data.height / data.width) * width}px`;
  }, [layoutCol]);

  const [src, setSrc] = useState<string>('');
  const timer = useRef<number>();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = async () => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        const scrollTop =
          document.documentElement.scrollTop || document.body.scrollTop;
        const clientHeight =
          document.documentElement.clientHeight || document.body.clientHeight;
        const rect = el.getBoundingClientRect();
        if (rect.top <= scrollTop + clientHeight) {
          setSrc(data.url);
        }
      }, 20);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, false);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const loadEndRef = useRef<boolean>(false);
  const onLoad = () => {
    loadEndRef.current = true;
    onLoadEnd?.();
  };
  useEffect(() => {
    if (loadEndRef.current) onLoadEnd?.();
  });

  return (
    <div ref={ref} className={styles.photo}>
      <img onLoad={onLoad} src={src} {...props} />
    </div>
  );
};

export default LoadPhoto;
