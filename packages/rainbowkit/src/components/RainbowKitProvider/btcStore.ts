import { useCallback, useEffect, useState } from 'react';

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

export function useBtcStore() {
  const [btcInfo, setBtcInfo] = useState<BtcAddressInfo>(def);

  useEffect(() => {
    (function () {
      setBtcInfo(getBtcStore());
    })();
  }, []);

  const setBtcValue = useCallback((value: BtcAddressInfo | null) => {
    async function set(value: any) {
      setBtcInfo(value);
      setBtcStore(value);
    }

    set(value);
  }, []);

  const removeBtcValue = useCallback(() => {
    async function remove() {
      setBtcInfo(def);
      setBtcStore(null);
    }

    remove();
  }, []);

  return { btcInfo, removeBtcValue, setBtcValue };
}

// ----------------------------------------------------------------------------------

function getBtcStore(): BtcAddressInfo {
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

function setBtcStore(data: BtcAddressInfo | null) {
  if (data) {
    const old = getBtcStore();
    const fresh = Object.assign({}, old, data);
    localStorage.setItem(btcStorageKey, JSON.stringify(fresh));
    return;
  }

  localStorage.setItem(btcStorageKey, '');
}
