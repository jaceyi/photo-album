import * as React from 'react';
import * as styles from './style.module.scss';

interface Option {
  label: string;
  value: any;
}

interface TagGroup {
  options: Option[];
}

const TagGroup = React.memo(({ options }: TagGroup) => {
  return (
    <div className={styles.group}>
      {options.map(item => (
        <div className={styles.tag} key={item.value}>
          {item.label}
        </div>
      ))}
    </div>
  );
});

export { TagGroup };
