import { FC, ImgHTMLAttributes, useState } from 'react';
import React, { useRef, useEffect } from 'react';
import * as styles from './style.module.scss';
import PlanLayout from '@/libs/PlanLayout';
import { Icon } from '@/components';

export interface Photo {
  id: string;
  url: string;
  name: string;
  width: number;
  height: number;
  created: number;
  tags: number[];
}

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  data: Photo;
  planLayout?: PlanLayout;
  onLoadEnd: Function;
}

const LoadPhoto: FC<Props> = ({ data, planLayout, onLoadEnd, ...props }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string>('');
  useEffect(() => {
    if (!planLayout) return;
    const computeSize = () => {
      const el = ref.current;
      if (!el) return;
      const wrap = el.parentNode?.parentNode as HTMLDivElement | null;
      if (!wrap) return;
      const { margin, columns } = planLayout.options;
      const width = (wrap.offsetWidth - margin) / columns;
      el.style.width = `${width}px`;
      el.style.height = `${(data.height / data.width) * width}px`;
    };
    const computeBefore = () => {
      computeSize();
      window.addEventListener('resize', computeSize, false);
    };
    planLayout.addComputeBefore(computeBefore);

    const getPhotoSrc = () => {
      const el = ref.current!;
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      const clientHeight =
        document.documentElement.clientHeight || document.body.clientHeight;
      const rect = el.getBoundingClientRect();
      if (rect.top <= scrollTop + clientHeight) {
        setSrc(data.url);
      }
    };
    const computeAfter = () => {
      const el = ref.current;
      if (src || !el) return;
      const parent = el.parentNode as HTMLDivElement | null;
      if (!parent) return;
      getPhotoSrc();
      const transitionEnd = () => {
        getPhotoSrc();
        parent.removeEventListener('transitionend', transitionEnd);
      };
      parent.addEventListener('transitionend', transitionEnd);
      window.addEventListener('scroll', getPhotoSrc, false);
    };
    planLayout.addComputeAfter(computeAfter);

    return () => {
      window.removeEventListener('resize', computeSize);
      planLayout.removeComputeBefore(computeBefore);

      window.removeEventListener('scroll', getPhotoSrc);
      planLayout.removeComputeAfter(computeAfter);
    };
  }, [planLayout]);

  // load end
  const [loadEndStatus, setLoadEndStatus] = useState<boolean>(false);
  const loadEnd = () => {
    setLoadEndStatus(true);
  };
  useEffect(() => {
    if (loadEndStatus) onLoadEnd();
  }, [loadEndStatus, onLoadEnd]);

  return (
    <div ref={ref} className={styles.photo}>
      {!!src && <img onLoad={loadEnd} onError={loadEnd} src={src} {...props} />}
      {!loadEndStatus && (
        <div className={styles.loading}>
          <Icon icon="xiangce" />
        </div>
      )}
    </div>
  );
};

export default LoadPhoto;
