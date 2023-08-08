import React, { createContext, ReactNode, useContext, useState } from 'react';
import { BtcAddressInfo, def, getBtcStore } from './btcStore';

const BtcWallet = createContext<BtcAddressInfo>({ ...def });

// ----------------------------------------------------------------------------------

export function BtcProvider(props: { children: ReactNode }) {
  const [data] = useState(() => getBtcStore());
  return <BtcWallet.Provider value={data}>{props.children}</BtcWallet.Provider>;
}

// ----------------------------------------------------------------------------------

export const useBtcAddressInfo = () => useContext(BtcWallet);
