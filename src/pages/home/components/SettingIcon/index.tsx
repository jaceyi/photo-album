import React, { useState, useCallback, useEffect } from 'react';
import { IconButton, Upload } from '@/components';
import { animated, useSpring } from '@react-spring/web';
import styles from './style.module.scss';

export namespace TSettingIcon {
  interface SelectOption {
    type: string;
    payload?: any;
  }
  export interface onSelect {
    (option: SelectOption): void;
  }
  export interface Props {
    onSelect: onSelect;
  }
}

const SettingIcon = ({ onSelect }: TSettingIcon.Props) => {
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
          <IconButton
            icon="fenlei"
            onClick={() => onSelect({ type: 'layout' })}
          />
        </div>
        <div className={styles.item}>
          <IconButton
            icon="biaoqian"
            onClick={() => onSelect({ type: 'tag' })}
          />
        </div>
        {/* <div className={styles.item}>
          <IconButton icon="sousuo" />
        </div>
        <div className={styles.item}>
          <IconButton icon="shijian" />
        </div>
         */}
        <div className={styles.item}>
          <IconButton
            icon="bofang"
            onClick={() => onSelect({ type: 'play' })}
          />
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
