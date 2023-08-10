import { MockConnector, MockProvider } from '@wagmi/core/connectors/mock';
import { createTestClient, http, publicActions, walletActions } from 'viem';
import { foundry } from 'viem/chains';
import {
  BtcAddressInfo,
  def,
} from '../../../components/RainbowKitProvider/btcStore';
import { Wallet } from '../../Wallet';

type Network = 'livenet' | 'testnet';

declare global {
  interface Window {
    unisat?: {
      requestAccounts(): Promise<string[]>;
      getAccounts(): Promise<string[]>;
      getNetwork(): Promise<Network>;
      switchNetwork(v: Network): Promise<void>;
      getPublicKey(): Promise<string>;
      getBalance(): Promise<{
        confirmed: number;
        unconfirmed: number;
        total: number;
      }>;
      getInscriptions(): Promise<{
        total: number;
        list: {
          inscriptionId: string;
          inscriptionNumber: string;
          address: string;
          outputValue: string;
          content: string;
          contentLength: string;
          contentType: number;
          preview: number;
          timestamp: number;
          offset: number;
          genesisTransaction: string;
          location: string;
        }[];
      }>;
      // sendBitcoin(toAddress: string, satoshis: number, options?: { feeRate - number  }): Promise<string>;
    };
  }
}

/**
 * ----------------------------------------------------------------------------------
 * unisatWallet
 * ----------------------------------------------------------------------------------
 *
 * @author zhangmao 2023/07/04
 */

// ----------------------------------------------------------------------------------

export interface UnisatOptions {
  network?: Network;
}
const id = 'unisat';
const name = 'Unisat Wallet';
const walletClient = createTestClient({
  account: {
    address: '',
  },
  chain: foundry,
  mode: 'hardhat',
  transport: http(),
})
  .extend(publicActions)
  .extend(walletActions);
const mockProvider = new MockProvider({
  chainId: foundry.id,
  id,
  name,
  walletClient,
});

// ----------------------------------------------------------------------------------

// unisat connector
class UnisatConnector extends MockConnector {
  id = id;
  name = name;
  options: UnisatOptions;
  btcData: BtcAddressInfo = def;

  constructor(options: UnisatOptions) {
    super({
      options: { id, name, walletClient },
    });

    this.options = options;
  }

  // ----------------------------------------------------------------------------------

  // connect wallet
  async connect() {
    if (typeof window.unisat === 'undefined') {
      return;
    }

    // @ts-ignore
    // const [address] = await window.unisat?.requestAccounts();
    // this.btcData = Object.assign(this.options, { address });
  }

  async getProvider() {
    return mockProvider;
  }

  async getWalletClient() {
    return walletClient;
  }
}

// ----------------------------------------------------------------------------------

export const unisatWallet = (options: UnisatOptions): Wallet => {
  const isUnisatInjected =
    typeof window !== 'undefined' &&
    typeof window.unisat !== 'undefined' &&
    typeof window.unisat?.requestAccounts !== 'undefined';
  const shouldUseWalletConnect = !isUnisatInjected;

  return {
    createConnector: () => {
      const connector = new UnisatConnector(options);

      // ----------------------------------------------------------------------------------

      return {
        connector,
        mobile: {
          getUri: async () => {
            await connector.connect();
            return '';
          },
        },
        qrCode: {
          getUri: async () => {
            await connector.connect();
            return '';
          },
        },
      };
    },

    downloadUrls: {
      android: 'https://unisat.io/download',
      chrome:
        'https://chrome.google.com/webstore/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo',
      ios: 'https://unisat.io/download',
      qrCode: 'https://unisat.io/download',
    },

    iconBackground: '#000000',

    iconUrl:
      'https://lh3.googleusercontent.com/FpdgjbCU_f4VZUrc3uNC7RY70OIrDpn1bQM-eSw9tIgaGtztz7A_REOwDCxFsZMWnw43IWCEn9PtD2A8Y0env7lB2OU',

    id,
    installed: !shouldUseWalletConnect ? isUnisatInjected : undefined,
    name,
  };
};
