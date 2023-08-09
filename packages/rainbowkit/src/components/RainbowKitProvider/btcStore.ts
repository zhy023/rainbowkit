export interface BtcAddressInfo {
  address: string;
  derivationPath: string;
  publicKey: string;
  symbol: string;
  type: string;
  network?: string;
}

export const def: BtcAddressInfo = {
  address: '',
  derivationPath: '',
  network: '',
  publicKey: '',
  symbol: '',
  type: '',
};

export const btcStorageKey = 'dpt_btc_walllet';

// ----------------------------------------------------------------------------------

export function getBtcStore(): BtcAddressInfo {
  return getJsonData(
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(btcStorageKey)
      : null
  );
}

// ----------------------------------------------------------------------------------

function getJsonData(string: string | null): BtcAddressInfo {
  try {
    const value = string ? JSON.parse(string) : {};
    return typeof value === 'object' ? value : {};
  } catch (err) {
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
