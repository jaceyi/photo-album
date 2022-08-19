export const removeArrayIndex = (arr: any[], index: number) => {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
};

export const removeArrayItem = (arr: any[], item: any) => {
  const index = arr.findIndex(v => v === item);
  return removeArrayIndex(arr, index);
};
