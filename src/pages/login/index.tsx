import React from 'react';
import { Icon } from '@/components';
import styles from './style.module.scss';
import { IconLoading } from '@/components';

const Login = () => (
  <div>
    <div className={styles.logo}>
      <Icon icon="xiangce" />
    </div>
    <div className={styles.text}>相册</div>
    <div className={styles.loading}>
      <IconLoading />
      <span>加载中</span>
    </div>
    <div className={styles.tip}>请挂梯子后访问</div>
  </div>
);

export default Login;
