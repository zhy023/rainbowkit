import '@stacks/connect';
import btc from '@scure/btc-signer';
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

interface SignPsbtRequestParams {
  publicKey: string;
  hex: string;
  // allowedSighash?: SignatureHash[];
  signAtIndex?: number | number[];
  network?: BtcAddressInfo['network'];
  account?: number;
}

const btcTestnet = {
  bech32: 'tb',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};

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

  // hiroWallet send psdt token
  async function sendBtcPsdt(
    address: string,
    amount: string,
    publicKey: string
  ): Promise<string | undefined> {
    const api = getApi();
    const tx = new btc.Transaction();

    if (btcInfo.network === 'testnet') {
      tx.addOutputAddress(address, fmtBit.toSatoshi(amount), btcTestnet);

      // 0 tx
      tx.addOutputAddress(
        '2MsWXDub5Jdwy4ZkiPTnUrxaSHvdSoW7BDE',
        fmtBit.toSatoshi('0'),
        btcTestnet
      );
    } else {
      tx.addOutputAddress(address, fmtBit.toSatoshi(amount));

      // 0 tx
      tx.addOutputAddress(
        '2MsWXDub5Jdwy4ZkiPTnUrxaSHvdSoW7BDE',
        fmtBit.toSatoshi('0')
      );
    }

    const psbt = tx.toPSBT();
    const hex = psbt.map((n: any) => n.toString(16).padStart(2, '0')).join('');

    const requestParams: SignPsbtRequestParams = {
      hex,
      network: btcInfo.network,
      publicKey,
    };

    const res = await api?.('signPsbt', requestParams);

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

    sendBtcPsdt,
    sendBtcTransfer,
    setBtcinfo,
    signBtcMessage,
  };
};
