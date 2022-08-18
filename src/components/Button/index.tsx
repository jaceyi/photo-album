import * as React from 'react';
import * as styles from './style.module.scss';

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  styleType?: 'default' | 'primary';
}

const Button = ({ className, styleType = 'default', ...props }: Props) => {
  return (
    <button
      type="button"
      className={`${styles.button} rc-button-${styleType} ${className || ''}`}
      {...props}
    />
  );
};

export default React.memo(Button);
