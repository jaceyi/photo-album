import React from 'react';
import type { FC } from 'react';
import { Spin } from '..';
import * as styles from './style.module.scss';

interface Props {
  loading?: boolean;
  text?: string | null;
}

export const Loading: FC<Props> = ({ loading = true, text = '加载中' }) => {
  return (
    <div className={styles.loading}>
      <Spin loading={loading} />
      {text !== null && <span>{text}</span>}
    </div>
  );
};
