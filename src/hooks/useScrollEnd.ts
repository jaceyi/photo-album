import { useEffect } from 'react';
import { throttle } from '@/utils';

interface Option {
  distance?: number;
  interval?: number;
}

export const useScrollEnd = (
  callback: Function,
  deps: any[],
  option?: Option
) => {
  useEffect(() => {
    let count = 0;
    let isEnd = false;
    const throttleCallback = throttle(() => {
      count++;
      return callback(count);
    }, option?.interval);
    let prevScrollTop = 0;
    const onScroll = async () => {
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight =
        document.documentElement.clientHeight || document.body.clientHeight;
      if (
        !isEnd &&
        scrollTop > prevScrollTop &&
        scrollTop + clientHeight >= scrollHeight - (option?.distance || 100)
      ) {
        try {
          await throttleCallback();
        } catch (e) {
          isEnd = true;
        }
      }
      prevScrollTop = scrollTop;
    };
    window.addEventListener('scroll', onScroll, false);
    return () => window.removeEventListener('scroll', onScroll);
  }, deps);
};
