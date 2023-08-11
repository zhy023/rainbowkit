declare module '*.svg' {
  const dataUrl: string;
  export default dataUrl;
}

declare module '*.png' {
  const dataUrl: string;
  export default dataUrl;
}

declare module 'satoshi-bitcoin' {
  export function toBitcoin(v: number | string): numner;
  export function toSatoshi(v: number | string): numner;
}

declare module '@scure/btc-signer' {
  export class Transaction {
    toPSBT(): Uint8Array;
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
}
