import '@stacks/connect';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import fmtBit from 'satoshi-bitcoin';
import { Connector, useAccount } from 'wagmi';
import { BtcAddressInfo, def, getBtcStore, setBtcStore } from './btcStore';

declare global {
  interface Window {
    HiroWalletProvider?: {
      request(method: string, params?: any[]): Promise<Record<string, any>>;
    };
    btc?: {
      request(method: string, params?: any[]): Promise<Record<string, any>>;
    };
  }
}

interface BtcInfoValue {
  btcInfo: BtcAddressInfo;
  setBtcinfo?: (value: BtcAddressInfo) => void;
}

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

function isBitWallet(conn?: Connector) {
  return ['hiro', 'xverse', 'unisat'].includes(conn?.id);
}

// ----------------------------------------------------------------------------------

export function BtcProvider(props: { children: ReactNode }) {
  const { btcInfo, setBtcinfo } = useBtcInfoState();

  return (
    <BtcInfoContext.Provider
      value={useMemo(
        () => ({
          btcInfo,
          setBtcinfo,
        }),
        [btcInfo, setBtcinfo]
      )}
    >
      {props.children}
    </BtcInfoContext.Provider>
  );
}

// ----------------------------------------------------------------------------------

export const useAddressCurrent = () => {
  const { address, connector } = useAccount();
  const { btcInfo, setBtcinfo } = useContext(BtcInfoContext);
  const isBtcWallet = isBitWallet(connector);

  // ----------------------------------------------------------------------------------

  function getApi(): Function | undefined {
    // fix request api
    return (
      window.StacksProvider?.request ||
      window.BlockstackProvider?.request ||
      window.HiroWalletProvider?.request ||
      window.btc?.request
    );
  }

  // ----------------------------------------------------------------------------------

  // hiroWallet send token
  async function sendBtcTransfer(
    address: string,
    amount: string
  ): Promise<string | undefined> {
    const api = getApi();
    const res = await api?.('sendTransfer', {
      address,
      amount: fmtBit.toSatoshi(amount),
      network: btcInfo.network,
    } as any);

    return res?.result?.txid;
  }

  // ----------------------------------------------------------------------------------

  // hiroWallet signMessage
  async function signBtcMessage(message: string): Promise<
    | {
        address: string;
        message: string;
        signature: string;
      }
    | undefined
  > {
    const api = getApi();
    const res = await api?.('signMessage', {
      message,
      network: btcInfo.network,
    } as any);

    return res?.result;
  }

  // ----------------------------------------------------------------------------------

  return {
    address: isBtcWallet ? btcInfo.address : address,
    btcInfo,
    isBtcWallet,

    sendBtcTransfer,
    setBtcinfo,
    signBtcMessage,
  };
};
