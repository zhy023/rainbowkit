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

declare module '@scure/btc-signer' {
  class Transaction {
    toPSBT(): Uint8Array {}
    addOutputAddress(
      address: string,
      amount: string,
      network?: {
        bech32: string;
        pubKeyHash: number;
        scriptHash: number;
        wif: number;
      }
    ): number;
  }
  export = { Transaction };
}
