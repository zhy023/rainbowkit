export interface BtcAddressInfo {
  address: string;
  derivationPath: string;
  publicKey: string;
  symbol: string;
  type: string;
  network: 'testnet' | 'mainnet';
}

export const def: BtcAddressInfo = {
  address: '',
  derivationPath: '',
  network: 'testnet',
  publicKey: '',
  symbol: '',
  type: '',
};

export const btcStorageKey = 'dpt_btc_walllet';

// ----------------------------------------------------------------------------------

export function getBtcStore(): BtcAddressInfo | null {
  if (typeof localStorage !== 'undefined') {
    return getJsonData(localStorage.getItem(btcStorageKey));
  }

  return null;
}

// ----------------------------------------------------------------------------------

function getJsonData(string: string | null): BtcAddressInfo {
  try {
    const value = string ? JSON.parse(string) : {};
    return typeof value === 'object' ? value : {};
  } catch {
    return { ...def };
  }
}

// ----------------------------------------------------------------------------------

export function setBtcStore(data: BtcAddressInfo | null) {
  if (data) {
    const old = getBtcStore();
    const fresh = Object.assign({}, old, data);
    localStorage.setItem(btcStorageKey, JSON.stringify(fresh));
    return;
  }

  localStorage.setItem(btcStorageKey, '');
}
