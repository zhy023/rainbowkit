declare module '*.svg' {
  const dataUrl: string;
  export default dataUrl;
}

declare module '*.png' {
  const dataUrl: string;
  export default dataUrl;
}

declare module 'satoshi-bitcoin';

declare module 'i18n-js/dist/require/index.js';

declare interface Window {
  btc: any;
}
