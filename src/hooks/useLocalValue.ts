import { useEffect, useState } from 'react';
import LocalDB from '@/libs/LocalDB';

export const useLocalValue = <T>(name: string, initialValue?: any) => {
  const result = useState<T>(() => LocalDB.get(name) || initialValue);
  const [value] = result;
  useEffect(() => {
    LocalDB.set(name, value);
  }, [value]);

  return result;
};
