import * as React from 'react';
import * as styles from './style.module.scss';
import { HTMLAttributes, CSSProperties } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';

// @ts-ignore
import('https://at.alicdn.com/t/c/font_3591956_y4cheh07mc.js');

interface Props extends HTMLAttributes<HTMLButtonElement> {
  icon: string;
  className?: string;
  size?: string | number;
  style?: CSSProperties;
}

export const Icon = React.memo(
  ({ icon, className = '', size, style = {}, ...rest }: Props) => {
    const _style: CSSProperties = style;
    if (size !== undefined) {
      _style.fontSize = size;
    }

    return (
      <span {...rest} className={`${styles.wrap} ${className}`}>
        <svg className={styles.icon} style={_style} aria-hidden="true">
          <use xlinkHref={`#icon-${icon}`}></use>
        </svg>
      </span>
    );
  }
);

export const IconButton = React.memo((props: Props) => {
  const [style, set] = useSpring(() => ({
    scale: 1,
    rotate: 0
  }));

  const bind = useGesture({
    onPointerDown: () => {
      set({ scale: 1.15, rotate: 180 });
    },
    onPointerUp: () => {
      set({ scale: 1, rotate: 0 });
    }
  });

  return (
    <animated.div className={styles.button} {...bind()} style={style}>
      <Icon {...props} />
    </animated.div>
  );
});
