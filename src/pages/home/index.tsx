import * as React from 'react';
import { useDidMount } from '@/hooks';
import * as styles from './style.module.scss';
import SettingIcon from './components/SettingIcon';

const {} = 'react';

const Home = () => {
  useDidMount(() => {});

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.fast}></div>
        <SettingIcon />
      </div>
      <div>相册</div>
    </div>
  );
};

export default React.memo(Home);
