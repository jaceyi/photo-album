import { useEffect } from 'react';

export const useDidMount = (callback: Function) => {
  useEffect(() => {
    const destroy = callback?.();
    if (typeof destroy === 'function') {
      return destroy();
    }
  }, []);
};
