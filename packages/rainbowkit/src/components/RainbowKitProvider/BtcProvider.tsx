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
import * as fmtBit from 'satoshi-bitcoin';
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

  async function checkRequst() {
    try {
      await window.StacksProvider?.request?.('getAddresses');
      return true;
    } catch {
      return false;
    }
  }

  // ----------------------------------------------------------------------------------

  // hiroWallet send token
  async function sendBtcTransfer(
    address: string,
    amount: string
  ): Promise<string | undefined> {
    const checked = await checkRequst();

    try {
      let api = window.StacksProvider?.request;
      if (!checked) {
        api = window.btc?.request;
      }

      const res = await api?.('sendTransfer', {
        address,
        amount: fmtBit.toSatoshi(amount),
        network: btcInfo.network,
      } as any);

      return res?.result?.txid;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
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
    const api = window.StacksProvider?.request || window.btc?.request;

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
