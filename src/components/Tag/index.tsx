import React, { useState, useEffect } from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';
import { removeArrayItem } from '@/utils';
import type { CSSProperties } from 'react';

interface Option {
  label: string;
  value: any;
  color: string;
}

interface TagGroup {
  options: Option[];
  onChange?: Function;
  value?: any[];
}

const TagGroup = React.memo(({ options, onChange, value }: TagGroup) => {
  const [_value, _setValue] = useState<any[]>(value || []);
  useEffect(() => {
    if (value !== _value) {
      _setValue(value || []);
    }
  }, [value]);

  return (
    <div className={styles.group}>
      {options.map(item => {
        const { value: itemValue, label, color } = item;
        const activated = _value.find(v => v === itemValue);
        const style: CSSProperties = {};
        if (activated) {
          style.backgroundColor = color;
        }
        return (
          <div
            key={itemValue}
            className={classNames(styles.tag, {
              [styles.activated]: activated
            })}
            style={style}
            onClick={() => {
              const val = activated
                ? removeArrayItem(_value, itemValue)
                : [..._value, itemValue];
              if (!value) {
                _setValue(val);
              }
              onChange?.(val);
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
});

export { TagGroup };
