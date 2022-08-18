import * as React from 'react';
import { IconButton, Upload } from '@/components';
import { animated, useSpring } from '@react-spring/web';
import * as styles from './style.module.scss';

const { useState, useCallback, useEffect } = React;

const SettingIcon = () => {
  const [visible, setVisible] = useState(false);
  const style = useSpring({
    scale: visible ? 1 : 0,
    opacity: visible ? 1 : 0
  });

  useEffect(() => {
    const hidden = () => {
      if (visible === true) {
        setVisible(false);
      }
    };
    document.body.addEventListener('click', hidden, false);
    return () => document.body.removeEventListener('click', hidden);
  }, [visible]);

  const handleTabVisible = useCallback(
    e => {
      e.stopPropagation();
      setVisible(!visible);
    },
    [visible]
  );

  return (
    <div className={styles.setting}>
      <div className={styles.icon}>
        <IconButton onClick={handleTabVisible} icon="gengduo" />
      </div>
      <animated.div className={styles.popover} style={style}>
        <div className={styles.item}>
          <IconButton icon="sousuo" />
        </div>
        <div className={styles.item}>
          <IconButton icon="biaoqian" />
        </div>
        <div className={styles.item}>
          <IconButton icon="shijian" />
        </div>
        <div className={styles.item}>
          <IconButton icon="ziliao" />
        </div>
        <div className={styles.item}>
          <Upload>
            <IconButton icon="shangchuan" />
          </Upload>
        </div>
      </animated.div>
    </div>
  );
};

export default SettingIcon;
