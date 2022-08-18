import * as React from 'react';
import { Icon } from '@/components';
import * as styles from './style.module.scss';

const Login = () => (
  <div>
    <div className={styles.logo}>
      <Icon icon="xiangce" />
    </div>
    <div className={styles.text}>相册</div>
    <div className={styles.tip}>请挂梯子后访问</div>
  </div>
);

export default Login;
