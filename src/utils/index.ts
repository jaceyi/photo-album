export const removeArrayIndex = (arr: any[], index: number) => {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
};

export const removeArrayItem = (arr: any[], item: any) => {
  const index = arr.findIndex(v => v === item);
  return removeArrayIndex(arr, index);
};

export const throttle = <T extends any>(
  callback: Function,
  interval: number = 300
) => {
  let last = 0;
  let prevResult: T | undefined;
  return (...args: any[]): T => {
    const now = +new Date();
    if (now - last >= interval) {
      last = now;
      const prevResult = callback(...args);
      return prevResult;
    }
    return prevResult!;
  };
};
