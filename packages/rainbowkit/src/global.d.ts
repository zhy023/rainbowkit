declare module '*.svg' {
  const dataUrl: string;
  export default dataUrl;
}

declare module '*.png' {
  const dataUrl: string;
  export default dataUrl;
}

declare module 'satoshi-bitcoin' {
  function toBitcoin(v: number | string): numner;
  function toSatoshi(v: number | string): numner;
  export = { toBitcoin, toSatoshi };
}
