import '@stacks/connect';
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as fmtBit from 'satoshi-bitcoin';
import { Connector, useAccount } from 'wagmi';
import { BtcAddressInfo, def, getBtcStore, setBtcStore } from './btcStore';

interface BtcInfoValue {
  btcInfo: BtcAddressInfo;
  setBtcinfo?: (value: BtcAddressInfo) => void;
}

const btcConnId = ['leather', 'xverse', 'unisat'];

function useBtcInfoState() {
  const [btcInfo, setBtcinfo] = useState(() => getBtcStore());

  useEffect(() => {
    setBtcStore(btcInfo);
  }, [btcInfo]);

  return {
    btcInfo,
    setBtcinfo: useCallback((value: BtcAddressInfo) => setBtcinfo(value), []),
  };
}

const BtcInfoContext = createContext<BtcInfoValue>({
  btcInfo: { ...def },
});

// ----------------------------------------------------------------------------------

export const checkBitWallet = (conn?: Connector) => {
  if (!conn) {
    return false;
  }

  return btcConnId.includes(conn.id);
};

// ----------------------------------------------------------------------------------

export function BtcProvider(props: { children: ReactNode }) {
  const { btcInfo, setBtcinfo } = useBtcInfoState();
  const v = useMemo(() => {
    return {
      btcInfo: Object.assign(def, btcInfo),
      setBtcinfo,
    };
  }, [btcInfo, setBtcinfo]);

  return (
    <BtcInfoContext.Provider value={v}>
      {props.children}
    </BtcInfoContext.Provider>
  );
}

// ----------------------------------------------------------------------------------

export const useAddressCurrent = () => {
  const { address, connector } = useAccount();
  const { btcInfo, setBtcinfo } = useContext(BtcInfoContext);
  const isBtcWallet = checkBitWallet(connector);
  const btcLogined = isBtcWallet && Boolean(btcInfo.address);
  const lastAddress = btcLogined ? btcInfo.address : address;

  // ----------------------------------------------------------------------------------

  // leatherWallet send token
  async function sendBtcTransfer(amount: string, address: string) {
    if (typeof window === 'undefined' || typeof window.btc === 'undefined') {
      return '';
    }

    const res = await window.btc.request('sendTransfer', {
      amount: fmtBit.toSatoshi(amount),
      address,
      network: btcInfo.network,
    } as any);

    return res?.result?.txid;
  }

  // ----------------------------------------------------------------------------------

  // leatherWallet signMessage
  async function signBtcMessage(message: string): Promise<
    | {
        address: string;
        message: string;
        signature: string;
      }
    | undefined
  > {
    if (typeof window === 'undefined' || typeof window.btc === 'undefined') {
      return;
    }

    const res = await window.btc.request('signMessage', {
      message,
      network: btcInfo.network,
    } as any);

    return res?.result;
  }

  // ----------------------------------------------------------------------------------

  return {
    address: lastAddress,
    btcInfo,
    btcLogined,
    isBtcWallet,

    setBtcinfo,
    signBtcMessage,
    sendBtcTransfer,
  };
};
