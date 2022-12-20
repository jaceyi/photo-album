declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module '*.json';

declare module '*.scss' {
  const content: { [className: string]: string };
  export = content;
}

declare module 'macy' {
  interface Options {
    container: HTMLDivElement;
    margin: number;
    columns: number;
  }
  class Macy {
    constructor(options: Options);
    options: Options;
    recalculate: Function;
  }

  export = Macy;
}
