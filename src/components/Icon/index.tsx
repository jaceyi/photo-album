import React from 'react';
import styles from './style.module.scss';
import type { HTMLAttributes, CSSProperties } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import classNames from 'classnames';

// @ts-ignore
import('https://at.alicdn.com/t/c/font_3591956_7njwpa4f0pm.js');

interface Props extends HTMLAttributes<HTMLButtonElement> {
  icon: string;
  size?: string | number;
}

export const Icon = React.memo<Props>(
  ({ icon, className = '', size, style = {}, ...rest }) => {
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

export const IconButton = React.memo<Props>(props => {
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
      <Icon size={46} {...props} />
    </animated.div>
  );
});

interface SpinProps extends Omit<Props, 'icon'> {
  loading?: boolean;
  icon?: string;
}

export const Spin = React.memo<SpinProps>(
  ({ loading = true, size = 16, icon = 'loading', ...props }) => {
    return (
      <span
        className={classNames('loading-icon', styles.spin, {
          [styles.loading]: loading
        })}
      >
        <Icon size={size} icon={icon} {...props} />
      </span>
    );
  }
);
