import * as React from 'react';
import { ReactNode } from 'react';
import * as styles from './style.module.scss';

interface Props {
  children: ReactNode;
}

const { useRef } = React;

const Upload = ({ children }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <span onClick={handleClick}>
      <input className={styles.input} ref={inputRef} type="file" name="file" />
      {children}
    </span>
  );
};

export default React.memo(Upload);
