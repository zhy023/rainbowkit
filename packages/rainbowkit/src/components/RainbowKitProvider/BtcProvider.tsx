import React, { createContext, ReactNode, useContext } from 'react';
import { BtcAddressInfo, def, useBtcStore } from './btcStore';

const BtcWallet = createContext<BtcAddressInfo>({ ...def });

// ----------------------------------------------------------------------------------

export function BtcProvider(props: { children: ReactNode }) {
  const { btcInfo } = useBtcStore();

  return (
    <BtcWallet.Provider value={btcInfo}>{props.children}</BtcWallet.Provider>
  );
}

// ----------------------------------------------------------------------------------

export const useBtcAddressInfo = () => useContext(BtcWallet);
