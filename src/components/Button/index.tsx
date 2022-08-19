import React from 'react';
import styles from './style.module.scss';

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  styleType?: 'default' | 'primary';
}

export const Button = React.memo(
  ({ className, styleType = 'default', ...props }: Props) => {
    return (
      <button
        type="button"
        className={`${styles.button} rc-button-${styleType} ${className || ''}`}
        {...props}
      />
    );
  }
);
