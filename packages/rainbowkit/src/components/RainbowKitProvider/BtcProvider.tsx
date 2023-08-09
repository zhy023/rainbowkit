import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Connector, useAccount } from 'wagmi';
import { BtcAddressInfo, def, getBtcStore, setBtcStore } from './btcStore';

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

interface BtcInfoValue {
  btcInfo: BtcAddressInfo;
  setBtcinfo?: (value: BtcAddressInfo) => void;
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

  return {
    address: isBtcWallet ? btcInfo.address : address,
    btcInfo,
    isBtcWallet,
    setBtcinfo,
  };
};
