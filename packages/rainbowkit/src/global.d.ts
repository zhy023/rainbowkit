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
  type Network = {
    bech32: string;
    pubKeyHash: number;
    scriptHash: number;
    wif: number;
  };

  export const TEST_NETWORK: Network;

  export const NETWORK: Network;

  export class Address {
    constructor(network: Network);
    encode(params: { type: string; pubkey: string }): string;
    decode(address: string): string;
  }

  export class Transaction {
    toPSBT(): Uint8Array;
    addOutputAddress(address: string, amount: string, network: Network): number;
  }
}
