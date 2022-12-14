import React from 'react';
import type { HTMLAttributes, FC } from 'react';
import classNames from 'classnames';
import * as styles from './style.module.scss';

interface Props extends Omit<HTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange: (value: string) => void;
}

export const Input: FC<Props> = ({ onChange, className, ...props }) => {
  return (
    <input
      type="text"
      {...props}
      className={classNames(styles.input, className)}
      onChange={e => onChange(e.target.value)}
    />
  );
};
