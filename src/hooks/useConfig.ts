import { useState } from 'react';
import { useDidMount } from './useDidMount';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';

interface ConfigOptions {
  tags: { label: string; value: number; color: string }[];
}

interface Config {
  options: ConfigOptions;
}

const cacheConfig: Partial<Config> = {};

export const useConfig = <T extends keyof Config>(
  key: T,
  defaultValue?: any
): Config[T] => {
  const [value, setValue] = useState<Config[T] | undefined>(cacheConfig[key]);
  useDidMount(async () => {
    if (cacheConfig.hasOwnProperty(key)) return;

    const docRef = doc(db, 'config', key);
    const docSnap = await getDoc<Config[T]>(docRef as any);
    if (docSnap.exists()) {
      const value = docSnap.data();
      cacheConfig[key] = value;
      setValue(value);
    } else {
      console.log(`Config 中 ${key} 不存在`);
    }
  });

  return value ?? defaultValue;
};
